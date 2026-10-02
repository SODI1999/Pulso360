import { Router } from 'express';
import { supervisorController } from '../controllers/supervisorController.js';
import { authenticate, requireRole } from '../../middlewares/authMiddleware.js';

const router = Router();

// Todas las rutas requieren autenticación y rol SUPERVISOR
router.use(authenticate);
router.use(requireRole(['SUPERVISOR']));

router.get('/actions', supervisorController.getActions);
router.post('/actions/:id/followup', supervisorController.saveFollowup);

export default router;
