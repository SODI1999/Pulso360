import { roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';
import { clearAgentCache } from './agentQueries';

/**
 * Calculates a future business date skipping Saturdays and Sundays.
 * Used for statutory response deadlines under Colombian Habeas Data legislation (Ley 1581 de 2012).
 *
 * @param {Date|string} startDate - Starting timestamp.
 * @param {number} daysCount - Number of business days to add.
 * @returns {string} Target date formatted as 'YYYY-MM-DD'.
 */
const addBusinessDays = (startDate, daysCount) => {
  const target = new Date(startDate);
  let added = 0;
  while (added < daysCount) {
    target.setDate(target.getDate() + 1);
    const dayOfWeek = target.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) added++;
  }
  return target.toISOString().slice(0, 10);
};

/**
 * Submits a statutory Habeas Data request (Access, Rectification, Suppression/Revocation).
 * Enforces legal deadlines (10 days for consultations, 15 days for claims/rectifications).
 *
 * @param {'Acceso'|'Rectificacion'|'Supresion'|'Revocatoria'} requestType - ARCO request modality.
 * @param {Object} currentUser - Current user session.
 * @param {string} noteText - Justification or request detail provided by the agent.
 * @returns {Promise<{success: boolean, data?: {id: string}, generatedId?: string, error?: string}>} Outcome with radicado identifier.
 */
export async function createHabeasRequest(requestType, currentUser, noteText) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) {
      return { success:false,data:null,error: 'Sesión no válida o token ausente' };
    }
    try {
      const res = await apiClient.post('/agent/habeas-data', { type: requestType, note: noteText });
      clearAgentCache(currentUser?.id);
      return { ...res,generatedId: res.data.id };
    } catch (err) {
      return { success:false,data:null,error: err.response?.data?.error?.message || 'Error al crear solicitud Habeas Data en el servidor' };
    }
  }

  const storeData = pulsoStore.get();
  storeData.habeasRequests = storeData.habeasRequests || [];

  const now = new Date();
  const currentYear = now.getFullYear();
  const seq =
    storeData.habeasRequests.filter((r) => String(r.id).startsWith(`HD-${currentYear}-`)).length + 1;
  const generatedId = `HD-${currentYear}-${String(seq).padStart(3, '0')}`;
  const businessDays = requestType === 'Rectificacion' || requestType === 'Supresion' ? 15 : 10;

  storeData.habeasRequests.unshift({
    id: generatedId,
    userId: currentUser.id,
    type: requestType,
    createdAt: now.toISOString(),
    status: 'Recibida',
    deadline: addBusinessDays(now, businessDays),
    note: noteText
  });

  pulsoStore.save(storeData);
  pulsoStore.audit({
    actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
    action: 'SOLICITUD_HABEAS_DATA',
    target: `${generatedId} · ${requestType}`
  });

  return { success:true,data:{id:generatedId},generatedId };
}
