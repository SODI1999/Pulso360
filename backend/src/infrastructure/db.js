// backend/src/infrastructure/db.js
// Capa: P10 · infrastructure / Componente: C07 · Acceso a datos
// Gestión del Pool de conexiones de PostgreSQL (pg nativo)

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

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
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10),
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
