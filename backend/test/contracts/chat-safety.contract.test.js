import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import app from '../../src/app.js';
import pool from '../../src/infrastructure/db.js';
import { chatPersistenceService as chat } from '../../src/application/services/chatPersistenceService.js';
import { chatRepository } from '../../src/infrastructure/repositories/chatRepository.js';

const accounts = {};
const requests = [];
const call = (role, method, path, data) => request(app)[method]('/api/v1' + path).set('Authorization', 'Bearer ' + accounts[role].token).send(data);
async function consent(role, c3 = true) {
  await call(role, 'put', '/agent/consent', { acepta_politica: true, acepta_aviso_privacidad: true,
    c1_checkin: true, c2_bitacora: true, c3_apoyo: c3, c4_analitica: true, c5_contacto: false }).expect(200);
}
async function createRequest(mode = 'anonimo') {
  const result = await call('AGENTE', 'post', '/sst/support-requests', { mode, reason: 'Fixture de chat',
    description: 'Solicitud técnica para comprobar el contrato de chat.', urgency: 'baja' }).expect(201);
  requests.push(result.body.data.id);
  return result.body.data.id;
}
async function activate(id) { return (await call('SST', 'post', `/chat/requests/${id}/activate`).expect(200)).body.data; }
const send = (sessionId, overrides = {}) => chat.saveMessage({ sessionId, senderId: accounts.AGENTE.id,
  senderRole: 'AGENTE', text: 'Texto técnico de fixture.', ...overrides });

before(async () => {
  assert.equal(process.env.DB_NAME_TEST, 'pulso360_plan_test_20261005');
  for (const role of ['AGENTE', 'OTHER', 'SST', 'SUPERVISOR']) {
    const id = 'fx-chat-' + randomUUID();
    const actualRole = role === 'OTHER' ? 'AGENTE' : role;
    const email = id + '@example.test';
    await pool.query(`INSERT INTO usuarios(id,rol_codigo,correo_institucional,contrasena_hash,nombres,apellidos,estado)
      SELECT $1,$2,$3,contrasena_hash,'IdentidadFixture',$2,'Activo' FROM usuarios WHERE id='usr-1'`, [id,actualRole,email]);
    const login = await request(app).post('/api/v1/auth/login').send({ correo: email, contrasena: 'Pulso360#2026' }).expect(200);
    accounts[role] = { id, token: login.body.data.token };
  }
  await consent('AGENTE');
  await consent('OTHER');
});
after(async () => {
  const ids = Object.values(accounts).map(account => account.id);
  await pool.query('DELETE FROM mensajes_chat_soporte WHERE sesion_id IN (SELECT id FROM sesiones_chat_soporte WHERE agente_id=ANY($1::varchar[]))', [ids]);
  await pool.query('DELETE FROM sesiones_chat_soporte WHERE agente_id=ANY($1::varchar[])', [ids]);
  await pool.query('DELETE FROM solicitudes_apoyo WHERE owner_user_id=ANY($1::varchar[])', [ids]);
  await pool.query('DELETE FROM consentimientos WHERE usuario_id=ANY($1::varchar[])', [ids]);
  await pool.query('DELETE FROM usuarios WHERE id=ANY($1::varchar[])', [ids]);
  await pool.end();
});

test('activaciones simultáneas crean una sesión, una bienvenida y una auditoría', async () => {
  const id = await createRequest();
  const [one, two] = await Promise.all([activate(id), activate(id)]);
  assert.equal(one.session.id, two.session.id);
  assert.equal(Number(one.session.isNewSession) + Number(two.session.isNewSession), 1);
  const sessions = await pool.query('SELECT id FROM sesiones_chat_soporte WHERE solicitud_id=$1', [id]);
  assert.equal(sessions.rowCount, 1);
  const messages = await pool.query('SELECT id FROM mensajes_chat_soporte WHERE sesion_id=$1', [one.session.id]);
  assert.equal(messages.rowCount, 1);
  const logs = await pool.query("SELECT id FROM auditoria_logs WHERE resource_id=$1 AND action='ACTIVACION_CHAT_APOYO'", [one.session.id]);
  assert.equal(logs.rowCount, 1);
});

