// backend/src/application/services/chatPersistenceService.js
// Servicio de persistencia y trazabilidad de sesiones de chat vinculadas a Radicados de Apoyo SST (PostgreSQL)
// Modelo preventivo de SG-SST (RF-10, Ley 1581 de 2012 / Res. 2646 de 2008)

import { pool } from '../../infrastructure/db.js';
import { AppError } from '../errors/AppError.js';

export const chatPersistenceService = {
  /**
   * Activa e inicia una sala de chat preventivo vinculada a un radicado formal (Rol: SST).
   */
  activateChatForRequest: async ({ requestId, sstUserId }) => {
    if (!requestId) throw new AppError('El ID del radicado es requerido', 'SUPPORT_REQUEST_ID_REQUIRED', 400);
    if (!sstUserId) throw new AppError('El ID del especialista SST es requerido', 'CHAT_SST_ID_REQUIRED', 400);

    // 1. Obtener la solicitud formal
    const reqRes = await pool.query(
      `SELECT s.*, 
              CASE 
                WHEN s.mode = 'anonimo' THEN 'Agente Confidencial (' || RIGHT(s.owner_user_id, 4) || ')'
                ELSE u.nombres || ' ' || u.apellidos
              END AS agente_nombre_visible
       FROM solicitudes_apoyo s
       JOIN usuarios u ON u.id = s.owner_user_id
       WHERE s.id = $1`,
      [requestId]
    );

    const solicitud = reqRes.rows[0];
    if (!solicitud) {
      throw new AppError('El radicado de apoyo no existe', 'SUPPORT_REQUEST_NOT_FOUND', 404);
    }

    if (solicitud.status === 'Cerrada' || solicitud.status === 'Atendida') {
      throw new AppError('No se puede iniciar un chat preventivo para un radicado que ya ha sido concluido formalmente', 'REQUEST_ALREADY_CLOSED', 400);
    }

    // 2. Verificar si ya existe una sesión activa para este radicado
    const existingRes = await pool.query(
      `SELECT * FROM sesiones_chat_soporte 
       WHERE solicitud_id = $1 AND estado = 'activa'
       ORDER BY creado_en DESC
       LIMIT 1`,
      [requestId]
    );

    let session = existingRes.rows[0];
    let isNewSession = false;

    if (!session) {
      isNewSession = true;
      const sessionId = `chs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const isAnon = solicitud.mode === 'anonimo';

      const createRes = await pool.query(
        `INSERT INTO sesiones_chat_soporte (
           id, solicitud_id, agente_id, es_anonimo, sst_atendio_id, estado,
           motivo_solicitud, descripcion_solicitud, aprobado_en, creado_en, actualizado_en
         )
         VALUES ($1, $2, $3, $4, $5, 'activa', $6, $7, NOW(), NOW(), NOW())
         RETURNING *`,
        [
          sessionId,
          solicitud.id,
          solicitud.owner_user_id,
          isAnon,
          sstUserId,
          solicitud.reason,
          solicitud.description
        ]
      );
      session = createRes.rows[0];

      // Actualizar el estado del radicado a 'En gestion' si estaba en 'Recibida'
      await pool.query(
        `UPDATE solicitudes_apoyo
         SET status = CASE WHEN status = 'Recibida' THEN 'En gestion' ELSE status END,
             assigned_to = COALESCE(assigned_to, $1)
         WHERE id = $2`,
        [sstUserId, requestId]
      );

      // Mensaje de bienvenida institucional ligado al radicado
      const msgId = `msg-${Date.now()}-welcome`;
      const greetingText = `Hola. Hemos habilitado este canal preventivo para coordinar el radicado ${solicitud.code || solicitud.id}. ¿En qué podemos apoyarte respecto a este requerimiento?`;

      await pool.query(
        `INSERT INTO mensajes_chat_soporte (id, sesion_id, remitente_id, remitente_rol, remitente_nombre, texto, creado_en)
         VALUES ($1, $2, $3, 'SST', 'Especialista SST (Salud Ocupacional)', $4, NOW())`,
        [msgId, session.id, sstUserId, greetingText]
      );
    }

    // 3. Obtener mensajes cronológicos
    const messagesRes = await pool.query(
      `SELECT id, sesion_id AS "sessionId", remitente_id AS "senderId",
              remitente_rol AS "senderRole", remitente_nombre AS "senderName",
              texto AS "text", creado_en AS "timestamp"
       FROM mensajes_chat_soporte
       WHERE sesion_id = $1
       ORDER BY creado_en ASC
       LIMIT 100`,
      [session.id]
    );

    return {
      session: {
        id: session.id,
        requestId: session.solicitud_id,
        requestCode: solicitud.code,
        agentId: session.agente_id,
        agentName: solicitud.agente_nombre_visible,
        isAnonymous: session.es_anonimo,
        status: session.estado,
        reason: session.motivo_solicitud,
        details: session.descripcion_solicitud,
        approvedAt: session.aprobado_en,
        createdAt: session.creado_en,
        updatedAt: session.actualizado_en,
        isNewSession
      },
      messages: messagesRes.rows
    };
  },

  /**
   * Obtiene la sesión de chat (activa o cerrada) asociada a un radicado formal.
   */
  getChatByRequestId: async ({ requestId, userId, userRole }) => {
    if (!requestId) throw new AppError('El ID del radicado es requerido', 'SUPPORT_REQUEST_ID_REQUIRED', 400);

    const reqRes = await pool.query(
      `SELECT s.*,
              CASE 
                WHEN s.mode = 'anonimo' THEN 'Agente Confidencial (' || RIGHT(s.owner_user_id, 4) || ')'
                ELSE u.nombres || ' ' || u.apellidos
              END AS agente_nombre_visible
       FROM solicitudes_apoyo s
       JOIN usuarios u ON u.id = s.owner_user_id
       WHERE s.id = $1`,
      [requestId]
    );

    const solicitud = reqRes.rows[0];
    if (!solicitud) {
      throw new AppError('El radicado de apoyo no existe', 'SUPPORT_REQUEST_NOT_FOUND', 404);
    }

    if (userRole !== 'SST' && solicitud.owner_user_id !== userId) {
      throw new AppError('No tienes autorización para consultar el chat de este radicado', 'AUTH_FORBIDDEN_RESOURCE', 403);
    }

    const sessionRes = await pool.query(
      `SELECT * FROM sesiones_chat_soporte
       WHERE solicitud_id = $1
       ORDER BY creado_en DESC
       LIMIT 1`,
      [requestId]
    );

    const session = sessionRes.rows[0];
    if (!session) {
      return {
        session: null,
        messages: []
      };
    }

    const messagesRes = await pool.query(
      `SELECT id, sesion_id AS "sessionId", remitente_id AS "senderId",
              remitente_rol AS "senderRole", remitente_nombre AS "senderName",
              texto AS "text", creado_en AS "timestamp"
       FROM mensajes_chat_soporte
       WHERE sesion_id = $1
       ORDER BY creado_en ASC
       LIMIT 100`,
      [session.id]
    );

    return {
      session: {
        id: session.id,
        requestId: session.solicitud_id,
        requestCode: solicitud.code,
        agentId: session.agente_id,
        agentName: solicitud.agente_nombre_visible,
        isAnonymous: session.es_anonimo,
        status: session.estado,
        reason: session.motivo_solicitud,
        details: session.descripcion_solicitud,
        closingReason: session.motivo_cierre,
        closingNotes: session.notas_cierre,
        approvedAt: session.aprobado_en,
        closedAt: session.cerrado_en,
        createdAt: session.creado_en,
        updatedAt: session.actualizado_en
      },
      messages: messagesRes.rows
    };
  },

  /**
   * Obtiene el mapa de estados de chat para todos los radicados de un agente.
   */
  getAgentActiveChatsMap: async ({ agentId }) => {
    if (!agentId) throw new AppError('El ID del agente es requerido', 'CHAT_AGENT_ID_REQUIRED', 400);

    const res = await pool.query(
      `SELECT s.id AS "sessionId",
              s.solicitud_id AS "requestId",
              s.estado AS "status",
              s.creado_en AS "createdAt",
              s.actualizado_en AS "updatedAt",
              (SELECT COUNT(*)::int FROM mensajes_chat_soporte m WHERE m.sesion_id = s.id) AS "messageCount"
       FROM sesiones_chat_soporte s
       WHERE s.agente_id = $1 AND s.solicitud_id IS NOT NULL
       ORDER BY s.actualizado_en DESC`,
      [agentId]
    );

    return res.rows;
  },

  /**
   * Guarda un nuevo mensaje inmutable en una sesión de chat activa.
   */
  saveMessage: async ({ sessionId, senderId, senderRole, senderName, text }) => {
    if (!sessionId || !senderId || !text || !text.trim()) {
      throw new AppError('Datos de mensaje incompletos', 'CHAT_MESSAGE_INVALID', 400);
    }

    const sessionRes = await pool.query(`SELECT * FROM sesiones_chat_soporte WHERE id = $1`, [sessionId]);
    const session = sessionRes.rows[0];

    if (!session || session.estado !== 'activa') {
      throw new AppError('La sesión de chat no está activa para enviar mensajes', 'CHAT_SESSION_NOT_ACTIVE', 400);
    }

    const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const cleanText = text.trim();

    const insertRes = await pool.query(
      `INSERT INTO mensajes_chat_soporte (id, sesion_id, remitente_id, remitente_rol, remitente_nombre, texto, creado_en)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, sesion_id AS "sessionId", remitente_id AS "senderId",
                 remitente_rol AS "senderRole", remitente_nombre AS "senderName",
                 texto AS "text", creado_en AS "timestamp"`,
      [msgId, sessionId, senderId, senderRole, senderName, cleanText]
    );

    await pool.query(
      `UPDATE sesiones_chat_soporte SET actualizado_en = NOW() WHERE id = $1`,
      [sessionId]
    );

    return {
      ...insertRes.rows[0],
      requestId: session.solicitud_id
    };
  },

  /**
   * Concluye una sesión de chat y la pasa a modo solo lectura.
   */
  closeSession: async ({ sessionId, closedByUserId, closedByRole, reason = 'ATENCION_CONCLUIDA', notes = '', targetRequestStatus = 'Cerrada' }) => {
    const sessionRes = await pool.query(`SELECT * FROM sesiones_chat_soporte WHERE id = $1`, [sessionId]);
    const session = sessionRes.rows[0];

    if (!session) {
      throw new AppError('La sesión de chat no existe', 'CHAT_SESSION_NOT_FOUND', 404);
    }

    if (closedByRole !== 'SST' && session.agente_id !== closedByUserId) {
      throw new AppError('No tienes autorización para cerrar esta conversación', 'AUTH_FORBIDDEN_RESOURCE', 403);
    }

    const updateRes = await pool.query(
      `UPDATE sesiones_chat_soporte
       SET estado = 'cerrada',
           motivo_cierre = $1,
           notas_cierre = $2,
           sst_atendio_id = COALESCE(sst_atendio_id, CASE WHEN $3 = 'SST' THEN $4 ELSE NULL END),
           cerrado_en = NOW(),
           actualizado_en = NOW()
       WHERE id = $5
       RETURNING *`,
      [reason, notes, closedByRole, closedByUserId, sessionId]
    );

    // Actualizar estado del radicado formal según la decisión de SST
    let finalRequestStatus = null;
    if (session.solicitud_id) {
      finalRequestStatus = targetRequestStatus === 'En gestion' ? 'En gestion' : 'Cerrada';
      await pool.query(
        `UPDATE solicitudes_apoyo
         SET status = $1
         WHERE id = $2`,
        [finalRequestStatus, session.solicitud_id]
      );
    }

    // Mensaje de cierre del sistema
    const sysMsgId = `msg-${Date.now()}-ended`;
    await pool.query(
      `INSERT INTO mensajes_chat_soporte (id, sesion_id, remitente_id, remitente_rol, remitente_nombre, texto, creado_en)
       VALUES ($1, $2, $3, 'SST', 'Sistema de Acompañamiento', 'La conversación de este radicado ha sido concluida. Se conserva el registro para consulta en solo lectura.', NOW())`,
      [sysMsgId, sessionId, closedByUserId]
    );

    return {
      ...updateRes.rows[0],
      finalRequestStatus
    };
  },

  /**
   * Recupera el historial completo de mensajes de una sesión.
   */
  getSessionMessages: async (sessionId, userId, userRole) => {
    const sessionRes = await pool.query(`SELECT * FROM sesiones_chat_soporte WHERE id = $1`, [sessionId]);
    const session = sessionRes.rows[0];

    if (!session) {
      throw new AppError('La sesión de chat no existe', 'CHAT_SESSION_NOT_FOUND', 404);
    }

    if (userRole !== 'SST' && session.agente_id !== userId) {
      throw new AppError('No tienes autorización para consultar esta conversación', 'AUTH_FORBIDDEN_RESOURCE', 403);
    }

    const messagesRes = await pool.query(
      `SELECT id, sesion_id AS "sessionId", remitente_id AS "senderId",
              remitente_rol AS "senderRole", remitente_nombre AS "senderName",
              texto AS "text", creado_en AS "timestamp"
       FROM mensajes_chat_soporte
       WHERE sesion_id = $1
       ORDER BY creado_en ASC
       LIMIT 100`,
      [sessionId]
    );

    return {
      session,
      messages: messagesRes.rows
    };
  }
};
