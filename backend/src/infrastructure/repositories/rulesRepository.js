/**
 * @fileoverview Repositorio para gestión del catálogo de reglas preventivas de alerta (flujo de doble control).
 * Capa: P10 · infrastructure/repositories
 * @module infrastructure/repositories/rulesRepository
 */
import pool from '../db.js';

export const rulesRepository = {
  /**
   * Consulta el catálogo completo de reglas de alerta ordenadas por fecha de creación descendente.
   *
   * @returns {Promise<Array<Object>>} Lista de reglas de alerta.
   */
  async list() {
    return (await pool.query('SELECT * FROM reglas_alerta ORDER BY created_at DESC,id')).rows;
  },
  /**
   * Comprueba si el alcance (campaña o equipo) referenciado por la regla existe y se encuentra activo.
   *
   * @param {string} scope - Identificador del alcance a verificar.
   * @param {import('pg').PoolClient} client - Cliente transaccional.
   * @returns {Promise<boolean>} True si existe al menos una campaña o equipo activo con ese identificador.
   */
  async scopeExists(scope, client) {
    const result = await client.query(`SELECT id FROM campanas WHERE id=$1 AND activa=TRUE
      UNION ALL SELECT id FROM equipos WHERE id=$1 AND activo=TRUE`, [scope]);
    return result.rowCount > 0;
  },

  /**
   * Inserta una propuesta de regla de alerta por parte de SST en estado pendiente de aprobación (pending_approval = true).
   *
   * @param {Object} params - Datos de la propuesta.
   * @param {string} params.id - Identificador UUID de la regla.
   * @param {string} params.metric - Métrica evaluada ('energia', 'carga_emocional', etc.).
   * @param {string} params.operator - Operador de comparación ('<', '>', '<=').
   * @param {number} params.value - Valor umbral límite.
   * @param {number} params.persistence - Períodos mínimos de persistencia requeridos.
   * @param {string} params.unit - Unidad de tiempo ('semanal', etc.).
   * @param {string} params.scope - Ámbito de aplicación ('cualquier equipo', o ID de campaña/equipo).
   * @param {string} params.severity - Nivel de severidad asignado ('Baja', 'Media', 'Alta', 'Critica').
   * @param {string} params.actorId - Identificador del usuario especialista SST proponente.
   * @param {import('pg').PoolClient} client - Cliente transaccional.
   * @returns {Promise<Object>} Registro de la regla propuesta creada.
   */
  async createProposal({ id, metric, operator, value, persistence, unit, scope, severity, actorId }, client) {
    return (await client.query(`INSERT INTO reglas_alerta(id,nombre,metrica,operador,valor_umbral,persistencia_periodos,unidad_tiempo,alcance,severidad,activa,pending_approval,propuesta_por_id)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,FALSE,TRUE,$10) RETURNING *`,
    [id, `${metric} ${operator} ${value}%`, metric, operator, value, persistence, unit, scope, severity, actorId])).rows[0];
  },
  /**
   * Bloquea una regla para actualización mediante FOR UPDATE.
   *
   * @param {string} id - Identificador de la regla.
   * @param {import('pg').PoolClient} client - Cliente transaccional.
   * @returns {Promise<Object|undefined>} Fila de la regla bloqueada.
   */
  async findForUpdate(id, client) {
    return (await client.query('SELECT * FROM reglas_alerta WHERE id=$1 FOR UPDATE', [id])).rows[0];
  },

  /**
   * Aprueba y activa una regla pendiente, registrando el usuario administrador y la fecha.
   *
   * @param {string} id - Identificador de la regla a aprobar.
   * @param {string} actorId - Identificador del administrador aprobador.
   * @param {import('pg').PoolClient} client - Cliente transaccional.
   * @returns {Promise<Object>} Registro de la regla aprobada y activada.
   */
  async approve(id, actorId, client) {
    return (await client.query(`UPDATE reglas_alerta SET pending_approval=FALSE,activa=TRUE,
      aprobada_por_id=$2,aprobada_en=NOW() WHERE id=$1 RETURNING *`, [id, actorId])).rows[0];
  }
};
