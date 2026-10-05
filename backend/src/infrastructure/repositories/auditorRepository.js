import { query } from '../db.js';

/**
 * Retorna la lista de logs con filtros, de forma paginada y uniéndose a la tabla usuarios
 */
export const findLogs = async ({ limit = 50, offset = 0, rol, action, startDate, endDate, entidadAfectada }) => {
  let baseQuery = `
    SELECT 
      al.id, al.usuario_id, al.rol, al.action, al.resource, al.resource_id, 
      al.details, al.ip_address, al.prev_hash, al.hash, al.created_at,
      al.action AS accion,
      al.resource AS entidad_afectada,
      u.nombres, u.apellidos
    FROM auditoria_logs al
    LEFT JOIN usuarios u ON al.usuario_id = u.id
    WHERE 1=1
  `;
  
  const values = [];
  let paramIndex = 1;

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

  baseQuery += ` ORDER BY al.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  values.push(limit, offset);

  const result = await query(baseQuery, values);
  return result.rows;
};

/**
 * Cuenta el total de logs según los filtros para paginación
 */
export const countLogs = async ({ rol, action, startDate, endDate, entidadAfectada }) => {
  let baseQuery = `SELECT COUNT(*) as total FROM auditoria_logs al WHERE 1=1`;
  const values = [];
  let paramIndex = 1;

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

import crypto from 'node:crypto';

/**
 * Crea un registro en la tabla de logs
 */
export const createLog = async ({ usuarioId, rol, action, resource, resourceId, details, ipAddress, prevHash, hash }) => {
  const detailsJson = typeof details === 'string' ? JSON.stringify({ message: details }) : JSON.stringify(details || {});
  
  let computedPrevHash = prevHash;
  if (!computedPrevHash) {
    const prevLogQuery = `SELECT hash FROM auditoria_logs ORDER BY id DESC LIMIT 1`;
    const prevResult = await query(prevLogQuery);
    computedPrevHash = prevResult.rows[0]?.hash || ('GENESIS_' + crypto.randomBytes(16).toString('hex'));
  }
  
  const canonicalPayload = [
    computedPrevHash,
    usuarioId || '',
    rol || '',
    action,
    resource,
    resourceId || '',
    detailsJson,
    ipAddress || ''
  ].join('|');
  const computedHash = crypto.createHash('sha256').update(canonicalPayload).digest('hex');

  const insertQuery = `
    INSERT INTO auditoria_logs 
      (usuario_id, rol, action, resource, resource_id, details, ip_address, prev_hash, hash) 
    VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
    RETURNING *;
  `;
  
  const values = [
    usuarioId || null, 
    rol || null, 
    action, 
    resource, 
    resourceId || null, 
    detailsJson, 
    ipAddress || null, 
    computedPrevHash, 
    computedHash
  ];

  const result = await query(insertQuery, values);
  return result.rows[0];
};
