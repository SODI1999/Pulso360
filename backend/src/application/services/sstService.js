import { sstRepository } from '../../infrastructure/repositories/sstRepository.js';
import { consentRepository } from '../../infrastructure/repositories/consentRepository.js';
import AppError from '../errors/AppError.js';
import { createLog } from '../../infrastructure/repositories/auditorRepository.js';
import crypto from 'node:crypto';
import { analyticsService } from './analyticsService.js';
import { tieneConsentimientoActivo } from '../../domain/privacyRules.js';
import { isCalendarDate } from '../../domain/calendarDate.js';
import { emitToUser, emitToRole } from '../../infrastructure/socket.js';

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
    const target_desc = data.target_desc || data.targetDesc || data.target || null;
    const assigned_to = data.assigned_to || data.assignedTo || null;
    const title = data.title;
    const type = data.type;
    const indicator = data.indicator || 'Recuperacion agregada';
    // Validar parámetros obligatorios que aseguran la correcta descripción del plan.
    if (!title || !type || !campana_id || !start_date) {
      throw new AppError('Faltan campos obligatorios para crear la intervención.', 'INTERVENTION_MISSING_REQUIRED_FIELDS', 400);
    }

    const metricKeys = {'Recuperación agregada':'recuperacion_avg','Recuperacion agregada':'recuperacion_avg','Carga emocional':'carga_emocional_avg','Apoyo social':'apoyo_avg'};
    if (!isCalendarDate(start_date) || !isCalendarDate(end_date) || end_date < start_date) throw new AppError('Fechas inválidas','INTERVENTION_INVALID_DATES',400);
    if (!Object.hasOwn(metricKeys,indicator)) throw new AppError('Indicador inválido','INTERVENTION_INVALID_INDICATOR',400);
    if (typeof (data.external_action ?? data.externalAction ?? false) !== 'boolean') throw new AppError('Acción externa inválida','INTERVENTION_INVALID_PAYLOAD',400);
    const hasta = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Bogota'}).format(new Date());
    const start = new Date(hasta+'T12:00:00Z'); start.setUTCDate(start.getUTCDate()-27);
    const aggregates = await analyticsService.getAggregatedMetrics({campanaId:campana_id,equipoId:equipo_id,desde:start.toISOString().slice(0,10),hasta});
    const measured = aggregates.metrics?.[metricKeys[indicator]];
    const baseline = measured == null ? null : Number(measured)*20;

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
      external_action: data.external_action ?? data.externalAction ?? false,
      creator_id: sstUserId
    };

    const result = await sstRepository.createInterventionWithAlertTransition(payload);

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
    // El formulario ofrece detalles opcionales; la columna NOT NULL conserva cadena vacía.
    data = { ...data,description: data.description === undefined ? '' : data.description };
    // 1. Validar el consentimiento específico de apoyo (c3_apoyo) para tratamiento de datos sensibles
    const consent = await consentRepository.findActiveByUserId(userId);
    if (!tieneConsentimientoActivo(consent, 'c3_apoyo')) {
      throw new AppError('Requiere consentimiento C3 para solicitar apoyo psicosocial', 'CONSENT_C3_REQUIRED', 403);
    }

    // 2. Generar el identificador visual de radicado según la modalidad de anonimato solicitada.
    if (!['anonimo','identificado'].includes(data.mode) || !['alta','media','baja','critica'].includes(data.urgency) || typeof data.reason !== 'string' || !data.reason.trim() || data.reason.length > 100 || typeof data.description !== 'string' || data.description.length > 1000) {
      throw new AppError('Modalidad, urgencia, motivo o descripción inválidos','SUPPORT_INVALID_PAYLOAD',400);
    }
    const isAnonymous = data.mode === 'anonimo';
    const contact = data.contact_preference ?? data.contactPreference ?? 'app';
    const window = data.time_window ?? data.timeWindow ?? null;
    if (!isAnonymous && (typeof contact !== 'string' || contact.length > 30 || (window !== null && (typeof window !== 'string' || window.length > 50)))) {
      throw new AppError('Preferencia de contacto o franja inválida','SUPPORT_INVALID_PAYLOAD',400);
    }
    const prefix = isAnonymous ? 'ANON' : 'APO';
    const code = `${prefix}-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const id = `sup-${crypto.randomUUID()}`;
    const payload = {
      ...data,
      id,
      code,
      contact_preference: isAnonymous ? 'app' : (data.contact_preference ?? data.contactPreference ?? 'app'),
      time_window: isAnonymous ? 'No aplica' : (data.time_window ?? data.timeWindow ?? null),
      owner_user_id: userId,
      // Si el empleado exige anonimato en su formulario, la identidad concreta
      // se disocia del ticket para los analistas de SST.
      identity_user_id: isAnonymous ? null : userId
    };

    const created = await sstRepository.createSupportRequest(payload);
    
    return created;
  },

  async updateAlert(alertId, data, actorId) {
    if (!['GENERADA','EN_REVISION','INTERVENIDA','DESCARTADA'].includes(data.status)) throw new AppError('Estado inválido','INVALID_STATUS',400);
    const reason = data.dismissReason ?? data.dismiss_reason;
    if (data.status === 'DESCARTADA' && (typeof reason !== 'string' || reason.trim().length < 10)) throw new AppError('Justificación requerida','ALERT_REASON_REQUIRED',400);
    const result = await sstRepository.updateAlertStatus(alertId, {status:data.status,dismissReason:reason},actorId);
    if (!result) throw new AppError('Alerta no encontrada','ALERT_NOT_FOUND',404);
    return result.respondents < 5 ? {...result,description:null,evidence:null,protected:true} : result;
  },
  async updateSupportRequestStatus(requestId, status, actorId) {
    if (!['Recibida', 'En gestion', 'Atendida', 'Cerrada'].includes(status)) throw new AppError('Estado inválido', 'INVALID_STATUS', 400);
    const result = await sstRepository.updateSupportRequestStatus(requestId, status, actorId);
    if (!result) throw new AppError('Caso no encontrado', 'SUPPORT_NOT_FOUND', 404);

    // 1. Si se cerró una sesión de chat activa vinculada al radicado, emitir support:chat:ended en tiempo real
    if (result._closedChat) {
      emitToUser(result._closedChat.agentId, 'support:chat:ended', {
        sessionId: result._closedChat.sessionId,
        requestId,
        status,
        message: 'La conversación de este radicado ha sido concluida.'
      });
      emitToRole('SST', 'support:chat:ended', {
        sessionId: result._closedChat.sessionId,
        requestId,
        status,
        message: 'Conversación concluida por avance de estado del caso.'
      });
    }

    // 2. Notificar cambio de estado del radicado al agente solicitante
    if (result._internalOwnerId) {
      emitToUser(result._internalOwnerId, 'support:request:statusChanged', {
        requestId,
        code: result.code,
        status
      });
    }

    const { _internalOwnerId, _closedChat, ...cleanData } = result;
    return cleanData;
  }
};
