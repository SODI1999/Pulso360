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
    socket.on('support:chats:get', () => {
      if (userRole === 'SST') {
        socket.emit('support:chats:list', getSerializedChats());
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

    // Canal bidireccional de chat de apoyo psicológico / desahogo confidencial (Consentimiento C3)
    socket.on('support:message:send', (payload) => {
      if (!payload || !payload.text || typeof payload.text !== 'string' || !payload.text.trim()) {
        return;
      }

      const isAgent = userRole === 'AGENTE';
      const agentId = isAgent ? id : payload.receiverId;

      if (!agentId) return;

      let chat = activeChats.get(agentId);
      if (!chat) {
        chat = {
          agentId,
          agentName: payload.isAnonymous
            ? `Agente Confidencial (${agentId.slice(-4)})`
            : (payload.senderName || 'Agente de Contact Center'),
          isAnonymous: Boolean(payload.isAnonymous),
          unreadCount: 0,
          updatedAt: new Date().toISOString(),
          messages: []
        };
        activeChats.set(agentId, chat);
      }

      const message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        senderId: id,
        senderRole: userRole,
        senderName: isAgent
          ? (chat.isAnonymous ? chat.agentName : (payload.senderName || 'Agente de Contact Center'))
          : 'Especialista SST (Salud Ocupacional)',
        receiverId: isAgent ? null : agentId,
        agentId,
        text: payload.text.trim(),
        timestamp: new Date().toISOString()
      };

      // Conservar los últimos 50 mensajes en la conversación activa
      chat.messages.push(message);
      if (chat.messages.length > 50) {
        chat.messages.shift();
      }
      chat.updatedAt = message.timestamp;

      if (isAgent) {
        chat.unreadCount += 1;
        // Emitir al agente y a los especialistas de SST
        io.to(`user:${agentId}`).emit('support:message:received', message);
        io.to('role:SST').emit('support:message:received', message);
        io.to('role:SST').emit('support:chats:updated', getSerializedChats());
      } else if (userRole === 'SST') {
        // Emitir al agente destinatario y a la sala general de SST
        io.to(`user:${agentId}`).emit('support:message:received', message);
        io.to('role:SST').emit('support:message:received', message);
        io.to('role:SST').emit('support:chats:updated', getSerializedChats());
      }
    });

    // Cerrar sesión de chat activa
    socket.on('support:chat:close', (payload) => {
      const targetAgentId = userRole === 'SST' ? payload?.agentId : id;
      if (targetAgentId && activeChats.has(targetAgentId)) {
        activeChats.delete(targetAgentId);
        io.to(`user:${targetAgentId}`).emit('support:chat:ended', {
          message: 'La sesión de orientación en vivo ha finalizado.'
        });
        io.to('role:SST').emit('support:chats:updated', getSerializedChats());
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
