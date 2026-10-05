import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export async function markAllRead(currentUser) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) {
      return false;
    }
    try {
      await apiClient.patch('/notifications/read-all');
      return true;
    } catch (err) {
      console.warn('Error markAllRead API', err);
      return false;
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

  return updated;
}

export async function markNotificationRead(notif) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) {
      return false;
    }
    try {
      await apiClient.patch('/notifications/' + notif.id + '/read');
      return true;
    } catch (err) {
      console.warn('Error markNotificationRead API', err);
      return false;
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

  return updated;
}
