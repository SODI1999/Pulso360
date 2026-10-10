/**
 * @fileoverview Repositorio para ciclo de vida de tokens de restablecimiento de contraseña y revocación de sesiones.
 * Seguridad: Almacena exclusivamente hashes SHA-256 de tokens, expira a 30 min e incrementa auth_version.
 * Capa: P10 · infrastructure/repositories
 * @module infrastructure/repositories/passwordResetRepository
 */
import pool from '../db.js';

export const passwordResetRepository = {
  /**
   * Busca un usuario activo por correo electrónico insensible a mayúsculas.
   *
   * @param {string} email - Correo electrónico institucional.
   * @returns {Promise<Object|undefined>} Fila de usuario ({ id, rol_codigo, correo_institucional }) o undefined.
   */
  async findActiveUser(email) {
    return (await pool.query("SELECT id,rol_codigo,correo_institucional FROM usuarios WHERE LOWER(correo_institucional)=LOWER($1) AND estado='Activo'", [email])).rows[0];
  },
  /**
   * Bloquea al usuario con FOR UPDATE, invalida tokens activos previos e inserta el nuevo token con vigencia de 30 minutos.
   *
   * @param {string} id - Identificador UUID del token.
   * @param {string} userId - Identificador del usuario titular.
   * @param {string} tokenHash - Hash SHA-256 del token plano.
   * @param {import('pg').PoolClient} client - Cliente transaccional.
   * @returns {Promise<void>}
   */
  async createToken(id, userId, tokenHash, client) {
    await client.query('SELECT id FROM usuarios WHERE id=$1 FOR UPDATE', [userId]);
    await client.query('UPDATE password_reset_tokens SET consumed_at=NOW() WHERE usuario_id=$1 AND consumed_at IS NULL', [userId]);
    await client.query("INSERT INTO password_reset_tokens (id,usuario_id,token_hash,expires_at) VALUES ($1,$2,$3,NOW()+INTERVAL '30 minutes')", [id, userId, tokenHash]);
  },

  /**
   * Actualiza el estado de entrega del correo y consume el token si falló la entrega.
   *
   * @param {string} id - Identificador del token.
   * @param {string} status - Estado de entrega ('DELIVERED' | 'FAILED').
   * @param {import('pg').PoolClient} client - Cliente transaccional.
   * @returns {Promise<void>}
   */
  async recordDelivery(id, status, client) {
    await client.query(`UPDATE password_reset_tokens SET delivery_status=$2::varchar,
      consumed_at=CASE WHEN $2::varchar='FAILED' THEN NOW() ELSE consumed_at END WHERE id=$1`, [id, status]);
  },

  /**
   * Obtiene el correo institucional asociado a un token entregado, vigente y no consumido.
   *
   * @param {string} tokenHash - Hash SHA-256 del token.
   * @returns {Promise<string|undefined>} Correo del usuario o undefined.
   */
  async findEligibleEmail(tokenHash) {
    return (await pool.query(`SELECT u.correo_institucional FROM password_reset_tokens t JOIN usuarios u ON u.id=t.usuario_id
      WHERE token_hash=$1 AND consumed_at IS NULL AND expires_at>NOW() AND delivery_status='DELIVERED' AND u.estado='Activo'`, [tokenHash])).rows[0]?.correo_institucional;
  },
  /**
   * Bloquea secuencialmente al usuario y al token con FOR UPDATE respetando el orden jerárquico.
   *
   * @param {string} tokenHash - Hash SHA-256 del token presentado.
   * @param {import('pg').PoolClient} client - Cliente transaccional.
   * @returns {Promise<Object|null>} Fila del usuario bloqueado o null si el token no es elegible.
   */
  async lockEligibleUser(tokenHash, client) {
    const candidate = (await client.query('SELECT usuario_id FROM password_reset_tokens WHERE token_hash=$1', [tokenHash])).rows[0];
    if (!candidate) return null;
    // Request y confirm bloquean primero al titular: no se invierte el orden al consumir tokens.
    const user = (await client.query("SELECT id,rol_codigo FROM usuarios WHERE id=$1 AND estado='Activo' FOR UPDATE", [candidate.usuario_id])).rows[0];
    const eligible = await client.query(`SELECT id FROM password_reset_tokens WHERE token_hash=$1 AND consumed_at IS NULL
      AND expires_at>NOW() AND delivery_status='DELIVERED' FOR UPDATE`, [tokenHash]);
    return user && eligible.rowCount ? user : null;
  },

  /**
   * Reemplaza la contraseña del usuario, incrementa auth_version para revocar JWTs emitidos previamente,
   * desbloquea la cuenta y consume todos los tokens de restablecimiento pendientes.
   *
   * @param {string} userId - Identificador del usuario.
   * @param {string} passwordHash - Nuevo hash bcrypt de contraseña.
   * @param {import('pg').PoolClient} client - Cliente transaccional.
   * @returns {Promise<void>}
   */
  async replacePassword(userId, passwordHash, client) {
    await client.query('UPDATE usuarios SET contrasena_hash=$2,auth_version=auth_version+1,intentos_fallidos=0,bloqueado_hasta=NULL,updated_at=NOW() WHERE id=$1', [userId, passwordHash]);
    await client.query('UPDATE password_reset_tokens SET consumed_at=NOW() WHERE usuario_id=$1 AND consumed_at IS NULL', [userId]);
  }
};
