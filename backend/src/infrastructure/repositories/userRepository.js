import pool from '../db.js';

export const userRepository = {
  async findByEmail(correo) {
    const query = `
      SELECT id, correo_institucional AS correo, contrasena_hash, rol_codigo, nombres, apellidos, estado, intentos_fallidos, bloqueado_hasta
      FROM usuarios
      WHERE correo_institucional = $1
    `;
    const { rows } = await pool.query(query, [correo]);
    return rows[0] || null;
  },

  async findProfileById(id) {
    const query = `
      SELECT 
        u.id, u.correo_institucional AS correo, u.rol_codigo, u.estado, u.nombres, u.apellidos,
        e.id AS equipo_id, e.nombre AS equipo_nombre,
        c.id AS campana_id, c.nombre AS campana_nombre
      FROM usuarios u
      LEFT JOIN asignaciones_usuario_equipo aue ON u.id = aue.usuario_id AND aue.activa = TRUE
      LEFT JOIN equipos e ON aue.equipo_id = e.id
      LEFT JOIN campanas c ON e.campana_id = c.id
      WHERE u.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    const row = rows[0];
    if (!row) return null;

    return {
      id: row.id,
      correo: row.correo,
      nombres: row.nombres,
      apellidos: row.apellidos,
      rol: row.rol_codigo,
      rol_codigo: row.rol_codigo,
      estado: row.estado,
      equipo: row.equipo_id ? {
        id: row.equipo_id,
        nombre: row.equipo_nombre,
        campana: row.campana_nombre
      } : null
    };
  },

  async registerFailedAttempt(id, maxReached) {
    const query = `
      UPDATE usuarios
      SET intentos_fallidos = intentos_fallidos + 1,
          bloqueado_hasta = $2
      WHERE id = $1
      RETURNING intentos_fallidos, bloqueado_hasta
    `;
    const bloqueadoHasta = maxReached ? new Date(Date.now() + 15 * 60 * 1000) : null;
    const { rows } = await pool.query(query, [id, bloqueadoHasta]);
    return rows[0];
  },

  async resetFailedAttempts(id) {
    const query = `
      UPDATE usuarios
      SET intentos_fallidos = 0,
          bloqueado_hasta = NULL
      WHERE id = $1
    `;
    await pool.query(query, [id]);
  }
};
