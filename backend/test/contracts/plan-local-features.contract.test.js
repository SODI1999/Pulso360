import { test,before,after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../../src/app.js';
import pool from '../../src/infrastructure/db.js';
import { setMailTransportForTests } from '../../src/infrastructure/mailDelivery.js';
import { canonicalJson } from '../../src/domain/canonicalJson.js';
import { createLog } from '../../src/infrastructure/repositories/auditorRepository.js';
import nodemailer from 'nodemailer';
const users=[],rules=[],versions=[],auditIds=[];
const tokens={};
let deliveredToken,agentId,originalLexicon;
const call=(method,path,data,role='ADMIN')=>request(app)[method]('/api/v1'+path).set('Authorization','Bearer '+tokens[role]).send(data);
before(async()=>{
  assert.equal(process.env.DB_NAME_TEST,'pulso360_plan_test_20261005');
  for(const role of ['ADMIN','AUDITOR','SST','AGENTE']){
    const id='fx-'+crypto.randomUUID(),email=id+'@example.test';users.push(id);
    await pool.query(`INSERT INTO usuarios(id,rol_codigo,correo_institucional,contrasena_hash,nombres,apellidos,estado)
      SELECT $1,$2,$3,contrasena_hash,'Fixture','Contratos','Activo' FROM usuarios WHERE id='usr-1'`,[id,role,email]);
    const res=await request(app).post('/api/v1/auth/login').send({correo:email,contrasena:'Pulso360#2026'}).expect(200);
    tokens[role]=res.body.data.token;
    if(role==='AGENTE')agentId=id;
  }
  await pool.query(`INSERT INTO consentimientos(id,usuario_id,politica_id,tipo_evento,acepta_politica,acepta_aviso_privacidad,c2_bitacora,c3_apoyo)
    SELECT $1,$2,id,'ACTUALIZACION',TRUE,TRUE,TRUE,TRUE FROM politicas_privacidad WHERE estado='PUBLICADA' AND vigente_desde<=NOW() ORDER BY vigente_desde DESC,created_at DESC,id DESC LIMIT 1`,[crypto.randomUUID(),agentId]);
  originalLexicon=(await pool.query("SELECT * FROM versiones_lexico WHERE estado='ACTIVA' ORDER BY activado_en DESC,id LIMIT 1")).rows[0];
  process.env.PUBLIC_FRONTEND_URL='http://localhost:5173';
});
after(async()=>{
  setMailTransportForTests(null);
  await pool.query("UPDATE versiones_lexico SET estado='OBSOLETA' WHERE estado='ACTIVA'");
  await pool.query("UPDATE versiones_lexico SET estado='ACTIVA' WHERE id=$1",[originalLexicon.id]);
  await pool.query('DELETE FROM lexico_activaciones WHERE version_id=ANY($1::varchar[]) OR previous_version_id=ANY($1::varchar[])',[versions]);
  await pool.query('DELETE FROM versiones_lexico WHERE id=ANY($1::varchar[])',[versions]);
  await pool.query('DELETE FROM reglas_alerta WHERE id=ANY($1::varchar[])',[rules]);
  await pool.query('DELETE FROM consentimientos WHERE usuario_id=ANY($1::varchar[])',[users]);
  await pool.query('DELETE FROM usuarios WHERE id=ANY($1::varchar[])',[users]);
  // Los eventos permanecen: borrar un tramo destruiría la evidencia de continuidad.
  await pool.end();
});
test('reglas: propuesta persistente, únicamente ADMIN aprueba, revisión duplicada 409',async()=>{
  const data={metric:'Recuperación agregada',operator:'baje más de',value:15,persistence:3,unit:'semanas',scope:'camp-1',severity:'Alta'};
  const res=await call('post','/sst/rules',data,'SST').expect(201);rules.push(res.body.data.id);
  assert.equal(res.body.data.activa,false);assert.equal(res.body.data.pending_approval,true);
  assert.ok((await call('get','/sst/rules',undefined,'SST').expect(200)).body.data.some(row=>row.id===rules[0]));
  await call('patch',`/admin/rules/${rules[0]}/approval`,{},'SST').expect(403);
  const approved=await call('patch',`/admin/rules/${rules[0]}/approval`,{}).expect(200);
  assert.equal(approved.body.data.pending_approval,false);assert.ok(approved.body.data.aprobada_en);
  await call('patch',`/admin/rules/${rules[0]}/approval`,{}).expect(409);
  await call('post','/sst/rules',{...data,scope:'unknown'},'SST').expect(400);
});
test('léxico: contenido registrado e íntegro, activación y reversión con permisos',async()=>{
  assert.equal(Number((await pool.query('SELECT COUNT(*) AS total FROM lexico_activaciones')).rows[0].total),0);
  await call('post','/admin/nlp/revert',{}).expect(409);
  const dictionary=structuredClone(originalLexicon.contenido);
  dictionary.categories['Sobrecarga percibida']=dictionary.categories['Sobrecarga percibida'].slice(0,1);
  const id='fx-lex-'+crypto.randomUUID().slice(0,12);versions.push(id);
  const hash=crypto.createHash('sha256').update(canonicalJson(dictionary)).digest('hex');
  await pool.query("INSERT INTO versiones_lexico(id,codigo_version,estado,hash_contenido,contenido) VALUES($1,$2,'BORRADOR',$3,$4)",[id,id,hash,dictionary]);
  await call('post',`/admin/nlp/versions/${id}/activate`,{},'SST').expect(403);
  await call('post','/admin/nlp/versions/unknown/activate',{}).expect(404);
  await call('post',`/admin/nlp/versions/${id}/activate`,{}).expect(200);
  const active=await call('get','/nlp/lexicon/active',undefined,'AGENTE').expect(200);
  assert.deepEqual(active.body.data.dictionary,dictionary);
  await pool.query("UPDATE versiones_lexico SET contenido='{}' WHERE id=$1",[id]);
  await call('get','/nlp/lexicon/active',undefined,'AGENTE').expect(409);
  await pool.query('UPDATE versiones_lexico SET contenido=$2 WHERE id=$1',[id,dictionary]);
  const reverted=await call('post','/admin/nlp/revert',{}).expect(200);
  assert.equal(reverted.body.data.id,originalLexicon.id);
});
test('auditoría: contenido alterado, concurrentes, continuidad entre páginas, exportación >50',async()=>{
  const events=await Promise.all(Array.from({length:55},(_,index)=>createLog({usuarioId:users[0],rol:'ADMIN',action:'FIXTURE_CONCURRENT',resource:'fixture',details:{index}})));
  auditIds.push(...events.map(row=>String(row.id)));
  let res=await call('get','/auditor/integrity',undefined,'AUDITOR').expect(200);
  assert.ok(!res.body.data.failures.some(f=>auditIds.includes(f.id)));
  assert.ok(res.body.data.verifiedRecords>=55);
  await call('get','/auditor/integrity').expect(403);
  const row=events[0];
  await pool.query('UPDATE auditoria_logs SET details=$2 WHERE id=$1',[row.id,{altered:true}]);
  res=await call('get','/auditor/integrity',undefined,'AUDITOR').expect(200);
  assert.ok(res.body.data.failures.some(f=>f.id===String(row.id)&&f.kind==='CONTENT'));
  await pool.query('UPDATE auditoria_logs SET details=$2 WHERE id=$1',[row.id,row.details]);
  const page1=(await call('get','/auditor/logs?limit=30',undefined,'AUDITOR').expect(200)).body;
  await createLog({usuarioId:users[0],rol:'ADMIN',action:'FIXTURE_BETWEEN_PAGES',resource:'fixture'});
  const page2=(await call('get',`/auditor/logs?limit=30&offset=30&maxId=${page1.pagination.maxId}`,undefined,'AUDITOR').expect(200)).body;
  assert.equal(page1.pagination.total,page2.pagination.total);
  assert.equal(page2.data.some(row=>page1.data.some(first=>first.id===row.id)),false);
  assert.equal(page1.data.at(-1).prev_hash,page2.data[0].hash);
  const exported=(await call('post','/auditor/export',{action:'FIXTURE_CONCURRENT',limit:100},'AUDITOR').expect(200)).body.data;
  assert.ok(exported.logs.length>=55);assert.ok(exported.metadata.snapshotHash);
  await call('post','/auditor/export',{limit:10001},'AUDITOR').expect(400);
  await pool.query('UPDATE auditoria_logs SET prev_hash=$2 WHERE id=$1',[row.id,'0'.repeat(64)]);
  try {
    const broken=(await call('get','/auditor/integrity',undefined,'AUDITOR').expect(200)).body.data;
    assert.ok(broken.failures.some(f=>f.id===String(row.id)&&f.kind==='LINK'));
  } finally { await pool.query('UPDATE auditoria_logs SET prev_hash=$2 WHERE id=$1',[row.id,row.prev_hash]); }
});

test('recuperación sin SMTP devuelve indisponibilidad sin confirmar envío',async()=>{
  const previous=process.env.SMTP_HOST;
  delete process.env.SMTP_HOST;
  setMailTransportForTests(null);
  try {
    const res=await request(app).post('/api/v1/auth/password-reset/request').send({correo:agentId+'@example.test'}).expect(503);
    assert.equal(res.body.success,false);assert.equal(res.body.error.code,'PASSWORD_RESET_UNAVAILABLE');
    assert.match(res.body.error.message,/no está disponible/);
  } finally { if(previous!==undefined)process.env.SMTP_HOST=previous; }
});

test('Nodemailer prepara el correo con transporte local controlado y solo persiste el hash del token',async()=>{
  const transport=nodemailer.createTransport({streamTransport:true,buffer:true,newline:'unix'});
  let message,mailBytes;
  setMailTransportForTests({sendMail:async input=>{
    message=input;const result=await transport.sendMail(input);mailBytes=result.message;return result;
  }});
  try {
    const response=await request(app).post('/api/v1/auth/password-reset/request').send({correo:agentId+'@example.test'}).expect(200);
    const url=new URL(message.text.match(/http[^\s]+/)[0]);
    assert.equal(url.pathname,'/nueva-clave');assert.equal(message.to,agentId+'@example.test');
    assert.ok(Buffer.isBuffer(mailBytes));assert.match(mailBytes.toString(),/Recuperaci/);
    const token=url.searchParams.get('token');
    assert.equal(JSON.stringify(response.body).includes(token),false);
    const stored=(await pool.query('SELECT token_hash,delivery_status FROM password_reset_tokens WHERE usuario_id=$1 ORDER BY created_at DESC LIMIT 1',[agentId])).rows[0];
    assert.equal(stored.token_hash,crypto.createHash('sha256').update(token).digest('hex'));assert.equal(stored.delivery_status,'DELIVERED');
  } finally { setMailTransportForTests(null); }
});
test('recuperación: SMTP controlado, sin token en respuesta, expiración, fallo y uso único revocan sesión',async()=>{
  const legacy=jwt.sign({id:agentId,role:'AGENTE'},process.env.JWT_SECRET || 'secret',{expiresIn:'1h'});
  await request(app).get('/api/v1/auth/me').set('Authorization','Bearer '+legacy).expect(200);
  setMailTransportForTests({sendMail:async message=>{
    deliveredToken=new URL(message.text.match(/http[^\s]+/)[0]).searchParams.get('token');
    return {accepted:[message.to],rejected:[]};
  }});
  const email=agentId+'@example.test';
  const ask=()=>request(app).post('/api/v1/auth/password-reset/request').send({correo:email});
  const validate=token=>request(app).post('/api/v1/auth/password-reset/validate').send({token});
  const confirm=token=>request(app).post('/api/v1/auth/password-reset/confirm').send({token,contrasena:'FixtureNew#2026'});
  const requested=await ask().expect(200);
  assert.equal(JSON.stringify(requested.body).includes(deliveredToken),false);
  const unknown=await request(app).post('/api/v1/auth/password-reset/request').send({correo:'unknown@example.test'}).expect(200);
  assert.deepEqual(requested.body,unknown.body);
  assert.equal((await validate('invalid').expect(200)).body.data.valid,false);
  assert.equal((await validate(deliveredToken).expect(200)).body.data.valid,true);
  await pool.query("UPDATE password_reset_tokens SET expires_at=NOW()-INTERVAL '1 minute' WHERE usuario_id=$1",[agentId]);
  await confirm(deliveredToken).expect(400);
  await ask().expect(200);
  setMailTransportForTests({sendMail:async()=>{throw new Error('Fixture delivery failure');}});
  await ask().expect(200);
  const failed=await pool.query("SELECT delivery_status,consumed_at FROM password_reset_tokens WHERE usuario_id=$1 ORDER BY created_at DESC LIMIT 1",[agentId]);
  assert.equal(failed.rows[0].delivery_status,'FAILED');assert.ok(failed.rows[0].consumed_at);
  setMailTransportForTests({sendMail:async message=>{deliveredToken=new URL(message.text.match(/http[^\s]+/)[0]).searchParams.get('token');return {accepted:[message.to],rejected:[]};}});
  await ask().expect(200);
  const results=await Promise.all([confirm(deliveredToken),confirm(deliveredToken)]);
  assert.deepEqual(results.map(r=>r.status).sort(),[200,400]);
  assert.equal((await validate(deliveredToken).expect(200)).body.data.valid,false);
  await call('get','/auth/me',undefined,'AGENTE').expect(401);
  await request(app).get('/api/v1/auth/me').set('Authorization','Bearer '+legacy).expect(401);
  await request(app).post('/api/v1/auth/login').send({correo:email,contrasena:'Pulso360#2026'}).expect(401);
  await request(app).post('/api/v1/auth/login').send({correo:email,contrasena:'FixtureNew#2026'}).expect(200);
});
