/**
 * @fileoverview Repositorio para registro y consulta de check-ins diarios de bienestar en 6 dimensiones.
 * Capa: P10 · infrastructure/repositories
 * @module infrastructure/repositories/checkinRepository
 */
import { auditedMutation } from './auditedMutation.js';
import pool from '../db.js';

/**
 * Normaliza las fechas y marcas temporales de un registro de check-in diario.
 *
 * @param {Object|null} row - Fila cruda retornada por la consulta SQL.
 * @returns {Object|null} Registro normalizado con checkin_date en formato YYYY-MM-DD.
 */
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
  /**
   * Inserta las seis dimensiones previamente validadas por dominio/servicio.
   * La operación se confirma de forma atómica junto a su log de auditoría.
   *
   * @param {Object} params - Datos del check-in.
   * @param {string} params.id - Identificador único UUID del registro.
   * @param {string} params.userId - Identificador del usuario agente.
   * @param {string} [params.asignacionId] - Identificador de asignación de equipo vigente.
   * @param {string} [params.journeyKey] - Clave de jornada operativa usada por la restricción de unicidad.
   * @param {string} params.checkinDate - Fecha del check-in (formato YYYY-MM-DD).
   * @param {number|null} params.energia - Dimensión de energía (1 a 5).
   * @param {number|null} params.cargaEmocional - Dimensión de carga emocional (1 a 5).
   * @param {number|null} params.recuperacion - Dimensión de recuperación (1 a 5).
   * @param {number|null} params.apoyo - Dimensión de apoyo percibido (1 a 5).
   * @param {number|null} params.distanciamiento - Dimensión de distanciamiento (1 a 5).
   * @param {number|null} params.ineficacia - Dimensión de ineficacia (1 a 5).
   * @returns {Promise<Object>} Registro del check-in formateado.
   */
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

  /**
   * Actualiza las dimensiones de bienestar de un check-in existente bajo mutación auditada.
   *
   * @param {string} id - Identificador único del check-in.
   * @param {Object} dimensions - Dimensiones evaluadas ({ energia, cargaEmocional, recuperacion, apoyo, distanciamiento, ineficacia }).
   * @returns {Promise<Object|null>} Registro del check-in actualizado y formateado.
   */
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

  /**
   * Consulta el registro de check-in diario de un usuario para una fecha determinada.
   *
   * @param {string} userId - Identificador único del usuario.
   * @param {string} checkinDate - Fecha consultada en formato YYYY-MM-DD.
   * @returns {Promise<Object|null>} Registro del check-in formateado o null si no existe.
   */
  async findByUserAndDate(userId, checkinDate) {
    const query = `
      SELECT id, usuario_id, checkin_date, energia, carga_emocional, recuperacion, apoyo, distanciamiento, ineficacia, submitted_at
      FROM daily_checkins
      WHERE usuario_id = $1 AND checkin_date = $2
    `;
    const { rows } = await pool.query(query, [userId, checkinDate]);
    return formatCheckin(rows[0]);
  },

  /**
   * Consulta el historial cronológico de check-ins de un usuario ordenado por fecha descendente.
   *
   * @param {string} userId - Identificador único del usuario.
   * @param {number} [limit=30] - Límite de registros a retornar.
   * @returns {Promise<Array<Object>>} Lista de registros de check-in formateados.
   */
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

