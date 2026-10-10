/**
 * @fileoverview Repositorio de validación de ámbito organizacional (alcance de supervisión, equipos y campañas).
 * Capa: P10 · infrastructure/repositories
 * @module infrastructure/repositories/scopeRepository
 */
import pool from '../db.js';

export const scopeRepository = {
  /**
   * Consulta si un equipo está activo y obtiene su campaña asociada.
   *
   * @param {string} id - Identificador del equipo.
   * @param {import('pg').PoolClient|import('pg').Pool} [client=pool] - Cliente de base de datos.
   * @returns {Promise<{campana_id: string}|undefined>} Fila con campana_id o undefined.
   */
  async findActiveTeam(id, client = pool) {
    return (await client.query('SELECT campana_id FROM equipos WHERE id=$1 AND activo=TRUE', [id])).rows[0];
  },
  /**
   * Comprueba si una campaña existe y se encuentra activa.
   *
   * @param {string} id - Identificador de la campaña.
   * @param {import('pg').PoolClient|import('pg').Pool} [client=pool] - Cliente de base de datos.
   * @returns {Promise<boolean>} True si la campaña existe y está activa.
   */
  async campaignExists(id, client = pool) {
    return (await client.query('SELECT id FROM campanas WHERE id=$1 AND activa=TRUE', [id])).rowCount > 0;
  },

  /**
   * Valida si un usuario posee asignación activa de SUPERVISOR sobre la campaña o equipo indicado.
   *
   * @param {string} userId - Identificador del usuario.
   * @param {string|null} campanaId - Identificador de campaña o null.
   * @param {string|null} equipoId - Identificador de equipo o null.
   * @param {import('pg').PoolClient|import('pg').Pool} [client=pool] - Cliente de base de datos.
   * @returns {Promise<boolean>} True si el supervisor tiene asignación activa en el ámbito.
   */
  async supervisorAssigned(userId, campanaId, equipoId, client = pool) {
    const result = await client.query(`SELECT 1 FROM asignaciones_usuario_equipo a JOIN equipos e ON a.equipo_id=e.id
      WHERE a.usuario_id=$1 AND a.activa=TRUE AND a.tipo_asignacion='SUPERVISOR' AND e.activo=TRUE
      AND ($2::varchar IS NULL OR e.campana_id=$2) AND ($3::varchar IS NULL OR e.id=$3)`, [userId, campanaId || null, equipoId || null]);
    return result.rowCount > 0;
  },

  /**
   * Obtiene la etiqueta textual (nombre) de un equipo o campaña.
   *
   * @param {string} [campanaId] - Identificador de campaña.
   * @param {string} [equipoId] - Identificador de equipo (prevalece si está presente).
   * @param {import('pg').PoolClient|import('pg').Pool} [client=pool] - Cliente de base de datos.
   * @returns {Promise<string|null>} Nombre de la entidad o null.
   */
  async findLabel(campanaId, equipoId, client = pool) {
    const result = await client.query(equipoId ? 'SELECT nombre FROM equipos WHERE id=$1' : 'SELECT nombre FROM campanas WHERE id=$1', [equipoId || campanaId]);
    return result.rows[0]?.nombre || null;
  }
};
