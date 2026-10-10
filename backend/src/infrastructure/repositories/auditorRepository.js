/**
 * @fileoverview Repositorio para registro inmutable y verificación criptográfica de la cadena de auditoría (auditoria_logs).
 * Integridad: Bloqueo advisory lock 360013 para encadenamiento secuencial SHA-256 (formato v2).
 * Capa: P10 · infrastructure/repositories
 * @module infrastructure/repositories/auditorRepository
 */
import { query, transaction } from '../db.js';

/**
 * Retorna el identificador máximo actual registrado en la tabla de logs de auditoría.
 *
 * @returns {Promise<number>} ID máximo o 0 si la tabla está vacía.
 */
export const getLatestId = async () => (await query('SELECT COALESCE(MAX(id),0) AS id FROM auditoria_logs')).rows[0].id;

/**
 * Consulta de registros de auditoría filtrada y paginada con unión a usuarios para trazabilidad institucional.
 *
 * @param {Object} filters - Filtros de auditoría.
 * @param {number} [filters.limit=50] - Límite de registros.
 * @param {number} [filters.offset=0] - Desplazamiento de paginación.
 * @param {string} [filters.rol] - Filtrar por rol del actor.
 * @param {string} [filters.action] - Filtrar por acción específica.
 * @param {string} [filters.startDate] - Fecha inicial ISO.
 * @param {string} [filters.endDate] - Fecha final ISO.
 * @param {string} [filters.entidadAfectada] - Filtrar por recurso o entidad afectada.
 * @param {number} [filters.maxId] - ID máximo para paginación estable.
 * @returns {Promise<Array<Object>>} Lista de registros de auditoría.
 */
