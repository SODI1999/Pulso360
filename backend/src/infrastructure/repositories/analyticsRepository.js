import pool from '../db.js';

export const analyticsRepository = {
  /**
   * Cuenta los participantes únicos en la cohorte para evaluar k-anonimato.
   * Se utiliza COUNT(DISTINCT d.usuario_id) para contar participantes y no simplemente las filas de check-ins,
   * garantizando que el umbral de protección dependa de personas reales y no de la frecuencia de registros,
   * evitando que un supervisor deduzca datos de un solo empleado muy activo.
   *
   * @param {Object} params
   * @param {number} [params.campanaId]
   * @param {number} [params.equipoId]
   * @param {string} params.desde - Fecha inicial (YYYY-MM-DD)
   * @param {string} params.hasta - Fecha final (YYYY-MM-DD)
   * @returns {Promise<number>} Número de participantes únicos
   */
  async countDistinctParticipants({ campanaId, equipoId, desde, hasta }) {
    let query = `
      SELECT COUNT(DISTINCT d.usuario_id) AS total_participantes
      FROM daily_checkins d
      JOIN usuarios u ON d.usuario_id = u.id
      LEFT JOIN asignaciones_usuario_equipo a ON (d.asignacion_id = a.id OR (d.asignacion_id IS NULL AND d.usuario_id = a.usuario_id AND a.activa = TRUE))
      LEFT JOIN equipos eq ON a.equipo_id = eq.id
      WHERE 1=1
    `;
    const values = [];
    let index = 1;

    if (desde) {
      query += ` AND d.checkin_date >= $${index++}`;
      values.push(desde);
    }
    if (hasta) {
      query += ` AND d.checkin_date <= $${index++}`;
      values.push(hasta);
    }
    if (campanaId) {
      query += ` AND eq.campana_id = $${index++}`;
      values.push(campanaId);
    }
    if (equipoId) {
      query += ` AND a.equipo_id = $${index++}`;
      values.push(equipoId);
    }

    const { rows } = await pool.query(query, values);
    return Number(rows[0]?.total_participantes) || 0;
  },

  /**
   * Obtiene los promedios agregados para las 6 dimensiones de bienestar.
   * Solo debe ser invocado por el servicio tras confirmar que se cumple el k-anonimato (k >= 5).
   * Los parámetros posicionales ($1..$4) se usan de forma estricta contra ataques de inyección SQL.
   *
   * @param {Object} params
   * @param {string} [params.campanaId]
   * @param {string} [params.equipoId]
   * @param {string} [params.desde]
   * @param {string} [params.hasta]
   * @returns {Promise<Object|null>} Promedios agregados redondeados a 2 decimales
   */
  async getAggregatedAverages({ campanaId, equipoId, desde, hasta }) {
    let query = `
      SELECT 
        ROUND(AVG(d.energia), 2) AS energia,
        ROUND(AVG(d.carga_emocional), 2) AS carga_emocional,
        ROUND(AVG(d.recuperacion), 2) AS recuperacion,
        ROUND(AVG(d.apoyo), 2) AS apoyo,
        ROUND(AVG(d.distanciamiento), 2) AS distanciamiento,
        ROUND(AVG(d.ineficacia), 2) AS ineficacia
      FROM daily_checkins d
      JOIN usuarios u ON d.usuario_id = u.id
      LEFT JOIN asignaciones_usuario_equipo a ON (d.asignacion_id = a.id OR (d.asignacion_id IS NULL AND d.usuario_id = a.usuario_id AND a.activa = TRUE))
      LEFT JOIN equipos eq ON a.equipo_id = eq.id
      WHERE 1=1
    `;
    const values = [];
    let index = 1;

    if (desde) {
      query += ` AND d.checkin_date >= $${index++}`;
      values.push(desde);
    }
    if (hasta) {
      query += ` AND d.checkin_date <= $${index++}`;
      values.push(hasta);
    }
    if (campanaId) {
      query += ` AND eq.campana_id = $${index++}`;
      values.push(campanaId);
    }
    if (equipoId) {
      query += ` AND a.equipo_id = $${index++}`;
      values.push(equipoId);
    }

    const { rows } = await pool.query(query, values);
    
    if (!rows[0] || rows[0].energia === null) return null;

    return {
      energia_avg: Number(rows[0].energia) || 0,
      carga_emocional_avg: Number(rows[0].carga_emocional) || 0,
      recuperacion_avg: Number(rows[0].recuperacion) || 0,
      apoyo_avg: Number(rows[0].apoyo) || 0,
      distanciamiento_avg: Number(rows[0].distanciamiento) || 0,
      ineficacia_avg: Number(rows[0].ineficacia) || 0,
      energia: Number(rows[0].energia) || 0,
      carga_emocional: Number(rows[0].carga_emocional) || 0,
      recuperacion: Number(rows[0].recuperacion) || 0,
      apoyo: Number(rows[0].apoyo) || 0,
      distanciamiento: Number(rows[0].distanciamiento) || 0,
      ineficacia: Number(rows[0].ineficacia) || 0
    };
  }
};
