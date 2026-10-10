/**
 * Casos de uso del acompañamiento por radicado. El SQL pertenece a chatRepository.
 * Una transacción bloquea primero el radicado y después la sesión, igual que SST.
 * Los DTO públicos ocultan la identidad del agente en modo anónimo; recipientId
 * es exclusivamente para enrutamiento interno y los transportes lo descartan.
 */
import { createHash, randomUUID } from 'node:crypto';
import { transaction } from '../../infrastructure/db.js';
import { chatRepository } from '../../infrastructure/repositories/chatRepository.js';
import { consentRepository } from '../../infrastructure/repositories/consentRepository.js';
import { createLog } from '../../infrastructure/repositories/auditorRepository.js';
import { AppError } from '../errors/AppError.js';

async function requireActor(userId, role, client) {
  const actor = await chatRepository.findActor(userId, client);
  if (!actor || actor.estado !== 'Activo') throw new AppError('Usuario no disponible.', 'AUTH_USER_INACTIVE', 401);
  if (!['AGENTE', 'SST'].includes(actor.rol_codigo) || actor.rol_codigo !== role) {
    throw new AppError('No tienes acceso a esta conversación.', 'AUTH_FORBIDDEN_ROLE', 403);
  }
  return actor;
}

async function requireConsent(userId, client) {
  const consent = await consentRepository.findActiveByUserId(userId, client);
  if (!consent?.politica_vigente || !consent.acepta_politica || !consent.c3_apoyo) {
    throw new AppError('Se requiere consentimiento vigente para apoyo.', 'CONSENT_REQUIRED', 403);
  }
}

async function authorizedRequest(requestId, actor, client) {
  const request = await chatRepository.lockRequest(requestId, client);
  if (!request) throw new AppError('El radicado de apoyo no existe.', 'SUPPORT_REQUEST_NOT_FOUND', 404);
  if (actor.rol_codigo === 'AGENTE' && request.owner_user_id !== actor.id) {
    throw new AppError('No tienes acceso al chat de este radicado.', 'AUTH_FORBIDDEN_RESOURCE', 403);
  }
  return request;
}

async function authorizedSession(sessionId, actor, client) {
  const reference = await chatRepository.findReference(sessionId, client);
  if (!reference?.solicitud_id) throw new AppError('La sesión de chat no existe.', 'CHAT_SESSION_NOT_FOUND', 404);
  const request = await authorizedRequest(reference.solicitud_id, actor, client);
  const session = await chatRepository.lockSession(sessionId, client);
  if (!session || session.solicitud_id !== request.id || session.agente_id !== request.owner_user_id) {
    throw new AppError('La sesión no corresponde al radicado.', 'CHAT_SESSION_NOT_FOUND', 404);
  }
  return { request, session };
}

function publicMessage(message, request) {
  const hiddenIdentity = request.mode === 'anonimo' && (message.senderRole === 'AGENTE' || message.senderId === request.owner_user_id);
  const agentMessage = message.senderRole === 'AGENTE';
  return {
    id: message.id, sessionId: message.sessionId,
    senderId: hiddenIdentity ? null : message.senderId,
    senderRole: message.senderRole,
    senderName: request.mode === 'anonimo' && agentMessage ? 'Agente Confidencial' : message.senderName,
    text: message.text, timestamp: message.timestamp
  };
}

function publicSession(session, request) {
  const anonymous = request.mode === 'anonimo';
  return {
    id: session.id, requestId: request.id, requestCode: request.code,
    agentId: anonymous ? null : session.agente_id,
    agentName: anonymous ? 'Agente Confidencial' : request.owner_name,
    isAnonymous: anonymous, status: session.estado,
    reason: session.motivo_solicitud, details: session.descripcion_solicitud,
    approvedAt: session.aprobado_en, closedAt: session.cerrado_en,
    closingReason: session.motivo_cierre, closingNotes: session.notas_cierre,
    createdAt: session.creado_en, updatedAt: session.actualizado_en
  };
}

// Mantiene la forma snake_case del endpoint histórico sin devolver filas SQL crudas.
function publicStoredSession(session, request) {
  return {
    id: session.id, solicitud_id: request.id,
    agente_id: request.mode === 'anonimo' ? null : session.agente_id,
    es_anonimo: request.mode === 'anonimo', sst_atendio_id: session.sst_atendio_id,
    estado: session.estado, motivo_solicitud: session.motivo_solicitud,
    descripcion_solicitud: session.descripcion_solicitud, aprobado_en: session.aprobado_en,
    motivo_cierre: session.motivo_cierre, notas_cierre: session.notas_cierre,
    creado_en: session.creado_en, actualizado_en: session.actualizado_en, cerrado_en: session.cerrado_en
  };
}

function assertOpen(request, session) {
  if (['Cerrada', 'Atendida'].includes(request.status) || session?.estado !== 'activa') {
    throw new AppError('La sesión no está activa para enviar mensajes.', 'CHAT_SESSION_NOT_ACTIVE', 400);
  }
}

