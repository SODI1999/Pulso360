/**
 * @fileoverview Repositorio de analítica organizacional y cálculo de bienestar agregado con k-anonimato estricto.
 * INVARIANTE INVIOLABLE DE PRIVACIDAD: Las agregaciones evalúan k >= 5 y consentimiento C4 sobre la política vigente.
 * Capa: P10 · infrastructure/repositories
 * @module infrastructure/repositories/analyticsRepository
 */
import pool from '../db.js';

export const analyticsRepository = {
  /**
   * Cuenta los participantes únicos en la cohorte para evaluar k-anonimato.
   * Se utiliza COUNT(DISTINCT d.usuario_id) para contar participantes y no simplemente las filas de check-ins,
   * garantizando que el umbral de protección dependa de personas reales y no de la frecuencia de registros,
   * evitando que un supervisor deduzca datos de un solo empleado muy activo.
   *
   * @param {Object} params
   * @param {string} [params.campanaId]
   * @param {string} [params.equipoId]
   * @param {string} params.desde - Fecha inicial (YYYY-MM-DD)
   * @param {string} params.hasta - Fecha final (YYYY-MM-DD)
   * @param {import('pg').PoolClient|import('pg').Pool} [client=pool] - Conexión de consulta.
   * @returns {Promise<number>} Número de participantes únicos
   */
  async countDistinctParticipants({ campanaId, equipoId, desde, hasta }, client = pool) {
    let query = `
      SELECT COUNT(DISTINCT d.usuario_id) AS total_participantes
      FROM daily_checkins d
      JOIN usuarios u ON d.usuario_id = u.id
      JOIN (
        SELECT DISTINCT ON (usuario_id) usuario_id, c4_analitica, acepta_politica, politica_id
        FROM consentimientos
        ORDER BY usuario_id, registrado_en DESC, id DESC
      ) c4 ON c4.usuario_id = d.usuario_id AND c4.c4_analitica = TRUE AND c4.acepta_politica = TRUE
        AND c4.politica_id = (SELECT id FROM politicas_privacidad WHERE estado='PUBLICADA' AND vigente_desde<=NOW()
          ORDER BY vigente_desde DESC, created_at DESC, id DESC LIMIT 1)
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

    const { rows } = await client.query(query, values);
    return Number(rows[0]?.total_participantes) || 0;
  },

  /**
   * Obtiene los promedios agregados para las 6 dimensiones de bienestar.
   * Solo debe ser invocado por el servicio tras confirmar que se cumple el k-anonimato (k >= 5).
   * Devuelve conteos internos y métricas suprimidas por dimensión; no es un DTO público.
   *
   * @param {Object} params
   * @param {string} [params.campanaId]
   * @param {string} [params.equipoId]
   * @param {string} [params.desde]
   * @param {string} [params.hasta]
   * @param {number} [params.minK=5] - Umbral de publicación, nunca inferior a cinco.
   * @param {boolean} [params.activeOnly=false] - Restringe a ámbitos activos.
   * @param {import('pg').PoolClient|import('pg').Pool} [client=pool] - Conexión de consulta.
   * @returns {Promise<Object|null>} Promedios agregados redondeados a 2 decimales
   */
  async getSnapshot(params, client = pool) {
    return this.getAggregatedAverages({ ...params, includeCohort: true }, client);
  },

  /**
   * Calcula los promedios agregados de las 6 dimensiones de bienestar aplicando supresión granular
   * por dimensión si el conteo de participantes es inferior al umbral minK (por defecto k >= 5).
   * Solo incluye participantes que hayan otorgado consentimiento activo C4 para la política vigente.
   *
   * @param {Object} params - Criterios de agregación.
   * @param {string} [params.campanaId] - Identificador de campaña.
   * @param {string} [params.equipoId] - Identificador de equipo.
   * @param {string} [params.desde] - Fecha inicial YYYY-MM-DD.
   * @param {string} [params.hasta] - Fecha final YYYY-MM-DD.
   * @param {number} [params.minK=5] - Umbral mínimo; debe ser un entero mayor o igual a cinco.
   * @param {boolean} [params.includeCohort=false] - Incluye desglose de cohort_count y participant_counts.
   * @param {boolean} [params.activeOnly=false] - Restringe únicamente a equipos y campañas activos.
   * @param {import('pg').PoolClient|import('pg').Pool} [client=pool] - Cliente de base de datos.
   * @returns {Promise<Object|null>} Promedios protegidos por k-anonimato o null si no se cumple el umbral.
   * @throws {RangeError} Si se intenta reducir o invalidar el umbral de privacidad.
   */
  async getAggregatedAverages({ campanaId, equipoId, desde, hasta, minK = 5, includeCohort = false, activeOnly = false }, client = pool) {
    if (!Number.isInteger(minK) || minK < 5) {
      throw new RangeError('El umbral de privacidad debe ser un entero mayor o igual a cinco.');
    }
    let query = `
      SELECT 
        COUNT(DISTINCT d.usuario_id) AS cohort_count,
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
        SELECT DISTINCT ON (usuario_id) usuario_id, c4_analitica, acepta_politica, politica_id
        FROM consentimientos
        ORDER BY usuario_id, registrado_en DESC, id DESC
      ) c4 ON c4.usuario_id = d.usuario_id AND c4.c4_analitica = TRUE AND c4.acepta_politica = TRUE
        AND c4.politica_id = (SELECT id FROM politicas_privacidad WHERE estado='PUBLICADA' AND vigente_desde<=NOW()
          ORDER BY vigente_desde DESC, created_at DESC, id DESC LIMIT 1)
      LEFT JOIN asignaciones_usuario_equipo a ON (d.asignacion_id = a.id OR (d.asignacion_id IS NULL AND d.usuario_id = a.usuario_id AND a.activa = TRUE))
      LEFT JOIN equipos eq ON a.equipo_id = eq.id
      WHERE 1=1
    `;
    const values = [];
    let index = 1;

    if (activeOnly) {
      query += ` AND eq.activo=TRUE AND EXISTS(SELECT 1 FROM campanas c WHERE c.id=eq.campana_id AND c.activa=TRUE)`;
    }

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

    const { rows } = await client.query(query, values);
    
    if (!rows[0]) return null;

    const row = rows[0];
    // Solo metadatos internos; el DTO público sigue publicando métricas protegidas.
    const participant_counts = Object.fromEntries(['energia','carga_emocional','recuperacion','apoyo','distanciamiento','ineficacia']
      .map(field => [field, Number(row['count_' + field])]));

    // Evaluate granular k-anonymity
    const resolveDimension = (countField, avgField) => {
      return Number(row[countField]) >= minK ? (row[avgField] === null ? null : Number(row[avgField])) : null;
    };

    const energia = resolveDimension('count_energia', 'energia');
    const carga_emocional = resolveDimension('count_carga_emocional', 'carga_emocional');
    const recuperacion = resolveDimension('count_recuperacion', 'recuperacion');
    const apoyo = resolveDimension('count_apoyo', 'apoyo');
    const distanciamiento = resolveDimension('count_distanciamiento', 'distanciamiento');
    const ineficacia = resolveDimension('count_ineficacia', 'ineficacia');

    // If all dimensions are null due to k-anonymity (or really no data), return null overall.
    if (energia === null && carga_emocional === null && recuperacion === null && apoyo === null && distanciamiento === null && ineficacia === null) {
      return includeCohort ? { cohort_count: Number(row.cohort_count), participant_counts, metrics: null } : null;
    }

    const metrics = {
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
    return includeCohort ? { cohort_count: Number(row.cohort_count), participant_counts, metrics } : metrics;
  }
};
