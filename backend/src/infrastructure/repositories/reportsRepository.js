import pool from '../db.js';

export const reportsRepository = {
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

  async create({ id, tipoReporte, autorId, campanaId, equipoId, fechaCorte, hashIntegridad, parametrosFiltro, rutaArchivo }) {
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
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

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