test('todos los DTO de chat anónimo omiten identidad, incluida la histórica y el cierre del agente', async () => {
  const id = await createRequest();
  const activated = await activate(id);
  assert.equal(activated.session.agentId, null);
  assert.equal(activated.recipientId, undefined);
  assert.ok(!activated.session.agentName.includes(accounts.AGENTE.id.slice(-4)));
  const saved = await send(activated.session.id, { senderName: 'Identidad falsa', clientMsgId: 'anon-test' });
  assert.equal(saved.message.senderId, null);
  assert.equal(saved.message.senderName, 'Agente Confidencial');
  assert.equal(saved.recipientId, accounts.AGENTE.id);
  // Datos históricos potencialmente identificadores también se ocultan al leer.
  await pool.query('UPDATE mensajes_chat_soporte SET remitente_nombre=$2 WHERE id=$1', [saved.message.id, 'IdentidadFixture AGENTE']);
  for (const path of [`/chat/requests/${id}`, `/chat/sessions/${activated.session.id}/messages`]) {
    const response = await call('SST', 'get', path).expect(200);
    const data = response.body.data;
    assert.ok(!JSON.stringify(data).includes(accounts.AGENTE.id));
    assert.ok(!JSON.stringify(data).includes('IdentidadFixture'));
    assert.equal(data.messages.find(message => message.id === saved.message.id).senderId, null);
  }
  const closed = await call('AGENTE', 'post', `/chat/sessions/${activated.session.id}/close`, {}).expect(200);
  assert.equal(closed.body.data.agente_id, null);
  assert.equal(closed.body.data.recipientId, undefined);
  const history = (await call('SST', 'get', `/chat/sessions/${activated.session.id}/messages`).expect(200)).body.data;
  assert.ok(!JSON.stringify(history).includes(accounts.AGENTE.id));
  assert.equal(history.messages.at(-1).senderRole, 'SISTEMA');
});

test('servicio valida rol real, titularidad y C3 sin depender del socket o botón', async () => {
  const id = await createRequest();
  const { session } = await activate(id);
  await assert.rejects(chat.activateChatForRequest({ requestId: id, sstUserId: accounts.AGENTE.id }), { code: 'AUTH_FORBIDDEN_ROLE' });
  await assert.rejects(send(session.id, { senderId: accounts.SUPERVISOR.id }), { code: 'AUTH_FORBIDDEN_ROLE' });
  await assert.rejects(send(session.id, { senderId: accounts.OTHER.id }), { code: 'AUTH_FORBIDDEN_RESOURCE' });
  await assert.rejects(chat.getSessionMessages(session.id, accounts.SUPERVISOR.id, 'SST'), { code: 'AUTH_FORBIDDEN_ROLE' });
  await assert.rejects(chat.closeSession({ sessionId: session.id, closedByUserId: accounts.OTHER.id, closedByRole: 'AGENTE' }), { code: 'AUTH_FORBIDDEN_RESOURCE' });
  await call('OTHER', 'get', `/chat/requests/${id}`).expect(403);
  await call('OTHER', 'post', `/chat/sessions/${session.id}/close`, {}).expect(403);
  await consent('AGENTE', false);
  try {
    await assert.rejects(send(session.id), { code: 'CONSENT_REQUIRED' });
    await assert.rejects(chat.activateChatForRequest({ requestId: id, sstUserId: accounts.SST.id }), { code: 'CONSENT_REQUIRED' });
    await call('AGENTE', 'get', `/chat/requests/${id}`).expect(200);
  } finally { await consent('AGENTE'); }
  assert.equal((await pool.query('SELECT id FROM mensajes_chat_soporte WHERE sesion_id=$1', [session.id])).rowCount, 1);
});

