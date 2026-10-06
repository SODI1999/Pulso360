import { auditedMutation } from './auditedMutation.js';
import pool from '../db.js';

export const userRepository = {
  async findActiveAssignments(userId) {
    return (await pool.query(`SELECT a.id,a.equipo_id,e.campana_id,a.tipo_asignacion,a.fecha_inicio::text AS fecha_inicio
      FROM asignaciones_usuario_equipo a JOIN equipos e ON e.id=a.equipo_id
      WHERE a.usuario_id=$1 AND a.activa=TRUE ORDER BY a.fecha_inicio DESC,a.id`, [userId])).rows;
  },
  async findNavigationCounts(userId, role) {
    return (await pool.query(`SELECT
      (SELECT COUNT(*)::int FROM notificaciones WHERE is_read=FALSE AND (usuario_id=$1 OR (usuario_id IS NULL AND rol_destinatario=$2))) AS unread,
      CASE WHEN $2='SST' THEN (SELECT COUNT(*)::int FROM sst_alertas WHERE status IN ('GENERADA','EN_REVISION')) END AS alerts,
      CASE WHEN $2='SST' THEN (SELECT COUNT(*)::int FROM solicitudes_apoyo WHERE status NOT IN ('Cerrada','Resuelta')) END AS support,
      CASE WHEN $2='ADMIN' THEN (SELECT COUNT(*)::int FROM solicitudes_habeas_data WHERE status='En tramite') END AS habeas`, [userId, role])).rows[0];
  },
  async findByEmail(correo) {
    const query = `
      SELECT id, correo_institucional AS correo, contrasena_hash, rol_codigo, nombres, apellidos, estado, intentos_fallidos, bloqueado_hasta,
        COALESCE((to_jsonb(usuarios)->>'auth_version')::integer, 0) AS auth_version
      FROM usuarios
      WHERE correo_institucional = $1
    `;
    const { rows } = await pool.query(query, [correo]);
    return rows[0] || null;
  },

  async findProfileById(id) {
    const query = `
      SELECT 
        u.id, u.correo_institucional AS correo, u.rol_codigo, u.estado, u.nombres, u.apellidos, u.shift_start_hour,
        COALESCE((to_jsonb(u)->>'auth_version')::integer, 0) AS auth_version,
        e.id AS equipo_id, e.nombre AS equipo_nombre,
        c.id AS campana_id, c.nombre AS campana_nombre
      FROM usuarios u
      LEFT JOIN asignaciones_usuario_equipo aue ON u.id = aue.usuario_id AND aue.activa = TRUE
      LEFT JOIN equipos e ON aue.equipo_id = e.id
      LEFT JOIN campanas c ON e.campana_id = c.id
      WHERE u.id = $1 ORDER BY aue.fecha_inicio DESC NULLS LAST, aue.id
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
      auth_version: row.auth_version,
      shift_start_hour: row.shift_start_hour,
      equipo_id: row.equipo_id,
      equipo_nombre: row.equipo_nombre,
      campana_id: row.campana_id,
      campana_nombre: row.campana_nombre,
      equipo: row.equipo_id ? {
        id: row.equipo_id,
        nombre: row.equipo_nombre,
        campana: row.campana_nombre,
        campana_id: row.campana_id
      } : null
    };
  },

  async findAvailableScopes(userId, role) {
    if (!['ADMIN', 'SST', 'SUPERVISOR'].includes(role)) return [];
    const { rows } = await pool.query(`SELECT e.id, e.nombre, e.campana_id, c.nombre AS campana_nombre
      FROM equipos e JOIN campanas c ON c.id = e.campana_id
      WHERE e.activo AND c.activa AND ($2 != 'SUPERVISOR' OR EXISTS (
        SELECT 1 FROM asignaciones_usuario_equipo a WHERE a.usuario_id = $1
        AND a.equipo_id = e.id AND a.activa)) ORDER BY c.nombre, e.nombre`, [userId, role]);
    return rows;
  },

  async findSupervisors(role) {
    if (!['ADMIN', 'SST'].includes(role)) return [];
    const { rows } = await pool.query(`SELECT u.id, CONCAT(u.nombres, ' ', u.apellidos) AS name,
      COALESCE(array_agg(a.equipo_id) FILTER (WHERE a.equipo_id IS NOT NULL), '{}') AS team_ids
      FROM usuarios u LEFT JOIN asignaciones_usuario_equipo a ON a.usuario_id = u.id AND a.activa
      WHERE u.rol_codigo = 'SUPERVISOR' AND u.estado = 'Activo' GROUP BY u.id ORDER BY name`);
    return rows;
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
  },

  async findActiveAssignment(userId) {
    const query = `
      SELECT id, usuario_id, equipo_id, tipo_asignacion, fecha_inicio, activa
      FROM asignaciones_usuario_equipo
      WHERE usuario_id = $1 AND activa = TRUE
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows[0] || null;
  },

  async createHabeasDataRequest({ id, userId, type, note }) {
    const query = `
      INSERT INTO solicitudes_habeas_data (
        id, usuario_id, type, note, deadline, status
      ) VALUES (
        $1, $2, $3, $4, CURRENT_DATE + INTERVAL '15 days', 'En tramite'
      ) RETURNING *;
    `;
    return auditedMutation(async client => (await client.query(query,[id,userId,type,note])).rows[0],
      { usuarioId:userId,rol:'AGENTE',action:'SOLICITUD_HABEAS_DATA',resource:'solicitudes_habeas_data',resourceId:id });
  },

  async findHabeasDataRequestsByUser(userId) {
    const query = `
      SELECT id, type, status, deadline, note, resuelto_en, created_at
      FROM solicitudes_habeas_data
      WHERE usuario_id = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }
};
