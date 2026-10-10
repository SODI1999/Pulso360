/**
 * @fileoverview Repositorio para gestión y control de versiones del catálogo léxico determinista (NLP).
 * Capa: P10 · infrastructure/repositories
 * @module infrastructure/repositories/lexiconRepository
 */
import pool from '../db.js';

export const lexiconRepository = {
  /**
   * Obtiene la versión del léxico que se encuentra actualmente activa.
   *
   * @param {import('pg').PoolClient|import('pg').Pool} [client=pool] - Cliente de base de datos.
   * @param {boolean} [lock=false] - Indica si debe aplicarse bloqueo FOR UPDATE.
   * @returns {Promise<Object|undefined>} Fila de la versión de léxico activa.
   */
  async findActive(client = pool, lock = false) {
    const result = await client.query("SELECT * FROM versiones_lexico WHERE estado='ACTIVA' ORDER BY activado_en DESC,id LIMIT 1" + (lock ? ' FOR UPDATE' : ''));
    return result.rows[0];
  },
  /**
   * Lista todas las versiones del léxico con su estado, hash de contenido y fecha de activación.
   *
   * @returns {Promise<Array<Object>>} Lista de versiones registradas.
   */
  async list() {
    return (await pool.query(`SELECT id,codigo_version AS version,estado,hash_contenido AS hash,
      contenido IS NOT NULL AS has_content,activado_en FROM versiones_lexico ORDER BY created_at,id`)).rows;
  },

  /**
   * Adquiere un bloqueo por asesoría a nivel de transacción (lock ID 360014) para exclusión mutua de activación.
   *
   * @param {import('pg').PoolClient} client - Cliente transaccional.
   * @returns {Promise<void>}
   */
  async lockActivation(client) {
    await client.query('SELECT pg_advisory_xact_lock(360014)');
  },

  /**
   * Consulta el identificador de la versión anterior desde el registro histórico de activaciones.
   *
   * @param {import('pg').PoolClient} client - Cliente transaccional.
   * @returns {Promise<string|undefined>} Identificador de la versión anterior o undefined.
   */
  async findPreviousId(client) {
    return (await client.query('SELECT previous_version_id FROM lexico_activaciones ORDER BY id DESC LIMIT 1')).rows[0]?.previous_version_id;
  },
  /**
   * Bloquea una versión de léxico para actualización exclusiva con FOR UPDATE.
   *
   * @param {string} id - Identificador de la versión.
   * @param {import('pg').PoolClient} client - Cliente transaccional.
   * @returns {Promise<Object|undefined>} Fila de la versión de léxico.
   */
  async findForUpdate(id, client) {
    return (await client.query('SELECT * FROM versiones_lexico WHERE id=$1 FOR UPDATE', [id])).rows[0];
  },

  /**
   * Realiza la transición atómica: marca la versión activa previa como OBSOLETA,
   * activa la nueva versión e inserta el registro de auditoría en lexico_activaciones.
   *
   * @param {string} id - Identificador de la versión a activar.
   * @param {string|null} previousId - Identificador de la versión anteriormente activa.
   * @param {string} actorId - Identificador del usuario que realiza la activación.
   * @param {import('pg').PoolClient} client - Cliente transaccional.
   * @returns {Promise<void>}
   */
  async activate(id, previousId, actorId, client) {
    await client.query("UPDATE versiones_lexico SET estado='OBSOLETA' WHERE estado='ACTIVA'");
    await client.query("UPDATE versiones_lexico SET estado='ACTIVA',activado_en=NOW() WHERE id=$1", [id]);
    await client.query('INSERT INTO lexico_activaciones(version_id,previous_version_id,actor_id) VALUES($1,$2,$3)', [id, previousId, actorId]);
  }
};
