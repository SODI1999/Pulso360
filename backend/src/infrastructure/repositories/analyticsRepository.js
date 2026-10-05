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
      JOIN (
        SELECT DISTINCT ON (usuario_id) usuario_id, c4_analitica
        FROM consentimientos
        ORDER BY usuario_id, registrado_en DESC
      ) c4 ON c4.usuario_id = d.usuario_id AND c4.c4_analitica = TRUE
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
  async getAggregatedAverages({ campanaId, equipoId, desde, hasta, minK = 5 }) {
    let query = `
      SELECT 
        COUNT(DISTINCT CASE WHEN d.energia IS NOT NULL THEN d.usuario_id END) AS count_energia,
        ROUND(AVG(d.energia), 2) AS energia,
        COUNT(DISTINCT CASE WHEN d.carga_emocional IS NOT NULL THEN d.usuario_id END) AS count_carga_emocional,
        ROUND(AVG(d.carga_emocional), 2) AS carga_emocional,
        COUNT(DISTINCT CASE WHEN d.recuperacion IS NOT NULL THEN d.usuario_id END) AS count_recuperacion,
        ROUND(AVG(d.recuperacion), 2) AS recuperacion,
        COUNT(DISTINCT CASE WHEN d.apoyo IS NOT NULL THEN d.usuario_id END) AS count_apoyo,
        ROUND(AVG(d.apoyo), 2) AS apoyo,
        COUNT(DISTINCT CASE WHEN d.distanciamiento IS NOT NULL THEN d.usuario_id END) AS count_distanciamiento,
        ROUND(AVG(d.distanciamiento), 2) AS distanciamiento,
        COUNT(DISTINCT CASE WHEN d.ineficacia IS NOT NULL THEN d.usuario_id END) AS count_ineficacia,
        ROUND(AVG(d.ineficacia), 2) AS ineficacia
      FROM daily_checkins d
      JOIN usuarios u ON d.usuario_id = u.id
      JOIN (
        SELECT DISTINCT ON (usuario_id) usuario_id, c4_analitica
        FROM consentimientos
        ORDER BY usuario_id, registrado_en DESC
      ) c4 ON c4.usuario_id = d.usuario_id AND c4.c4_analitica = TRUE
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
    
    if (!rows[0]) return null;

    const row = rows[0];

    // Evaluate granular k-anonymity
    const resolveDimension = (countField, avgField) => {
      return Number(row[countField]) >= minK ? (Number(row[avgField]) || 0) : null;
    };

    const energia = resolveDimension('count_energia', 'energia');
    const carga_emocional = resolveDimension('count_carga_emocional', 'carga_emocional');
    const recuperacion = resolveDimension('count_recuperacion', 'recuperacion');
    const apoyo = resolveDimension('count_apoyo', 'apoyo');
    const distanciamiento = resolveDimension('count_distanciamiento', 'distanciamiento');
    const ineficacia = resolveDimension('count_ineficacia', 'ineficacia');

    // If all dimensions are null due to k-anonymity (or really no data), return null overall.
    if (energia === null && carga_emocional === null && recuperacion === null && apoyo === null && distanciamiento === null && ineficacia === null) {
      return null;
    }

    return {
      energia_avg: energia,
      carga_emocional_avg: carga_emocional,
      recuperacion_avg: recuperacion,
      apoyo_avg: apoyo,
      distanciamiento_avg: distanciamiento,
      ineficacia_avg: ineficacia,
      energia,
      carga_emocional,
      recuperacion,
      apoyo,
      distanciamiento,
      ineficacia
    };
  }
};
