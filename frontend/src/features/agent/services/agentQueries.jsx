import { pulsoStore } from '../../../core/storage/pulsoStore';

import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export function getAgentRecords(userId) {
  const data = pulsoStore.get();
  return {
    settings: data.settings,
    consents: { [userId]: data.consents?.[userId] },
    checkins: (data.checkins || []).filter((row) => row.userId === userId),
    journals: (data.journals || []).filter((row) => row.userId === userId),
    supportRequests: (data.supportRequests || []).filter((row) => row.ownerUserId === userId),
    habeasRequests: (data.habeasRequests || []).filter((row) => row.userId === userId)
  };
}

export async function fetchAgentRecords(userId) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) {
      return { settings: {}, consents: {}, checkins: [], journals: [], supportRequests: [], habeasRequests: [] };
    }
    try {
      const [checkinsRes, journalsRes, supportsRes, habeasRes, consentRes] = await Promise.all([
        apiClient.get('/agent/checkin/history').catch(() => ({ data: [] })),
        apiClient.get('/agent/journal').catch(() => ({ data: [] })),
        apiClient.get('/agent/support-requests').catch(() => ({ data: [] })),
        apiClient.get('/agent/habeas-data').catch(() => ({ data: [] })),
        apiClient.get('/agent/consent').catch(() => ({ data: null }))
      ]);
      
      const extract = (res) => res?.data?.data || res?.data || [];
      const extractSingle = (res) => res?.data?.data || res?.data || null;
      
      const rawCheckins = extract(checkinsRes);
      const rawJournals = extract(journalsRes);
      const rawSupport = extract(supportsRes);
      const rawHabeas = extract(habeasRes);
      const consentData = extractSingle(consentRes);

      return {
        settings: {
          policyVersion: env.policyVersion || 'v1.0.0',
          policyEffectiveDate: env.policyEffectiveDate || '2026-08-01'
        },
        consents: { [userId]: consentData },
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
           submittedAt: c.created_at || c.submittedAt
        })),
        journals: (Array.isArray(rawJournals) ? rawJournals : []).map((j) => ({
           id: j.id,
           userId,
           context: j.context,
           text: j.content || j.text,
           date: j.created_at?.slice(0, 10) || j.date,
           createdAt: j.created_at || j.createdAt,
           updatedAt: j.updated_at || j.updatedAt,
           analysis: j.analysis_result || j.analysis,
           correctedCategories: j.corrected_categories || j.correctedCategories,
           correctionNote: j.correction_note || j.correctionNote,
           correctionHistory: j.correction_history || j.correctionHistory || []
        })),
        supportRequests: (Array.isArray(rawSupport) ? rawSupport : []).map((r) => ({
           id: r.id,
           code: r.code,
           ownerUserId: userId,
           identityUserId: r.mode === 'anonimo' ? null : userId,
           mode: r.mode,
           date: r.created_at?.slice(0, 10) || r.date,
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
           type: h.request_type || h.type,
           status: h.status,
           details: h.details
        }))
      };
    } catch (err) {
      console.error('Error fetching agent records:', err);
      return { settings: {}, consents: {}, checkins: [], journals: [], supportRequests: [], habeasRequests: [] };
    }
  }

  return getAgentRecords(userId);
}
