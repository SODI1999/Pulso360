import { AppError } from '../errors/AppError.js';
import { validarDimensionesCheckin, tieneConsentimientoActivo } from '../../domain/privacyRules.js';
import { consentRepository } from '../../infrastructure/repositories/consentRepository.js';
import { checkinRepository } from '../../infrastructure/repositories/checkinRepository.js';
import { journalRepository } from '../../infrastructure/repositories/journalRepository.js';
import { userRepository } from '../../infrastructure/repositories/userRepository.js';

export const agentService = {
  async getConsentStatus(userId) {
    const consent = await consentRepository.findActiveByUserId(userId);
    if (!consent) {
      return {
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
      politica_version: consent.politica_version,
      acepta_politica: consent.acepta_politica,
      acepta_aviso_privacidad: consent.acepta_aviso_privacidad,
      c1_checkin: consent.c1_checkin,
      c2_bitacora: consent.c2_bitacora,
      c3_apoyo: consent.c3_apoyo,
      c4_analitica: consent.c4_analitica,
      c5_contacto: consent.c5_contacto,
      registrado_en: consent.registrado_en ? new Date(consent.registrado_en).toISOString() : null,
      active: consent.acepta_politica,
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

    const currentConsent = await consentRepository.findActiveByUserId(userId);

    const mergedFlags = {
      acepta_politica: flags.acepta_politica !== undefined 
        ? Boolean(flags.acepta_politica) 
        : (currentConsent ? currentConsent.acepta_politica : true),
      acepta_aviso_privacidad: flags.acepta_aviso_privacidad !== undefined 
        ? Boolean(flags.acepta_aviso_privacidad) 
        : (currentConsent ? currentConsent.acepta_aviso_privacidad : true),
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
    
    // Si no acepta política o aviso, el resto de flags deben ser false
    if (!mergedFlags.acepta_politica || !mergedFlags.acepta_aviso_privacidad) {
      mergedFlags.c1_checkin = false;
      mergedFlags.c2_bitacora = false;
      mergedFlags.c3_apoyo = false;
      mergedFlags.c4_analitica = false;
      mergedFlags.c5_contacto = false;
    }

    const id = `con-${Date.now()}`;
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
    const today = new Date().toISOString().split('T')[0];
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

    const { valid, errors } = validarDimensionesCheckin(data);
    if (!valid) {
      throw new AppError(errors[0], 'CHECKIN_INVALID_DIMENSIONS', 400);
    }

    const today = data.checkin_date || new Date().toISOString().split('T')[0];
    const existing = await checkinRepository.findByUserAndDate(userId, today);
    if (existing) {
      throw new AppError('Ya registraste tu check-in diario para hoy', 'CHECKIN_ALREADY_REGISTERED_TODAY', 409);
    }

    const assignment = await userRepository.findActiveAssignment(userId);
    const asignacionId = assignment ? assignment.id : null;

    const id = `chk-${Date.now()}`;
    const newCheckin = await checkinRepository.create({
      id,
      userId,
      asignacionId,
      journeyKey: data.journey_key || 'START_SHIFT',
      checkinDate: today,
      energia: data.energia,
      cargaEmocional: data.carga_emocional,
      recuperacion: data.recuperacion,
      apoyo: data.apoyo,
      distanciamiento: data.distanciamiento,
      ineficacia: data.ineficacia
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

    if (!content || content.trim().length < 5) {
      throw new AppError('El contenido de la bitácora no puede estar vacío o tener menos de 5 caracteres', 'JOURNAL_CONTENT_EMPTY', 400);
    }

    const assignment = await userRepository.findActiveAssignment(userId);
    const asignacionId = assignment ? assignment.id : null;
    const today = new Date().toISOString().split('T')[0];
    
    const id = `jou-${Date.now()}`;
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
  }
};
