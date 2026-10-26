import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { clearAdminCache } from './adminQueries';

export async function confirmAdvance(requestId, nextStatus, note) {
  if (!getAuthToken()) {
    return { success: false, data: null, error: 'Sesión no válida o token ausente' };
  }
  try {
    const res = await apiClient.patch('/admin/habeas-data/' + requestId, { status: nextStatus, note });
    clearAdminCache();
    return { ...res, req: res.data };
  } catch (error) {
    return { success: false, data: null, error: error.response?.data?.error?.message || 'Error en el servidor' };
  }
}
