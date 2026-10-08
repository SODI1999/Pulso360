// backend/src/interfaces/routes/chatRoutes.js
// Rutas REST para chat preventivo vinculado a Radicados de Apoyo SST (RF-10)

import { Router } from 'express';
import { chatController } from '../controllers/chatController.js';
import { authenticate, requireRole } from '../../middlewares/authMiddleware.js';

const router = Router();

// Exclusivo para agentes de piso y especialistas SST.
// Supervisores, Auditores y Administradores son estrictamente bloqueados con 403 Forbidden.
router.use(authenticate);
router.use(requireRole(['AGENTE', 'SST']));

// Chat vinculado a radicado formal
router.post('/requests/:requestId/activate', requireRole(['SST']), chatController.activateChat);
router.get('/requests/:requestId', chatController.getChatByRequest);
router.get('/agent-active-map', requireRole(['AGENTE']), chatController.getAgentActiveMap);

// Ciclo de vida y mensajes de sesión
router.post('/sessions/:sessionId/close', chatController.closeSession);
router.get('/sessions/:sessionId/messages', chatController.getSessionHistory);

export default router;
