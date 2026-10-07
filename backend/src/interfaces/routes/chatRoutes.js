// backend/src/interfaces/routes/chatRoutes.js
// Rutas REST para gestión y persistencia de chat de acompañamiento SST (RF-10)

import { Router } from 'express';
import { chatController } from '../controllers/chatController.js';
import { authenticate, requireRole } from '../../middlewares/authMiddleware.js';

const router = Router();

// Exclusivo para agentes de piso y especialistas SST.
// Supervisores, Auditores y Administradores son estrictamente bloqueados con 403 Forbidden.
router.use(authenticate);
router.use(requireRole(['AGENTE', 'SST']));

router.get('/active', chatController.getActiveChat);
router.get('/sessions/:sessionId/messages', chatController.getSessionHistory);
router.post('/sessions/:sessionId/close', chatController.closeSession);

export default router;
