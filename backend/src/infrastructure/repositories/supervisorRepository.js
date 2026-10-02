import pool from '../db.js';

export const supervisorRepository = {
  async findAssignedInterventions(supervisorId) {
    const query = `
      SELECT 
        i.id, i.campana_id, i.type, i.priority, i.status, 
        i.created_at, i.deadline, i.assigned_to, i.progress,
        c.nombre AS campana_nombre,
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
      LEFT JOIN seguimientos_intervencion s ON s.intervencion_id = i.id
      WHERE i.assigned_to = $1 
         OR i.campana_id IN (
           SELECT eq.campana_id 
           FROM equipos eq 
           WHERE eq.supervisor_id = $1
         )
      GROUP BY i.id, c.nombre
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
      await client.query(insertQuery, [id, intervencionId, autorId, fecha, progresoReportado, notaAvance]);

      const updateQuery = `
        UPDATE sst_intervenciones 
        SET progress = $1, 
            status = CASE WHEN $1 >= 100 THEN 'Cerrada' ELSE 'Activa' END 
        WHERE id = $2 
        RETURNING *
      `;
      const result = await client.query(updateQuery, [progresoReportado, intervencionId]);
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
};
