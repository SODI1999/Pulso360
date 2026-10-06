import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from './jwtConfig.js';

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

    // Canal bidireccional de chat de apoyo psicológico / desahogo confidencial (Consentimiento C3)
    socket.on('support:message:send', (payload) => {
      if (!payload || !payload.text || typeof payload.text !== 'string' || !payload.text.trim()) {
        return;
      }

      const message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        senderId: id,
        senderRole: userRole,
        receiverId: payload.receiverId || null,
        text: payload.text.trim(),
        timestamp: new Date().toISOString()
      };

      // Si el emisor es un AGENTE: se emite a su propia sala y exclusivamente a los especialistas SST
      // (Los supervisores de operaciones NO tienen acceso a estas salas)
      if (userRole === 'AGENTE') {
        io.to(`user:${id}`).emit('support:message:received', message);
        io.to('role:SST').emit('support:message:received', message);
      } else if (userRole === 'SST') {
        // Si el emisor es SST: se emite a la sala del agente destinatario y a la sala general de SST
        if (payload.receiverId) {
          io.to(`user:${payload.receiverId}`).emit('support:message:received', message);
        }
        io.to('role:SST').emit('support:message:received', message);
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
