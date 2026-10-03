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
           c.id AS campana_id, c.nombre AS campana_nombre
    FROM usuarios u
    LEFT JOIN asignaciones_usuario_equipo aue ON u.id = aue.usuario_id AND aue.activa = TRUE
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
export const createCampaign = async ({ id, codigo, nombre, descripcion }) => {
  const query = `
    INSERT INTO campanas (id, codigo, nombre, descripcion) 
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const { rows } = await pool.query(query, [id, codigo, nombre, descripcion]);
  return rows[0];
};

/**
 * Actualiza una campaña.
 */
export const updateCampaign = async (id, { nombre, activa }) => {
  const query = `
    UPDATE campanas 
    SET nombre = $2, activa = $3, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $1 
    RETURNING *
  `;
  const { rows } = await pool.query(query, [id, nombre, activa]);
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
export const updateTeam = async (id, { nombre, activo, supervisorNombre, nMiembros }) => {
  const query = `
    UPDATE equipos 
    SET nombre = $2, activo = $3, supervisor_nombre = $4, n_miembros = $5, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $1 
    RETURNING *
  `;
  const { rows } = await pool.query(query, [id, nombre, activo, supervisorNombre, nMiembros]);
  return rows[0];
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
export const createPolicy = async ({ id, version, titulo, textoPolitica, textoAviso, creadoPorId }) => {
  const hashContenido = crypto.createHash('sha256').update(textoPolitica + (textoAviso || '')).digest('hex');
  const query = `
    INSERT INTO politicas_privacidad (id, version, titulo, texto_politica, texto_aviso_privacidad, hash_contenido, estado, vigente_desde, creado_por_id) 
    VALUES ($1, $2, $3, $4, $5, $6, 'PUBLICADA', CURRENT_TIMESTAMP, $7)
    RETURNING id, version, titulo, estado, vigente_desde
  `;
  const { rows } = await pool.query(query, [id, version, titulo, textoPolitica, textoAviso, hashContenido, creadoPorId]);
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
export const updateHabeasDataStatus = async (id, status, note) => {
  const query = `
    UPDATE solicitudes_habeas_data 
    SET status = $2, note = COALESCE($3, note), 
        resuelto_en = CASE WHEN $2 IN ('Respondida', 'Rechazada') THEN CURRENT_TIMESTAMP ELSE resuelto_en END 
    WHERE id = $1 
    RETURNING *
  `;
  const { rows } = await pool.query(query, [id, status, note]);
  return rows[0];
};
