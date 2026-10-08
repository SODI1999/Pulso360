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

  // Activar consentimiento C3 de apoyo para el agente de prueba
  await call('put', '/agent/consent', {
    acepta_politica: true,
    acepta_aviso_privacidad: true,
    c1_checkin: true,
    c2_bitacora: true,
    c3_apoyo: true,
    c4_analitica: true,
    c5_contacto: true
  }, 'AGENTE').expect(200);
});

after(async () => {
  await pool.query('DELETE FROM mensajes_chat_soporte WHERE remitente_id = ANY($1::varchar[])', [users]);
  await pool.query('DELETE FROM sesiones_chat_soporte WHERE agente_id = ANY($1::varchar[])', [users]);
  await pool.query('DELETE FROM solicitudes_apoyo WHERE owner_user_id = ANY($1::varchar[])', [users]);
  await pool.query('DELETE FROM consentimientos WHERE usuario_id = ANY($1::varchar[])', [users]);
  await pool.query('DELETE FROM usuarios WHERE id = ANY($1::varchar[])', [users]);
  await pool.end();
});

test('Privacidad RBAC: SUPERVISOR es bloqueado con 403 Forbidden al intentar acceder al chat de apoyo', async () => {
  const res1 = await call('get', '/chat/requests/req-fake', undefined, 'SUPERVISOR').expect(403);
  assert.equal(res1.body.success, false);
  assert.equal(res1.body.error.code, 'AUTH_FORBIDDEN_ROLE');

  const res2 = await call('post', '/chat/requests/req-fake/activate', undefined, 'SUPERVISOR').expect(403);
  assert.equal(res2.body.success, false);
  assert.equal(res2.body.error.code, 'AUTH_FORBIDDEN_ROLE');

  const res3 = await call('get', '/chat/agent-active-map', undefined, 'SUPERVISOR').expect(403);
  assert.equal(res3.body.success, false);
  assert.equal(res3.body.error.code, 'AUTH_FORBIDDEN_ROLE');
});

test('Journey Radicado a Chat: Radicación formal, activación por SST y comunicación en vivo', async () => {
  // 1. Agente radica solicitud formal de acompañamiento (SG-SST)
  const reqRes = await call('post', '/sst/support-requests', {
    reason: 'Sobrecarga de llamadas y fatiga de turno',
    description: 'Alta tensión en colas de llamadas de soporte',
    urgency: 'alta',
    mode: 'anonimo'
  }, 'AGENTE').expect(201);

  assert.equal(reqRes.body.success, true);
  const solicitud = reqRes.body.data;
  assert.ok(solicitud.id, 'Debe retornar el ID del radicado');
  const requestId = solicitud.id;

  // 2. Antes de la activación, no existe sesión de chat iniciada
  const emptyChatRes = await call('get', `/chat/requests/${requestId}`, undefined, 'AGENTE').expect(200);
  assert.equal(emptyChatRes.body.success, true);
  assert.equal(emptyChatRes.body.data.session, null, 'No debe haber sesión de chat previa a la activación');
  assert.deepEqual(emptyChatRes.body.data.messages, []);

  // 3. Agente no puede activar el chat por sí mismo (solo SST tiene autorización)
  const agentActivateRes = await call('post', `/chat/requests/${requestId}/activate`, undefined, 'AGENTE').expect(403);
  assert.equal(agentActivateRes.body.success, false);
  assert.equal(agentActivateRes.body.error.code, 'AUTH_FORBIDDEN_ROLE');

  // 4. Especialista SST evalúa el radicado y activa el canal de chat preventivo
  const sstActivateRes = await call('post', `/chat/requests/${requestId}/activate`, undefined, 'SST').expect(200);
  assert.equal(sstActivateRes.body.success, true);
  const chatData = sstActivateRes.body.data;
  assert.ok(chatData.session, 'Debe crear la sesión');
  assert.equal(chatData.session.requestId, requestId);
  assert.equal(chatData.session.status, 'activa');
  assert.equal(chatData.session.isAnonymous, true);
  assert.ok(chatData.messages.length >= 1, 'Debe incluir mensaje inicial institucional');
  const sessionId = chatData.session.id;

  // 5. Agente consulta el chat de su radicado y recibe la sesión activa y los mensajes
  const agentChatRes = await call('get', `/chat/requests/${requestId}`, undefined, 'AGENTE').expect(200);
  assert.equal(agentChatRes.body.success, true);
  assert.equal(agentChatRes.body.data.session.id, sessionId);
  assert.equal(agentChatRes.body.data.session.status, 'activa');

  // 6. Agente consulta su mapa de radicados con chat activo
  const mapRes = await call('get', '/chat/agent-active-map', undefined, 'AGENTE').expect(200);
  assert.equal(mapRes.body.success, true);
  assert.ok(Array.isArray(mapRes.body.data));
  const activeEntry = mapRes.body.data.find(e => e.requestId === requestId);
  assert.ok(activeEntry, 'El radicado debe figurar en el mapa de chats activos');
  assert.equal(activeEntry.status, 'activa');

  // 7. SST concluye la sesión con notas de salud ocupacional
  const closeRes = await call('post', `/chat/sessions/${sessionId}/close`, {
    reason: 'ATENCION_CONCLUIDA',
    notes: 'Agente orientado en técnica de respiración diafragmática y micropausa'
  }, 'SST').expect(200);
  assert.equal(closeRes.body.success, true);
  assert.equal(closeRes.body.data.estado, 'cerrada');

  // 8. Historial de mensajes inmutables en solo lectura
  const messagesRes = await call('get', `/chat/sessions/${sessionId}/messages`, undefined, 'AGENTE').expect(200);
  assert.equal(messagesRes.body.success, true);
  assert.ok(messagesRes.body.data.messages.length >= 2, 'Debe contener mensaje inicial y mensaje de cierre');

  // 9. Consulta del radicado tras el cierre: se conserva congelado para consulta histórica
  const finalChatRes = await call('get', `/chat/requests/${requestId}`, undefined, 'AGENTE').expect(200);
  assert.equal(finalChatRes.body.data.session.status, 'cerrada');
  assert.equal(finalChatRes.body.data.session.closingReason, 'ATENCION_CONCLUIDA');
});
