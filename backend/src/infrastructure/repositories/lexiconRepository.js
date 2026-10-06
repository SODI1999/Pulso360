import pool from '../db.js';

export const lexiconRepository = {
  async findActive(client = pool, lock = false) {
    const result = await client.query("SELECT * FROM versiones_lexico WHERE estado='ACTIVA' ORDER BY activado_en DESC,id LIMIT 1" + (lock ? ' FOR UPDATE' : ''));
    return result.rows[0];
  },
  async list() {
    return (await pool.query(`SELECT id,codigo_version AS version,estado,hash_contenido AS hash,
      contenido IS NOT NULL AS has_content,activado_en FROM versiones_lexico ORDER BY created_at,id`)).rows;
  },
  async lockActivation(client) {
    await client.query('SELECT pg_advisory_xact_lock(360014)');
  },
  async findPreviousId(client) {
    return (await client.query('SELECT previous_version_id FROM lexico_activaciones ORDER BY id DESC LIMIT 1')).rows[0]?.previous_version_id;
  },
  async findForUpdate(id, client) {
    return (await client.query('SELECT * FROM versiones_lexico WHERE id=$1 FOR UPDATE', [id])).rows[0];
  },
  async activate(id, previousId, actorId, client) {
    await client.query("UPDATE versiones_lexico SET estado='OBSOLETA' WHERE estado='ACTIVA'");
    await client.query("UPDATE versiones_lexico SET estado='ACTIVA',activado_en=NOW() WHERE id=$1", [id]);
    await client.query('INSERT INTO lexico_activaciones(version_id,previous_version_id,actor_id) VALUES($1,$2,$3)', [id, previousId, actorId]);
  }
};
