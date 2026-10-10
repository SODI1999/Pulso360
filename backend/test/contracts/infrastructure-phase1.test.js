import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import jwt from 'jsonwebtoken';
import pool from '../../src/infrastructure/db.js';
import { findUserById } from '../../src/infrastructure/repositories/adminRepository.js';
import { analyticsRepository } from '../../src/infrastructure/repositories/analyticsRepository.js';
import { userRepository } from '../../src/infrastructure/repositories/userRepository.js';
import { consentRepository } from '../../src/infrastructure/repositories/consentRepository.js';
import { chatPersistenceService } from '../../src/application/services/chatPersistenceService.js';
import { AppError } from '../../src/application/errors/AppError.js';
import { initSocketServer } from '../../src/infrastructure/socket.js';

test('findUserById usa el pool y mantiene el identificador fuera del SQL', async t => {
  const id = "user' OR 1=1 --";
  t.mock.method(pool, 'query', async (sql, values) => {
    assert.ok(sql.includes('WHERE id = $1'));
    assert.ok(!sql.includes(id));
    assert.deepEqual(values, [id]);
    return { rows: [{ id: 'fixture', rol_codigo: 'SUPERVISOR' }] };
  });
  assert.equal((await findUserById(id)).id, 'fixture');
});

test('analítica impide reducir k y suprime dimensiones con menos de cinco personas', async () => {
  const fields = ['energia', 'carga_emocional', 'recuperacion', 'apoyo', 'distanciamiento', 'ineficacia'];
  const row = { cohort_count: '5' };
  for (const field of fields) { row['count_' + field] = '4'; row[field] = '3.5'; }
  row.count_energia = '5';
  let queries = 0;
  const client = { query: async () => { queries++; return { rows: [row] }; } };
  for (const minK of [0, 1, 4, 4.5, NaN, '5']) {
    await assert.rejects(analyticsRepository.getAggregatedAverages({ minK }, client), RangeError);
  }
  assert.equal(queries, 0);
  const snapshot = await analyticsRepository.getSnapshot({}, client);
  assert.equal(snapshot.metrics.energia, 3.5);
  for (const field of fields.slice(1)) assert.equal(snapshot.metrics[field], null);
});

