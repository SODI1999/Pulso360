import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export async function markAllRead(currentUser) {
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

  if (!env.useMockStorage && getAuthToken()) {
    try {
      apiClient.patch('/notifications/read-all').catch(err => console.warn('Error markAllRead API in background', err));
    } catch {
      // Ignored
    }
  }

  return updated;
}

export async function markNotificationRead(notif) {
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

  if (updated && !env.useMockStorage && getAuthToken()) {
    try {
      apiClient.patch('/notifications/' + notif.id + '/read').catch(err => console.warn('Error markNotificationRead API in background', err));
    } catch {
      // Ignored
    }
  }

  return updated;
}
