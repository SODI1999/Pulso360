import pool from '../db.js';

export const notificationsRepository = {
  async findByUserAndRole(userId, rolCodigo) {
    const query = `
      SELECT id, usuario_id, rol_destinatario, title, context, is_read, href, created_at
      FROM notificaciones
      WHERE usuario_id = $1 OR (usuario_id IS NULL AND rol_destinatario = $2)
      ORDER BY created_at DESC
      LIMIT 50
    `;
    const { rows } = await pool.query(query, [userId, rolCodigo]);
    return rows.map(row => ({
      ...row,
      read: row.is_read
    }));
  },

  async markRead(notificationId, userId, rolCodigo) {
    const query = `
      UPDATE notificaciones 
      SET is_read = TRUE 
      WHERE id = $1 
        AND (usuario_id = $2 OR (usuario_id IS NULL AND rol_destinatario = $3))
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [notificationId, userId, rolCodigo]);
    return rows[0] || null;
  },

  async markAllRead(userId, rolCodigo) {
    const query = `
      UPDATE notificaciones 
      SET is_read = TRUE 
      WHERE usuario_id = $1 OR (usuario_id IS NULL AND rol_destinatario = $2)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [userId, rolCodigo]);
    return rows;
  }
};
