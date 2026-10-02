import { supervisorRepository } from '../../infrastructure/repositories/supervisorRepository.js';

export const supervisorService = {
  async getAssignedActions(supervisorId) {
    if (!supervisorId) {
      throw { statusCode: 400, message: "ID de supervisor es requerido", code: "MISSING_SUPERVISOR_ID" };
    }
    const actions = await supervisorRepository.findAssignedInterventions(supervisorId);
    return actions;
  },

  async recordFollowup(supervisorId, { intervencionId, progress, note, actionType }) {
    if (!intervencionId) {
      throw { statusCode: 400, message: "ID de intervención es requerido", code: "MISSING_INTERVENCION_ID" };
    }
    
    // progress can be 0, so check undefined
    if (progress === undefined) {
      throw { statusCode: 400, message: "Progreso es requerido", code: "MISSING_PROGRESS" };
    }

    const id = 'seg-int-' + Date.now();
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

    return result;
  }
};
