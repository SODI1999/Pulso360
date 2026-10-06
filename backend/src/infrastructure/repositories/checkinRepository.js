import { auditedMutation } from './auditedMutation.js';
import pool from '../db.js';

function formatCheckin(row) {
  if (!row) return null;
  return {
    ...row,
    checkin_date: row.checkin_date instanceof Date
      ? row.checkin_date.toISOString().split('T')[0]
      : String(row.checkin_date).slice(0, 10),
    submitted_at: row.submitted_at instanceof Date
      ? row.submitted_at.toISOString()
      : row.submitted_at
  };
}

export const checkinRepository = {
  async create({ id, userId, asignacionId, journeyKey, checkinDate, energia, cargaEmocional, recuperacion, apoyo, distanciamiento, ineficacia }) {
    const query = `
      INSERT INTO daily_checkins (
        id, usuario_id, asignacion_id, journey_key, checkin_date,
        energia, carga_emocional, recuperacion, apoyo, distanciamiento, ineficacia
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      ) RETURNING *
    `;
    const values = [
      id, userId, asignacionId, journeyKey, checkinDate,
      energia, cargaEmocional, recuperacion, apoyo, distanciamiento, ineficacia
    ];
    return auditedMutation(async client => formatCheckin((await client.query(query,values)).rows[0]),
      row => ({ usuarioId:row.usuario_id,rol:'AGENTE',action:'REGISTRO_CHECKIN',resource:'daily_checkins',resourceId:row.id }));
  },

  async update(id, { energia, cargaEmocional, recuperacion, apoyo, distanciamiento, ineficacia }) {
    const query = `
      UPDATE daily_checkins SET
        energia = $2, carga_emocional = $3, recuperacion = $4,
        apoyo = $5, distanciamiento = $6, ineficacia = $7
      WHERE id = $1
      RETURNING *
    `;
    const values = [id, energia, cargaEmocional, recuperacion, apoyo, distanciamiento, ineficacia];
    return auditedMutation(async client => formatCheckin((await client.query(query,values)).rows[0]),
      row => ({ usuarioId:row.usuario_id,rol:'AGENTE',action:'EDICION_CHECKIN',resource:'daily_checkins',resourceId:row.id }));
  },

  async findByUserAndDate(userId, checkinDate) {
    const query = `
      SELECT id, usuario_id, checkin_date, energia, carga_emocional, recuperacion, apoyo, distanciamiento, ineficacia, submitted_at
      FROM daily_checkins
      WHERE usuario_id = $1 AND checkin_date = $2
    `;
    const { rows } = await pool.query(query, [userId, checkinDate]);
    return formatCheckin(rows[0]);
  },

  async findHistoryByUser(userId, limit = 30) {
    const query = `
      SELECT id, checkin_date, energia, carga_emocional, recuperacion, apoyo, distanciamiento, ineficacia, submitted_at
      FROM daily_checkins
      WHERE usuario_id = $1
      ORDER BY checkin_date DESC
      LIMIT $2
    `;
    const { rows } = await pool.query(query, [userId, limit]);
    return rows.map(formatCheckin);
  }
};

