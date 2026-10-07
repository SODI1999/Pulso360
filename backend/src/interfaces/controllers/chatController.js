// backend/src/interfaces/controllers/chatController.js
// Controlador REST para sesiones e historial de chat de acompañamiento SST

import { chatPersistenceService } from '../../application/services/chatPersistenceService.js';

export const chatController = {
  /**
   * GET /api/v1/support/chat/active
   * Para agentes: recupera la sesión activa y mensajes.
   * Para SST: recupera la lista de todas las sesiones activas en el centro.
   */
  getActiveChat: async (req, res, next) => {
    try {
      const userRole = req.user.role || req.user.rol_codigo;
      const isAgent = userRole === 'AGENTE';

      if (isAgent) {
        const isAnonymous = req.query.isAnonymous === 'true' || req.query.anonymous === 'true';
        const data = await chatPersistenceService.getOrCreateActiveSession({
          agentId: req.user.id,
          isAnonymous,
          agentName: `${req.user.nombres || ''} ${req.user.apellidos || ''}`.trim()
        });
        return res.status(200).json({ success: true, data });
      }

      if (userRole === 'SST') {
        const sessions = await chatPersistenceService.getActiveSessionsForSst();
        return res.status(200).json({ success: true, data: sessions });
      }

      return res.status(403).json({
        success: false,
        error: { message: 'Rol no autorizado para acceder al canal de chat', code: 'AUTH_FORBIDDEN_ROLE' }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/support/chat/sessions/:sessionId/messages
   * Retorna el historial de mensajes de una sesión específica.
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
   * POST /api/v1/support/chat/sessions/:sessionId/close
   * Concluye la sesión de chat activa y emite evento de cierre.
   */
  closeSession: async (req, res, next) => {
    try {
      const { sessionId } = req.params;
      const { reason, notes } = req.body || {};
      const userRole = req.user.role || req.user.rol_codigo;

      const closedSession = await chatPersistenceService.closeSession({
        sessionId,
        closedByUserId: req.user.id,
        closedByRole: userRole,
        reason,
        notes
      });

      return res.status(200).json({
        success: true,
        message: 'Sesión de orientación en vivo concluida exitosamente',
        data: closedSession
      });
    } catch (err) {
      next(err);
    }
  }
};
