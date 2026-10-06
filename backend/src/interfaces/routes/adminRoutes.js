import { Router } from 'express';
import { authenticate, requireRole } from '../../middlewares/authMiddleware.js';
import * as adminController from '../controllers/adminController.js';
import { listLexicons, activateLexicon } from '../../application/services/lexiconService.js';
import { approveRule } from '../../application/services/rulesService.js';

/**
 * @fileoverview Rutas para el módulo de administración
 * @module adminRoutes
 */

const router = Router();

// Middleware común: solo usuarios autenticados con rol ADMIN
router.use(authenticate);
router.use(requireRole(['ADMIN']));

// Gestión de Usuarios
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.patch('/users/:id/status', adminController.setUserStatus);
router.patch('/users/:id', adminController.updateUser);

// Organización (Campañas y Equipos)
router.get('/organization', adminController.getOrganization);
router.post('/campaigns', adminController.createCampaign);
router.patch('/campaigns/:id', adminController.updateCampaign);
router.post('/teams', adminController.createTeam);
router.patch('/teams/:id', adminController.updateTeam);

// Parámetros del Sistema
router.get('/params', adminController.getSystemParams);
router.patch('/rules/:id/approval', async (req,res,next) => {
  try { res.json({ success:true,data:await approveRule(req.params.id,req.user) }); } catch(error) { next(error); }
});
router.get('/nlp/versions', async (req,res,next) => {
  try { res.json({ success:true,data:await listLexicons() }); } catch(error) { next(error); }
});
router.post('/nlp/versions/:id/activate', async (req,res,next) => {
  try { res.json({ success:true,data:await activateLexicon(req.params.id,req.user) }); } catch(error) { next(error); }
});
router.post('/nlp/revert', async (req,res,next) => {
  try { res.json({ success:true,data:await activateLexicon(null,req.user,true) }); } catch(error) { next(error); }
});
router.put('/params/:clave', adminController.updateSystemParam);

// Políticas de Privacidad
router.post('/policies', adminController.createPolicy);

// Habeas Data
router.get('/habeas-data', adminController.getHabeasData);
router.patch('/habeas-data/:id', adminController.updateHabeasData);

export default router;
