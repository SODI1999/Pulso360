// backend/src/application/services/chatPersistenceService.js
// Servicio de persistencia y trazabilidad de sesiones de chat de acompañamiento SST (PostgreSQL)

import { pool } from '../../infrastructure/db.js';
import { AppError } from '../errors/AppError.js';

export const chatPersistenceService = {
  /**
   * Obtiene o crea la sesión activa de chat para un agente.
   * Si ya existe una sesión en estado 'activa', la recupera junto con sus mensajes.
   */
  getOrCreateActiveSession: async ({ agentId, isAnonymous = false, agentName = null }) => {
    if (!agentId) throw new AppError('El ID del agente es requerido', 'CHAT_AGENT_ID_REQUIRED', 400);

    const existingRes = await pool.query(
      `SELECT s.*, 
              CASE 
                WHEN s.es_anonimo THEN 'Agente Confidencial (' || RIGHT(s.agente_id, 4) || ')'
                ELSE u.nombres || ' ' || u.apellidos
              END AS agente_nombre_visible
       FROM sesiones_chat_soporte s
       JOIN usuarios u ON u.id = s.agente_id
       WHERE s.agente_id = $1 AND s.estado = 'activa'
       ORDER BY s.creado_en DESC
       LIMIT 1`,
      [agentId]
    );

    let session = existingRes.rows[0];

    if (!session) {
      const sessionId = `chs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const createRes = await pool.query(
        `INSERT INTO sesiones_chat_soporte (id, agente_id, es_anonimo, estado, creado_en, actualizado_en)
         VALUES ($1, $2, $3, 'activa', NOW(), NOW())
         RETURNING *`,
        [sessionId, agentId, Boolean(isAnonymous)]
      );
      session = createRes.rows[0];
    } else if (isAnonymous !== undefined && session.es_anonimo !== Boolean(isAnonymous)) {
      const updateRes = await pool.query(
        `UPDATE sesiones_chat_soporte SET es_anonimo = $1, actualizado_en = NOW() WHERE id = $2 RETURNING *`,
        [Boolean(isAnonymous), session.id]
      );
      session = updateRes.rows[0];
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
        agentId: session.agente_id,
        isAnonymous: session.es_anonimo,
        status: session.estado,
        createdAt: session.creado_en,
        updatedAt: session.actualizado_en
      },
      messages: messagesRes.rows
    };
  },

  /**
   * Guarda un nuevo mensaje en la sesión de chat activa.
   */
  saveMessage: async ({ sessionId, senderId, senderRole, senderName, text }) => {
    if (!sessionId || !senderId || !text || !text.trim()) {
      throw new AppError('Datos de mensaje incompletos', 'CHAT_MESSAGE_INVALID', 400);
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

    return insertRes.rows[0];
  },

  /**
   * Obtiene la lista de todas las sesiones de chat activas para la consola de SST.
   */
  getActiveSessionsForSst: async () => {
    const res = await pool.query(
      `SELECT s.id AS "sessionId",
              s.agente_id AS "agentId",
              CASE 
                WHEN s.es_anonimo THEN 'Agente Confidencial (' || RIGHT(s.agente_id, 4) || ')'
                ELSE u.nombres || ' ' || u.apellidos
              END AS "agentName",
              s.es_anonimo AS "isAnonymous",
              s.actualizado_en AS "updatedAt",
              COALESCE(
                (SELECT m.texto FROM mensajes_chat_soporte m WHERE m.sesion_id = s.id ORDER BY m.creado_en DESC LIMIT 1),
                'Conversación iniciada'
              ) AS "lastMessage",
              (
                SELECT COUNT(*)::int 
                FROM mensajes_chat_soporte m 
                WHERE m.sesion_id = s.id AND m.remitente_rol = 'AGENTE'
              ) AS "messageCount"
       FROM sesiones_chat_soporte s
       JOIN usuarios u ON u.id = s.agente_id
       WHERE s.estado = 'activa'
       ORDER BY s.actualizado_en DESC`
    );

    return res.rows;
  },

  /**
   * Recupera el historial completo de mensajes de una sesión específica validando autorización.
   */
  getSessionMessages: async (sessionId, userId, userRole) => {
    const sessionRes = await pool.query(
      `SELECT * FROM sesiones_chat_soporte WHERE id = $1`,
      [sessionId]
    );

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
      session: {
        id: session.id,
        agentId: session.agente_id,
        isAnonymous: session.es_anonimo,
        status: session.estado,
        createdAt: session.creado_en,
        updatedAt: session.actualizado_en
      },
      messages: messagesRes.rows
    };
  },

  /**
   * Concluye una sesión de chat activa.
   */
  closeSession: async ({ sessionId, closedByUserId, closedByRole, reason = 'ATENCION_CONCLUIDA', notes = '' }) => {
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

    // Mensaje de cierre del sistema
    const sysMsgId = `msg-${Date.now()}-ended`;
    await pool.query(
      `INSERT INTO mensajes_chat_soporte (id, sesion_id, remitente_id, remitente_rol, remitente_nombre, texto, creado_en)
       VALUES ($1, $2, $3, 'SST', 'Sistema de Acompañamiento', 'La sesión de orientación en vivo ha finalizado. Puedes volver a escribir cuando lo requieras.', NOW())`,
      [sysMsgId, sessionId, closedByUserId]
    );

    return updateRes.rows[0];
  }
};
