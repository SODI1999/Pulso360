import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import request from 'supertest';
import app from '../../src/app.js';
import pool from '../../src/infrastructure/db.js';

const users = [];
const tokens = {};
let agentId, sstId, supervisorId;

const call = (method, path, data, role = 'AGENTE') =>
  request(app)[method]('/api/v1' + path).set('Authorization', 'Bearer ' + tokens[role]).send(data);

before(async () => {
  assert.equal(process.env.DB_NAME_TEST, 'pulso360_plan_test_20261005');

  for (const role of ['AGENTE', 'SST', 'SUPERVISOR']) {
    const id = 'fx-chat-' + crypto.randomUUID();
    const email = id + '@example.test';
    users.push(id);
    await pool.query(
      `INSERT INTO usuarios(id, rol_codigo, correo_institucional, contrasena_hash, nombres, apellidos, estado)
       SELECT $1, $2, $3, contrasena_hash, 'Fixture', $2, 'Activo' FROM usuarios WHERE id='usr-1'`,
      [id, role, email]
    );

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ correo: email, contrasena: 'Pulso360#2026' })
      .expect(200);

    tokens[role] = res.body.data.token;
    if (role === 'AGENTE') agentId = id;
    if (role === 'SST') sstId = id;
    if (role === 'SUPERVISOR') supervisorId = id;
  }
});

after(async () => {
  await pool.query('DELETE FROM mensajes_chat_soporte WHERE remitente_id = ANY($1::varchar[])', [users]);
  await pool.query('DELETE FROM sesiones_chat_soporte WHERE agente_id = ANY($1::varchar[])', [users]);
  await pool.query('DELETE FROM usuarios WHERE id = ANY($1::varchar[])', [users]);
  await pool.end();
});

test('Persistencia Chat SST: AGENTE obtiene o crea sesión activa', async () => {
  const res = await call('get', '/support/chat/active', undefined, 'AGENTE').expect(200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.data.session);
  assert.equal(res.body.data.session.agentId, agentId);
  assert.equal(res.body.data.session.status, 'activa');
  assert.ok(Array.isArray(res.body.data.messages));
});

test('Privacidad RBAC: SUPERVISOR es bloqueado con 403 Forbidden al intentar acceder al chat de apoyo', async () => {
  const res = await call('get', '/support/chat/active', undefined, 'SUPERVISOR').expect(403);
  assert.equal(res.body.success, false);
  assert.equal(res.body.error.code, 'AUTH_FORBIDDEN_ROLE');
});

test('Consola SST: Especialista SST obtiene lista de sesiones activas en el centro', async () => {
  const res = await call('get', '/support/chat/active', undefined, 'SST').expect(200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
  const myAgentSession = res.body.data.find(s => s.agentId === agentId);
  assert.ok(myAgentSession, 'Debe incluir la sesión del agente creado');
});

test('Ciclo de vida Chat: Especialista SST puede cerrar sesión de orientación formalmente', async () => {
  const activeRes = await call('get', '/support/chat/active', undefined, 'AGENTE').expect(200);
  const sessionId = activeRes.body.data.session.id;

  const closeRes = await call('post', `/support/chat/sessions/${sessionId}/close`, {
    reason: 'ATENCION_CONCLUIDA',
    notes: 'Agente orientado en técnica 4-7-8 de respiración y pausa activa'
  }, 'SST').expect(200);

  assert.equal(closeRes.body.success, true);
  assert.equal(closeRes.body.data.estado, 'cerrada');
  assert.equal(closeRes.body.data.motivo_cierre, 'ATENCION_CONCLUIDA');
});
