import express from 'express';
import { authenticate, requireRole } from '../../middlewares/authMiddleware.js';
import * as auditorController from '../controllers/auditorController.js';

const router = express.Router();

router.use(authenticate);
router.use(requireRole(['AUDITOR', 'ADMIN']));

router.get('/logs', auditorController.getLogs);
router.post('/export', auditorController.exportLogs);

export default router;