export const chatPersistenceService = {
  /**
   * SST activa una única sesión por radicado; bienvenida, estado y auditoría son atómicos.
   * @param {{requestId: string, sstUserId: string}} data - Radicado y actor autenticado.
   * @returns {Promise<Object>} Sesión/mensajes públicos y recipientId exclusivamente interno.
   * @throws {AppError} Cuenta/rol inválidos, radicado concluido o C3 no vigente.
   */
  async activateChatForRequest({ requestId, sstUserId }) {
    if (!requestId) throw new AppError('Indica el radicado.', 'SUPPORT_REQUEST_ID_REQUIRED', 400);
    return transaction(async client => {
      const actor = await requireActor(sstUserId, 'SST', client);
      const request = await authorizedRequest(requestId, actor, client);
      if (['Cerrada', 'Atendida'].includes(request.status)) {
        throw new AppError('El radicado ya fue concluido.', 'REQUEST_ALREADY_CLOSED', 400);
      }
      await requireConsent(request.owner_user_id, client);
      let session = await chatRepository.findByRequest(request.id, true, client);
      const isNewSession = !session;
      if (!session) {
        session = await chatRepository.createSession({ id: 'chs-' + randomUUID(), requestId: request.id,
          agentId: request.owner_user_id, anonymous: request.mode === 'anonimo', sstId: actor.id,
          reason: request.reason, description: request.description }, client);
        await chatRepository.markInProgress(request.id, actor.id, client);
        await chatRepository.createMessage({ id: 'msg-' + randomUUID(), sessionId: session.id,
          senderId: actor.id, senderRole: 'SST', senderName: 'Especialista SST (Salud Ocupacional)',
          text: `Hola. Hemos habilitado este canal para coordinar el radicado ${request.code}. ¿En qué podemos apoyarte?` }, client);
        await createLog({ usuarioId: actor.id, rol: 'SST', action: 'ACTIVACION_CHAT_APOYO',
          resource: 'sesiones_chat_soporte', resourceId: session.id }, client);
      }
      const messages = await chatRepository.findMessages(session.id, client);
      return { session: { ...publicSession(session, request), isNewSession },
        messages: messages.map(message => publicMessage(message, request)),
        recipientId: request.owner_user_id };
    });
  },
  /**
   * Consulta un radicado propio o autorizado a SST, incluso tras revocar C3 para lectura histórica.
   * @param {{requestId: string, userId: string, userRole: string}} data - Contexto autenticado.
   * @returns {Promise<{session: Object|null, messages: Array<Object>}>} DTO sin identidad anónima.
   * @throws {AppError} Actor, rol, titularidad o radicado inválidos.
   */
  async getChatByRequestId({ requestId, userId, userRole }) {
    if (!requestId) throw new AppError('Indica el radicado.', 'SUPPORT_REQUEST_ID_REQUIRED', 400);
    return transaction(async client => {
      const actor = await requireActor(userId, userRole, client);
      const request = await authorizedRequest(requestId, actor, client);
      const session = await chatRepository.findByRequest(request.id, false, client);
      if (!session) return { session: null, messages: [] };
      const messages = await chatRepository.findMessages(session.id, client);
      return { session: publicSession(session, request),
        messages: messages.map(message => publicMessage(message, request)) };
    });
  },
  /**
   * Lista exclusivamente las sesiones del agente activo indicado.
   * @param {{agentId: string}} data - Titular autenticado.
   * @returns {Promise<Array<Object>>} Mapa propio sin contenido de mensajes.
   * @throws {AppError} Cuenta inactiva o rol distinto de AGENTE.
   */
  async getAgentActiveChatsMap({ agentId }) {
    return transaction(async client => {
      await requireActor(agentId, 'AGENTE', client);
      return chatRepository.findAgentMap(agentId, client);
    });
  },
  /**
   * Guarda mensaje, actividad y auditoría atómicamente con rol/titularidad/C3 vigentes.
   * clientMsgId identifica un reintento del mismo texto, sin una segunda escritura.
   * @param {{sessionId: string, senderId: string, senderRole: string, text: string, clientMsgId?: string}} data - Emisor autenticado y texto.
   * @returns {Promise<{message: Object, recipientId: string}>} Confirmación pública y destino interno.
   * @throws {AppError} Datos inválidos, acceso denegado, C3 revocado o sesión cerrada.
   */
  async saveMessage({ sessionId, senderId, senderRole, text, clientMsgId }) {
    if (!sessionId || typeof text !== 'string' || !text.trim() || text.trim().length > 800 ||
        (clientMsgId !== undefined && (typeof clientMsgId !== 'string' || !clientMsgId || clientMsgId.length > 128))) {
      throw new AppError('Escribe un mensaje de hasta 800 caracteres en una sesión activa.', 'CHAT_MESSAGE_INVALID', 400);
    }
    return transaction(async client => {
      const actor = await requireActor(senderId, senderRole, client);
      const { request, session } = await authorizedSession(sessionId, actor, client);
      if (actor.rol_codigo === 'AGENTE') await requireConsent(actor.id, client);
      const id = clientMsgId
        ? 'msg-' + createHash('sha256').update(JSON.stringify([session.id, actor.id, clientMsgId])).digest('hex').slice(0, 40)
        : 'msg-' + randomUUID();
      const existing = clientMsgId ? await chatRepository.findMessage(id, client) : null;
      if (existing && existing.text !== text.trim()) {
        throw new AppError('El reintento debe conservar el mensaje original.', 'CHAT_MESSAGE_CONFLICT', 409);
      }
      if (existing) return { message: { ...publicMessage(existing, request), requestId: request.id }, recipientId: request.owner_user_id };
      assertOpen(request, session);
      const senderName = actor.rol_codigo === 'SST' ? 'Especialista SST (Salud Ocupacional)'
        : request.mode === 'anonimo' ? 'Agente Confidencial' : `${actor.nombres} ${actor.apellidos}`;
      const message = await chatRepository.createMessage({ id, sessionId: session.id, senderId: actor.id,
        senderRole: actor.rol_codigo, senderName, text: text.trim() }, client);
      await chatRepository.touchSession(session.id, client);
      await createLog({ usuarioId: actor.id, rol: actor.rol_codigo, action: 'ENVIO_MENSAJE_APOYO',
        resource: 'mensajes_chat_soporte', resourceId: message.id }, client);
      return { message: { ...publicMessage(message, request), requestId: request.id }, recipientId: request.owner_user_id };
    });
  },
  /**
   * Cierra chat y actualiza radicado con mensaje de sistema y auditoría en una transacción.
   * Repetir el cierre no altera notas/estado ni inserta otro mensaje. AGENTE solo cierra su caso.
   * @param {{sessionId: string, closedByUserId: string, closedByRole: string, reason?: string, notes?: string, targetRequestStatus?: string}} data - Cierre solicitado.
   * @returns {Promise<Object>} DTO histórico con finalRequestStatus y recipientId interno.
   * @throws {AppError} Acceso denegado o campos/estado inválidos.
   */
  async closeSession({ sessionId, closedByUserId, closedByRole, reason = 'ATENCION_CONCLUIDA', notes = '', targetRequestStatus = 'Cerrada' }) {
    if (typeof reason !== 'string' || !reason.trim() || reason.length > 60 || typeof notes !== 'string' || notes.length > 500 ||
        !['Cerrada', 'En gestion'].includes(targetRequestStatus)) {
      throw new AppError('Revisa el motivo, las notas y el estado de cierre.', 'CHAT_CLOSE_INVALID', 400);
    }
    return transaction(async client => {
      const actor = await requireActor(closedByUserId, closedByRole, client);
      const { request, session } = await authorizedSession(sessionId, actor, client);
      if (actor.rol_codigo === 'AGENTE' && targetRequestStatus !== 'Cerrada') {
        throw new AppError('El seguimiento del radicado corresponde a SST.', 'AUTH_FORBIDDEN_ROLE', 403);
      }
      if (session.estado === 'cerrada') {
        return { ...publicStoredSession(session, request), finalRequestStatus: request.status, recipientId: request.owner_user_id };
      }
      assertOpen(request, session);
      const closed = await chatRepository.closeSession({ id: session.id, reason: reason.trim(), notes: notes.trim(),
        sstId: actor.rol_codigo === 'SST' ? actor.id : null }, client);
      await chatRepository.setRequestStatus(request.id, targetRequestStatus, client);
      await chatRepository.createMessage({ id: 'msg-' + randomUUID(), sessionId: session.id, senderId: actor.id,
        senderRole: 'SISTEMA', senderName: 'Sistema de Acompañamiento',
        text: 'La conversación de este radicado ha concluido. Puedes consultar su historial en solo lectura.' }, client);
      await createLog({ usuarioId: actor.id, rol: actor.rol_codigo, action: 'CIERRE_CHAT_APOYO',
        resource: 'sesiones_chat_soporte', resourceId: session.id }, client);
      return { ...publicStoredSession(closed, request), finalRequestStatus: targetRequestStatus, recipientId: request.owner_user_id };
    });
  },
  /**
   * Consulta mensajes y sesión con la forma histórica del endpoint, sin identidad anónima.
   * @param {string} sessionId - Sesión solicitada.
   * @param {string} userId - Actor autenticado.
   * @param {string} userRole - Rol autenticado contrastado con BD.
   * @returns {Promise<{session: Object, messages: Array<Object>}>} Historial autorizado.
   * @throws {AppError} Rol/titularidad inválidos o sesión inexistente.
   */
  async getSessionMessages(sessionId, userId, userRole) {
    return transaction(async client => {
      const actor = await requireActor(userId, userRole, client);
      const { request, session } = await authorizedSession(sessionId, actor, client);
      const messages = await chatRepository.findMessages(session.id, client);
      return { session: publicStoredSession(session, request),
        messages: messages.map(message => publicMessage(message, request)) };
    });
  }
};
