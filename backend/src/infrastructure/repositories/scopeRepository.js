import pool from '../db.js';

export const scopeRepository = {
  async findActiveTeam(id, client = pool) {
    return (await client.query('SELECT campana_id FROM equipos WHERE id=$1 AND activo=TRUE', [id])).rows[0];
  },
  async campaignExists(id, client = pool) {
    return (await client.query('SELECT id FROM campanas WHERE id=$1 AND activa=TRUE', [id])).rowCount > 0;
  },
  async supervisorAssigned(userId, campanaId, equipoId, client = pool) {
    const result = await client.query(`SELECT 1 FROM asignaciones_usuario_equipo a JOIN equipos e ON a.equipo_id=e.id
      WHERE a.usuario_id=$1 AND a.activa=TRUE AND a.tipo_asignacion='SUPERVISOR' AND e.activo=TRUE
      AND ($2::varchar IS NULL OR e.campana_id=$2) AND ($3::varchar IS NULL OR e.id=$3)`, [userId, campanaId || null, equipoId || null]);
    return result.rowCount > 0;
  },
  async findLabel(campanaId, equipoId, client = pool) {
    const result = await client.query(equipoId ? 'SELECT nombre FROM equipos WHERE id=$1' : 'SELECT nombre FROM campanas WHERE id=$1', [equipoId || campanaId]);
    return result.rows[0]?.nombre || null;
  }
};
