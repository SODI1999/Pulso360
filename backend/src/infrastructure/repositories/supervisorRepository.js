/**
 * @fileoverview Repositorio para gestión de intervenciones preventivas y seguimientos asignados a supervisores operativos.
 * Capa: P10 · infrastructure/repositories
 * @module infrastructure/repositories/supervisorRepository
 */
import { createLog } from './auditorRepository.js';
import pool from '../db.js';

export const supervisorRepository = {
  /**
   * Valida si una intervención específica pertenece al ámbito autorizado del supervisor
   * (asignada directamente, a uno de sus equipos a cargo o a su campaña asignada).
   *
   * @param {string} intervencionId - Identificador de la intervención.
   * @param {string} supervisorId - Identificador del usuario supervisor.
   * @returns {Promise<{id: string, campana_id: string, equipo_id: string|null}|undefined>} Ámbito o undefined.
   */
  async findAuthorizedIntervention(intervencionId, supervisorId) {
    return (await pool.query(`
      SELECT i.id, i.campana_id, i.equipo_id
      FROM sst_intervenciones i
      WHERE i.id = $1
        AND (
          i.assigned_to = $2
          OR i.equipo_id IN (
            SELECT aue.equipo_id FROM asignaciones_usuario_equipo aue
            WHERE aue.usuario_id = $2 AND aue.activa = TRUE
          )
          OR i.campana_id IN (
            SELECT eq.campana_id FROM equipos eq
            JOIN asignaciones_usuario_equipo aue ON aue.equipo_id = eq.id
            WHERE aue.usuario_id = $2 AND aue.activa = TRUE
          )
        )
    `, [intervencionId, supervisorId])).rows[0];
  },
  /**
   * Consulta las intervenciones activas o históricas asignadas al supervisor o pertenecientes a sus equipos y campañas a cargo.
   * Agrega el historial completo de seguimientos en un arreglo JSON embebido ordenado cronológicamente.
   *
   * @param {string} supervisorId - Identificador del supervisor.
   * @returns {Promise<Array<Object>>} Lista de intervenciones con seguimientos embebidos.
   */
  async findAssignedInterventions(supervisorId) {
    const query = `
      SELECT 
        i.id, i.alerta_id, i.title, i.type, i.campana_id, i.equipo_id, 
        i.creator_id, i.assigned_to, i.status, i.start_date, i.end_date, 
        i.indicator, i.baseline, i.after_val, i.progress, i.target_desc, 
        i.external_action, i.created_at,
        c.nombre AS campana_nombre,
        COALESCE(a.severity, 'Media') AS priority,
        i.end_date AS deadline,
        COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'fecha', s.fecha,
              'progreso_reportado', s.progreso_reportado,
              'nota_avance', s.nota_avance,
              'autor_id', s.autor_id,
              'tipo_accion', s.tipo_accion
            ) ORDER BY s.created_at DESC, s.fecha DESC, s.id DESC
          ) FILTER (WHERE s.id IS NOT NULL), 
          '[]'
        ) AS seguimientos
      FROM sst_intervenciones i
      LEFT JOIN campanas c ON i.campana_id = c.id
      LEFT JOIN sst_alertas a ON i.alerta_id = a.id
      LEFT JOIN seguimientos_intervencion s ON s.intervencion_id = i.id
      WHERE i.assigned_to = $1 
         OR i.equipo_id IN (
           SELECT aue.equipo_id 
           FROM asignaciones_usuario_equipo aue 
           WHERE aue.usuario_id = $1 AND aue.activa = TRUE
         )
         OR i.campana_id IN (
           SELECT eq.campana_id 
           FROM equipos eq 
           JOIN asignaciones_usuario_equipo aue ON aue.equipo_id = eq.id
           WHERE aue.usuario_id = $1 AND aue.activa = TRUE
         )
      GROUP BY i.id, c.nombre, a.severity
      ORDER BY i.created_at DESC
    `;
    const result = await pool.query(query, [supervisorId]);
    return result.rows;
  },

  /**
   * Registra un seguimiento de avance sobre una intervención en una transacción atómica:
   * inserta en seguimientos_intervencion, actualiza el progreso en sst_intervenciones (cerrándola si progreso >= 100)
   * y genera el log de auditoría correspondiente.
   *
   * @param {Object} params - Datos del seguimiento.
   * @param {string} params.id - Identificador UUID del seguimiento.
   * @param {string} params.intervencionId - Identificador de la intervención.
   * @param {string} params.autorId - Identificador del supervisor autor.
   * @param {string} params.fecha - Fecha del seguimiento (YYYY-MM-DD).
   * @param {number} params.progresoReportado - Porcentaje de avance (0 a 100).
   * @param {string} params.notaAvance - Nota descriptiva del avance o acción ejecutada.
   * @param {string} params.tipoAccion - Tipo de acción ('Reunion', 'Capacitacion', 'Ajuste operativo', etc.).
   * @returns {Promise<Object>} Registro del seguimiento creado.
   */
  async createFollowup({ id, intervencionId, autorId, fecha, progresoReportado, notaAvance, tipoAccion }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const insertQuery = `
        INSERT INTO seguimientos_intervencion 
        (id, intervencion_id, autor_id, fecha, progreso_reportado, nota_avance, tipo_accion)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const followupResult = await client.query(insertQuery, [id, intervencionId, autorId, fecha, progresoReportado, notaAvance, tipoAccion]);

      const updateQuery = `
        UPDATE sst_intervenciones 
        SET progress = $1, 
            status = CASE WHEN $1 >= 100 THEN 'Cerrada' ELSE 'Activa' END 
        WHERE id = $2 
        RETURNING *
      `;
      await client.query(updateQuery, [progresoReportado, intervencionId]);
      
      await createLog({usuarioId:autorId,rol:'SUPERVISOR',action:'SEGUIMIENTO_INTERVENCION',resource:'sst_intervenciones',resourceId:intervencionId,details:{progress:progresoReportado}},client);
      await client.query('COMMIT');
      return followupResult.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
};
