import pool from '../db.js';

export const passwordResetRepository = {
  async findActiveUser(email) {
    return (await pool.query("SELECT id,rol_codigo,correo_institucional FROM usuarios WHERE LOWER(correo_institucional)=LOWER($1) AND estado='Activo'", [email])).rows[0];
  },
  async createToken(id, userId, tokenHash, client) {
    await client.query('SELECT id FROM usuarios WHERE id=$1 FOR UPDATE', [userId]);
    await client.query('UPDATE password_reset_tokens SET consumed_at=NOW() WHERE usuario_id=$1 AND consumed_at IS NULL', [userId]);
    await client.query("INSERT INTO password_reset_tokens (id,usuario_id,token_hash,expires_at) VALUES ($1,$2,$3,NOW()+INTERVAL '30 minutes')", [id, userId, tokenHash]);
  },
  async recordDelivery(id, status, client) {
    await client.query(`UPDATE password_reset_tokens SET delivery_status=$2::varchar,
      consumed_at=CASE WHEN $2::varchar='FAILED' THEN NOW() ELSE consumed_at END WHERE id=$1`, [id, status]);
  },
  async findEligibleEmail(tokenHash) {
    return (await pool.query(`SELECT u.correo_institucional FROM password_reset_tokens t JOIN usuarios u ON u.id=t.usuario_id
      WHERE token_hash=$1 AND consumed_at IS NULL AND expires_at>NOW() AND delivery_status='DELIVERED' AND u.estado='Activo'`, [tokenHash])).rows[0]?.correo_institucional;
  },
  async lockEligibleUser(tokenHash, client) {
    const candidate = (await client.query('SELECT usuario_id FROM password_reset_tokens WHERE token_hash=$1', [tokenHash])).rows[0];
    if (!candidate) return null;
    // Request y confirm bloquean primero al titular: no se invierte el orden al consumir tokens.
    const user = (await client.query("SELECT id,rol_codigo FROM usuarios WHERE id=$1 AND estado='Activo' FOR UPDATE", [candidate.usuario_id])).rows[0];
    const eligible = await client.query(`SELECT id FROM password_reset_tokens WHERE token_hash=$1 AND consumed_at IS NULL
      AND expires_at>NOW() AND delivery_status='DELIVERED' FOR UPDATE`, [tokenHash]);
    return user && eligible.rowCount ? user : null;
  },
  async replacePassword(userId, passwordHash, client) {
    await client.query('UPDATE usuarios SET contrasena_hash=$2,auth_version=auth_version+1,intentos_fallidos=0,bloqueado_hasta=NULL,updated_at=NOW() WHERE id=$1', [userId, passwordHash]);
    await client.query('UPDATE password_reset_tokens SET consumed_at=NOW() WHERE usuario_id=$1 AND consumed_at IS NULL', [userId]);
  }
};
