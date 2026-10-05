import { supervisorRepository } from '../../infrastructure/repositories/supervisorRepository.js';
import * as auditorRepository from '../../infrastructure/repositories/auditorRepository.js';
import pool from '../../infrastructure/db.js';
import { AppError } from '../errors/AppError.js';
import crypto from 'node:crypto';

export const supervisorService = {
  async getAssignedActions(supervisorId) {
    if (!supervisorId) {
      throw new AppError("ID de supervisor es requerido", 'MISSING_SUPERVISOR_ID', 400);
    }
    const actions = await supervisorRepository.findAssignedInterventions(supervisorId);
    return actions;
  },

  async recordFollowup(supervisorId, { intervencionId, progress, note, actionType }) {
    if (!intervencionId) {
      throw new AppError("ID de intervención es requerido", 'MISSING_INTERVENCION_ID', 400);
    }
    
    if (progress === undefined) {
      throw new AppError("Progreso es requerido", 'MISSING_PROGRESS', 400);
    }
    
    const parsedProgress = parseInt(progress, 10);
    if (isNaN(parsedProgress) || parsedProgress < 0 || parsedProgress > 100) {
      throw new AppError('El progreso debe ser un entero entre 0 y 100', 'INVALID_PROGRESS', 400);
    }

    const checkQuery = `
      SELECT i.id, i.campana_id, i.equipo_id
      FROM sst_intervenciones i
      WHERE i.id = $1 
        AND (
          i.assigned_to = $2 
          OR i.equipo_id IN (
            SELECT aue.equipo_id FROM asignaciones_usuario_equipo aue 
            WHERE aue.usuario_id = $2 AND aue.activa = TRUE
          )
          OR i.campana_id IN (
            SELECT eq.campana_id FROM equipos eq 
            JOIN asignaciones_usuario_equipo aue ON aue.equipo_id = eq.id 
            WHERE aue.usuario_id = $2 AND aue.activa = TRUE
          )
        )
    `;
    const checkResult = await pool.query(checkQuery, [intervencionId, supervisorId]);
    if (checkResult.rows.length === 0) {
      throw new AppError('Intervención no encontrada o no autorizada para este supervisor', 'FORBIDDEN', 403);
    }

    const id = `seg-${crypto.randomUUID()}`;
    const fecha = new Date().toISOString();
    
    // Ensure progress is constrained between 0 and 100
    const progresoReportado = Math.max(0, Math.min(100, Number(progress)));
    const notaAvance = note || actionType || 'Avance registrado';

    const result = await supervisorRepository.createFollowup({
      id,
      intervencionId,
      autorId: supervisorId,
      fecha,
      progresoReportado,
      notaAvance
    });

    await auditorRepository.createLog({
      usuarioId: supervisorId,
      rol: 'SUPERVISOR',
      action: 'SEGUIMIENTO_INTERVENCION',
      resource: 'sst_intervenciones',
      resourceId: intervencionId,
      details: `${actionType || 'Avance'} (${progresoReportado}% avance)`
    });

    return result;
  }
};
