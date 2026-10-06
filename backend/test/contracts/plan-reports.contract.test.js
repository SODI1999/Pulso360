import { test,before,after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import request from 'supertest';
import app from '../../src/app.js';
import pool from '../../src/infrastructure/db.js';
const users=[],reports=[],mark=crypto.randomUUID().slice(0,8);
let token,otherToken,supervisorId;
const call=(method,path,body,bearer=token)=>request(app)[method](`/api/v1${path}`).set('Authorization',`Bearer ${bearer}`).send(body);
async function user(role,team){
  const id=`fx-${crypto.randomUUID()}`,email=`${id}@example.test`;users.push(id);
  await pool.query(`INSERT INTO usuarios (id,rol_codigo,correo_institucional,contrasena_hash,nombres,apellidos,estado)
    SELECT $1,$2,$3,contrasena_hash,'Fixture',$4,'Activo' FROM usuarios WHERE id='usr-1'`,[id,role,email,mark]);
  const assignment=crypto.randomUUID();
  await pool.query(`INSERT INTO asignaciones_usuario_equipo (id,usuario_id,equipo_id,tipo_asignacion,fecha_inicio,activa) VALUES ($1,$2,$3,$4,CURRENT_DATE,TRUE)`,[assignment,id,team,role]);
  return {id,email,assignment};
}
before(async()=>{
  assert.equal(process.env.DB_NAME_TEST,'pulso360_plan_test_20261005');
  for(let index=0;index<5;index++){
    const agent=await user('AGENTE','team-alpha-1');
    await pool.query(`INSERT INTO consentimientos (id,usuario_id,politica_id,tipo_evento,acepta_politica,acepta_aviso_privacidad,c4_analitica)
      SELECT $1,$2,id,'ACTUALIZACION',TRUE,TRUE,TRUE FROM politicas_privacidad WHERE estado='PUBLICADA' AND vigente_desde<=NOW() ORDER BY vigente_desde DESC,created_at DESC,id DESC LIMIT 1`,[crypto.randomUUID(),agent.id]);
    for(const [date,energy] of [['2026-09-01',2],['2026-09-02',index===0?null:4]]){
      await pool.query(`INSERT INTO daily_checkins (id,usuario_id,asignacion_id,journey_key,checkin_date,energia,carga_emocional,recuperacion,apoyo,distanciamiento,ineficacia)
        VALUES ($1,$2,$3,'START_SHIFT',$4,$5,3,5,4,2,1)`,[crypto.randomUUID(),agent.id,agent.assignment,date,energy]);
    }
  }
  const first=await user('SUPERVISOR','team-alpha-1'),second=await user('SUPERVISOR','team-beta-2');supervisorId=first.id;
  for(const [email,set] of [[first.email,t=>token=t],[second.email,t=>otherToken=t]]){
    const login=await request(app).post('/api/v1/auth/login').send({correo:email,contrasena:'Pulso360#2026'}).expect(200);set(login.body.data.token);
  }
});
after(async()=>{
  await pool.query('DELETE FROM reportes_generados WHERE id=ANY($1::varchar[])',[reports]);
  await pool.query('DELETE FROM daily_checkins WHERE usuario_id=ANY($1::varchar[])',[users]);
  await pool.query('DELETE FROM consentimientos WHERE usuario_id=ANY($1::varchar[])',[users]);
  await pool.query('DELETE FROM asignaciones_usuario_equipo WHERE usuario_id=ANY($1::varchar[])',[users]);
  await pool.query('DELETE FROM usuarios WHERE id=ANY($1::varchar[])',[users]);
  await pool.end();
});
test('dos supervisores: corte ajeno se rechaza antes de agregar',async()=>{
  await call('post','/reports',{campanaId:'camp-2',equipoId:'team-beta-2',desde:'2026-09-01',hasta:'2026-09-01'}).expect(403);
  await call('get','/sst/metrics?campana_id=camp-1&equipo_id=team-alpha-1',undefined,otherToken).expect(403);
});
test('periodo, dimensiones y null se conservan en un único snapshot',async()=>{
  const payload={campanaId:'camp-1',equipoId:'team-alpha-1',desde:'2026-09-01',hasta:'2026-09-01',dimensions:['energia'],format:'json'};
  const first=await call('post','/reports',payload).expect(201);reports.push(first.body.data.id);
  assert.deepEqual(first.body.data.metrics,{energia:2});
  const second=await call('post','/reports',{...payload,desde:'2026-09-02',hasta:'2026-09-02'}).expect(201);reports.push(second.body.data.id);
  assert.deepEqual(second.body.data.metrics,{energia:null});
  const download=await call('get',`/reports/${first.body.data.id}/download`).expect(200);
  assert.deepEqual(download.body.metrics,first.body.data.metrics);
  assert.equal(download.body.parametrosFiltro.desde,'2026-09-01');
  const history=await call('get','/reports?equipoId=team-alpha-1').expect(200);
  assert.deepEqual(history.body.data.find(r=>r.id===second.body.data.id).metrics,{energia:null});
  await call('get',`/reports/${first.body.data.id}/download`,undefined,otherToken).expect(403);
  await pool.query('UPDATE asignaciones_usuario_equipo SET activa=FALSE WHERE usuario_id=$1',[supervisorId]);
  await call('get',`/reports/${first.body.data.id}/download`).expect(403);
  await pool.query('UPDATE asignaciones_usuario_equipo SET activa=TRUE WHERE usuario_id=$1',[supervisorId]);
  await pool.query('UPDATE reportes_generados SET parametros_filtro=jsonb_set(parametros_filtro,\'{snapshot_metrics,energia}\',\'99\') WHERE id=$1',[first.body.data.id]);
  await call('get',`/reports/${first.body.data.id}/download`).expect(409);
});
test('CSV del servidor incluye solo dimensiones elegidas; periodo vacío no pasa k',async()=>{
  const created=await call('post','/reports',{equipoId:'team-alpha-1',desde:'2026-09-01',hasta:'2026-09-01',dimensions:['recuperacion'],format:'csv'}).expect(201);
  reports.push(created.body.data.id);
  const csv=await call('get',`/reports/${created.body.data.id}/download`).expect(200);
  assert.match(csv.headers['content-type'],/text\/csv/);assert.match(csv.text,/recuperacion/);assert.doesNotMatch(csv.text,/energia/);
  await call('post','/reports',{equipoId:'team-alpha-1',desde:'1999-01-01',hasta:'1999-01-02'}).expect(403);
});

test('C4 desactivado excluye al titular del conteo y los promedios del mismo periodo',async()=>{
  const agentId=users[0];
  await pool.query(`INSERT INTO consentimientos(id,usuario_id,politica_id,tipo_evento,acepta_politica,acepta_aviso_privacidad,c4_analitica)
    SELECT $1,$2,id,'ACTUALIZACION',TRUE,TRUE,FALSE FROM politicas_privacidad WHERE estado='PUBLICADA' AND vigente_desde<=NOW()
    ORDER BY vigente_desde DESC,created_at DESC,id DESC LIMIT 1`,[crypto.randomUUID(),agentId]);
  const metrics=(await call('get','/sst/metrics?equipo_id=team-alpha-1&desde=2026-09-01&hasta=2026-09-01').expect(200)).body.data;
  assert.equal(metrics.cohort_count,4);assert.equal(metrics.protected,true);assert.equal(metrics.metrics,null);
  await call('post','/reports',{equipoId:'team-alpha-1',desde:'2026-09-01',hasta:'2026-09-01'}).expect(403);
  await call('get','/sst/metrics?equipo_id=team-alpha-1&desde=2026-02-30').expect(400);
});
