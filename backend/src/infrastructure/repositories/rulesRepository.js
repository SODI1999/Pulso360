import pool from '../db.js';

export const rulesRepository = {
  async list() {
    return (await pool.query('SELECT * FROM reglas_alerta ORDER BY created_at DESC,id')).rows;
  },
  async scopeExists(scope, client) {
    const result = await client.query(`SELECT id FROM campanas WHERE id=$1 AND activa=TRUE
      UNION ALL SELECT id FROM equipos WHERE id=$1 AND activo=TRUE`, [scope]);
    return result.rowCount > 0;
  },
  async createProposal({ id, metric, operator, value, persistence, unit, scope, severity, actorId }, client) {
    return (await client.query(`INSERT INTO reglas_alerta(id,nombre,metrica,operador,valor_umbral,persistencia_periodos,unidad_tiempo,alcance,severidad,activa,pending_approval,propuesta_por_id)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,FALSE,TRUE,$10) RETURNING *`,
    [id, `${metric} ${operator} ${value}%`, metric, operator, value, persistence, unit, scope, severity, actorId])).rows[0];
  },
  async findForUpdate(id, client) {
    return (await client.query('SELECT * FROM reglas_alerta WHERE id=$1 FOR UPDATE', [id])).rows[0];
  },
  async approve(id, actorId, client) {
    return (await client.query(`UPDATE reglas_alerta SET pending_approval=FALSE,activa=TRUE,
      aprobada_por_id=$2,aprobada_en=NOW() WHERE id=$1 RETURNING *`, [id, actorId])).rows[0];
  }
};
