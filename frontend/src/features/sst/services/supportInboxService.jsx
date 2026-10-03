import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export async function advanceStatus(requestId, WORKFLOW_STATES) {
  const data = pulsoStore.get();
  const req = (data.supportRequests || []).find((r) => r.id === requestId);
  if (!req) return null;

  const currentIndex = WORKFLOW_STATES.indexOf(req.status);
  const nextStatus = WORKFLOW_STATES[Math.min(currentIndex + 1, WORKFLOW_STATES.length - 1)];

  if (!env.useMockStorage && getAuthToken()) {
    try {
      const res = await apiClient.patch('/sst/support-requests/' + requestId + '/status', { status: nextStatus });
      return { req: res.data, nextStatus };
    } catch (err) {
      return { error: err.response?.data?.error?.message || 'Error al avanzar caso en el servidor' };
    }
  }

  req.status = nextStatus;
  pulsoStore.save(data);

  return { req, nextStatus };
}
