import pool from '../db.js';
import crypto from 'crypto';

/**
 * @fileoverview Repositorio de persistencia para el módulo de administración
 * @module adminRepository
 */

/**
 * Encuentra todos los usuarios de la organización.
 */
export const findAllUsers = async () => {
  const query = `
    SELECT u.id, u.rol_codigo, u.correo_institucional AS correo, u.nombres, u.apellidos, u.estado, 
           e.id AS equipo_id, e.nombre AS equipo_nombre,
           c.id AS campana_id, c.nombre AS campana_nombre,
           COALESCE((SELECT json_agg(json_build_object('equipo_id', a.equipo_id, 'tipo_asignacion', a.tipo_asignacion) ORDER BY a.fecha_inicio DESC, a.id DESC)
             FROM asignaciones_usuario_equipo a WHERE a.usuario_id=u.id AND a.activa=TRUE), '[]'::json) AS asignaciones
    FROM usuarios u
    LEFT JOIN LATERAL (SELECT equipo_id FROM asignaciones_usuario_equipo a
      WHERE a.usuario_id=u.id AND a.activa=TRUE ORDER BY a.fecha_inicio DESC, a.id DESC LIMIT 1) aue ON TRUE
    LEFT JOIN equipos e ON aue.equipo_id = e.id
    LEFT JOIN campanas c ON e.campana_id = c.id
  `;
  const { rows } = await pool.query(query);
  return rows;
};

/**
 * Busca un usuario por correo.
 */
export const findByEmail = async (correo) => {
  const query = `
    SELECT id, correo_institucional
    FROM usuarios 
    WHERE LOWER(correo_institucional) = LOWER($1)
  `;
  const { rows } = await pool.query(query, [correo]);
  return rows[0];
};

export const findUserByFullName = async (fullName) => {
  const query = `
    SELECT id, rol_codigo, estado 
    FROM usuarios 
    WHERE CONCAT(nombres, ' ', apellidos) = $1
    LIMIT 1
  `;
  const { rows } = await pool.query(query, [fullName]);
  return rows[0];
};

/**
 * Crea un usuario nuevo.
 */
export const createUser = async ({ id, rolCodigo, correo, contrasenaHash, nombres, apellidos, shiftStartHour }) => {
  const query = `
    INSERT INTO usuarios (id, rol_codigo, correo_institucional, contrasena_hash, nombres, apellidos, shift_start_hour, estado)
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'Activo')
    RETURNING id, rol_codigo, correo_institucional, nombres, apellidos, estado, created_at
  `;
  const { rows } = await pool.query(query, [id, rolCodigo, correo, contrasenaHash, nombres, apellidos, shiftStartHour]);
  return rows[0];
};

/**
 * Asigna un usuario a un equipo desactivando la asignación previa.
 */
