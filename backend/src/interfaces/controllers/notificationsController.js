import { notificationsService } from '../../application/services/notificationsService.js';

export const notificationsController = {
  async getNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const rolCodigo = req.user.rol;
      const notifications = await notificationsService.getNotifications(userId, rolCodigo);
      res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  },

  async markRead(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await notificationsService.markAsRead(id);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },

  async markAllRead(req, res, next) {
    try {
      const userId = req.user.id;
      const rolCodigo = req.user.rol;
      const updated = await notificationsService.markAllAsRead(userId, rolCodigo);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
};
