import { Router } from 'express';
import { authenticate, requireRole } from '../../middlewares/authMiddleware.js';
import * as adminController from '../controllers/adminController.js';

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

// Organización (Campañas y Equipos)
router.get('/organization', adminController.getOrganization);
router.post('/campaigns', adminController.createCampaign);
router.patch('/campaigns/:id', adminController.updateCampaign);
router.post('/teams', adminController.createTeam);
router.patch('/teams/:id', adminController.updateTeam);

// Parámetros del Sistema
router.get('/params', adminController.getSystemParams);
router.put('/params/:clave', adminController.updateSystemParam);

// Políticas de Privacidad
router.post('/policies', adminController.createPolicy);

// Habeas Data
router.get('/habeas-data', adminController.getHabeasData);
router.patch('/habeas-data/:id', adminController.updateHabeasData);

export default router;
