import pool from '../db.js';

export const notificationsRepository = {
  async findByUserAndRole(userId, rolCodigo) {
    const query = `
      SELECT id, usuario_id, rol_destinatario, title, context, is_read, href, created_at
      FROM notificaciones
      WHERE usuario_id = $1 OR rol_destinatario = $2
      ORDER BY created_at DESC
      LIMIT 50
    `;
    const { rows } = await pool.query(query, [userId, rolCodigo]);
    return rows;
  },

  async markRead(notificationId) {
    const query = `
      UPDATE notificaciones
      SET is_read = TRUE
      WHERE id = $1
      RETURNING id, usuario_id, rol_destinatario, title, context, is_read, href, created_at
    `;
    const { rows } = await pool.query(query, [notificationId]);
    return rows[0] || null;
  },

  async markAllRead(userId, rolCodigo) {
    const query = `
      UPDATE notificaciones
      SET is_read = TRUE
      WHERE usuario_id = $1 OR rol_destinatario = $2
      RETURNING id, usuario_id, rol_destinatario, title, context, is_read, href, created_at
    `;
    const { rows } = await pool.query(query, [userId, rolCodigo]);
    return rows;
  }
};
