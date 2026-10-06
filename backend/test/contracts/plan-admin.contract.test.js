import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import request from 'supertest';
import app from '../../src/app.js';
import pool from '../../src/infrastructure/db.js';
const marker = `fixture-${crypto.randomUUID().slice(0,8)}`;
let token, userId, campaignId, teamId;
const call = (method,path,body) => request(app)[method](`/api/v1/admin${path}`).set('Authorization',`Bearer ${token}`).send(body);
before(async () => {
  assert.equal(process.env.DB_NAME_TEST,'pulso360_plan_test_20261005');
  const login=await request(app).post('/api/v1/auth/login').send({ correo:'admin@pulso360.co',contrasena:'Pulso360#2026' }).expect(200);
  token=login.body.data.token;
});
after(async () => {
  if(userId){await pool.query('DELETE FROM asignaciones_usuario_equipo WHERE usuario_id=$1',[userId]);await pool.query('DELETE FROM usuarios WHERE id=$1',[userId]);}
  if(teamId) { await pool.query('DELETE FROM asignaciones_usuario_equipo WHERE equipo_id=$1',[teamId]); await pool.query('DELETE FROM equipos WHERE id=$1',[teamId]); }
  if(campaignId) await pool.query('DELETE FROM campanas WHERE id=$1',[campaignId]);
  await pool.end();
});
test('campaña inactiva y equipo con supervisor real se conservan', async () => {
  const campaign=await call('post','/campaigns',{ codigo:marker,nombre:marker,activa:false }).expect(201);
  campaignId=campaign.body.data.id;
  assert.equal(campaign.body.data.activa,false);
  const team=await call('post','/teams',{ campanaId:campaignId,codigo:marker,nombre:marker,supervisorId:'usr-2',nMiembros:0,activo:false }).expect(201);
  teamId=team.body.data.id;
  assert.equal(team.body.data.activo,false);
  const assignment=await pool.query("SELECT usuario_id FROM asignaciones_usuario_equipo WHERE equipo_id=$1 AND tipo_asignacion='SUPERVISOR' AND activa=TRUE",[teamId]);
  assert.equal(assignment.rows[0].usuario_id,'usr-2');
});
test('alta suspendida exige contraseña y asignación inválida no deja filas parciales', async () => {
  const body={ correo:`${marker}@example.test`,nombres:'Fixture',apellidos:'Admin',rolCodigo:'AGENTE',status:'Suspendido' };
  await call('post','/users',body).expect(400);
  await call('post','/users',{...body,contrasena:'Fixture#2026',equipoId:'equipo-inexistente'}).expect(400);
  const missing=await pool.query('SELECT id FROM usuarios WHERE correo_institucional=$1',[body.correo]);
  assert.equal(missing.rowCount,0);
  const created=await call('post','/users',{...body,contrasena:'Fixture#2026'}).expect(201);
  userId=created.body.data.id;
  assert.equal(created.body.data.estado,'Suspendido');
});
test('rol, equipo y estado persisten juntos y por separado', async () => {
  const updated=await call('patch',`/users/${userId}`,{ rolCodigo:'SUPERVISOR',equipoId:'team-alpha-1',status:'Activo' }).expect(200);
  assert.equal(updated.body.data.equipo_id,'team-alpha-1');
  await call('patch',`/users/${userId}`,{status:'Suspendido'}).expect(200);
  await call('patch',`/users/${userId}`,{rolCodigo:'AGENTE'}).expect(200);
  await call('patch',`/users/${userId}`,{equipoId:'team-beta-2'}).expect(200);
  await call('patch',`/users/${userId}`,{rolCodigo:'SST',equipoId:'equipo-invalido',status:'Activo'}).expect(400);
  const users=await call('get','/users').expect(200);
  const user=users.body.data.find(u=>u.id===userId);
  assert.equal(user.rol_codigo,'AGENTE');assert.equal(user.estado,'Suspendido');assert.equal(user.equipo_id,'team-beta-2');
  await call('patch',`/users/${userId}/status`,{status:'Activo'}).expect(200);
});
test('parámetros sin efecto operativo rechazan modificación remota',async()=>{
  await call('put','/params/umbral_k_anonimato',{valor:{valor:3}}).expect(409);
  await call('put','/params/gobernanza_checkin',{valor:{horas_edicion_permitidas:24}}).expect(409);
});

