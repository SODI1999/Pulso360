import { Router } from 'express';
import { agentController } from '../controllers/agentController.js';
import { authenticate, requireRole } from '../../middlewares/authMiddleware.js';

const router = Router();

// Todas las rutas requieren estar autenticado y tener rol AGENTE
router.use(authenticate);
router.use(requireRole(['AGENTE']));

// Privacidad y Consentimiento
router.get('/consent', agentController.getConsent);
router.put('/consent', agentController.updateConsent);

// Check-in diario
router.get('/checkin/today', agentController.getTodayCheckin);
router.post('/checkin', agentController.registerCheckin);
router.get('/checkin/history', agentController.getCheckinHistory);

// Bitácora / Desahogo personal
router.get('/journal', agentController.getJournalEntries);
router.post('/journal', agentController.createJournalEntry);
router.delete('/journal/:id', agentController.deleteJournalEntry);

// Solicitudes Habeas Data
router.post('/habeas-data', agentController.createHabeasData);

export default router;
