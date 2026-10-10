import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

let vite, confirmChatMessage, synchronizeSocketAuthentication;
before(async () => {
  vite = await createServer({ configFile: false, root: process.cwd(), logLevel: 'silent', appType: 'custom',
    server: { middlewareMode: true, hmr: false, watch: null }, optimizeDeps: { noDiscovery: true, include: [] } });
  ({ confirmChatMessage } = await vite.ssrLoadModule('/src/core/socket/useChatDelivery.jsx'));
  ({ synchronizeSocketAuthentication } = await vite.ssrLoadModule('/src/core/socket/socketClient.jsx'));
});
after(async () => { await vite.close(); });

function socketFixture() {
  const handlers = new Map();
  return {
    connected: true, sent: [],
    on(name, callback) { if (!handlers.has(name)) handlers.set(name, new Set()); handlers.get(name).add(callback); },
    off(name, callback) { handlers.get(name)?.delete(callback); },
    emit(name, payload, acknowledge) { this.sent.push({ name, payload, acknowledge }); },
    receive(name, data) { for (const callback of handlers.get(name) || []) callback(data); },
    listeners() { return [...handlers.values()].reduce((count, callbacks) => count + callbacks.size, 0); }
  };
}
const payload = { sessionId: 'fixture-session', text: 'Texto técnico.', clientMsgId: 'fixture-attempt' };

test('cambiar la identidad desconecta el socket anterior antes del nuevo handshake', () => {
  const calls = [];
  const socket = { connected: true, auth: { token: 'sst-fixture' },
    disconnect() { calls.push('disconnect'); this.connected = false; },
    connect() { calls.push(this.auth.token); this.connected = true; } };
  synchronizeSocketAuthentication(socket, 'agent-fixture');
  assert.deepEqual(calls, ['disconnect', 'agent-fixture']);
  synchronizeSocketAuthentication(socket, 'agent-fixture');
  assert.equal(calls.length, 2);
  synchronizeSocketAuthentication(socket, null);
  assert.equal(socket.connected, false);
  assert.equal(socket.auth.token, null);
});

test('el envío espera confirmación y descarta errores/mensajes de otro intento', async () => {
  const socket = socketFixture();
  let confirmed = false;
  const delivery = confirmChatMessage(socket, payload).then(message => { confirmed = true; return message; });
  socket.receive('support:error', { clientMsgId: 'other', error: { message: 'Otro chat' } });
  socket.receive('support:message:received', { sessionId: 'other', clientMsgId: payload.clientMsgId });
  await Promise.resolve();
  assert.equal(confirmed, false);
  const message = { ...payload, id: 'server-message' };
  socket.receive('support:message:received', message);
  assert.deepEqual(await delivery, message);
  assert.equal(socket.listeners(), 0);
});

test('el error de servidor rechaza el intento y limpia listeners, sin una confirmación falsa', async () => {
  const socket = socketFixture();
  const delivery = confirmChatMessage(socket, payload);
  socket.receive('support:error', { clientMsgId: payload.clientMsgId, error: { message: 'Sesión cerrada.' } });
  await assert.rejects(delivery, /Sesión cerrada/);
  assert.equal(socket.listeners(), 0);
});

test('acknowledgement confirma el guardado aunque no llegue el evento de difusión', async () => {
  const socket = socketFixture();
  const delivery = confirmChatMessage(socket, payload);
  socket.sent[0].acknowledge({ success: true, data: { ...payload, id: 'persisted' } });
  assert.equal((await delivery).id, 'persisted');
  assert.equal(socket.listeners(), 0);
});

test('sin conexión no emite a la cola; una desconexión pendiente se informa como no confirmada', async () => {
  const socket = socketFixture();
  socket.connected = false;
  await assert.rejects(confirmChatMessage(socket, payload), /Sin conexión/);
  assert.equal(socket.sent.length, 0);
  socket.connected = true;
  const delivery = confirmChatMessage(socket, payload);
  socket.receive('disconnect');
  await assert.rejects(delivery, /antes de confirmar/);
  assert.equal(socket.listeners(), 0);
});

test('timeout y cancelación no retienen suscripciones ni aceptan confirmaciones tardías', async () => {
  const socket = socketFixture();
  const timed = confirmChatMessage(socket, payload, { timeoutMs: 10 });
  await assert.rejects(timed, /No recibimos confirmación/);
  socket.sent[0].acknowledge({ success: true, data: { ...payload, id: 'late' } });
  assert.equal(socket.listeners(), 0);
  const controller = new AbortController();
  const pending = confirmChatMessage(socket, payload, { signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
  assert.equal(socket.listeners(), 0);
});
