import { sstRepository } from '../../infrastructure/repositories/sstRepository.js';
import { consentRepository } from '../../infrastructure/repositories/consentRepository.js';
import AppError from '../errors/AppError.js';
import { createLog } from '../../infrastructure/repositories/auditorRepository.js';
import crypto from 'node:crypto';

export const sstService = {
  /**
   * Obtiene la lista de alertas activas para el panel del área SST.
   * 
   * @param {Object} filters Filtros como 'estado'
   * @returns {Promise<Array>} Lista de alertas
   */
  async getAlerts(filters) {
    return await sstRepository.findAlerts(filters);
  },

  /**
   * Obtiene la lista de intervenciones de bienestar gestionadas por el área SST.
   * 
   * @param {Object} filters Filtros como 'status'
   * @returns {Promise<Array>} Lista de intervenciones
   */
  async getInterventions(filters) {
    return await sstRepository.findInterventions(filters);
  },

  /**
   * Permite al especialista SST registrar un nuevo plan de acción (intervención) en una campaña o equipo.
   * Verifica la completitud de la información antes de la creación en BD.
   * 
   * @param {string} sstUserId ID del especialista que crea la intervención
   * @param {Object} data Estructura del plan de intervención
   * @returns {Promise<Object>} Resumen de intervención creada
   * @throws {AppError} Si faltan atributos esenciales
   */
  async createIntervention(sstUserId, data) {
    const campana_id = data.campana_id || data.campanaId;
    const equipo_id = data.equipo_id || data.equipoId || null;
    const start_date = data.start_date || data.startDate;
    const end_date = data.end_date || data.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const alerta_id = data.alerta_id || data.alertaId || null;
    const target_desc = data.target_desc || data.targetDesc || null;
    const assigned_to = data.assigned_to || data.assignedTo || null;
    const title = data.title;
    const type = data.type;
    const indicator = data.indicator || 'Recuperacion agregada';
    const baseline = data.baseline !== undefined ? data.baseline : null;
    
    // Validar parámetros obligatorios que aseguran la correcta descripción del plan.
    if (!title || !type || !campana_id || !start_date) {
      throw new AppError('Faltan campos obligatorios para crear la intervención.', 'INTERVENTION_MISSING_REQUIRED_FIELDS', 400);
    }

    const id = `int-${crypto.randomUUID()}`;
    const payload = {
      ...data,
      id,
      alerta_id,
      title,
      type,
      campana_id,
      equipo_id,
      assigned_to,
      start_date,
      end_date,
      indicator,
      baseline,
      target_desc,
      creator_id: sstUserId
    };

    const result = await sstRepository.createInterventionWithAlertTransition(payload);

    try {
      await createLog({ 
        usuarioId: sstUserId, 
        rol: 'SST', 
        action: 'CREACION_INTERVENCION', 
        resource: 'sst_intervenciones', 
        resourceId: result.id, 
        details: 'Intervención preventiva creada: ' + title 
      });
    } catch (auditError) {
      console.warn('Advertencia: No se pudo registrar auditoría en createIntervention:', auditError.message);
    }

    return result;
  },

  /**
   * Permite que el área SST visualice los tickets de ayuda psicológica.
   * El repositorio subyacente se encarga de proteger la identidad si el modo es anónimo.
   * 
   * @returns {Promise<Array>} Lista de solicitudes de apoyo
   */
  async getSupportRequests() {
    return await sstRepository.findSupportRequests();
  },

  /**
   * Canal para que un trabajador u operador solicite ayuda emocional (Soporte Psicosocial).
   * 
   * MECANISMO DE CONSENTIMIENTO:
   * 1. Dado que solicitar apoyo y proveer estado emocional es un dato sensible (Ley 1581).
   * 2. Se verifica que el trabajador posea vigente el consentimiento explícito C3 ("Apoyo Psicosocial").
   * 3. Si no es así, el sistema rechaza preventivamente la solicitud para evitar tratamiento ilegal.
   * 
   * @param {string} userId ID del trabajador solicitante
   * @param {Object} data Detalles de la solicitud (motivo, nivel, contacto, modalidad)
   * @returns {Promise<Object>} Confirmación de radicado del ticket
   * @throws {AppError} Si el empleado no ha habilitado la autorización C3
   */
  async createSupportRequest(userId, data) {
    // 1. Validar el consentimiento específico de apoyo (c3_apoyo) para tratamiento de datos sensibles
    const consent = await consentRepository.findActiveByUserId(userId);
    if (!consent || !consent.c3_apoyo) {
      throw new AppError('Requiere consentimiento C3 para solicitar apoyo psicosocial', 'CONSENT_C3_REQUIRED', 403);
    }

    // 2. Generar el identificador visual de radicado según la modalidad de anonimato solicitada.
    const isAnonymous = data.mode === 'anonimo';
    const prefix = isAnonymous ? 'ANON' : 'APO';
    const code = `${prefix}-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const id = `sup-${crypto.randomUUID()}`;
    const payload = {
      ...data,
      id,
      code,
      owner_user_id: userId,
      // Si el empleado exige anonimato en su formulario, la identidad concreta
      // se disocia del ticket para los analistas de SST.
      identity_user_id: isAnonymous ? null : userId
    };

    const created = await sstRepository.createSupportRequest(payload);
    
    return {
      id: created.id,
      code: created.code,
      sla: '24 h habiles',
      status: created.status
    };
  },

  async updateAlert(alertId, data) {
    return await sstRepository.updateAlertStatus(alertId, { 
      status: data.status, 
      dismissReason: data.dismissReason || data.dismiss_reason 
    });
  },

  async updateSupportRequestStatus(requestId, status, sstUserId) {
    const result = await sstRepository.updateSupportRequestStatus(requestId, status);
    if (result) {
      try {
        await createLog({ 
          usuarioId: sstUserId || null, 
          rol: 'SST', 
          action: 'ACTUALIZACION_APOYO', 
          resource: 'solicitudes_apoyo', 
          resourceId: requestId, 
          details: `Estado actualizado a: ${status}` 
        });
      } catch (auditError) {
        console.warn('Advertencia: No se pudo registrar auditoría en updateSupportRequest:', auditError.message);
      }
    }
    return result;
  }
};
