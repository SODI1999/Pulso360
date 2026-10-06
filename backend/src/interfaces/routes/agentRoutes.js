import { Router } from 'express';
import { agentController } from '../controllers/agentController.js';
import { authenticate, requireRole } from '../../middlewares/authMiddleware.js';
import { validateBody } from '../../middlewares/validationMiddleware.js';

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
router.post(
  '/journal',
  validateBody(
    {
      content: {
        required: true,
        type: 'string',
        minLength: 5,
        message: 'El contenido de la bitácora no puede estar vacío o tener menos de 5 caracteres',
        code: 'JOURNAL_CONTENT_EMPTY'
      }
    },
    'JOURNAL_CONTENT_EMPTY'
  ),
  agentController.createJournalEntry
);
router.put('/journal/:id', agentController.updateJournalEntry);
router.post('/journal/:id/corrections', agentController.correctJournal);
router.delete('/journal/:id', agentController.deleteJournalEntry);

// Solicitudes de Apoyo
router.get('/support-requests', agentController.getMySupportRequests);

// Solicitudes Habeas Data
router.get('/habeas-data', agentController.getMyHabeasData);
router.post('/habeas-data', agentController.createHabeasData);

export default router;
