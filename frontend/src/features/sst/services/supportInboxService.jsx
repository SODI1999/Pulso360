import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export function advanceStatus(requestId, WORKFLOW_STATES) {
  const data = pulsoStore.get();
  const req = (data.supportRequests || []).find((r) => r.id === requestId);
  if (!req) return null;

  const currentIndex = WORKFLOW_STATES.indexOf(req.status);
  const nextStatus = WORKFLOW_STATES[Math.min(currentIndex + 1, WORKFLOW_STATES.length - 1)];

  req.status = nextStatus;
  pulsoStore.save(data);

  if (!env.useMockStorage && getAuthToken()) {
    apiClient.patch('/sst/support-requests/' + requestId + '/status', { status: nextStatus }).catch((err) => {
      console.warn('Backend: Sincronización de avance de caso fallida', err.message);
    });
  }

  return { req, nextStatus };
}
