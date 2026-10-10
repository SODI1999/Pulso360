/**
 * Transporte Socket.IO del acompañamiento persistido. Solo AGENTE y SST pueden
 * operar chats; la sesión en PostgreSQL determina titular, modo y destinatario.
 * @module infrastructure/socket
 */
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from './jwtConfig.js';
import { userRepository } from './repositories/userRepository.js';
import { sstRepository } from './repositories/sstRepository.js';
import { chatPersistenceService } from '../application/services/chatPersistenceService.js';
import { AppError } from '../application/errors/AppError.js';

let ioInstance = null;

/**
 * Revalida firma, vigencia, estado, rol actual y versión de sesión contra BD.
 * @param {string} token - Token presentado en el handshake.
 * @returns {Promise<Object>} Perfil autenticado sin hash de contraseña.
 */
async function authenticatedProfile(token) {
  const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
  const user = await userRepository.findProfileById(decoded.id);
  if (!user || user.estado !== 'Activo') {
    throw new AppError('Usuario no disponible.', 'AUTH_USER_INACTIVE', 401);
  }
  if (Number(decoded.auth_version || 0) !== Number(user.auth_version || 0)) {
    throw new AppError('La sesión fue revocada.', 'AUTH_SESSION_REVOKED', 401);
  }
  return user;
}

/**
 * Inicializa Socket.IO y aísla los eventos por usuario y rol verificados.
 * Revalida autorización en cada operación de chat y emite solo tras persistir.
 * @param {import('node:http').Server} httpServer - Servidor HTTP compartido.
 * @returns {Server} Instancia Socket.IO que debe cerrarse al detener el servidor.
 */
export function initSocketServer(httpServer) {
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:5173'];
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) callback(null, true);
        else callback(new Error('Bloqueado por política CORS'));
      },
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) return next(new Error('AUTH_TOKEN_MISSING'));
    try {
      socket.user = await authenticatedProfile(token);
      socket.data.token = token;
      next();
    } catch (error) {
      next(new Error(error instanceof AppError ? error.code : 'AUTH_TOKEN_INVALID'));
    }
  });

  io.on('connection', socket => {
    socket.join(`role:${socket.user.rol_codigo}`);
    socket.join(`user:${socket.user.id}`);

    // Un cambio de rol invalida también las salas de esta conexión.
    async function supportUser() {
      const user = await authenticatedProfile(socket.data.token);
      if (user.rol_codigo !== socket.user.rol_codigo) {
        socket.disconnect(true);
        throw new AppError('El rol cambió.', 'AUTH_SESSION_REVOKED', 401);
      }
      if (!['AGENTE', 'SST'].includes(user.rol_codigo)) {
        throw new AppError('No tienes acceso al chat de apoyo.', 'AUTH_FORBIDDEN_ROLE', 403);
      }
      return user;
    }

    function supportError(error, clientMsgId = null) {
      const authenticationError = ['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(error.name);
      socket.emit('support:error', {
        success: false,
        error: {
          code: error instanceof AppError ? error.code : authenticationError ? 'AUTH_TOKEN_INVALID' : 'SUPPORT_UNAVAILABLE',
          message: error instanceof AppError ? error.message : 'No se pudo completar la operación de apoyo.'
        },
        clientMsgId
      });
      if (authenticationError || error.statusCode === 401) socket.disconnect(true);
    }

    socket.on('support:chats:get', async () => {
      try {
        const user = await supportUser();
        if (user.rol_codigo !== 'SST') throw new AppError('Acceso reservado a SST.', 'AUTH_FORBIDDEN_ROLE', 403);
        // El catálogo implementado son los radicados; no existe una lista de chats en memoria.
        socket.emit('support:triage:list', await sstRepository.findSupportRequests());
      } catch (error) { supportError(error); }
    });

    socket.on('support:message:send', async (payload, acknowledge) => {
      try {
        const user = await supportUser();
        if (!payload?.sessionId || typeof payload.text !== 'string' || !payload.text.trim()) {
          throw new AppError('Indica una sesión y un mensaje.', 'CHAT_MESSAGE_INVALID', 400);
        }
        const { message, recipientId } = await chatPersistenceService.saveMessage({
          sessionId: payload.sessionId, senderId: user.id, senderRole: user.rol_codigo,
          text: payload.text, clientMsgId: payload.clientMsgId
        });
        // Ignorar receiverId, senderName e isAnonymous enviados por el cliente.
        const confirmed = { ...message, clientMsgId: payload.clientMsgId || null };
        io.to(`user:${recipientId}`).emit('support:message:received', confirmed);
        io.to('role:SST').emit('support:message:received', confirmed);
        if (typeof acknowledge === 'function') acknowledge({ success: true, data: confirmed });
      } catch (error) { supportError(error, payload?.clientMsgId || null); }
    });

    socket.on('support:chat:close', async payload => {
      try {
        const user = await supportUser();
        if (!payload?.sessionId) throw new AppError('Indica una sesión.', 'CHAT_SESSION_NOT_FOUND', 404);
        const { recipientId, ...closed } = await chatPersistenceService.closeSession({
          sessionId: payload.sessionId, closedByUserId: user.id, closedByRole: user.rol_codigo,
          reason: payload.reason || 'CONCLUIDO_POR_USUARIO', notes: payload.notes || '',
          targetRequestStatus: payload.targetRequestStatus || 'Cerrada'
        });
        const event = {
          sessionId: closed.id, requestId: closed.solicitud_id,
          status: closed.finalRequestStatus || 'Cerrada',
          message: 'La conversación de este radicado ha sido concluida.'
        };
        io.to(`user:${recipientId}`).emit('support:chat:ended', event);
        io.to('role:SST').emit('support:chat:ended', event);
      } catch (error) { supportError(error); }
    });
  });

  ioInstance = io;
  return io;
}

/**
 * Obtiene la instancia de transporte inicializada.
 * @returns {Server|null}
 */
export function getSocketServer() { return ioInstance; }

/**
 * Emite a la sala institucional; el llamador debe autorizar el contenido.
 * @param {string} role - Código institucional de rol.
 * @param {string} event - Nombre del evento.
 * @param {*} data - Datos autorizados para ese rol.
 * @returns {void}
 */
export function emitToRole(role, event, data) { ioInstance?.to(`role:${role}`).emit(event, data); }

/**
 * Emite al titular; el llamador debe autorizar el contenido.
 * @param {string} userId - Identificador del destinatario.
 * @param {string} event - Nombre del evento.
 * @param {*} data - Datos autorizados para el usuario.
 * @returns {void}
 */
export function emitToUser(userId, event, data) { ioInstance?.to(`user:${userId}`).emit(event, data); }
