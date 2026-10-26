import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { clearAgentCache } from './agentQueries';

/**
 * Creates an occupational health and psychosocial support request (SST Acompañamiento).
 * Supports both anonymous and confidential identified modes, preserving psychological safety.
 *
 * @param {boolean} isAnonymous - Flag indicating whether identity should be obscured from SST specialists.
 * @param {'baja'|'media'|'alta'} urgency - Level of urgency selected for the consultation.
 * @param {'anonimo'|'identificado'} supportMode - Operational mode ('anonimo' or 'identificado').
 * @param {Object} currentUser - Authenticated agent session.
 * @param {string} reason - Occupational motive (e.g., 'Sobrecarga percibida', 'Tensión emocional').
 * @param {string} details - Detailed description or context provided by the agent.
 * @param {'app'|'directo'|'llamada'} contactPreference - Channel preference for SST contact.
 * @param {string} timeWindow - Preferred availability window during or outside shift.
 * @returns {Promise<{success: boolean, data?: {code: string}, code?: string, error?: string}>} Case radicado.
 */
export async function createSupportRequest(
  isAnonymous,
  urgency,
  supportMode,
  currentUser,
  reason,
  details,
  contactPreference,
  timeWindow
) {
  if (!getAuthToken()) {
    return { success: false, data: null, error: 'Sesión no válida o token ausente' };
  }
  try {
    const res = await apiClient.post('/sst/support-requests', {
      mode: isAnonymous ? 'anonimo' : 'identificado',
      reason,
      description: details.trim(),
      urgency,
      contact_preference: isAnonymous ? 'app' : contactPreference || 'app',
      time_window: isAnonymous ? 'No aplica' : timeWindow || 'No aplica'
    });
    clearAgentCache(currentUser?.id);
    return { ...res, code: res.data.code };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err.response?.data?.error?.message || 'Error al crear solicitud de apoyo en el servidor'
    };
  }
}
