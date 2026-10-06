import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export function getNotificationData() {
  if (!env.useMockStorage) return { notifications:[] };
  const { notifications } = pulsoStore.get();
  return { notifications };
}

export async function fetchNotifications() {
  if (!env.useMockStorage) {
    if (!getAuthToken()) throw new Error('Sesión no válida o expirada.');
    try {
      const response = await apiClient.get('/notifications');
      const rawList = response.data?.data || response.data || [];
      return (Array.isArray(rawList) ? rawList : []).map((n) => ({
        id: n.id,
        userId: n.usuario_id || n.userId,
        role: (n.rol_destinatario || n.role || '').toLowerCase(),
        title: n.title,
        context: n.context,
        read: Boolean(n.is_read ?? n.read),
        href: n.href,
        createdAt: n.created_at || n.createdAt
      }));
    } catch (err) {
      throw new Error(err.response?.data?.error?.message || 'No se pudieron cargar las notificaciones.');
    }
  }
  return pulsoStore.get().notifications || [];
}
