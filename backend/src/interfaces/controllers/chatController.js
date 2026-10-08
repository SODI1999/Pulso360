// backend/src/interfaces/controllers/chatController.js
// Controlador REST para chat preventivo vinculado a Radicados de Apoyo SST

import { chatPersistenceService } from '../../application/services/chatPersistenceService.js';
import { emitToRole, emitToUser } from '../../infrastructure/socket.js';

export const chatController = {
  /**
   * POST /api/v1/chat/requests/:requestId/activate
   * Activa e inicia la sala de chat preventivo para un radicado específico (Rol: SST).
   */
  activateChat: async (req, res, next) => {
    try {
      const { requestId } = req.params;
      const data = await chatPersistenceService.activateChatForRequest({
        requestId,
        sstUserId: req.user.id
      });

      // Notificar al agente en tiempo real que se abrió el chat de su radicado
      emitToUser(data.session.agentId, 'support:chat:activated', data);
      emitToRole('SST', 'support:chat:activated', data);

      return res.status(200).json({
        success: true,
        message: 'Canal de chat preventivo activado para el radicado',
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/chat/requests/:requestId
   * Obtiene la sesión de chat (activa o cerrada) de un radicado (Roles: AGENTE, SST).
   */
  getChatByRequest: async (req, res, next) => {
    try {
      const { requestId } = req.params;
      const userRole = req.user.role || req.user.rol_codigo;
      const data = await chatPersistenceService.getChatByRequestId({
        requestId,
        userId: req.user.id,
        userRole
      });

      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/chat/agent-active-map
   * Obtiene el mapa de chats activos de todos los radicados del agente (Rol: AGENTE).
   */
  getAgentActiveMap: async (req, res, next) => {
    try {
      const data = await chatPersistenceService.getAgentActiveChatsMap({
        agentId: req.user.id
      });
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/chat/sessions/:sessionId/messages
   * Retorna los mensajes de una sesión específica de chat.
   */
  getSessionHistory: async (req, res, next) => {
    try {
      const { sessionId } = req.params;
      const userRole = req.user.role || req.user.rol_codigo;
      const data = await chatPersistenceService.getSessionMessages(sessionId, req.user.id, userRole);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/chat/sessions/:sessionId/close
   * Concluye una sesión de chat y pasa a modo de lectura.
   */
  closeSession: async (req, res, next) => {
    try {
      const { sessionId } = req.params;
      const { reason, notes, targetRequestStatus } = req.body || {};
      const userRole = req.user.role || req.user.rol_codigo;

      const closedSession = await chatPersistenceService.closeSession({
        sessionId,
        closedByUserId: req.user.id,
        closedByRole: userRole,
        reason,
        notes,
        targetRequestStatus
      });

      emitToUser(closedSession.agente_id, 'support:chat:ended', {
        sessionId,
        requestId: closedSession.solicitud_id,
        status: closedSession.finalRequestStatus || 'Cerrada',
        message: 'La conversación de este radicado ha sido concluida.'
      });
      emitToRole('SST', 'support:chat:ended', {
        sessionId,
        requestId: closedSession.solicitud_id,
        status: closedSession.finalRequestStatus || 'Cerrada',
        message: 'Conversación concluida.'
      });

      return res.status(200).json({
        success: true,
        message: 'Sesión de orientación concluida exitosamente',
        data: closedSession
      });
    } catch (err) {
      next(err);
    }
  }
};
