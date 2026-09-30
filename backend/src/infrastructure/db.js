// backend/src/infrastructure/db.js
// Capa: P10 · infrastructure / Componente: C07 · Acceso a datos
// Gestión del Pool de conexiones de PostgreSQL (pg nativo)

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'pulso360_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
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