test('Habeas Data conserva titular, creación y vencimiento y recupera respuesta en ambas vistas',async()=>{
  const requestId='fx-hd-'+crypto.randomUUID();
  try {
    await pool.query(`INSERT INTO solicitudes_habeas_data(id,usuario_id,type,status,deadline,note,created_at)
      VALUES($1,$2,'Consulta','En tramite','2020-01-01','Fixture','2019-12-20T12:00:00Z')`,[requestId,userId]);
    let item=(await call('get','/habeas-data').expect(200)).body.data.find(row=>row.id===requestId);
    assert.equal(item.usuario_id,userId);assert.equal(item.deadline.slice(0,10),'2020-01-01');assert.equal(item.created_at.slice(0,10),'2019-12-20');
    await call('patch',`/habeas-data/${requestId}`,{status:'Respondida',note:'Respuesta técnica'}).expect(200);
    await call('patch',`/habeas-data/${requestId}`,{status:'En tramite'}).expect(409);
    const login=await request(app).post('/api/v1/auth/login').send({correo:`${marker}@example.test`,contrasena:'Fixture#2026'}).expect(200);
    const own=(await request(app).get('/api/v1/agent/habeas-data').set('Authorization','Bearer '+login.body.data.token).expect(200)).body.data.find(row=>row.id===requestId);
    item=(await call('get','/habeas-data').expect(200)).body.data.find(row=>row.id===requestId);
    assert.equal(own.status,item.status);assert.equal(own.note,item.note);assert.equal(own.deadline,item.deadline);assert.ok(own.resuelto_en);
  } finally { await pool.query('DELETE FROM solicitudes_habeas_data WHERE id=$1',[requestId]); }
});

test('catálogo de usuarios no duplica cuentas con varias asignaciones activas', async () => {
  const assignmentId='fx-assignment-'+crypto.randomUUID();
  try {
    await pool.query(`INSERT INTO asignaciones_usuario_equipo(id,usuario_id,equipo_id,tipo_asignacion,fecha_inicio,activa)
      VALUES($1,$2,'team-alpha-1','AGENTE',CURRENT_DATE,TRUE)`,[assignmentId,userId]);
    const users=(await call('get','/users').expect(200)).body.data.filter(row=>row.id===userId);
    assert.equal(users.length,1);assert.equal(users[0].asignaciones.length,2);
  } finally { await pool.query('DELETE FROM asignaciones_usuario_equipo WHERE id=$1',[assignmentId]); }
});

test('sesión existente aplica rol y suspensión persistidos sin confiar en el rol antiguo del JWT', async () => {
  const login=await request(app).post('/api/v1/auth/login').send({correo:`${marker}@example.test`,contrasena:'Fixture#2026'}).expect(200);
  const authorization='Bearer '+login.body.data.token;
  try {
    await call('patch',`/users/${userId}`,{rolCodigo:'SST'}).expect(200);
    await request(app).get('/api/v1/sst/alerts').set('Authorization',authorization).expect(200);
    await request(app).get('/api/v1/agent/checkin/history').set('Authorization',authorization).expect(403);
    await call('patch',`/users/${userId}`,{status:'Suspendido'}).expect(200);
    await request(app).get('/api/v1/auth/me').set('Authorization',authorization).expect(401);
  } finally { await call('patch',`/users/${userId}`,{rolCodigo:'AGENTE',status:'Activo',equipoId:'team-beta-2'}).expect(200); }
});
