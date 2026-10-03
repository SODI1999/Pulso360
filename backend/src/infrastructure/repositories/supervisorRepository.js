import pool from '../db.js';

export const supervisorRepository = {
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
              'autor_id', s.autor_id
            ) ORDER BY s.fecha DESC
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

  async createFollowup({ id, intervencionId, autorId, fecha, progresoReportado, notaAvance }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const insertQuery = `
        INSERT INTO seguimientos_intervencion 
        (id, intervencion_id, autor_id, fecha, progreso_reportado, nota_avance) 
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const followupResult = await client.query(insertQuery, [id, intervencionId, autorId, fecha, progresoReportado, notaAvance]);

      const updateQuery = `
        UPDATE sst_intervenciones 
        SET progress = $1, 
            status = CASE WHEN $1 >= 100 THEN 'Cerrada' ELSE 'Activa' END 
        WHERE id = $2 
        RETURNING *
      `;
      await client.query(updateQuery, [progresoReportado, intervencionId]);
      
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
