import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { clearAgentCache } from './agentQueries';

/**
 * Submits a statutory Habeas Data request (Access, Rectification, Suppression/Revocation).
 * Enforces legal deadlines via backend.
 *
 * @param {'Acceso'|'Rectificacion'|'Supresion'|'Revocatoria'} requestType - ARCO request modality.
 * @param {Object} currentUser - Current user session.
 * @param {string} noteText - Justification or request detail provided by the agent.
 * @returns {Promise<{success: boolean, data?: {id: string}, generatedId?: string, error?: string}>} Outcome with radicado identifier.
 */
export async function createHabeasRequest(requestType, currentUser, noteText) {
  if (!getAuthToken()) {
    return { success: false, data: null, error: 'Sesión no válida o token ausente' };
  }
  try {
    const res = await apiClient.post('/agent/habeas-data', { type: requestType, note: noteText });
    clearAgentCache(currentUser?.id);
    return { ...res, generatedId: res.data.id };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err.response?.data?.error?.message || 'Error al crear solicitud Habeas Data en el servidor'
    };
  }
}
