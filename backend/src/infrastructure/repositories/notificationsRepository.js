/**
 * @fileoverview Repositorio para consulta y marcado de lectura de notificaciones in-app del sistema.
 * Capa: P10 · infrastructure/repositories
 * @module infrastructure/repositories/notificationsRepository
 */
import pool from '../db.js';

export const notificationsRepository = {
  /**
   * Consulta las 50 notificaciones más recientes dirigidas al usuario o a su rol institucional.
   *
   * @param {string} userId - Identificador del usuario autenticado.
   * @param {string} rolCodigo - Código del rol del usuario (AGENTE, SUPERVISOR, SST, ADMIN).
   * @returns {Promise<Array<Object>>} Lista de notificaciones con propiedad 'read'.
   */
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

  /**
   * Marca una notificación individual como leída garantizando pertenencia al usuario o su rol.
   *
   * @param {string} notificationId - Identificador de la notificación.
   * @param {string} userId - Identificador del usuario.
   * @param {string} rolCodigo - Rol del usuario.
   * @returns {Promise<Object|null>} Notificación actualizada o null si no coincide el destinatario.
   */
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

  /**
   * Marca como leídas todas las notificaciones pendientes dirigidas al usuario o a su rol.
   *
   * @param {string} userId - Identificador del usuario.
   * @param {string} rolCodigo - Rol del usuario.
   * @returns {Promise<Array<Object>>} Lista de notificaciones actualizadas.
   */
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
