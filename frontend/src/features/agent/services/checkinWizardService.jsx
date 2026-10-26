import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { normalizeCheckin, clearAgentCache } from './agentQueries';

/**
 * Persists an agent daily check-in record to the remote API.
 * Handles validation, payload normalization across BPO wellbeing dimensions, and cache invalidation.
 *
 * @param {Object|null} existingCheckin - Existing check-in object if editing, or null for new submissions.
 * @param {Object} user - Currently authenticated user object (must contain id and role).
 * @param {string} journeyKey - Shift identifier / date formatted string (e.g., 'YYYY-MM-DD').
 * @param {Object} draft - Key-value map of question responses (energia, cargaEmocional, recuperacion, etc.).
 * @returns {Promise<{success: boolean, data: Object|null, payload?: Object, error?: string}>} Operation outcome with normalized payload or error message.
 */
export async function saveCheckin(existingCheckin, user, journeyKey, draft) {
  if (!getAuthToken()) return { success: false, data: null, error: 'Sesión no válida o expirada.' };
  try {
    const payloadBody = {
      journey_key: journeyKey,
      checkin_date: journeyKey,
      energia: draft.energia != null ? Number(draft.energia) : null,
      carga_emocional: (draft.cargaEmocional ?? draft.carga_emocional) != null ? Number(draft.cargaEmocional ?? draft.carga_emocional) : null,
      recuperacion: draft.recuperacion != null ? Number(draft.recuperacion) : null,
      apoyo: draft.apoyo != null ? Number(draft.apoyo) : null,
      distanciamiento: draft.distanciamiento != null ? Number(draft.distanciamiento) : null,
      ineficacia: draft.ineficacia != null ? Number(draft.ineficacia) : null
    };

    const res = await apiClient.post('/agent/checkin', payloadBody);
    clearAgentCache(user.id);
    return { ...res, payload: normalizeCheckin(res.data, user.id) };
  } catch (err) {
    return { success: false, data: null, error: err.response?.data?.error?.message || 'Error al registrar check-in' };
  }
}
