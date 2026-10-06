import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import request from 'supertest';
import app from '../../src/app.js';
import pool from '../../src/infrastructure/db.js';
import { currentJourney } from '../../src/domain/journey.js';

const id = `test-plan-${crypto.randomUUID()}`;
const email = `${id}@example.test`;
let token;
const call = (method, path, body) => request(app)[method](`/api/v1${path}`)
  .set('Authorization', `Bearer ${token}`).send(body);

before(async () => {
  assert.equal(process.env.NODE_ENV, 'test');
  assert.equal(process.env.DB_NAME_TEST, 'pulso360_plan_test_20261005');
  await pool.query(`INSERT INTO usuarios (id, rol_codigo, correo_institucional, contrasena_hash, nombres, apellidos, estado, shift_start_hour)
    SELECT $1, 'AGENTE', $2, contrasena_hash, 'Fixture', 'Integracion', 'Activo', 8 FROM usuarios WHERE id='usr-1'`, [id, email]);
  const login = await request(app).post('/api/v1/auth/login').send({ correo: email, contrasena: 'Pulso360#2026' }).expect(200);
  token = login.body.data.token;
  await call('put', '/agent/consent', { acepta_politica: true, c1_checkin: true, c2_bitacora: true, c3_apoyo: true }).expect(200);
});

after(async () => {
  await pool.query('DELETE FROM bitacoras WHERE usuario_id=$1', [id]);
  await pool.query('DELETE FROM daily_checkins WHERE usuario_id=$1', [id]);
  await pool.query('DELETE FROM consentimientos WHERE usuario_id=$1', [id]);
  await pool.query('DELETE FROM usuarios WHERE id=$1', [id]);
  await pool.end();
});

test('jornada de Bogotá respeta cambio UTC y comienzo real de turno', () => {
  assert.equal(currentJourney(8, new Date('2026-10-06T02:00:00Z')), '2026-10-05');
  assert.equal(currentJourney(8, new Date('2026-10-06T12:59:00Z')), '2026-10-05');
  assert.equal(currentJourney(8, new Date('2026-10-06T13:00:00Z')), '2026-10-06');
  assert.equal(currentJourney(6, new Date('2026-10-06T12:00:00Z')), '2026-10-06');
});

test('perfil recupera asignación y contadores propios completos sin datos administrativos de otros roles', async () => {
  const before = (await call('get','/auth/me').expect(200)).body.data.navigation_counts.unread;
  const assignment = crypto.randomUUID(), notices = Array.from({length:51},()=>crypto.randomUUID());
  try {
    await pool.query(`INSERT INTO asignaciones_usuario_equipo(id,usuario_id,equipo_id,tipo_asignacion,fecha_inicio,activa)
      VALUES($1,$2,'team-alpha-1','AGENTE',CURRENT_DATE,TRUE)`,[assignment,id]);
    await pool.query(`INSERT INTO notificaciones(id,usuario_id,title,is_read)
      SELECT notice,$1,'Aviso técnico del fixture',FALSE FROM unnest($2::varchar[]) AS notice`,[id,notices]);
    const profile = (await call('get','/auth/me').expect(200)).body.data;
    assert.equal(profile.shift_start_hour,8);
    assert.equal(profile.assignments[0].id,assignment);
    assert.equal(profile.assignments[0].equipo_id,'team-alpha-1');
    assert.equal(profile.assignments[0].campana_id,'camp-1');
    assert.match(profile.assignments[0].fecha_inicio,/^\d{4}-\d{2}-\d{2}$/);
    assert.equal(profile.navigation_counts.unread,before+51);
    assert.equal(profile.navigation_counts.alerts,null);
    assert.equal(profile.navigation_counts.support,null);
    assert.equal(profile.navigation_counts.habeas,null);
  } finally {
    await pool.query('DELETE FROM notificaciones WHERE id=ANY($1::varchar[])',[notices]);
    await pool.query('DELETE FROM asignaciones_usuario_equipo WHERE id=$1',[assignment]);
  }
});

