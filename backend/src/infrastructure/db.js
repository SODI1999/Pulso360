/**
 * @fileoverview Gestión del Pool de conexiones de PostgreSQL y utilidades de ejecución SQL.
 * Capa: P10 · infrastructure / Componente: C07 · Acceso a datos y persistencia
 *
 * Administra el ciclo de vida del Pool de conexiones, aislamiento de base de datos
 * para entornos de test y transacciones atómicas seguras con BEGIN/COMMIT/ROLLBACK.
 *
 * @module infrastructure/db
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
if (process.env.NODE_ENV === 'test') dotenv.config({ path:'.env.test' });
if (process.env.NODE_ENV === 'test' && (!process.env.DB_NAME_TEST || process.env.DB_NAME_TEST === process.env.DB_NAME)) {
  throw new Error('Las pruebas requieren DB_NAME_TEST distinta de DB_NAME.');
}

const { Pool } = pg;

// Validación de variables de entorno requeridas para la conexión
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  throw new Error(`[Config Error]: Faltan variables de entorno requeridas para la BD: ${missingVars.join(', ')}`);
}

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: (process.env.NODE_ENV === 'test' && process.env.DB_NAME_TEST) ? process.env.DB_NAME_TEST : process.env.DB_NAME,
  user: process.env.NODE_ENV === 'test' ? process.env.DB_TEST_USER || process.env.DB_USER : process.env.DB_USER,
  password: process.env.NODE_ENV === 'test' ? process.env.DB_TEST_PASSWORD || process.env.DB_PASSWORD : process.env.DB_PASSWORD,
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10),
  ssl: process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
    : false,
});

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]: Error inesperado en cliente inactivo', err);
});

/**
 * Ejecuta una consulta SQL parametrizada
 * @param {string} text - Consulta SQL con marcadores posicionales ($1, $2...)
 * @param {Array} params - Valores de los parámetros
 * @returns {Promise<pg.QueryResult>}
 */
export const query = (text, params) => pool.query(text, params);

/**
 * Ejecuta un conjunto de operaciones dentro de una transacción atómica segura.
 * Adquiere un cliente dedicado del pool, inicia BEGIN, ejecuta el callback y
 * finaliza con COMMIT si es exitoso o ROLLBACK ante cualquier excepción.
 *
 * @template T
 * @param {function(import('pg').PoolClient): Promise<T>} operation - Callback que recibe el cliente de BD.
 * @returns {Promise<T>} Resultado devuelto por la operación transaccional.
 * @throws {Error} Propaga cualquier error ocurrido durante la transacción tras hacer ROLLBACK.
 */
export async function transaction(operation) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await operation(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

/**
 * Prueba la conexión inicial al servidor PostgreSQL
 * @returns {Promise<boolean>}
 */
export const testConnection = async () => {
  try {
    const res = await query('SELECT NOW() as current_time, current_database() as db;');
    console.log(`[PostgreSQL Conectado]: BD=${res.rows[0].db}, HoraServidor=${res.rows[0].current_time}`);
    return true;
  } catch (error) {
    console.error('[PostgreSQL Fallo de Conexión]:', error.message);
    return false;
  }
};

export default pool;