export const findLogs = async ({ limit = 50, offset = 0, rol, action, startDate, endDate, entidadAfectada, maxId }) => {
  let baseQuery = `
    SELECT 
      al.id, al.usuario_id, al.rol, al.action, al.resource, al.resource_id, 
      al.details, al.ip_address, al.prev_hash, al.hash, al.created_at, al.hash_version, al.actor_reference,
      al.action AS accion,
      al.resource AS entidad_afectada,
      u.nombres, u.apellidos
    FROM auditoria_logs al
    LEFT JOIN usuarios u ON al.usuario_id = u.id
    WHERE 1=1
  `;
  
  const values = [];
  let paramIndex = 1;

  if (maxId !== undefined) {
    baseQuery += ` AND al.id <= $${paramIndex++}`;
    values.push(maxId);
  }

  if (rol) {
    baseQuery += ` AND al.rol = $${paramIndex}`;
    values.push(rol);
    paramIndex++;
  }

  if (action) {
    baseQuery += ` AND al.action = $${paramIndex}`;
    values.push(action);
    paramIndex++;
  }

  if (entidadAfectada) {
    baseQuery += ` AND al.resource = $${paramIndex}`;
    values.push(entidadAfectada);
    paramIndex++;
  }

  if (startDate) {
    baseQuery += ` AND al.created_at >= $${paramIndex}`;
    values.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    baseQuery += ` AND al.created_at <= $${paramIndex}`;
    values.push(endDate);
    paramIndex++;
  }

  baseQuery += ` ORDER BY al.id DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  values.push(limit, offset);

  const result = await query(baseQuery, values);
  return result.rows;
};

/**
 * Cuenta el total de logs que cumplen con los criterios de filtro para cálculo de paginación.
 *
 * @param {Object} filters - Filtros de auditoría ({ rol, action, startDate, endDate, entidadAfectada, maxId }).
 * @returns {Promise<number>} Conteo total de filas coincidentes.
 */
export const countLogs = async ({ rol, action, startDate, endDate, entidadAfectada, maxId }) => {
  let baseQuery = `SELECT COUNT(*) as total FROM auditoria_logs al WHERE 1=1`;
  const values = [];
  let paramIndex = 1;

  if (maxId !== undefined) {
    baseQuery += ` AND al.id <= $${paramIndex++}`;
    values.push(maxId);
  }

  if (rol) {
    baseQuery += ` AND al.rol = $${paramIndex}`;
    values.push(rol);
    paramIndex++;
  }

  if (action) {
    baseQuery += ` AND al.action = $${paramIndex}`;
    values.push(action);
    paramIndex++;
  }

  if (entidadAfectada) {
    baseQuery += ` AND al.resource = $${paramIndex}`;
    values.push(entidadAfectada);
    paramIndex++;
  }

  if (startDate) {
    baseQuery += ` AND al.created_at >= $${paramIndex}`;
    values.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    baseQuery += ` AND al.created_at <= $${paramIndex}`;
    values.push(endDate);
    paramIndex++;
  }

  const result = await query(baseQuery, values);
  return parseInt(result.rows[0].total, 10);
};

import { auditHash, GENESIS_HASH } from '../../domain/auditHash.js';

/**
 * Inserta un registro inmutable en auditoria_logs calculando el hash criptográfico SHA-256 encadenado a prev_hash.
 * Adquiere un bloqueo advisory lock 360013 para asegurar atomicidad y secuencia estricta de la cadena.
 *
 * @param {Object} event - Evento de auditoría a registrar.
 * @param {string} [event.usuarioId] - Identificador del usuario actor o null.
 * @param {string} [event.rol] - Rol institucional del actor o null.
 * @param {string} event.action - Código de la acción auditada (CREACION_USUARIO, REGISTRO_CHECKIN, etc.).
 * @param {string} event.resource - Nombre de la tabla o entidad afectada.
 * @param {string|number|null} [event.resourceId] - Identificador del recurso afectado.
 * @param {Object|string} [event.details] - Metadatos estructurados de contexto del evento.
 * @param {string|null} [event.ipAddress] - Dirección IP de origen o null.
 * @param {import('pg').PoolClient} [client] - Cliente transaccional. Si se omite, crea una transacción propia.
 * @returns {Promise<Object>} Fila del log insertado con id, prev_hash y hash calculado.
 */
export const createLog = async (event, client) => {
  if (!client) return transaction(tx => createLog(event, tx));
  // La misma exclusión protege el orden de commit y el enlace entre transacciones.
  await client.query('SELECT pg_advisory_xact_lock(360013)');
  const previous = (await client.query('SELECT hash FROM auditoria_logs ORDER BY id DESC LIMIT 1')).rows[0];
  const id = (await client.query("SELECT nextval(pg_get_serial_sequence('auditoria_logs','id')) AS id")).rows[0].id;
  const row = {
    id, usuario_id: event.usuarioId || null, actor_reference: event.usuarioId || null,
    rol: event.rol || null, action: event.action, resource: event.resource,
    resource_id: event.resourceId || null,
    details: typeof event.details === 'string' ? { message: event.details } : event.details || {},
    ip_address: event.ipAddress || null, prev_hash: previous?.hash || GENESIS_HASH,
    created_at: new Date().toISOString(), hash_version: 2
  };
  row.hash = auditHash(row);
  const result = await client.query(`INSERT INTO auditoria_logs
    (id,usuario_id,actor_reference,rol,action,resource,resource_id,details,ip_address,prev_hash,hash,created_at,hash_version)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,2) RETURNING *`,
  [row.id,row.usuario_id,row.actor_reference,row.rol,row.action,row.resource,row.resource_id,
    JSON.stringify(row.details),row.ip_address,row.prev_hash,row.hash,row.created_at]);
  return result.rows[0];
};

/**
 * Recorre la cadena completa de auditoría verificando enlaces criptográficos (prev_hash) y consistencia de contenido (hash).
 * Retorna un reporte detallado de integridad, fallos detectados y cobertura de verificación (formato v2 vs legacy).
 *
 * @returns {Promise<{totalRecords: number, verifiedRecords: number, legacyUnverifiable: number, firstId: number|null, lastId: number|null, chainValid: boolean, contentValid: boolean, failures: Array<{id: string, kind: string}>, coverage: string}>} Reporte de integridad.
 */
export async function verifyIntegrity() {
  return transaction(async client => {
    // Una sola consulta obtiene una vista consistente de la cadena completa.
    const { rows } = await client.query('SELECT * FROM auditoria_logs ORDER BY id');
    let previous = null, verified = 0, legacy = 0;
    const failures = [];
    for (const row of rows) {
      if (previous && row.prev_hash !== previous.hash) failures.push({ id: String(row.id), kind: 'LINK' });
      if (row.hash_version === 2) {
        if (!previous && row.prev_hash !== GENESIS_HASH) failures.push({ id: String(row.id), kind: 'GENESIS' });
        if (row.hash !== auditHash(row)) failures.push({ id: String(row.id), kind: 'CONTENT' });
        verified++;
      } else legacy++;
      previous = row;
    }
    return { totalRecords: rows.length, verifiedRecords: verified, legacyUnverifiable: legacy,
      firstId: rows[0]?.id || null, lastId: rows.at(-1)?.id || null,
      chainValid: !failures.some(f => f.kind !== 'CONTENT'),
      contentValid: !failures.some(f => f.kind === 'CONTENT'), failures,
      coverage: legacy ? 'Enlaces completos; contenido verificable únicamente en registros con formato 2. Los hashes históricos se conservan.' : 'Enlaces y contenido de todos los registros con formato 2.' };
  });
}