test('análisis, revisión e historial persisten; editar invalida y rechaza respuesta atrasada', async () => {
  const created = await call('post', '/agent/journal', { content: 'Texto técnico de prueba para el turno.' }).expect(201);
  const entry = created.body.data;
  const analysis = { version: 'lexico-v1.2', categories: [{ name: 'Sobrecarga percibida', confidence:.55,evidence:[] }] };
  await call('put', `/agent/journal/${entry.id}`, { analysis, contentHash: entry.content_hash }).expect(200);
  await call('post', `/agent/journal/${entry.id}/corrections`, { categories: [], note: 'Revisión técnica', contentHash: entry.content_hash }).expect(201);
  let list = await call('get', '/agent/journal').expect(200);
  assert.equal(list.body.data[0].correction_history.length, 1);
  assert.deepEqual(list.body.data[0].corrected_categories_json, []);
  const edited = await call('put', `/agent/journal/${entry.id}`, { content: 'Un texto diferente para comprobar la revisión.' }).expect(200);
  assert.equal(edited.body.data.analysis_json, null);
  assert.equal(edited.body.data.analysis_history[0].correctionHistory.length, 1);
  await call('put', `/agent/journal/${entry.id}`, { analysis, contentHash: entry.content_hash }).expect(409);
  await call('put', `/agent/journal/${entry.id}`, { analysis, contentHash: edited.body.data.content_hash }).expect(200);
  await call('put', `/agent/journal/${entry.id}`, { analysis: null }).expect(200);
  list = await call('get', '/agent/journal').expect(200);
  assert.equal(list.body.data[0].analysis_json, null);
  assert.equal(list.body.data[0].analysis_history.length, 2);
  await call('put', '/agent/journal/jou-ajena', { content: 'No pertenece al titular.' }).expect(404);
});

test('C3 y aceptación se verifican por HTTP; preferencias e historial son del servidor', async () => {
  const created = await call('post', '/agent/journal', { content: 'Entrada técnica para verificar permisos.' }).expect(201);
  await call('put', '/agent/consent', { c3_apoyo: false }).expect(200);
  await call('put', `/agent/journal/${created.body.data.id}`, { analysis: { version: 'lexico-v1.2', categories: [] }, contentHash: created.body.data.content_hash }).expect(403);
  const revoked = await call('put', '/agent/consent', { acepta_politica: false }).expect(200);
  assert.equal(revoked.body.data.active, false);
  assert.equal(revoked.body.data.c1_checkin, false);
  assert.ok(revoked.body.data.history.length >= 3);
  assert.ok(revoked.body.data.policy.texto_politica);
  await call('post', '/agent/journal', { content: 'Intento sin consentimiento.' }).expect(403);
  await call('put', '/agent/consent', { policyVersion: 'politica-inexistente', acepta_politica: true }).expect(409);
});

test('check-in: 119 minutos permite editar, 121 rechaza; fechas y valores persistidos se recuperan',async()=>{
  await call('put','/agent/consent',{acepta_politica:true,c1_checkin:true}).expect(200);
  const data={energia:4,carga_emocional:3,recuperacion:4,apoyo:5,distanciamiento:1,ineficacia:2};
  const res=await call('post','/agent/checkin',data).expect(201);
  assert.equal(res.body.data.energia,4);assert.ok(res.body.data.submitted_at);
  await pool.query("UPDATE daily_checkins SET submitted_at=NOW()-INTERVAL '119 minutes' WHERE id=$1",[res.body.data.id]);
  await call('post','/agent/checkin',{...data,energia:2}).expect(201);
  assert.equal((await call('get','/agent/checkin/today').expect(200)).body.data.checkin.energia,2);
  await pool.query("UPDATE daily_checkins SET submitted_at=NOW()-INTERVAL '121 minutes' WHERE id=$1",[res.body.data.id]);
  const expired=await call('post','/agent/checkin',data).expect(409);
  assert.equal(expired.body.error.code,'CHECKIN_EDIT_WINDOW_EXPIRED');
  await call('post','/agent/checkin',{...data,checkin_date:'2000-01-01'}).expect(409);
});

