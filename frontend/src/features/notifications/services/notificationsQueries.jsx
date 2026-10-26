import { apiClient, getAuthToken } from '../../../core/api/apiClient';

export function getNotificationData() {
  return { notifications: [] };
}

export async function fetchNotifications() {
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
