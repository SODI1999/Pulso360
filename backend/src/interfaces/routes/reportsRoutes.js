import { Router } from 'express';
import { reportsController } from '../controllers/reportsController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', reportsController.getReports);
router.post('/', reportsController.createReport);

export default router;
