import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { validateBody } from '../../middlewares/validationMiddleware.js';
import { passwordResetService } from '../../application/services/passwordResetService.js';

const router = Router();

router.post(
  '/login',
  validateBody(
    {
      correo: { required: true, message: 'Correo y contraseña son obligatorios', code: 'AUTH_MISSING_FIELDS' },
      contrasena: { required: true, message: 'Correo y contraseña son obligatorios', code: 'AUTH_MISSING_FIELDS' }
    },
    'AUTH_MISSING_FIELDS'
  ),
  authController.login
);
router.get('/me', authenticate, authController.getMe);
for (const [route,operation] of [['request','request'],['validate','validate'],['confirm','confirm']]) {
  router.post('/password-reset/'+route,async (req,res,next)=>{
    try { res.status(200).json({success:true,data:await passwordResetService[operation](req.body)}); }
    catch(error){next(error);}
  });
}

export default router;
