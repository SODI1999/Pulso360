// src/features/agent/services/agentQueries.jsx
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { onLogout } from '../../../core/auth/authService';
import { normalizeConsent } from '../../../core/auth/consentContract';

/**
 * Normaliza una fila cruda de check-in (snake_case o camelCase) a contrato canónico de frontend.
 *
 * @param {Object} row - Fila cruda de check-in.
 * @param {string} userId - Identificador del titular del registro.
 * @returns {Object} Objeto de check-in normalizado.
 */
export const normalizeCheckin = (row, userId) => ({
  ...row,
  userId,
  journeyKey: row.checkin_date || row.journeyKey,
  date: row.checkin_date || row.date,
  cargaEmocional: row.carga_emocional ?? row.cargaEmocional,
  submittedAt: row.submitted_at || row.submittedAt
});

const agentRecordsCache = new Map();

/**
 * Limpia la caché local en memoria de registros del agente.
 *
 * @param {string} [userId] - Identificador opcional para invalidar solo su caché.
 */
export function clearAgentCache(userId) {
  if (userId) {
    agentRecordsCache.delete(userId);
  } else {
    agentRecordsCache.clear();
  }
}

onLogout(() => clearAgentCache());

/**
 * Obtiene los registros del agente desde la caché en memoria.
 *
 * @param {string} userId - Identificador del usuario agente.
 * @returns {Object} Conjunto de registros (checkins, journals, solicitudes, consentimientos).
 */
export function getAgentRecords(userId) {
  if (userId && agentRecordsCache.has(userId)) {
    return agentRecordsCache.get(userId);
  }
  return { settings: {}, consents: {}, checkins: [], journals: [], supportRequests: [], habeasRequests: [] };
}

/**
 * Consulta asíncrona de los registros del agente al servidor backend REST PostgreSQL.
 *
 * @param {string} userId - Identificador del usuario agente autenticado.
 * @returns {Promise<Object>} Promesa que resuelve los registros normalizados del agente.
 * @throws {Error} Si la sesión es inválida o falla la red.
 */
export async function fetchAgentRecords(userId) {
  if (!getAuthToken()) {
    throw new Error('Sesión no válida o expirada.');
  }
  try {
    const [checkinsRes, journalsRes, supportsRes, habeasRes, consentRes] = await Promise.all([
      apiClient.get('/agent/checkin/history'),
      apiClient.get('/agent/journal'),
      apiClient.get('/agent/support-requests'),
      apiClient.get('/agent/habeas-data'),
      apiClient.get('/agent/consent')
    ]);

    const extract = (res) => res?.data?.data || res?.data || [];
    const extractSingle = (res) => res?.data?.data || res?.data || null;

    const rawCheckins = extract(checkinsRes);
    const rawJournals = extract(journalsRes);
    const rawSupport = extract(supportsRes);
    const rawHabeas = extract(habeasRes);

    const normalizedConsent = normalizeConsent(extractSingle(consentRes));

    const records = {
      settings: {
        policyVersion: normalizedConsent?.policy?.version || null,
        policyEffectiveDate: normalizedConsent?.policy?.vigente_desde || null,
        checkinEditHours: 2,
        umbralMinimo: 5
      },
      consents: { [userId]: normalizedConsent },
      checkins: (Array.isArray(rawCheckins) ? rawCheckins : []).map((c) => ({
        id: c.id,
        userId,
        journeyKey: c.checkin_date || c.journeyKey,
        date: c.checkin_date || c.date,
        energia: c.energia,
        cargaEmocional: c.carga_emocional || c.cargaEmocional,
        recuperacion: c.recuperacion,
        apoyo: c.apoyo,
        distanciamiento: c.distanciamiento,
        ineficacia: c.ineficacia,
        submittedAt: c.submitted_at || c.created_at || c.submittedAt
      })),
      journals: (Array.isArray(rawJournals) ? rawJournals : []).map((j) => ({
        id: j.id,
        userId,
        context: j.context,
        text: j.content || j.text,
        date: j.entry_date?.slice(0, 10) || j.date,
        createdAt: j.created_at || j.createdAt,
        updatedAt: j.updated_at || j.updatedAt,
        analysis: j.analysis_json || j.analysis || null,
        contentHash: j.content_hash,
        analysisHistory: j.analysis_history || [],
        correctedCategories: j.corrected_categories_json ?? j.correctedCategories,
        correctionNote: j.correction_note || j.correctionNote,
        correctionHistory: j.correction_history || j.correctionHistory || []
      })),
      supportRequests: (Array.isArray(rawSupport) ? rawSupport : []).map((r) => ({
        id: r.id,
        code: r.code,
        ownerUserId: userId,
        identityUserId: r.mode === 'anonimo' ? null : userId,
        mode: r.mode,
        date: r.request_date?.slice(0, 10) || r.date,
        urgency: r.urgency,
        reason: r.reason,
        description: r.description,
        contactPreference: r.contact_preference || r.contactPreference,
        timeWindow: r.time_window || r.timeWindow,
        status: r.status,
        assignedTo: r.assigned_to || r.assignedTo,
        sla: r.sla_status || r.sla
      })),
      habeasRequests: (Array.isArray(rawHabeas) ? rawHabeas : []).map((h) => ({
        id: h.id,
        code: h.code,
        userId,
        date: h.created_at?.slice(0, 10) || h.date,
        createdAt: h.created_at || h.createdAt,
        type: h.request_type || h.type,
        status: h.status,
        details: h.note || h.details,
        note: h.note,
        deadline: h.deadline
      }))
    };

    if (userId) {
      agentRecordsCache.set(userId, records);
    }
    return records;
  } catch (err) {
    throw new Error(err.response?.data?.error?.message || 'No se pudieron cargar tus registros.');
  }
}
