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
          socket.emit('support:chats:list', sessions);
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

    // Canal bidireccional de chat de apoyo psicológico / desahogo confidencial (Consentimiento C3)
    socket.on('support:message:send', async (payload) => {
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

      const cleanText = payload.text.trim();
      const senderDisplayName = isAgent
        ? (chat.isAnonymous ? chat.agentName : (payload.senderName || 'Agente de Contact Center'))
        : 'Especialista SST (Salud Ocupacional)';

      let savedMsg = null;
      try {
        const sessionData = await chatPersistenceService.getOrCreateActiveSession({
          agentId,
          isAnonymous: Boolean(payload.isAnonymous),
          agentName: payload.senderName
        });
        savedMsg = await chatPersistenceService.saveMessage({
          sessionId: sessionData.session.id,
          senderId: id,
          senderRole: userRole,
          senderName: senderDisplayName,
          text: cleanText
        });
      } catch (err) {
        // Fallback defensivo si PostgreSQL tiene latencia
      }

      const message = savedMsg || {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        senderId: id,
        senderRole: userRole,
        senderName: senderDisplayName,
        receiverId: isAgent ? null : agentId,
        agentId,
        text: cleanText,
        timestamp: new Date().toISOString()
      };

      // Conservar en memoria rápida
      chat.messages.push(message);
      if (chat.messages.length > 50) {
        chat.messages.shift();
      }
      chat.updatedAt = message.timestamp;

      if (isAgent) {
        chat.unreadCount += 1;
      }

      // Emitir mensaje en tiempo real al agente y a los especialistas SST
      io.to(`user:${agentId}`).emit('support:message:received', message);
      io.to('role:SST').emit('support:message:received', message);

      try {
        const sstSessions = await chatPersistenceService.getActiveSessionsForSst();
        io.to('role:SST').emit('support:chats:updated', sstSessions);
      } catch {
        io.to('role:SST').emit('support:chats:updated', getSerializedChats());
      }
    });

    // Cerrar sesión de chat activa
    socket.on('support:chat:close', async (payload) => {
      const targetAgentId = userRole === 'SST' ? payload?.agentId : id;
      if (targetAgentId) {
        activeChats.delete(targetAgentId);
        try {
          const sessionData = await chatPersistenceService.getOrCreateActiveSession({ agentId: targetAgentId });
          if (sessionData?.session?.id) {
            await chatPersistenceService.closeSession({
              sessionId: sessionData.session.id,
              closedByUserId: id,
              closedByRole: userRole,
              reason: payload?.reason || 'CONCLUIDO_POR_USUARIO',
              notes: payload?.notes || ''
            });
          }
        } catch {
          // Ignorar error de persistencia en cierre
        }

        io.to(`user:${targetAgentId}`).emit('support:chat:ended', {
          message: 'La sesión de orientación en vivo ha finalizado.'
        });

        try {
          const sstSessions = await chatPersistenceService.getActiveSessionsForSst();
          io.to('role:SST').emit('support:chats:updated', sstSessions);
        } catch {
          io.to('role:SST').emit('support:chats:updated', getSerializedChats());
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
