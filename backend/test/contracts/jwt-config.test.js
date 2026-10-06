import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../../src/app.js';
import { getJwtSecret } from '../../src/infrastructure/jwtConfig.js';
import pool from '../../src/infrastructure/db.js';

describe('Configuración JWT y errores públicos', () => {
  it('rechaza claves ausentes, triviales y el ejemplo público incluso en test', () => {
    const original = process.env.JWT_SECRET;
    try {
      for (const candidate of ['', 'secret', 'pulso360_super_secret_jwt_key_2026_academica']) {
        process.env.JWT_SECRET = candidate;
        assert.throws(getJwtSecret, error => error.code === 'AUTH_INSECURE_CONFIG');
      }
    } finally { process.env.JWT_SECRET = original; }
  });

  it('rechaza un token fabricado con la clave pública', async () => {
    const token = jwt.sign({ id: 'usr-1', rol_codigo: 'ADMIN', auth_version: 0 },
      'pulso360_super_secret_jwt_key_2026_academica');
    const response = await request(app).get('/api/v1/admin/users').set('Authorization', `Bearer ${token}`);
    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, 'AUTH_TOKEN_INVALID');
  });

  it('health no expone errores internos de PostgreSQL', async () => {
    const original = pool.query;
    try {
      pool.query = async () => { throw new Error('private-host/schema/credential'); };
      const response = await request(app).get('/api/v1/health');
      assert.equal(response.status, 503);
      assert.equal(response.body.code, 'DATABASE_UNAVAILABLE');
      assert.ok(!JSON.stringify(response.body).includes('private-host'));
    } finally { pool.query = original; }
  });
});
