/**
 * Persistencia del chat ligado a radicados. Los métodos reciben el mismo cliente
 * transaccional; el servicio autoriza actores y bloquea primero el radicado.
 * @module infrastructure/repositories/chatRepository
 */
export const chatRepository = {
  /**
   * Consulta el rol y estado reales del actor, sin credenciales.
   * @param {string} id - Cuenta actuante.
   * @param {import('pg').PoolClient} client - Transacción actual.
   * @returns {Promise<Object|undefined>} Perfil mínimo.
   */
  async findActor(id, client) {
    return (await client.query('SELECT id,rol_codigo,estado,nombres,apellidos FROM usuarios WHERE id=$1', [id])).rows[0];
  },
  /**
   * Bloquea el radicado antes de consultar o modificar sus sesiones.
   * Serializa activación, envío y cierre con el cierre desde la bandeja SST.
   * @param {string} id - Radicado.
   * @param {import('pg').PoolClient} client - Transacción actual.
   * @returns {Promise<Object|undefined>} Radicado con titular interno y nombre.
   */
  async lockRequest(id, client) {
    return (await client.query(`SELECT s.*, CONCAT(u.nombres,' ',u.apellidos) AS owner_name
      FROM solicitudes_apoyo s JOIN usuarios u ON u.id=s.owner_user_id
      WHERE s.id=$1 FOR UPDATE OF s`, [id])).rows[0];
  },
  /**
   * Consulta la referencia para adquirir los locks en orden radicado → sesión.
   * @param {string} id - Sesión.
   * @param {import('pg').PoolClient} client - Transacción actual.
   * @returns {Promise<Object|undefined>} Referencia interna de sesión.
   */
  async findReference(id, client) {
    return (await client.query('SELECT solicitud_id FROM sesiones_chat_soporte WHERE id=$1', [id])).rows[0];
  },
  /**
   * Bloquea la sesión después del radicado. No autoriza por sí sola al actor.
   * @param {string} id - Sesión.
   * @param {import('pg').PoolClient} client - Transacción actual.
   * @returns {Promise<Object|undefined>} Sesión interna.
   */
  async lockSession(id, client) {
    return (await client.query('SELECT * FROM sesiones_chat_soporte WHERE id=$1 FOR UPDATE', [id])).rows[0];
  },
  /**
   * Busca la sesión activa, o la más reciente para consulta histórica.
   * @param {string} requestId - Radicado ya bloqueado.
   * @param {boolean} activeOnly - Restringir a sesiones activas.
   * @param {import('pg').PoolClient} client - Transacción actual.
   * @returns {Promise<Object|undefined>} Sesión interna.
   */
  async findByRequest(requestId, activeOnly, client) {
    const sql = activeOnly
      ? "SELECT * FROM sesiones_chat_soporte WHERE solicitud_id=$1 AND estado='activa' ORDER BY creado_en DESC,id DESC LIMIT 1"
      : 'SELECT * FROM sesiones_chat_soporte WHERE solicitud_id=$1 ORDER BY creado_en DESC,id DESC LIMIT 1';
    return (await client.query(sql, [requestId])).rows[0];
  },
  /**
   * Crea sesión bajo el lock del radicado. Los IDs se generan con UUID en servicio.
   * @param {Object} data - id, requestId, agentId, anonymous, sstId, reason y description.
   * @param {import('pg').PoolClient} client - Transacción actual.
   * @returns {Promise<Object>} Sesión persistida.
   */
  async createSession(data, client) {
    return (await client.query(`INSERT INTO sesiones_chat_soporte
      (id,solicitud_id,agente_id,es_anonimo,sst_atendio_id,estado,motivo_solicitud,descripcion_solicitud,aprobado_en)
      VALUES($1,$2,$3,$4,$5,'activa',$6,$7,NOW()) RETURNING *`,
    [data.id,data.requestId,data.agentId,data.anonymous,data.sstId,data.reason,data.description])).rows[0];
  },
  /**
   * Marca gestión sin reemplazar un responsable previo.
   * @param {string} requestId - Radicado bloqueado.
   * @param {string} sstId - Cuenta SST validada.
   * @param {import('pg').PoolClient} client - Transacción actual.
   * @returns {Promise<void>}
   */
  async markInProgress(requestId, sstId, client) {
    await client.query(`UPDATE solicitudes_apoyo SET status=CASE WHEN status='Recibida' THEN 'En gestion' ELSE status END,
      assigned_to=COALESCE(assigned_to,$2) WHERE id=$1`, [requestId,sstId]);
  },
  /**
   * Consulta los últimos 100 mensajes, presentados en orden cronológico estable.
   * @param {string} sessionId - Sesión autorizada por servicio.
   * @param {import('pg').PoolClient} client - Transacción actual.
   * @returns {Promise<Array<Object>>} Mensajes internos, sin filtrar identidad.
   */
  async findMessages(sessionId, client) {
    return (await client.query(`SELECT * FROM (
      SELECT id,sesion_id AS "sessionId",remitente_id AS "senderId",remitente_rol AS "senderRole",
        remitente_nombre AS "senderName",texto AS "text",creado_en AS "timestamp"
      FROM mensajes_chat_soporte WHERE sesion_id=$1 ORDER BY creado_en DESC,id DESC LIMIT 100
    ) recent ORDER BY "timestamp",id`, [sessionId])).rows;
  },
  /**
   * Consulta un mensaje para reconciliar reintentos con la misma clave.
   * @param {string} id - ID derivado de sesión, actor y clientMsgId.
   * @param {import('pg').PoolClient} client - Transacción actual.
   * @returns {Promise<Object|undefined>} Mensaje existente.
   */
  async findMessage(id, client) {
    return (await client.query(`SELECT id,sesion_id AS "sessionId",remitente_id AS "senderId",remitente_rol AS "senderRole",
      remitente_nombre AS "senderName",texto AS "text",creado_en AS "timestamp"
      FROM mensajes_chat_soporte WHERE id=$1`, [id])).rows[0];
  },
  /**
   * Inserta el mensaje; toda identidad viene del actor/sesión del servidor.
   * @param {Object} data - id, sessionId, senderId, senderRole, senderName y text.
   * @param {import('pg').PoolClient} client - Transacción actual.
   * @returns {Promise<Object>} Mensaje persistido.
   */
  async createMessage(data, client) {
    return (await client.query(`INSERT INTO mensajes_chat_soporte
      (id,sesion_id,remitente_id,remitente_rol,remitente_nombre,texto) VALUES($1,$2,$3,$4,$5,$6)
      RETURNING id,sesion_id AS "sessionId",remitente_id AS "senderId",remitente_rol AS "senderRole",
        remitente_nombre AS "senderName",texto AS "text",creado_en AS "timestamp"`,
    [data.id,data.sessionId,data.senderId,data.senderRole,data.senderName,data.text])).rows[0];
  },
  /**
   * Actualiza actividad dentro de la transacción del mensaje.
   * @param {string} id - Sesión bloqueada.
   * @param {import('pg').PoolClient} client - Transacción actual.
   * @returns {Promise<void>}
   */
  async touchSession(id, client) { await client.query('UPDATE sesiones_chat_soporte SET actualizado_en=NOW() WHERE id=$1', [id]); },
  /**
   * Cierra la sesión; el servicio evita repetir efectos de un cierre confirmado.
   * @param {Object} data - id, reason, notes y sstId (nullable).
   * @param {import('pg').PoolClient} client - Transacción actual.
   * @returns {Promise<Object>} Sesión cerrada.
   */
  async closeSession(data, client) {
    return (await client.query(`UPDATE sesiones_chat_soporte SET estado='cerrada',motivo_cierre=$2,notas_cierre=$3,
      sst_atendio_id=COALESCE(sst_atendio_id,$4),cerrado_en=NOW(),actualizado_en=NOW() WHERE id=$1 RETURNING *`,
    [data.id,data.reason,data.notes,data.sstId])).rows[0];
  },
  /**
   * Actualiza el radicado en el mismo cierre transaccional.
   * @param {string} id - Radicado bloqueado.
   * @param {string} status - Estado validado por servicio.
   * @param {import('pg').PoolClient} client - Transacción actual.
   * @returns {Promise<void>}
   */
  async setRequestStatus(id, status, client) { await client.query('UPDATE solicitudes_apoyo SET status=$2 WHERE id=$1', [id,status]); },
  /**
   * Lista las sesiones del titular sin divulgar mensajes ni identidad a otro rol.
   * @param {string} agentId - Cuenta agente validada en servicio.
   * @param {import('pg').PoolClient} client - Transacción actual.
   * @returns {Promise<Array<Object>>} Mapa de radicados con sesión.
   */
  async findAgentMap(agentId, client) {
    return (await client.query(`SELECT s.id AS "sessionId",s.solicitud_id AS "requestId",s.estado AS "status",
      s.creado_en AS "createdAt",s.actualizado_en AS "updatedAt",
      (SELECT COUNT(*)::int FROM mensajes_chat_soporte m WHERE m.sesion_id=s.id) AS "messageCount"
      FROM sesiones_chat_soporte s WHERE s.agente_id=$1 AND s.solicitud_id IS NOT NULL
      ORDER BY s.actualizado_en DESC,s.id DESC`, [agentId])).rows;
  }
};
