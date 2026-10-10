/**
 * @fileoverview Repositorio para persistencia e integridad criptográfica (SHA-256) de reportes generados.
 * Capa: P10 · infrastructure/repositories
 * @module infrastructure/repositories/reportsRepository
 */
import pool from '../db.js';

export const reportsRepository = {
  /**
   * Consulta todos los reportes exportados por un autor ordenados por fecha descendente.
   *
   * @param {string} autorId - Identificador del usuario autor del reporte.
   * @returns {Promise<Array<Object>>} Lista de reportes generados.
   */
  async findAll(autorId) {
    const query = `
      SELECT id, tipo_reporte, autor_id, campana_id, equipo_id, fecha_corte, hash_integridad, parametros_filtro, ruta_archivo, created_at
      FROM reportes_generados
      WHERE autor_id = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [autorId]);
    return rows;
  },

  /**
   * Inserta un nuevo registro de reporte generado con su correspondiente hash de integridad SHA-256.
   *
   * @param {Object} params - Datos del reporte.
   * @param {string} params.id - Identificador UUID del reporte.
   * @param {string} params.tipoReporte - Tipo de reporte ('CLIMA_SEMANAL', 'INTERVENCIONES', etc.).
   * @param {string} params.autorId - Identificador del usuario autor.
   * @param {string|null} [params.campanaId] - Identificador de campaña o null.
   * @param {string|null} [params.equipoId] - Identificador de equipo o null.
   * @param {string} params.fechaCorte - Fecha de corte del reporte (YYYY-MM-DD).
   * @param {string} params.hashIntegridad - Hash SHA-256 del contenido generado.
   * @param {Object|null} [params.parametrosFiltro] - Parámetros y filtros aplicados.
   * @param {string|null} [params.rutaArchivo] - Ruta de archivo o null.
   * @param {import('pg').PoolClient|import('pg').Pool} [client=pool] - Cliente de base de datos.
   * @returns {Promise<Object>} Registro del reporte creado.
   */
  async create({ id, tipoReporte, autorId, campanaId, equipoId, fechaCorte, hashIntegridad, parametrosFiltro, rutaArchivo }, client = pool) {
    const query = `
      INSERT INTO reportes_generados (
        id, tipo_reporte, autor_id, campana_id, equipo_id, fecha_corte, hash_integridad, parametros_filtro, ruta_archivo
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      ) RETURNING id, tipo_reporte, autor_id, campana_id, equipo_id, fecha_corte, hash_integridad, parametros_filtro, ruta_archivo, created_at
    `;
    const values = [
      id,
      tipoReporte,
      autorId,
      campanaId || null,
      equipoId || null,
      fechaCorte,
      hashIntegridad,
      parametrosFiltro ? JSON.stringify(parametrosFiltro) : null,
      rutaArchivo || null
    ];
    const { rows } = await client.query(query, values);
    return rows[0];
  },

  /**
   * Obtiene la información y hash de integridad de un reporte específico por su ID.
   *
   * @param {string} id - Identificador del reporte.
   * @returns {Promise<Object|undefined>} Fila del reporte o undefined.
   */
  async findById(id) {
    const query = `
      SELECT id, tipo_reporte, autor_id, campana_id, equipo_id, fecha_corte, hash_integridad, parametros_filtro, ruta_archivo, created_at
      FROM reportes_generados
      WHERE id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
};