test('cada finalidad y una política nueva se verifican por petición directa; C5 no bloquea apoyo voluntario',async()=>{
  const full={acepta_politica:true,acepta_aviso_privacidad:true,c1_checkin:true,c2_bitacora:true,c3_apoyo:true,c4_analitica:true,c5_contacto:true};
  await call('put','/agent/consent',full).expect(200);
  await call('put','/agent/consent',{c1_checkin:false}).expect(200);
  await call('post','/agent/checkin',{energia:4,carga_emocional:3,recuperacion:4,apoyo:5,distanciamiento:1,ineficacia:2}).expect(403);
  await call('put','/agent/consent',{c2_bitacora:false}).expect(200);
  await call('post','/agent/journal',{content:'Texto privado técnico de prueba.'}).expect(403);
  await call('put','/agent/consent',{c3_apoyo:false}).expect(200);
  await call('post','/sst/support-requests',{mode:'anonimo',reason:'Fixture',urgency:'baja',description:'Descripción técnica del fixture.'}).expect(403);
  await call('put','/agent/consent',{...full,c5_contacto:false}).expect(200);
  await call('post','/sst/support-requests',{mode:'anonimo',reason:'Fixture',urgency:'baja',description:'Descripción técnica del fixture.'}).expect(201);
  await pool.query('DELETE FROM solicitudes_apoyo WHERE owner_user_id=$1',[id]);
  const policy='fx-pol-'+crypto.randomUUID().slice(0,12);
  try {
    await pool.query(`INSERT INTO politicas_privacidad(id,version,titulo,texto_politica,texto_aviso_privacidad,hash_contenido,estado,vigente_desde)
      VALUES($1,$1,'Fixture','Política técnica','Aviso técnico',$2,'PUBLICADA',NOW())`,[policy,'a'.repeat(64)]);
    const status=await call('get','/agent/consent').expect(200);
    assert.equal(status.body.data.active,false);assert.equal(status.body.data.policy.id,policy);
    await call('post','/agent/journal',{content:'No debe procesarse con versión antigua.'}).expect(403);
    await call('get','/nlp/lexicon/active').expect(403);
  } finally { await pool.query('DELETE FROM politicas_privacidad WHERE id=$1',[policy]); }
});

test('fallo de auditoría revierte la escritura privada; eventos efectivos no guardan su contenido',async()=>{
  await call('put','/agent/consent',{acepta_politica:true,c2_bitacora:true,c3_apoyo:true}).expect(200);
  const content='Texto privado técnico que no aparece en auditoría.';
  await pool.query(`CREATE OR REPLACE FUNCTION fixture_audit_failure() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN IF NEW.actor_reference='${id}' AND NEW.action='CREACION_BITACORA' THEN RAISE EXCEPTION 'Fixture audit failure'; END IF; RETURN NEW; END $$`);
  await pool.query('CREATE TRIGGER fixture_audit_failure_trigger BEFORE INSERT ON auditoria_logs FOR EACH ROW EXECUTE FUNCTION fixture_audit_failure()');
  try {
    await call('post','/agent/journal',{content}).expect(500);
    assert.equal((await pool.query('SELECT id FROM bitacoras WHERE usuario_id=$1 AND content=$2',[id,content])).rowCount,0);
  } finally {
    await pool.query('DROP TRIGGER fixture_audit_failure_trigger ON auditoria_logs');
    await pool.query('DROP FUNCTION fixture_audit_failure()');
  }
  const created=await call('post','/agent/journal',{content}).expect(201);
  await call('delete',`/agent/journal/${created.body.data.id}`).expect(200);
  const rows=(await pool.query('SELECT * FROM auditoria_logs WHERE actor_reference=$1',[id])).rows;
  assert.ok(rows.some(row=>row.action==='CREACION_BITACORA'));
  assert.ok(rows.some(row=>row.action==='ELIMINACION_BITACORA'));
  assert.equal(JSON.stringify(rows).includes(content),false);
});
