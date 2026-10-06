import { Router } from 'express';
import { authenticate, requireRole } from '../../middlewares/authMiddleware.js';
import { getActiveLexicon } from '../../application/services/lexiconService.js';
const router = Router();
router.get('/lexicon/active', authenticate, requireRole(['AGENTE']), async (req,res,next) => {
  try { res.json({ success:true, data:await getActiveLexicon(req.user.id) }); } catch(error) { next(error); }
});
export default router;
