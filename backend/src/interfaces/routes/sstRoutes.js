import { Router } from 'express';
import { sstController } from '../controllers/sstController.js';
import { authenticate, requireRole } from '../../middlewares/authMiddleware.js';
import { listRules, proposeRule } from '../../application/services/rulesService.js';

const router = Router();
router.get('/rules', authenticate, requireRole(['SST']), async (req,res,next) => {
  try { res.json({ success:true,data:await listRules() }); } catch(error) { next(error); }
});
router.post('/rules', authenticate, requireRole(['SST']), async (req,res,next) => {
  try { res.status(201).json({ success:true,data:await proposeRule(req.body,req.user) }); } catch(error) { next(error); }
});

// ============================================================================
// Pulso360 — Módulo de Seguridad y Salud en el Trabajo (SST) y Analítica
// Se garantiza el aislamiento de datos usando k-anonimato para las métricas
// y control de acceso basado en roles (RBAC) estricto de acuerdo al Spec-Driven Development.
// ============================================================================

/**
 * Endpoints de Métricas Agregadas (Analytics)
 * Accesibles tanto por el área SST como Supervisores de Operación.
 * El servicio implementa de manera transparente el cálculo k-anónimo.
 */
router.get(
  '/metrics',
  authenticate,
  requireRole(['SST', 'SUPERVISOR']),
  sstController.getMetrics
);

/**
 * Endpoints de Gestión de Alertas Organizacionales
 * (Módulo reservado de manera exclusiva para el Especialista SST).
 */
router.get(
  '/alerts',
  authenticate,
  requireRole(['SST']),
  sstController.getAlerts
);

/**
 * Endpoints de Intervenciones Estratégicas
 * (Exclusivo para el control del panel de Salud Ocupacional).
 */
router.get(
  '/interventions',
  authenticate,
  requireRole(['SST']),
  sstController.getInterventions
);
router.post(
  '/interventions',
  authenticate,
  requireRole(['SST']),
  sstController.createIntervention
);

/**
 * Endpoints de Solicitudes de Apoyo Psicológico Individual.
 * 
 * ATENCIÓN: Roles divergentes operando el mismo recurso conceptual
 * - La lectura es exclusiva del área de SST para organizar y tratar la asistencia.
 * - La creación es solicitada autónomamente por el trabajador (AGENTE).
 */
router.get(
  '/support-requests',
  authenticate,
  requireRole(['SST']),
  sstController.getSupportRequests
);

router.post(
  '/support-requests',
  authenticate,
  requireRole(['AGENTE']),
  sstController.createSupportRequest
);

router.patch(
  '/alerts/:id',
  authenticate,
  requireRole(['SST']),
  sstController.updateAlert
);

router.patch(
  '/support-requests/:id/status',
  authenticate,
  requireRole(['SST']),
  sstController.updateSupportRequestStatus
);

export default router;
