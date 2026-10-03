import pool from '../db.js';

export const sstRepository = {
  /**
   * Busca alertas de salud ocupacional con la información de campaña y equipo asociada.
   * Filtra las alertas del catálogo sin acoplarse directamente al modelo del agente.
   * 
   * @param {Object} filters Criterios de filtrado
   * @returns {Promise<Array>} Lista de alertas de SST
   */
  async findAlerts(filters = {}) {
    let query = `
      SELECT 
        a.id, a.alert_date, a.status, a.severity, a.respondents, a.description,
        r.nombre AS regla_nombre,
        c.nombre AS campana_nombre,
        e.nombre AS equipo_nombre
      FROM sst_alertas a
      JOIN reglas_alerta r ON a.regla_id = r.id
      LEFT JOIN campanas c ON a.campana_id = c.id
      LEFT JOIN equipos e ON a.equipo_id = e.id
      WHERE 1=1
    `;
    const values = [];
    let index = 1;

    const statusFilter = filters.status || filters.estado;
    if (statusFilter) {
      query += ` AND a.status = $${index++}`;
      values.push(statusFilter);
    }

    query += ` ORDER BY a.alert_date DESC`;
    const { rows } = await pool.query(query, values);
    return rows;
  },

  /**
   * Consulta las intervenciones de bienestar, que son los planes de acción creados por el área SST.
   * 
   * @param {Object} filters
   * @returns {Promise<Array>}
   */
  async findInterventions(filters = {}) {
    let query = `
      SELECT 
        i.id, i.alerta_id, i.title, i.type, i.campana_id, i.equipo_id,
        c.nombre AS campana_nombre,
        e.nombre AS equipo_nombre,
        i.creator_id, i.assigned_to, i.start_date, i.end_date, i.indicator, i.baseline, i.progress, i.target_desc, i.status, i.created_at
      FROM sst_intervenciones i
      LEFT JOIN campanas c ON i.campana_id = c.id
      LEFT JOIN equipos e ON i.equipo_id = e.id
      WHERE 1=1
    `;
    const values = [];
    let index = 1;

    if (filters.status) {
      query += ` AND i.status = $${index++}`;
      values.push(filters.status);
    }
    
    query += ` ORDER BY i.created_at DESC`;
    const { rows } = await pool.query(query, values);
    return rows;
  },

  /**
   * Persiste una nueva intervención definida por el especialista SST en base de datos.
   * Los valores predeterminados garantizan consistencia en los campos iniciales (ej. progress: 0).
   * 
   * @param {Object} data Datos validados de la intervención
   * @returns {Promise<Object>} Resumen de la intervención insertada
   */
  async createIntervention(data) {
    const query = `
      INSERT INTO sst_intervenciones (
        id, alerta_id, title, type, campana_id, equipo_id, creator_id, assigned_to, 
        start_date, end_date, indicator, baseline, progress, target_desc, status, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW()
      ) RETURNING id, status, created_at
    `;
    const values = [
      data.id, data.alerta_id || null, data.title, data.type, data.campana_id, data.equipo_id, data.creator_id, data.assigned_to || null,
      data.start_date, data.end_date, data.indicator, data.baseline || null, data.progress || 0, data.target_desc || null, 'Activa'
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async createInterventionWithAlertTransition(data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const insertQuery = `
        INSERT INTO sst_intervenciones (
          id, alerta_id, title, type, campana_id, equipo_id, creator_id, assigned_to, 
          start_date, end_date, indicator, baseline, progress, target_desc, status, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW()
        ) RETURNING id, status, created_at
      `;
      const values = [
        data.id, data.alerta_id || null, data.title, data.type, data.campana_id, data.equipo_id, data.creator_id, data.assigned_to || null,
        data.start_date, data.end_date, data.indicator, data.baseline || null, data.progress || 0, data.target_desc || null, 'Activa'
      ];
      const { rows } = await client.query(insertQuery, values);

      if (data.alerta_id) {
        await client.query(
          `UPDATE sst_alertas SET status = 'INTERVENIDA' WHERE id = $1`,
          [data.alerta_id]
        );
      }

      await client.query('COMMIT');
      return rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Obtiene la lista de solicitudes de apoyo de los trabajadores.
   * ATENCIÓN A LA PRIVACIDAD: Si el trabajador eligió el modo 'anonimo', la consulta
   * omite deliberadamente la concatenación de nombres, protegiendo así su identidad directamente desde la capa de persistencia.
   * 
   * @returns {Promise<Array>} Solicitudes con el nombre del solicitante (o NULL si es anónimo)
   */
  async findSupportRequests() {
    const query = `
      SELECT 
        s.id, s.code, s.mode, s.request_date, s.reason, s.description, s.urgency, s.contact_preference, s.status,
        CASE 
          WHEN s.mode = 'anonimo' THEN NULL 
          ELSE CONCAT(u.nombres, ' ', u.apellidos) 
        END AS solicitante
      FROM solicitudes_apoyo s
      LEFT JOIN usuarios u ON s.owner_user_id = u.id
      ORDER BY s.request_date DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  /**
   * Crea un ticket de solicitud de apoyo psicosocial.
   * 
   * @param {Object} data 
   * @returns {Promise<Object>} Confirmación de creación con el código único de seguimiento
   */
  async createSupportRequest(data) {
    const query = `
      INSERT INTO solicitudes_apoyo (
        id, code, mode, owner_user_id, identity_user_id, request_date, reason, description, urgency, contact_preference, status
      ) VALUES (
        $1, $2, $3, $4, $5, NOW(), $6, $7, $8, $9, $10
      ) RETURNING id, code, status
    `;
    const values = [
      data.id, data.code, data.mode, data.owner_user_id, data.identity_user_id,
      data.reason, data.description, data.urgency, data.contact_preference, 'Recibida'
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async updateAlertStatus(alertId, { status, dismissReason }) {
    const query = `
      UPDATE sst_alertas 
      SET status = $2,
          description = CASE WHEN $3::text IS NOT NULL AND $3::text <> '' THEN description || ' [Descarte: ' || $3 || ']' ELSE description END
      WHERE id = $1 
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [alertId, status, dismissReason || null]);
    return rows[0];
  },

  async updateSupportRequestStatus(requestId, status) {
    const query = `
      UPDATE solicitudes_apoyo 
      SET status = $2,
          resuelto_en = CASE WHEN $2 IN ('Atendida', 'Cerrada') THEN CURRENT_TIMESTAMP ELSE resuelto_en END
      WHERE id = $1 
      RETURNING 
        id, code, mode, reason, description, urgency, contact_preference,
        status, request_date, resuelto_en, created_at,
        CASE WHEN mode = 'anonimo' THEN NULL ELSE owner_user_id END AS owner_user_id;
    `;
    const { rows } = await pool.query(query, [requestId, status]);
    return rows[0];
  }
};
