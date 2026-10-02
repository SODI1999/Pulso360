import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export async function confirmAdvance(requestId, nextStatus, note, actorLabel) {
  const data = pulsoStore.get();
  const req = (data.habeasRequests || []).find((item) => item.id === requestId);
  if (!req) return null;

  req.status = nextStatus;
  if (note) req.note = note;

  pulsoStore.save(data);

  pulsoStore.audit({
    actor: actorLabel,
    action: 'GESTION_HABEAS_DATA',
    target: `${req.id} (${req.type}) -> Estado: ${nextStatus} · Constancia: ${note || 'Sin nota'}`
  });

  if (!env.useMockStorage && getAuthToken()) {
    try {
      await apiClient.patch('/admin/habeas-data/' + requestId, { status: nextStatus, note });
    } catch (error) {
      console.error('Error updating habeas data request via API:', error);
    }
  }

  return { req };
}