async function socketFixture(t, role = 'AGENTE') {
  const profile = { id: 'fixture-owner', rol_codigo: role, estado: 'Activo', auth_version: 0, nombres: 'Persona', apellidos: 'Prueba' };
  t.mock.method(userRepository, 'findProfileById', async () => ({ ...profile }));
  t.mock.method(consentRepository, 'findActiveByUserId', async () => ({ politica_vigente: true, acepta_politica: true, c3_apoyo: true }));
  const server = createServer();
  const io = initSocketServer(server);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const connections = [];
  t.after(async () => {
    for (const socket of connections) socket.close();
    await new Promise(resolve => io.close(resolve));
  });
  async function connect(version = 0) {
    const token = jwt.sign({ id: profile.id, role, auth_version: version }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const socket = new WebSocket(`ws://127.0.0.1:${server.address().port}/socket.io/?EIO=4&transport=websocket`);
    connections.push(socket);
    const events = [];
    const waiters = [];
    const connected = new Promise((resolve, reject) => {
      socket.addEventListener('error', () => reject(new Error('Falló transporte de prueba.')));
      socket.addEventListener('message', ({ data }) => {
        const packet = String(data);
        if (packet.startsWith('0')) socket.send('40' + JSON.stringify({ token }));
        else if (packet === '2') socket.send('3');
        else if (packet.startsWith('44')) reject(new Error(JSON.parse(packet.slice(2)).message));
        else if (packet.startsWith('40')) resolve();
        else if (packet.startsWith('42')) {
          const [name, payload] = JSON.parse(packet.slice(2));
          events.push({ name, payload });
          const index = waiters.findIndex(item => item.name === name);
          if (index >= 0) waiters.splice(index, 1)[0].resolve(payload);
        }
      });
    });
    await connected;
    return {
      events,
      emit: (name, data) => socket.send('42' + JSON.stringify([name, data])),
      next: name => new Promise(resolve => waiters.push({ name, resolve }))
    };
  }
  return { profile, io, connect };
}

test('socket rechaza rol ajeno y mensajes sin sesión persistida', { timeout: 4000 }, async t => {
  const fixture = await socketFixture(t, 'SUPERVISOR');
  const socket = await fixture.connect();
  const result = socket.next('support:error');
  socket.emit('support:message:send', { text: 'Prueba', sessionId: 'other' });
  assert.equal((await result).error.code, 'AUTH_FORBIDDEN_ROLE');
  assert.ok(!socket.events.some(event => event.name === 'support:message:received'));
});

test('socket sin sessionId no guarda ni emite un mensaje efímero', { timeout: 4000 }, async t => {
  const save = t.mock.method(chatPersistenceService, 'saveMessage', async () => assert.fail('No debe guardar'));
  const fixture = await socketFixture(t);
  const socket = await fixture.connect();
  const result = socket.next('support:error');
  socket.emit('support:message:send', { text: 'Prueba', clientMsgId: 'pending' });
  const error = await result;
  assert.equal(error.error.code, 'CHAT_MESSAGE_INVALID');
  assert.equal(error.clientMsgId, 'pending');
  assert.equal(save.mock.callCount(), 0);
});

test('socket impide guardar mensajes en la sesión de otro titular', { timeout: 4000 }, async t => {
  const save = t.mock.method(chatPersistenceService, 'saveMessage', async () => { throw new AppError('Acceso denegado.', 'AUTH_FORBIDDEN_RESOURCE', 403); });
  const fixture = await socketFixture(t);
  const socket = await fixture.connect();
  const result = socket.next('support:error');
  socket.emit('support:message:send', { sessionId: 'foreign', text: 'Prueba' });
  assert.equal((await result).error.code, 'AUTH_FORBIDDEN_RESOURCE');
  assert.equal(save.mock.callCount(), 1);
});

test('socket deriva destinatario de BD e ignora identidad y receptor del payload', { timeout: 4000 }, async t => {
  t.mock.method(chatPersistenceService, 'saveMessage', async data => {
    assert.equal(data.senderName, undefined);
    assert.equal(data.receiverId, undefined);
    assert.equal(data.senderRole, 'SST');
    return { message: { id: 'persisted', sessionId: data.sessionId, text: data.text }, recipientId: 'real-owner' };
  });
  const fixture = await socketFixture(t, 'SST');
  const destinations = [];
  const originalTo = fixture.io.to.bind(fixture.io);
  t.mock.method(fixture.io, 'to', room => { destinations.push(room); return originalTo(room); });
  const socket = await fixture.connect();
  const result = socket.next('support:message:received');
  socket.emit('support:message:send', { sessionId: 'session', text: 'Prueba', receiverId: 'forged', senderName: 'Falso', clientMsgId: 'pending' });
  assert.equal((await result).id, 'persisted');
  assert.ok(destinations.includes('user:real-owner'));
  assert.ok(!destinations.includes('user:forged'));
});

test('socket exige consentimiento vigente y no filtra errores SQL', { timeout: 4000 }, async t => {
  const fixture = await socketFixture(t);
  const socket = await fixture.connect();
  t.mock.method(chatPersistenceService, 'saveMessage', async () => { throw new AppError('Se requiere consentimiento.', 'CONSENT_REQUIRED', 403); });
  let result = socket.next('support:error');
  socket.emit('support:message:send', { sessionId: 'session', text: 'Prueba' });
  assert.equal((await result).error.code, 'CONSENT_REQUIRED');
  t.mock.method(chatPersistenceService, 'saveMessage', async () => { throw new Error('SQL secreto técnico'); });
  result = socket.next('support:error');
  socket.emit('support:message:send', { sessionId: 'session', text: 'Prueba' });
  const error = await result;
  assert.equal(error.error.code, 'SUPPORT_UNAVAILABLE');
  assert.ok(!JSON.stringify(error).includes('SQL'));
  assert.ok(!socket.events.some(event => event.name === 'support:message:received'));
});

test('socket rechaza JWT revocado al conectar y vuelve a verificar antes de operar', { timeout: 4000 }, async t => {
  const fixture = await socketFixture(t);
  await assert.rejects(fixture.connect(1), /AUTH_SESSION_REVOKED/);
  const socket = await fixture.connect();
  fixture.profile.auth_version = 1;
  const result = socket.next('support:error');
  socket.emit('support:message:send', { sessionId: 'session', text: 'Prueba' });
  assert.equal((await result).error.code, 'AUTH_SESSION_REVOKED');
});
