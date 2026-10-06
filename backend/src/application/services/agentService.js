import { AppError } from '../errors/AppError.js';
import { validarDimensionesCheckin, tieneConsentimientoActivo } from '../../domain/privacyRules.js';
import { consentRepository } from '../../infrastructure/repositories/consentRepository.js';
import { checkinRepository } from '../../infrastructure/repositories/checkinRepository.js';
import { journalRepository } from '../../infrastructure/repositories/journalRepository.js';
import { userRepository } from '../../infrastructure/repositories/userRepository.js';
import { sstRepository } from '../../infrastructure/repositories/sstRepository.js';
import crypto from 'node:crypto';
import { currentJourney } from '../../domain/journey.js';
import { validateAnalysis } from './lexiconService.js';

export const agentService = {
  async getConsentStatus(userId) {
    const [consent, policy, history] = await Promise.all([
      consentRepository.findActiveByUserId(userId), consentRepository.findLatestPublishedPolicy(),
      consentRepository.findHistory(userId)
    ]);
    if (!consent) {
      return {
        policy, history,
        politica_version: null,
        acepta_politica: false,
        acepta_aviso_privacidad: false,
        c1_checkin: false,
        c2_bitacora: false,
        c3_apoyo: false,
        c4_analitica: false,
        c5_contacto: false,
        registrado_en: null,
        active: false,
        version: null,
        flags: {
          c1_checkin: false,
          c2_bitacora: false,
          c3_apoyo: false,
          c4_analitica: false,
          c5_contacto: false
        }
      };
    }
    return {
      policy, history,
      politica_vigente: consent.politica_vigente,
      politica_version: consent.politica_version,
      acepta_politica: consent.acepta_politica,
      acepta_aviso_privacidad: consent.acepta_aviso_privacidad,
      c1_checkin: consent.c1_checkin,
      c2_bitacora: consent.c2_bitacora,
      c3_apoyo: consent.c3_apoyo,
      c4_analitica: consent.c4_analitica,
      c5_contacto: consent.c5_contacto,
      registrado_en: consent.registrado_en ? new Date(consent.registrado_en).toISOString() : null,
      active: consent.acepta_politica && consent.politica_vigente,
      version: consent.politica_version,
      flags: {
        c1_checkin: consent.c1_checkin,
        c2_bitacora: consent.c2_bitacora,
        c3_apoyo: consent.c3_apoyo,
        c4_analitica: consent.c4_analitica,
        c5_contacto: consent.c5_contacto
      }
    };
  },

  async updateConsent(userId, flags = {}, ipOrigen) {
    const policy = await consentRepository.findLatestPublishedPolicy();
    if (!policy) {
      throw new AppError('No hay política de privacidad activa', 'NO_ACTIVE_POLICY', 500);
    }

    if (!flags || typeof flags !== 'object' || Array.isArray(flags)) {
      throw new AppError('Cuerpo de solicitud inválido para actualización de consentimiento', 'CONSENT_INVALID_PAYLOAD', 400);
    }

    for (const key of ['acepta_politica', 'acepta_aviso_privacidad', 'c1_checkin', 'c2_bitacora', 'c3_apoyo', 'c4_analitica', 'c5_contacto']) {
      if (flags[key] !== undefined && typeof flags[key] !== 'boolean') {
        throw new AppError('Las preferencias deben ser booleanas', 'CONSENT_INVALID_PAYLOAD', 400);
      }
    }
    if (flags.policyVersion && flags.policyVersion !== policy.version) {
      throw new AppError('La política cambió. Revísala antes de guardar.', 'CONSENT_POLICY_CHANGED', 409);
    }
    const latestConsent = await consentRepository.findActiveByUserId(userId);
    const currentConsent = latestConsent?.politica_vigente ? latestConsent : null;

    const mergedFlags = {
      acepta_politica: flags.acepta_politica !== undefined 
        ? flags.acepta_politica === true 
        : (currentConsent ? currentConsent.acepta_politica : false),
      acepta_aviso_privacidad: flags.acepta_aviso_privacidad !== undefined 
        ? (flags.acepta_aviso_privacidad === true || flags.acepta_politica === true)
        : (currentConsent ? currentConsent.acepta_aviso_privacidad : false),
      c1_checkin: flags.c1_checkin !== undefined 
        ? Boolean(flags.c1_checkin) 
        : (currentConsent ? currentConsent.c1_checkin : false),
      c2_bitacora: flags.c2_bitacora !== undefined 
        ? Boolean(flags.c2_bitacora) 
        : (currentConsent ? currentConsent.c2_bitacora : false),
      c3_apoyo: flags.c3_apoyo !== undefined 
        ? Boolean(flags.c3_apoyo) 
        : (currentConsent ? currentConsent.c3_apoyo : false),
      c4_analitica: flags.c4_analitica !== undefined 
        ? Boolean(flags.c4_analitica) 
        : (currentConsent ? currentConsent.c4_analitica : false),
      c5_contacto: flags.c5_contacto !== undefined 
        ? Boolean(flags.c5_contacto) 
        : (currentConsent ? currentConsent.c5_contacto : false)
    };
    
    // Si no acepta política, el resto de flags deben ser false
    if (!mergedFlags.acepta_politica) {
      mergedFlags.c1_checkin = false;
      mergedFlags.c2_bitacora = false;
      mergedFlags.c3_apoyo = false;
      mergedFlags.c4_analitica = false;
      mergedFlags.c5_contacto = false;
    }

    const id = `con-${crypto.randomUUID()}`;
    await consentRepository.createConsentEvent({
      id,
      userId,
      politicaId: policy.id,
      tipoEvento: 'ACTUALIZACION',
      flags: mergedFlags,
      ipOrigen: ipOrigen || '0.0.0.0'
    });

    return await this.getConsentStatus(userId);
  },

  async getTodayCheckin(userId) {
    const profile = await userRepository.findProfileById(userId);
    const today = currentJourney(profile?.shift_start_hour);
    const checkin = await checkinRepository.findByUserAndDate(userId, today);
    return {
      completed: Boolean(checkin),
      checkin: checkin || null
    };
  },

  async registerCheckin(userId, data) {
    const consent = await consentRepository.findActiveByUserId(userId);
    if (!tieneConsentimientoActivo(consent, 'c1_checkin')) {
      throw new AppError('Requiere consentimiento C1 para registrar check-in', 'CONSENT_C1_REQUIRED', 403);
    }

    const profile = await userRepository.findProfileById(userId);
    const bogotaToday = currentJourney(profile?.shift_start_hour);
    const suppliedDate = data.checkin_date || data.checkinDate;
    if (suppliedDate && suppliedDate !== bogotaToday) {
      throw new AppError('La jornada cambió. Actualiza el formulario.', 'CHECKIN_JOURNEY_CHANGED', 409);
    }

    const normalizedData = {
      ...data,
      carga_emocional: data.carga_emocional !== undefined ? data.carga_emocional : data.cargaEmocional,
      journey_key: data.journey_key || data.journeyKey || 'START_SHIFT',
      checkin_date: data.checkin_date || data.checkinDate || bogotaToday
    };

    const { valid, errors } = validarDimensionesCheckin(normalizedData);
    if (!valid) {
      throw new AppError(errors[0], 'CHECKIN_INVALID_DIMENSIONS', 400);
    }

    const today = normalizedData.checkin_date;
    const existing = await checkinRepository.findByUserAndDate(userId, today);
    
    if (existing) {
      const windowLimit = 7200000; // 2 horas en ms
      const submittedAt = new Date(existing.submitted_at || existing.created_at).getTime();
      if (Date.now() - submittedAt <= windowLimit) {
        return await checkinRepository.update(existing.id, {
          energia: normalizedData.energia,
          cargaEmocional: normalizedData.carga_emocional,
          recuperacion: normalizedData.recuperacion,
          apoyo: normalizedData.apoyo,
          distanciamiento: normalizedData.distanciamiento,
          ineficacia: normalizedData.ineficacia
        });
      } else {
        throw new AppError('Ventana de edición de check-in expirada para la jornada actual', 'CHECKIN_EDIT_WINDOW_EXPIRED', 409);
      }
    }

    const assignment = await userRepository.findActiveAssignment(userId);
    const asignacionId = assignment ? assignment.id : null;

    const id = `chk-${crypto.randomUUID()}`;
    const newCheckin = await checkinRepository.create({
      id,
      userId,
      asignacionId,
      journeyKey: normalizedData.journey_key,
      checkinDate: today,
      energia: normalizedData.energia,
      cargaEmocional: normalizedData.carga_emocional,
      recuperacion: normalizedData.recuperacion,
      apoyo: normalizedData.apoyo,
      distanciamiento: normalizedData.distanciamiento,
      ineficacia: normalizedData.ineficacia
    });

    return newCheckin;
  },

  async getCheckinHistory(userId, limit = 30) {
    return await checkinRepository.findHistoryByUser(userId, limit);
  },

  async createJournalEntry(userId, { context, content }) {
    const consent = await consentRepository.findActiveByUserId(userId);
    if (!tieneConsentimientoActivo(consent, 'c2_bitacora')) {
      throw new AppError('Requiere consentimiento C2 para desahogo personal en bitácora', 'CONSENT_C2_REQUIRED', 403);
    }

    if (typeof content !== 'string' || content.trim().length < 5) {
      throw new AppError('El contenido de la bitácora no puede estar vacío o tener menos de 5 caracteres', 'JOURNAL_CONTENT_EMPTY', 400);
    }

    if (context !== undefined && (typeof context !== 'string' || context.length > 60)) throw new AppError('Contexto inválido','JOURNAL_CONTEXT_INVALID',400);
    const assignment = await userRepository.findActiveAssignment(userId);
    const asignacionId = assignment ? assignment.id : null;
    const profile = await userRepository.findProfileById(userId);
    const today = currentJourney(profile?.shift_start_hour);
    
    const id = `jou-${crypto.randomUUID()}`;
    const newEntry = await journalRepository.create({
      id,
      userId,
      asignacionId,
      entryDate: today,
      context: context || 'REGULAR',
      content: content.trim()
    });

    return newEntry;
  },

  async getMyJournalEntries(userId) {
    return await journalRepository.findByUserId(userId);
  },

  async deleteJournalEntry(userId, journalId) {
    const deletedRow = await journalRepository.delete(journalId, userId);
    if (!deletedRow) {
      throw new AppError('Bitácora no encontrada o no pertenece al usuario', 'JOURNAL_NOT_FOUND', 404);
    }
    return { id: journalId, deleted: true };
  },

  async updateJournalEntry(userId, journalId, data) {
    const consent = await consentRepository.findActiveByUserId(userId);
    if (!tieneConsentimientoActivo(consent, 'c2_bitacora')) {
      throw new AppError('Requiere consentimiento C2 activo para editar bitácora', 'CONSENT_C2_REQUIRED', 403);
    }

    const content = data.content === undefined ? undefined : (typeof data.content === 'string' ? data.content.trim() : '');
    let analysisJson = Object.hasOwn(data, 'analysis') ? data.analysis : data.analysis_json;
    if (data.context !== undefined && (typeof data.context !== 'string' || data.context.length > 60)) {
      throw new AppError('Contexto inválido', 'JOURNAL_CONTEXT_INVALID',400);
    }
    if (content === undefined && analysisJson === undefined && data.context === undefined) {
      throw new AppError('Datos insuficientes para actualizar bitácora', 'INVALID_JOURNAL_UPDATE', 400);
    }

    if (content !== undefined && content.length < 5) {
      throw new AppError('El contenido de la bitácora no puede tener menos de 5 caracteres', 'JOURNAL_CONTENT_EMPTY', 400);
    }

    if (analysisJson !== undefined && !tieneConsentimientoActivo(consent, 'c3_apoyo')) {
      throw new AppError('Requiere C3 para procesar el análisis', 'CONSENT_C3_REQUIRED', 403);
    }
    if (analysisJson !== undefined && analysisJson !== null && (!Array.isArray(analysisJson.categories) || typeof analysisJson.version !== 'string')) {
      throw new AppError('Análisis inválido', 'JOURNAL_ANALYSIS_INVALID', 400);
    }
    if (analysisJson != null) analysisJson = await validateAnalysis(analysisJson,userId);
    const updated = await journalRepository.update(journalId, userId, {
      content, context:data.context, analysis: analysisJson, contentHash: data.contentHash
    });
    if (!updated) {
      throw new AppError('Bitácora no encontrada o no pertenece al usuario', 'JOURNAL_NOT_FOUND', 404);
    }
    return updated;
  },

  async correctJournal(userId, journalId, data) {
    const consent = await consentRepository.findActiveByUserId(userId);
    if (!tieneConsentimientoActivo(consent, 'c2_bitacora') || !tieneConsentimientoActivo(consent, 'c3_apoyo')) {
      throw new AppError('Requiere consentimiento C2 y C3 vigente', 'CONSENT_C3_REQUIRED', 403);
    }
    if (!Array.isArray(data.categories) || data.categories.some(c => typeof c !== 'string') || typeof data.note !== 'string' || data.note.length > 200) {
      throw new AppError('Revisión inválida', 'JOURNAL_CORRECTION_INVALID', 400);
    }
    const updated = await journalRepository.update(journalId, userId, {
      contentHash: data.contentHash, correction: { categories: [...new Set(data.categories)], note: data.note.trim() }
    });
    if (!updated) throw new AppError('Entrada no disponible', 'JOURNAL_NOT_FOUND', 404);
    return updated;
  },

  async createHabeasDataRequest(userId, { type, note }) {
    const validTypes = ['Portabilidad', 'Rectificacion', 'Supresion', 'Consulta'];
    if (!validTypes.includes(type)) {
      throw new AppError('Tipo de solicitud Habeas Data inválido', 'INVALID_HABEAS_TYPE', 400);
    }

    const id = `HD-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const newRequest = await userRepository.createHabeasDataRequest({
      id, userId, type, note
    });

    return newRequest;
  },

  async getMySupportRequests(userId) {
    return await sstRepository.findSupportRequestsByUser(userId);
  },

  async getMyHabeasData(userId) {
    return await userRepository.findHabeasDataRequestsByUser(userId);
  }
};
