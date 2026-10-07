import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';
import { clearAdminCache } from './adminQueries';

export async function confirmAdvance(requestId, nextStatus, note, actorLabel) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) {
      return { success:false,data:null,error: 'Sesión no válida o token ausente' };
    }
    try {
      const res = await apiClient.patch('/admin/habeas-data/' + requestId, { status: nextStatus, note });
      clearAdminCache();
      return { ...res, req: res.data };
    } catch (error) {
      return { success:false,data:null,error: error.response?.data?.error?.message || 'Error en el servidor' };
    }
  }

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

  return { success:true,data:req, req };
}
