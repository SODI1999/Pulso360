import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export function getNotificationData() {
  const { notifications } = pulsoStore.get();
  return { notifications };
}

export async function fetchNotifications() {
  if (!env.useMockStorage) {
    if (!getAuthToken()) return [];
    try {
      const response = await apiClient.get('/notifications');
      if (response.success && response.data) {
        return response.data;
      }
      return response.data || [];
    } catch (err) {
      console.warn('Error fetching notifications from API', err);
      return [];
    }
  }
  return pulsoStore.get().notifications || [];
}