export const assignUserToTeam = async ({ id, usuarioId, equipoId, tipoAsignacion, fechaInicio }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Desactiva asignación previa
    await client.query(`
      UPDATE asignaciones_usuario_equipo 
      SET activa = FALSE, fecha_fin = CURRENT_DATE 
      WHERE usuario_id = $1 AND activa = TRUE
    `, [usuarioId]);
    
    // Inserta la nueva
    const { rows } = await client.query(`
      INSERT INTO asignaciones_usuario_equipo (id, usuario_id, equipo_id, tipo_asignacion, fecha_inicio, activa) 
      VALUES ($1, $2, $3, $4, $5, TRUE) 
      RETURNING *
    `, [id, usuarioId, equipoId, tipoAsignacion, fechaInicio]);
    
    await client.query('COMMIT');
    return rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Actualiza el estado de un usuario.
 */
export const updateUserStatus = async (id, estado) => {
  const query = `
    UPDATE usuarios 
    SET estado = $2, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $1 
    RETURNING id, estado
  `;
  const { rows } = await pool.query(query, [id, estado]);
  return rows[0];
};

/**
 * Obtiene las campañas con sus equipos embebidos.
 */
export const findAllCampaignsWithTeams = async () => {
  const query = `
    SELECT c.id, c.codigo, c.nombre, c.descripcion, c.activa,
           COALESCE(
             json_agg(
               json_build_object(
                 'id', e.id, 
                 'codigo', e.codigo, 
                 'nombre', e.nombre, 
                 'supervisor_nombre', e.supervisor_nombre, 
                 'supervisor_id', (SELECT usuario_id FROM asignaciones_usuario_equipo WHERE equipo_id=e.id AND tipo_asignacion='SUPERVISOR' AND activa=TRUE ORDER BY fecha_inicio DESC LIMIT 1),
                 'n_miembros', e.n_miembros, 
                 'activo', e.activo
               )
             ) FILTER (WHERE e.id IS NOT NULL),
             '[]'::json
           ) AS equipos
    FROM campanas c
    LEFT JOIN equipos e ON c.id = e.campana_id
    GROUP BY c.id
  `;
  const { rows } = await pool.query(query);
  return rows;
};

/**
 * Crea una campaña.
 */
export const createCampaign = async ({ id, codigo, nombre, descripcion, activa = true }, client = pool) => {
  const query = `
    INSERT INTO campanas (id, codigo, nombre, descripcion, activa)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const { rows } = await client.query(query, [id, codigo, nombre, descripcion, activa]);
  return rows[0];
};

/**
 * Actualiza una campaña.
 */
export const updateCampaign = async (id, { nombre, activa }, client = pool) => {
  const query = `
    UPDATE campanas 
    SET nombre = COALESCE($2, nombre), activa = COALESCE($3, activa) 
    WHERE id = $1 
    RETURNING *
  `;
  const { rows } = await client.query(query, [id, nombre !== undefined ? nombre : null, activa !== undefined ? activa : null]);
  return rows[0];
};

export const findUserById = async (id) => {
  const query = `
    SELECT id, rol_codigo, estado, CONCAT(nombres, ' ', apellidos) AS nombre_completo
    FROM usuarios 
    WHERE id = $1
    LIMIT 1
  `;
  const { rows } = await client.query(query, [id]);
  return rows[0];
};

/**
 * Crea un equipo.
 */
export const createTeam = async ({ id, campanaId, codigo, nombre, descripcion, supervisorNombre, nMiembros }) => {
  const query = `
    INSERT INTO equipos (id, campana_id, codigo, nombre, descripcion, supervisor_nombre, n_miembros) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const { rows } = await pool.query(query, [id, campanaId, codigo, nombre, descripcion, supervisorNombre, nMiembros]);
  return rows[0];
};

/**
 * Actualiza un equipo.
 */
export const updateTeam = async (id, { nombre, activo, supervisorNombre, nMiembros }, client = pool) => {
  const query = `
    UPDATE equipos 
    SET nombre = COALESCE($2, nombre), 
        activo = COALESCE($3, activo), 
        supervisor_nombre = COALESCE($4, supervisor_nombre), 
        n_miembros = COALESCE($5, n_miembros) 
    WHERE id = $1 
    RETURNING *
  `;
  const { rows } = await client.query(query, [
    id, 
    nombre !== undefined ? nombre : null, 
    activo !== undefined ? activo : null, 
    supervisorNombre !== undefined ? supervisorNombre : null, 
    nMiembros !== undefined ? nMiembros : null
  ]);
  return rows[0];
};

/**
 * Actualiza equipo y realiza el relevo de supervisor de manera atómica
 */
export const updateTeamWithSupervisorHandover = async (teamId, { nombre, activo, nMiembros }, supervisorId, supervisorNombre, nuevaAsignacionId, externalClient) => {
  const client = externalClient || await pool.connect();
  try {
    if (!externalClient) await client.query('BEGIN');

    // 1. Actualizar el equipo
    const updateTeamQuery = `
      UPDATE equipos 
      SET nombre = COALESCE($2, nombre), 
          activo = COALESCE($3, activo), 
          supervisor_nombre = COALESCE($4, supervisor_nombre), 
          n_miembros = COALESCE($5, n_miembros) 
      WHERE id = $1 
      RETURNING *
    `;
    const { rows: teamRows } = await client.query(updateTeamQuery, [
      teamId, 
      nombre !== undefined ? nombre : null, 
      activo !== undefined ? activo : null, 
      supervisorNombre, 
      nMiembros !== undefined ? nMiembros : null
    ]);

    const updatedTeam = teamRows[0];
    if (!updatedTeam) {
      if (!externalClient) await client.query('ROLLBACK');
      return null;
    }

    // 2. Desactivar asignación previa del supervisor del equipo
    await client.query(`
      UPDATE asignaciones_usuario_equipo 
      SET activa = FALSE, fecha_fin = CURRENT_DATE 
      WHERE equipo_id = $1 AND tipo_asignacion = 'SUPERVISOR' AND activa = TRUE
    `, [teamId]);

    // 3. Crear nueva asignación para el nuevo supervisor
    await client.query(`
      INSERT INTO asignaciones_usuario_equipo (id, usuario_id, equipo_id, tipo_asignacion, fecha_inicio, activa) 
      VALUES ($1, $2, $3, 'SUPERVISOR', CURRENT_DATE, TRUE)
    `, [nuevaAsignacionId, supervisorId, teamId]);

    if (!externalClient) await client.query('COMMIT');
    return updatedTeam;
  } catch (error) {
    if (!externalClient) await client.query('ROLLBACK');
    throw error;
  } finally {
    if (!externalClient) client.release();
  }
};

/**
 * Obtiene los parámetros del sistema.
 */
export const findSystemParams = async () => {
  const query = `
    SELECT clave, valor, descripcion 
    FROM configuracion_sistema
  `;
  const { rows } = await pool.query(query);
  return rows;
};

/**
 * Actualiza un parámetro del sistema.
 */
export const updateSystemParam = async (clave, valorJson) => {
  const query = `
    UPDATE configuracion_sistema 
    SET valor = $2, updated_at = CURRENT_TIMESTAMP 
    WHERE clave = $1 
    RETURNING *
  `;
  const { rows } = await pool.query(query, [clave, valorJson]);
  return rows[0];
};

/**
 * Obtiene las políticas de privacidad.
 */
export const findPolicies = async () => {
  const query = `
    SELECT id, version, titulo, estado, vigente_desde 
    FROM politicas_privacidad 
    ORDER BY vigente_desde DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

/**
 * Crea una nueva política.
 */
export const createPolicy = async ({ id, version, titulo, textoPolitica, textoAviso, creadoPorId }, client = pool) => {
  const hashContenido = crypto.createHash('sha256').update(textoPolitica + (textoAviso || '')).digest('hex');
  const query = `
    INSERT INTO politicas_privacidad (id, version, titulo, texto_politica, texto_aviso_privacidad, hash_contenido, estado, vigente_desde, creado_por_id) 
    VALUES ($1, $2, $3, $4, $5, $6, 'PUBLICADA', CURRENT_TIMESTAMP, $7)
    RETURNING id, version, titulo, estado, vigente_desde
  `;
  const { rows } = await client.query(query, [id, version, titulo, textoPolitica, textoAviso, hashContenido, creadoPorId]);
  return rows[0];
};

/**
 * Obtiene las solicitudes de habeas data.
 */
export const findHabeasDataRequests = async () => {
  const query = `
    SELECT h.*, CONCAT(u.nombres, ' ', u.apellidos) AS solicitante, u.correo_institucional AS correo 
    FROM solicitudes_habeas_data h 
    JOIN usuarios u ON h.usuario_id = u.id 
    ORDER BY h.created_at DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

/**
 * Actualiza el estado de una solicitud de habeas data.
 */
export const updateHabeasDataStatus = async (id, status, note, client = pool) => {
  const query = `
    UPDATE solicitudes_habeas_data 
    SET status = $2::varchar, note = COALESCE($3::text, note), 
        resuelto_en = CASE WHEN $2::varchar IN ('Respondida', 'Rechazada') THEN CURRENT_TIMESTAMP ELSE resuelto_en END 
    WHERE id = $1 
    RETURNING *
  `;
  const { rows } = await client.query(query, [id, status, note]);
  return rows[0];
};

export const createPolicyNotification = async (id, version, client) => {
  await client.query(`INSERT INTO notificaciones (id,rol_destinatario,title,context,href)
    VALUES ($1,'AGENTE',$2,'Revisa la política vigente y actualiza tus preferencias.','/consentimiento')`,
  [id, `Nueva política (${version})`]);
};

export const findHabeasForUpdate = async (id, client) => {
  return (await client.query('SELECT status FROM solicitudes_habeas_data WHERE id=$1 FOR UPDATE', [id])).rows[0];
};