test('reintentos se reconcilian sin duplicar mensaje ni auditoría y rechazan texto distinto', async () => {
  const id = await createRequest('identificado');
  const { session } = await activate(id);
  const [first, repeated] = await Promise.all([send(session.id, { clientMsgId: 'repeat' }), send(session.id, { clientMsgId: 'repeat' })]);
  assert.equal(first.message.id, repeated.message.id);
  assert.equal(first.message.senderId, accounts.AGENTE.id);
  assert.equal((await pool.query("SELECT id FROM auditoria_logs WHERE resource_id=$1 AND action='ENVIO_MENSAJE_APOYO'", [first.message.id])).rowCount, 1);
  await assert.rejects(send(session.id, { clientMsgId: 'repeat', text: 'Otro texto.' }), { code: 'CHAT_MESSAGE_CONFLICT' });
  const closed = await chat.closeSession({ sessionId: session.id, closedByUserId: accounts.SST.id, closedByRole: 'SST',
    notes: 'Notas originales.', targetRequestStatus: 'En gestion' });
  assert.equal(closed.finalRequestStatus, 'En gestion');
  const again = await chat.closeSession({ sessionId: session.id, closedByUserId: accounts.SST.id, closedByRole: 'SST', notes: 'No sobrescribir.' });
  assert.equal(again.notas_cierre, 'Notas originales.');
  assert.equal(again.finalRequestStatus, 'En gestion');
  assert.equal((await pool.query('SELECT id FROM mensajes_chat_soporte WHERE sesion_id=$1', [session.id])).rowCount, 3);
  assert.equal((await send(session.id, { clientMsgId: 'repeat' })).message.id, first.message.id);
  await assert.rejects(send(session.id, { clientMsgId: 'new' }), { code: 'CHAT_SESSION_NOT_ACTIVE' });
});

test('fallos intermedios revierten activación, envío y cierre completos', async t => {
  const id = await createRequest();
  await t.test('activación', async sub => {
    sub.mock.method(chatRepository, 'markInProgress', async () => { throw new Error('Fallo técnico controlado'); });
    await assert.rejects(chat.activateChatForRequest({ requestId: id, sstUserId: accounts.SST.id }), /Fallo técnico/);
    assert.equal((await pool.query('SELECT id FROM sesiones_chat_soporte WHERE solicitud_id=$1', [id])).rowCount, 0);
    assert.equal((await pool.query('SELECT status FROM solicitudes_apoyo WHERE id=$1', [id])).rows[0].status, 'Recibida');
  });
  const { session } = await activate(id);
  await t.test('envío', async sub => {
    sub.mock.method(chatRepository, 'touchSession', async () => { throw new Error('Fallo técnico controlado'); });
    await assert.rejects(send(session.id), /Fallo técnico/);
    assert.equal((await pool.query('SELECT id FROM mensajes_chat_soporte WHERE sesion_id=$1', [session.id])).rowCount, 1);
  });
  await t.test('cierre', async sub => {
    sub.mock.method(chatRepository, 'createMessage', async () => { throw new Error('Fallo técnico controlado'); });
    await assert.rejects(chat.closeSession({ sessionId: session.id, closedByUserId: accounts.SST.id, closedByRole: 'SST' }), /Fallo técnico/);
    assert.equal((await pool.query('SELECT estado FROM sesiones_chat_soporte WHERE id=$1', [session.id])).rows[0].estado, 'activa');
    assert.equal((await pool.query('SELECT status FROM solicitudes_apoyo WHERE id=$1', [id])).rows[0].status, 'En gestion');
  });
});

test('envío concurrente con cierre no deja mensajes nuevos después del cierre', async () => {
  const id = await createRequest();
  const { session } = await activate(id);
  const [closed, message] = await Promise.allSettled([
    chat.closeSession({ sessionId: session.id, closedByUserId: accounts.SST.id, closedByRole: 'SST' }),
    send(session.id, { clientMsgId: 'racing' })
  ]);
  assert.equal(closed.status, 'fulfilled');
  if (message.status === 'rejected') assert.equal(message.reason.code, 'CHAT_SESSION_NOT_ACTIVE');
  await assert.rejects(send(session.id, { clientMsgId: 'after-close' }), { code: 'CHAT_SESSION_NOT_ACTIVE' });
  const records = await pool.query('SELECT texto FROM mensajes_chat_soporte WHERE sesion_id=$1', [session.id]);
  assert.equal(records.rowCount, message.status === 'fulfilled' ? 3 : 2);
});
