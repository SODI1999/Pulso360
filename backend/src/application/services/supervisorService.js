import { supervisorRepository } from '../../infrastructure/repositories/supervisorRepository.js';
import { AppError } from '../errors/AppError.js';
import crypto from 'node:crypto';
import { currentJourney } from '../../domain/journey.js';

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
    
    const numericProgress = Number(progress);
    if (!Number.isInteger(numericProgress) || numericProgress < 0 || numericProgress > 100) {
      throw new AppError('El progreso debe ser un número entero entre 0 y 100', 'INVALID_PROGRESS_VALUE', 400);
    }

    const authorized = await supervisorRepository.findAuthorizedIntervention(intervencionId, supervisorId);
    if (!authorized) {
      throw new AppError('Intervención no encontrada o no autorizada para este supervisor', 'FORBIDDEN', 403);
    }

    const id = `seg-${crypto.randomUUID()}`;
    const fecha = currentJourney(0);
    if (actionType != null && (typeof actionType !== 'string' || actionType.length > 100)) {
      throw new AppError('Tipo de acción inválido', 'INVALID_ACTION_TYPE', 400);
    }
    if (note != null && (typeof note !== 'string' || note.length > 2000)) {
      throw new AppError('Observación inválida', 'INVALID_NOTE', 400);
    }
    
    // Ensure progress is constrained between 0 and 100
    const progresoReportado = Math.max(0, Math.min(100, Number(progress)));
    const notaAvance = note || actionType || 'Avance registrado';

    const result = await supervisorRepository.createFollowup({
      id,
      intervencionId,
      autorId: supervisorId,
      fecha,
      progresoReportado,
      notaAvance,
      tipoAccion: actionType || null
    });

    return result;
  }
};
