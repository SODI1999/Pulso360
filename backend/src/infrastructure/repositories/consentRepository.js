/**
 * @fileoverview Repositorio para gestión inmutable de consentimientos de privacidad y políticas publicadas.
 * Capa: P10 · infrastructure/repositories
 * @module infrastructure/repositories/consentRepository
 */
import { auditedMutation } from './auditedMutation.js';
import pool from '../db.js';

export const consentRepository = {
  /**
   * Consulta el consentimiento más reciente del usuario, verificando si corresponde a la política vigente.
   *
   * @param {string} userId - Identificador único del usuario.
   * @param {import('pg').PoolClient|import('pg').Pool} [client=pool] - Conexión o transacción del llamador.
   * @returns {Promise<Object|null>} Consentimiento activo con política_version y booleano politica_vigente.
   */
  async findActiveByUserId(userId, client = pool) {
    const query = `
      SELECT c.*, p.version AS politica_version,
        p.id = (SELECT id FROM politicas_privacidad WHERE estado = 'PUBLICADA'
          AND vigente_desde <= NOW() ORDER BY vigente_desde DESC, created_at DESC, id DESC LIMIT 1) AS politica_vigente
      FROM consentimientos c
      JOIN politicas_privacidad p ON c.politica_id = p.id
      WHERE c.usuario_id = $1
      ORDER BY c.registrado_en DESC, c.id DESC
      LIMIT 1
    `;
    const { rows } = await client.query(query, [userId]);
    return rows[0] || null;
  },

  /**
   * Obtiene la última política de privacidad publicada y vigente.
   *
   * @returns {Promise<Object|null>} Fila de la política vigente o null si no hay política publicada.
   */
  async findLatestPublishedPolicy() {
    const query = `
      SELECT id, version, titulo, texto_politica, texto_aviso_privacidad, vigente_desde
      FROM politicas_privacidad
      WHERE estado = 'PUBLICADA' AND vigente_desde <= NOW()
      ORDER BY vigente_desde DESC, created_at DESC, id DESC
      LIMIT 1
    `;
    const { rows } = await pool.query(query);
    return rows[0] || null;
  },

  /**
   * Obtiene el historial completo de eventos de consentimiento del usuario ordenado por fecha descendente.
   *
   * @param {string} userId - Identificador único del usuario.
   * @returns {Promise<Array<Object>>} Lista de registros de consentimiento históricos.
   */
  async findHistory(userId) {
    const { rows } = await pool.query(`SELECT c.*, p.version AS politica_version
      FROM consentimientos c JOIN politicas_privacidad p ON p.id = c.politica_id
      WHERE c.usuario_id = $1 ORDER BY c.registrado_en DESC, c.id DESC`, [userId]);
    return rows;
  },

  /**
   * Registra un nuevo evento inmutable de consentimiento (aceptación o revocación de finalidades C1..C5)
   * ejecutado bajo una mutación auditada.
   *
   * @param {Object} params - Datos del evento de consentimiento.
   * @param {string} params.id - Identificador UUID del consentimiento.
   * @param {string} params.userId - Identificador del usuario.
   * @param {string} params.politicaId - Identificador de la política asociada.
   * @param {string} params.tipoEvento - Tipo de evento ('ACEPTACION', 'REVOCACION', 'ACTUALIZACION').
   * @param {Object} params.flags - Banderas booleanas { acepta_politica, acepta_aviso_privacidad, c1_checkin, c2_bitacora, c3_apoyo, c4_analitica, c5_contacto }.
   * @param {string} params.ipOrigen - Dirección IP de procedencia de la solicitud.
   * @returns {Promise<Object>} Fila del consentimiento registrado con id y timestamp registrado_en.
   */
  async createConsentEvent({ id, userId, politicaId, tipoEvento, flags, ipOrigen }) {
    const query = `
      INSERT INTO consentimientos (
        id, usuario_id, politica_id, tipo_evento,
        acepta_politica, acepta_aviso_privacidad,
        c1_checkin, c2_bitacora, c3_apoyo, c4_analitica, c5_contacto,
        ip_origen
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8, $9, $10, $11, $12
      ) RETURNING id, registrado_en
    `;
    const values = [
      id, userId, politicaId, tipoEvento,
      flags.acepta_politica, flags.acepta_aviso_privacidad,
      flags.c1_checkin, flags.c2_bitacora, flags.c3_apoyo, flags.c4_analitica, flags.c5_contacto,
      ipOrigen
    ];
    return auditedMutation(async client => (await client.query(query,values)).rows[0],
      { usuarioId:userId,rol:'AGENTE',action:flags.acepta_politica ? 'ACTUALIZACION_CONSENTIMIENTO' : 'REVOCACION_CONSENTIMIENTO',resource:'consentimientos',resourceId:id,details:{policyId:politicaId} });
  }
};
