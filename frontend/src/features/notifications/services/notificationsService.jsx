import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export async function markAllRead(currentUser) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) {
      throw new Error('Sesión no válida o expirada.');
    }
    try {
      return await apiClient.patch('/notifications/read-all');
    } catch (err) {
      throw new Error(err.response?.data?.error?.message || 'No se pudo actualizar la lectura.');
    }
  }

  const data = pulsoStore.get();
  let updated = false;

  (data.notifications || []).forEach((item) => {
    if (item.role === currentUser?.role || item.userId === currentUser?.id) {
      if (!item.read) {
        item.read = true;
        updated = true;
      }
    }
  });

  if (updated) {
    pulsoStore.save(data);
  }

  return {success:true,data:{updated}};
}

export async function markNotificationRead(notif) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) {
      throw new Error('Sesión no válida o expirada.');
    }
    try {
      return await apiClient.patch('/notifications/' + notif.id + '/read');
    } catch (err) {
      throw new Error(err.response?.data?.error?.message || 'No se pudo actualizar la lectura.');
    }
  }

  let updated = false;
  if (!notif.read) {
    const data = pulsoStore.get();
    const target = (data.notifications || []).find((item) => item.id === notif.id);
    if (target) {
      target.read = true;
      pulsoStore.save(data);
      updated = true;
    }
  }

  return {success:true,data:{updated}};
}
