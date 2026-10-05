import { Router } from 'express';
import { reportsController } from '../controllers/reportsController.js';
import { authenticate, requireRole } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(requireRole(['SUPERVISOR', 'LIDER_SST', 'ADMIN']));

router.get('/', reportsController.getReports);
router.post('/', reportsController.createReport);
router.get('/:id/download', reportsController.downloadReport);

export default router;
