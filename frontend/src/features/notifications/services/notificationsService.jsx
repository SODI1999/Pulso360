import { apiClient, getAuthToken } from '../../../core/api/apiClient';

export async function markAllRead() {
  if (!getAuthToken()) {
    throw new Error('Sesión no válida o expirada.');
  }
  try {
    return await apiClient.patch('/notifications/read-all');
  } catch (err) {
    throw new Error(err.response?.data?.error?.message || 'No se pudo actualizar la lectura.');
  }
}

export async function markNotificationRead(notif) {
  if (!getAuthToken()) {
    throw new Error('Sesión no válida o expirada.');
  }
  try {
    return await apiClient.patch('/notifications/' + notif.id + '/read');
  } catch (err) {
    throw new Error(err.response?.data?.error?.message || 'No se pudo actualizar la lectura.');
  }
}
