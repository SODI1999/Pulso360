import pool from '../db.js';
import crypto from 'crypto';

/**
 * @fileoverview Repositorio de persistencia administrativa integral (usuarios, campañas, equipos, parámetros, políticas y Habeas Data).
 * Capa: P10 · infrastructure/repositories
 * @module infrastructure/repositories/adminRepository
 */

/**
 * Encuentra todos los usuarios de la organización.
 * Excluye credenciales y registros de bienestar de la vista administrativa.
 * @returns {Promise<Array<Object>>} Perfiles y asignaciones operativas.
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
 * @param {string} correo - Correo institucional; comparación sin distinguir mayúsculas.
 * @returns {Promise<Object|undefined>} Identificador y correo sin credenciales, o undefined.
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
 * Busca un usuario por su nombre completo concatenado (nombres + apellidos).
 *
 * @param {string} fullName - Nombre completo del usuario.
 * @returns {Promise<Object|undefined>} Fila de usuario ({ id, rol_codigo, estado }) o undefined.
 */
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
 * La creación auditada con asignación utiliza createUserAtomic.
 * @param {Object} data - Datos validados: id, rolCodigo, correo, contrasenaHash,
 * nombres, apellidos y shiftStartHour opcional. No acepta contraseñas planas.
 * @returns {Promise<Object>} Usuario creado sin hash de contraseña.
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
 * Usa una transacción propia; no registra auditoría. La gestión auditada usa userManagementRepository.
 * @param {Object} data - id, usuarioId, equipoId, tipoAsignacion y fechaInicio (YYYY-MM-DD).
 * @returns {Promise<Object>} Asignación creada.
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
 * La gestión auditada utiliza updateUserAtomic.
 * @param {string} id - Identificador de usuario.
 * @param {string} estado - Estado previamente validado.
 * @returns {Promise<Object|undefined>} Identificador y estado, o undefined.
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
 * Incluye asignaciones de supervisión, sin datos de bienestar individual.
 * @returns {Promise<Array<Object>>} Campañas con equipos.
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
 * El servicio coordina auditoría y transacción cuando corresponda.
 * @param {Object} data - id, codigo, nombre, descripcion y activa (predeterminado true).
 * @param {import('pg').PoolClient|import('pg').Pool} [client=pool] - Conexión o transacción del llamador.
 * @returns {Promise<Object>} Campaña creada.
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
 * @param {string} id - Identificador de campaña.
 * @param {{nombre?: string, activa?: boolean}} changes - Campos validados; conserva los omitidos.
 * @param {import('pg').PoolClient|import('pg').Pool} [client=pool] - Conexión o transacción del llamador.
 * @returns {Promise<Object|undefined>} Campaña actualizada, o undefined.
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

/**
 * Consulta un usuario por su identificador único retornando rol, estado y nombre completo.
 *
 * @param {string} id - Identificador único del usuario.
 * @returns {Promise<Object|undefined>} Fila del usuario o undefined.
 */
export const findUserById = async (id) => {
  const query = `
    SELECT id, rol_codigo, estado, CONCAT(nombres, ' ', apellidos) AS nombre_completo
    FROM usuarios 
    WHERE id = $1
    LIMIT 1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

/**
 * Crea un equipo.
 * La creación con asignación y auditoría utiliza createTeamAtomic.
 * @param {Object} data - id, campanaId, codigo, nombre, descripcion, supervisorNombre y nMiembros.
 * @returns {Promise<Object>} Equipo creado.
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
 * No reasigna al supervisor; el relevo utiliza updateTeamWithSupervisorHandover.
 * @param {string} id - Identificador del equipo.
 * @param {{nombre?: string, activo?: boolean, supervisorNombre?: string, nMiembros?: number}} changes - Campos validados.
 * @param {import('pg').PoolClient|import('pg').Pool} [client=pool] - Conexión o transacción del llamador.
 * @returns {Promise<Object|undefined>} Equipo actualizado, o undefined.
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
 * Con cliente externo, el servicio conserva commit, rollback y auditoría.
 * @param {string} teamId - Identificador del equipo.
 * @param {{nombre?: string, activo?: boolean, nMiembros?: number}} changes - Campos validados.
 * @param {string} supervisorId - Supervisor previamente validado.
 * @param {string} supervisorNombre - Nombre visible del supervisor.
 * @param {string} nuevaAsignacionId - Identificador de asignación.
 * @param {import('pg').PoolClient} [externalClient] - Transacción del llamador; si se omite, crea una propia.
 * @returns {Promise<Object|null>} Equipo actualizado, o null si no existe.
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
 * @returns {Promise<Array<Object>>} Claves, valores y descripciones persistidos.
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
 * El llamador valida el valor y registra auditoría.
 * @param {string} clave - Clave existente de configuración.
 * @param {*} valorJson - Valor serializable compatible con la columna JSON.
 * @returns {Promise<Object|undefined>} Parámetro actualizado, o undefined.
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
 * @returns {Promise<Array<Object>>} Metadatos de políticas por vigencia descendente.
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
 * Calcula su hash; el servicio coordina auditoría y notificación.
 * @param {Object} data - id, version, titulo, textoPolitica, textoAviso opcional y creadoPorId.
 * @param {import('pg').PoolClient|import('pg').Pool} [client=pool] - Conexión o transacción del llamador.
 * @returns {Promise<Object>} Metadatos de la política publicada.
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
 * La identidad se recupera para gestión administrativa autorizada.
 * @returns {Promise<Array<Object>>} Solicitudes con datos de su titular.
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
 * Fija resolución para Respondida o Rechazada; el servicio coordina auditoría.
 * @param {string} id - Identificador de solicitud.
 * @param {string} status - Estado previamente validado.
 * @param {string|null} note - Nota; null conserva la existente.
 * @param {import('pg').PoolClient|import('pg').Pool} [client=pool] - Conexión o transacción del llamador.
 * @returns {Promise<Object|undefined>} Solicitud actualizada, o undefined.
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

/**
 * Despacha una notificación in-app para todos los agentes ante la publicación de una nueva versión de política de privacidad.
 *
 * @param {string} id - Identificador UUID de la notificación.
 * @param {string} version - Código de versión de la nueva política.
 * @param {import('pg').PoolClient} client - Cliente transaccional.
 * @returns {Promise<void>}
 */
export const createPolicyNotification = async (id, version, client) => {
  await client.query(`INSERT INTO notificaciones (id,rol_destinatario,title,context,href)
    VALUES ($1,'AGENTE',$2,'Revisa la política vigente y actualiza tus preferencias.','/consentimiento')`,
  [id, `Nueva política (${version})`]);
};

/**
 * Bloquea una solicitud de Habeas Data para actualización mediante FOR UPDATE.
 *
 * @param {string} id - Identificador de la solicitud.
 * @param {import('pg').PoolClient} client - Cliente transaccional.
 * @returns {Promise<{status: string}|undefined>} Fila con el estado actual o undefined.
 */
export const findHabeasForUpdate = async (id, client) => {
  return (await client.query('SELECT status FROM solicitudes_habeas_data WHERE id=$1 FOR UPDATE', [id])).rows[0];
};
