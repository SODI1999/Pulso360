import pool from '../db.js';

export const consentRepository = {
  async findActiveByUserId(userId) {
    const query = `
      SELECT c.*, p.version AS politica_version
      FROM consentimientos c
      JOIN politicas_privacidad p ON c.politica_id = p.id
      WHERE c.usuario_id = $1
      ORDER BY c.registrado_en DESC
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows[0] || null;
  },

  async findLatestPublishedPolicy() {
    const query = `
      SELECT id, version
      FROM politicas_privacidad
      WHERE estado = 'PUBLICADA'
      ORDER BY vigente_desde DESC
      LIMIT 1
    `;
    const { rows } = await pool.query(query);
    return rows[0] || null;
  },

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
    const { rows } = await pool.query(query, values);
    return rows[0];
  }
};
