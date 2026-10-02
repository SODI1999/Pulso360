import { notificationsRepository } from '../../infrastructure/repositories/notificationsRepository.js';

export const notificationsService = {
  async getNotifications(userId, rolCodigo) {
    const notifications = await notificationsRepository.findByUserAndRole(userId, rolCodigo);
    return notifications;
  },

  async markAsRead(notificationId) {
    const updated = await notificationsRepository.markRead(notificationId);
    if (!updated) {
      const error = new Error("Notificación no encontrada");
      error.statusCode = 404;
      error.code = "NOTIFICATION_NOT_FOUND";
      throw error;
    }
    return updated;
  },

  async markAllAsRead(userId, rolCodigo) {
    const updated = await notificationsRepository.markAllRead(userId, rolCodigo);
    return updated;
  }
};
