import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { clearSstCache } from './sstQueries';

export async function advanceStatus(requestId, WORKFLOW_STATES, currentStatus) {
  if (!getAuthToken()) return { success: false, data: null, error: 'No autorizado' };
  const currentIndex = WORKFLOW_STATES.indexOf(currentStatus);
  const nextStatus = WORKFLOW_STATES[Math.min(currentIndex + 1, WORKFLOW_STATES.length - 1)];
  try {
    const res = await apiClient.patch('/sst/support-requests/' + requestId + '/status', { status: nextStatus });
    clearSstCache();
    return { ...res, req: res.data, nextStatus };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err.response?.data?.error?.message || 'Error al avanzar caso en el servidor'
    };
  }
}
