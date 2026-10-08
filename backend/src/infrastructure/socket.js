import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from './jwtConfig.js';
import { chatPersistenceService } from '../application/services/chatPersistenceService.js';

let ioInstance = null;

/**
 * Inicializa el servidor Socket.io sobre la instancia HTTP de Express.
 * Implementa autenticación obligatoria mediante token JWT en el handshake
 * y asigna automáticamente a los sockets en salas según su rol y UID.
 *
 * @param {import('node:http').Server} httpServer
 * @returns {Server}
 */
export function initSocketServer(httpServer) {
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
    : ['http://localhost:5173'];

  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          callback(null, true);
        } else {
          callback(new Error('Bloqueado por política CORS'));
        }
      },
      credentials: true
    }
  });

  // Middleware de Autenticación para el Handshake de WebSockets
  io.use((socket, next) => {
    const rawToken =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!rawToken) {
      return next(new Error('AUTH_TOKEN_MISSING'));
    }

    try {
      const decoded = jwt.verify(rawToken, getJwtSecret(), { algorithms: ['HS256'] });
      socket.user = decoded;
      next();
    } catch {
      next(new Error('AUTH_TOKEN_INVALID'));
    }
  });

  // Almacén en memoria de conversaciones activas de soporte (efímero, confidencial, $0 costo)
  const activeChats = new Map();

  function getSerializedChats() {
    return Array.from(activeChats.values()).map((chat) => ({
      agentId: chat.agentId,
      agentName: chat.agentName,
      isAnonymous: chat.isAnonymous,
      updatedAt: chat.updatedAt,
      unreadCount: chat.unreadCount,
      lastMessage: chat.messages[chat.messages.length - 1]?.text || ''
    }));
  }

  io.on('connection', (socket) => {
    const { id, role, rol_codigo } = socket.user || {};
    const userRole = role || rol_codigo;

    // Conectar a sala según rol (p. ej. 'role:SST' para médicos ocupacionales)
    if (userRole) {
      socket.join(`role:${userRole}`);
    }

    // Conectar a sala personal (p. ej. 'user:usr-1' para notificaciones directas)
    if (id) {
      socket.join(`user:${id}`);
    }

    // Si un especialista SST se conecta o solicita la lista de chats activos
    socket.on('support:chats:get', async () => {
      if (userRole === 'SST') {
        try {
          const sessions = await chatPersistenceService.getActiveSessionsForSst();
          const queue = await chatPersistenceService.getTriageQueueForSst();
          socket.emit('support:chats:list', sessions);
          socket.emit('support:triage:list', queue);
        } catch (err) {
          socket.emit('support:chats:list', getSerializedChats());
        }
      }
    });

    // Si SST marca un chat como leído
    socket.on('support:chat:read', (payload) => {
      if (userRole === 'SST' && payload?.agentId && activeChats.has(payload.agentId)) {
        const chat = activeChats.get(payload.agentId);
        chat.unreadCount = 0;
        io.to('role:SST').emit('support:chats:updated', getSerializedChats());
      }
    });

    // Canal de chat preventivo vinculado a radicado formal (SG-SST)
    socket.on('support:message:send', async (payload) => {
      if (!payload || !payload.text || typeof payload.text !== 'string' || !payload.text.trim()) {
        return;
      }

      const isAgent = userRole === 'AGENTE';
      const cleanText = payload.text.trim();
      const sessionId = payload.sessionId;
      const targetAgentId = isAgent ? id : payload.receiverId;

      const senderDisplayName = isAgent
        ? (payload.isAnonymous ? 'Agente Confidencial' : (payload.senderName || 'Agente de Contact Center'))
        : 'Especialista SST (Salud Ocupacional)';

      let savedMsg = null;
      try {
        if (sessionId) {
          savedMsg = await chatPersistenceService.saveMessage({
            sessionId,
            senderId: id,
            senderRole: userRole,
            senderName: senderDisplayName,
            text: cleanText
          });
        }
      } catch (err) {
        return; // Detener emisión si falla validación o la sesión está cerrada
      }

      const clientMsgId = payload?.clientMsgId || null;

      const message = {
        ...(savedMsg || {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          sessionId,
          senderId: id,
          senderRole: userRole,
          senderName: senderDisplayName,
          receiverId: isAgent ? null : targetAgentId,
          text: cleanText,
          timestamp: new Date().toISOString()
        }),
        clientMsgId
      };

      // Emitir mensaje en tiempo real al agente y al equipo de SST
      if (targetAgentId) {
        io.to(`user:${targetAgentId}`).emit('support:message:received', message);
      }
      io.to('role:SST').emit('support:message:received', message);
    });

    // Cerrar sesión de chat activa del radicado
    socket.on('support:chat:close', async (payload) => {
      const sessionId = payload?.sessionId;
      if (sessionId) {
        try {
          const closed = await chatPersistenceService.closeSession({
            sessionId,
            closedByUserId: id,
            closedByRole: userRole,
            reason: payload?.reason || 'CONCLUIDO_POR_USUARIO',
            notes: payload?.notes || '',
            targetRequestStatus: payload?.targetRequestStatus || 'Cerrada'
          });

          const targetAgentId = closed?.agente_id || payload?.agentId;
          if (targetAgentId) {
            io.to(`user:${targetAgentId}`).emit('support:chat:ended', {
              sessionId,
              requestId: closed?.solicitud_id,
              status: closed?.finalRequestStatus || 'Cerrada',
              message: 'La conversación de este radicado ha sido concluida.'
            });
          }

          io.to('role:SST').emit('support:chat:ended', {
            sessionId,
            requestId: closed?.solicitud_id,
            status: closed?.finalRequestStatus || 'Cerrada',
            message: 'La conversación de este radicado ha sido concluida.'
          });
        } catch {
          // Ignorar error si ya fue cerrada
        }
      }
    });
  });

  ioInstance = io;
  return io;
}

/**
 * Obtiene la instancia activa de Socket.io.
 * @returns {Server|null}
 */
export function getSocketServer() {
  return ioInstance;
}

/**
 * Emite un evento a todos los usuarios conectados con un rol específico.
 * @param {string} role Código de rol ('SST', 'ADMIN', 'SUPERVISOR', 'AGENTE')
 * @param {string} event Nombre del evento
 * @param {any} data Carga útil del evento
 */
export function emitToRole(role, event, data) {
  if (ioInstance) {
    ioInstance.to(`role:${role}`).emit(event, data);
  }
}

/**
 * Emite un evento a un usuario específico mediante su sala privada.
 * @param {string} userId Identificador de usuario
 * @param {string} event Nombre del evento
 * @param {any} data Carga útil del evento
 */
export function emitToUser(userId, event, data) {
  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit(event, data);
  }
}
