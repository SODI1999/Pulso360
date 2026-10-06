import pool, { transaction } from '../db.js';
import { AppError } from '../../application/errors/AppError.js';
import { createLog } from './auditorRepository.js';

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
        a.id, a.alert_date, a.status, a.severity, a.respondents, CASE WHEN a.respondents >= 5 THEN a.description ELSE NULL END AS description,
        CASE WHEN a.respondents >= 5 THEN a.evidence ELSE NULL END AS evidence, (a.respondents < 5) AS protected,
        a.campana_id, a.equipo_id,a.dismiss_reason,
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
        i.creator_id, i.assigned_to, CONCAT(u.nombres,' ',u.apellidos) AS assigned_name,
        i.external_action, i.after_val, (SELECT COALESCE(json_agg(s ORDER BY s.created_at DESC, s.fecha DESC, s.id DESC),'[]') FROM seguimientos_intervencion s WHERE s.intervencion_id=i.id) AS seguimientos,
        i.start_date, i.end_date, i.indicator, i.baseline, i.progress, i.target_desc, i.status, i.created_at
      FROM sst_intervenciones i
      LEFT JOIN usuarios u ON u.id=i.assigned_to
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
        start_date, end_date, indicator, baseline, progress, target_desc, status, external_action, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW()
      ) RETURNING *
    `;
    const values = [
      data.id, data.alerta_id || null, data.title, data.type, data.campana_id, data.equipo_id, data.creator_id, data.assigned_to || null,
      data.start_date, data.end_date, data.indicator, data.baseline ?? null, data.progress ?? 0, data.target_desc || null, 'Activa', data.external_action ?? false
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async createInterventionWithAlertTransition(data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const campaign = await client.query('SELECT id FROM campanas WHERE id=$1 FOR SHARE',[data.campana_id]);
      if (!campaign.rowCount) throw new AppError('Campaña inválida','INVALID_CAMPAIGN',400);
      if (data.equipo_id) {
        const team = await client.query('SELECT id FROM equipos WHERE id=$1 AND campana_id=$2 AND activo=TRUE FOR SHARE',[data.equipo_id,data.campana_id]);
        if (!team.rowCount) throw new AppError('Equipo ajeno a la campaña o inactivo','INVALID_TEAM_SCOPE',400);
      }
      if (data.assigned_to) {
        const responsible=await client.query("SELECT id,rol_codigo FROM usuarios WHERE id=$1 AND estado='Activo' AND rol_codigo IN ('SUPERVISOR','SST') FOR SHARE",[data.assigned_to]);
        if (!responsible.rowCount) throw new AppError('Responsable inválido','INVALID_RESPONSIBLE',400);
        if (responsible.rows[0].rol_codigo === 'SUPERVISOR') {
          const assignment=await client.query('SELECT 1 FROM asignaciones_usuario_equipo a JOIN equipos e ON a.equipo_id=e.id WHERE a.usuario_id=$1 AND a.activa=TRUE AND e.campana_id=$2 AND ($3::varchar IS NULL OR e.id=$3)',[data.assigned_to,data.campana_id,data.equipo_id]);
          if (!assignment.rowCount) throw new AppError('El responsable no tiene asignado este ámbito','INVALID_RESPONSIBLE_SCOPE',400);
        }
      }
      if (data.alerta_id) {
        const alert=await client.query('SELECT id FROM sst_alertas WHERE id=$1 AND campana_id=$2 AND equipo_id IS NOT DISTINCT FROM $3 FOR UPDATE',[data.alerta_id,data.campana_id,data.equipo_id]);
        if (!alert.rowCount) throw new AppError('Alerta ajena al ámbito','INVALID_ALERT_SCOPE',400);
      }

      const insertQuery = `
        INSERT INTO sst_intervenciones (
          id, alerta_id, title, type, campana_id, equipo_id, creator_id, assigned_to, 
          start_date, end_date, indicator, baseline, progress, target_desc, status, external_action, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW()
        ) RETURNING *
      `;
      const values = [
        data.id, data.alerta_id || null, data.title, data.type, data.campana_id, data.equipo_id, data.creator_id, data.assigned_to || null,
        data.start_date, data.end_date, data.indicator, data.baseline ?? null, data.progress ?? 0, data.target_desc || null, 'Activa', data.external_action ?? false
      ];
      const { rows } = await client.query(insertQuery, values);

      if (data.alerta_id) {
        await client.query(
          `UPDATE sst_alertas SET status = 'INTERVENIDA' WHERE id = $1`,
          [data.alerta_id]
        );
      }

      await createLog({usuarioId:data.creator_id,rol:'SST',action:'CREACION_INTERVENCION',resource:'sst_intervenciones',resourceId:data.id,details:{campanaId:data.campana_id,equipoId:data.equipo_id}},client);
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
        s.id, s.code, s.mode, s.request_date, s.reason, s.description, s.urgency, s.contact_preference, s.time_window, s.sla, s.status,
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

  async findSupportRequestsByUser(userId) {
    const query = `
      SELECT 
        id, code, mode, request_date, reason, description, urgency, contact_preference, time_window, status, sla
      FROM solicitudes_apoyo
      WHERE owner_user_id = $1
      ORDER BY request_date DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  },

  /**
   * Crea un ticket de solicitud de apoyo psicosocial.
   * 
   * @param {Object} data 
   * @returns {Promise<Object>} Confirmación de creación con el código único de seguimiento
   */
  async createSupportRequest(data) {
    return transaction(async client => {
    const query = `
      INSERT INTO solicitudes_apoyo (
        id, code, mode, owner_user_id, identity_user_id, request_date, reason, description, urgency, contact_preference, time_window, status
      ) VALUES (
        $1, $2, $3, $4, $5, NOW(), $6, $7, $8, $9, $10, $11
      ) RETURNING id, code, status, contact_preference, time_window, request_date, sla
    `;
    const values = [
      data.id, data.code, data.mode, data.owner_user_id, data.identity_user_id,
      data.reason, data.description, data.urgency, data.contact_preference ?? data.contactPreference, data.time_window || null, 'Recibida'
    ];
    const { rows } = await client.query(query, values);
    if (rows[0]) await createLog({usuarioId:data.owner_user_id,rol:'AGENTE',action:'SOLICITUD_APOYO',resource:'solicitudes_apoyo',resourceId:data.id,details:{status:rows[0].status}},client);
    return rows[0];
    });
  },

  async updateAlertStatus(alertId, { status, dismissReason }, actorId) {
    return transaction(async client => {
    const query = `
      UPDATE sst_alertas 
      SET status = $2,
          dismiss_reason = COALESCE($3::text,dismiss_reason)
      WHERE id = $1 
      RETURNING *;
    `;
    const { rows } = await client.query(query, [alertId, status, dismissReason || null]);
    if (rows[0]) await createLog({usuarioId:actorId,rol:'SST',action:'CAMBIO_ESTADO_ALERTA',resource:'sst_alertas',resourceId:alertId,details:{status:rows[0].status}},client);
    return rows[0];
    });
  },

  async updateSupportRequestStatus(requestId, status, actorId) {
    return transaction(async client => {
    const query = `
      UPDATE solicitudes_apoyo 
      SET status = $2
      WHERE id = $1 
      RETURNING 
        id, code, mode, reason, description, urgency, contact_preference,
        time_window, status, request_date, created_at,
        CASE WHEN mode = 'anonimo' THEN NULL ELSE owner_user_id END AS owner_user_id;
    `;
    const { rows } = await client.query(query, [requestId, status]);
    if (rows[0]) await createLog({usuarioId:actorId,rol:'SST',action:'ACTUALIZACION_APOYO',resource:'solicitudes_apoyo',resourceId:requestId,details:{status:rows[0].status}},client);
    return rows[0];
    });
  }
};
