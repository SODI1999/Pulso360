import { currentJourney } from '../../src/domain/journey.js';
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import request from 'supertest';
import app from '../../src/app.js';
import pool from '../../src/infrastructure/db.js';
const id=`fixture-${crypto.randomUUID()}`,email=`${id}@example.test`,alertId=`alt-${crypto.randomUUID()}`;
let sstToken,agentToken,supervisorToken,interventionId,supportId;
const otherSupports=[];
const call=(token,method,path,body)=>request(app)[method](`/api/v1${path}`).set('Authorization',`Bearer ${token}`).send(body);
before(async()=>{
  assert.equal(process.env.DB_NAME_TEST,'pulso360_plan_test_20261005');
  await pool.query(`INSERT INTO usuarios (id,rol_codigo,correo_institucional,contrasena_hash,nombres,apellidos,estado)
    SELECT $1,'AGENTE',$2,contrasena_hash,'Fixture','SST','Activo' FROM usuarios WHERE id='usr-1'`,[id,email]);
  for(const [correo,set] of [[email,t=>agentToken=t],['sst@pulso360.co',t=>sstToken=t],['supervisor@pulso360.co',t=>supervisorToken=t]]){
    const res=await request(app).post('/api/v1/auth/login').send({correo,contrasena:'Pulso360#2026'}).expect(200);set(res.body.data.token);
  }
  await call(agentToken,'put','/agent/consent',{acepta_politica:true,c3_apoyo:true}).expect(200);
  await pool.query(`INSERT INTO sst_alertas (id,regla_id,campana_id,equipo_id,alert_date,severity,respondents,status,description,evidence)
    SELECT $1,id,'camp-1','team-alpha-1',CURRENT_DATE,'Alta',4,'GENERADA','Evidencia técnica sensible','[77,88]'::jsonb FROM reglas_alerta LIMIT 1`,[alertId]);
});
after(async()=>{
  if(interventionId){await pool.query('DELETE FROM seguimientos_intervencion WHERE intervencion_id=$1',[interventionId]);await pool.query('DELETE FROM sst_intervenciones WHERE id=$1',[interventionId]);}
  await pool.query('DELETE FROM sst_alertas WHERE id=$1',[alertId]);
  if(supportId)await pool.query('DELETE FROM solicitudes_apoyo WHERE id=$1',[supportId]);
  await pool.query('DELETE FROM solicitudes_apoyo WHERE id=ANY($1::varchar[])',[otherSupports]);
  await pool.query('DELETE FROM consentimientos WHERE usuario_id=$1',[id]);
  await pool.query('DELETE FROM usuarios WHERE id=$1',[id]);
  await pool.end();
});
test('alerta N=4 protege descripción y evidencia incluso al actualizar',async()=>{
  const list=await call(sstToken,'get','/sst/alerts').expect(200),alert=list.body.data.find(a=>a.id===alertId);
  assert.equal(alert.protected,true);assert.equal(alert.description,null);assert.equal(alert.evidence,null);
  const changed=await call(sstToken,'patch',`/sst/alerts/${alertId}`,{status:'EN_REVISION'}).expect(200);
  assert.equal(changed.body.data.evidence,null);
  await call(sstToken,'patch',`/sst/alerts/${alertId}`,{status:'DESCARTADA',dismissReason:'Motivo técnico de fixture'}).expect(200);
  const reloaded=(await call(sstToken,'get','/sst/alerts').expect(200)).body.data.find(a=>a.id===alertId);
  assert.equal(reloaded.dismiss_reason,'Motivo técnico de fixture');assert.equal(reloaded.description,null);
});
test('todos los campos de intervención y seguimiento se recuperan; responsable ajeno se rechaza',async()=>{
  const payload={title:'Fixture preventivo',type:'Pausas cognitivas',campanaId:'camp-1',equipoId:'team-alpha-1',assignedTo:'usr-2',
    startDate:'2026-10-05',endDate:'2026-11-02',indicator:'Recuperación agregada',target:'Objetivo técnico',externalAction:true};
  await call(sstToken,'post','/sst/interventions',{...payload,campanaId:'camp-2'}).expect(400);
  await call(sstToken,'post','/sst/interventions',{...payload,assignedTo:id}).expect(400);
  await call(sstToken,'post','/sst/interventions',{...payload,startDate:'2026-02-30'}).expect(400);
  const created=await call(sstToken,'post','/sst/interventions',payload).expect(201);interventionId=created.body.data.id;
  await call(supervisorToken,'post',`/supervisor/actions/${interventionId}/followup`,{progress:35,note:'Seguimiento técnico',actionType:'Pausa'}).expect(201);
  const list=await call(sstToken,'get','/sst/interventions').expect(200),item=list.body.data.find(i=>i.id===interventionId);
  assert.equal(item.target_desc,payload.target);assert.equal(item.external_action,true);assert.equal(item.assigned_to,'usr-2');
  assert.equal(item.start_date.slice(0,10),payload.startDate);assert.equal(item.seguimientos[0].progreso_reportado,35);
  assert.equal(item.seguimientos[0].autor_id,'usr-2');
  assert.equal(item.seguimientos[0].tipo_accion,'Pausa');
  assert.equal(item.seguimientos[0].fecha,currentJourney(0));
  const actions=(await call(supervisorToken,'get','/supervisor/actions').expect(200)).body.data;
  assert.equal(actions.find(row=>row.id===interventionId).seguimientos[0].nota_avance,'Seguimiento técnico');
  // El contrato permite consulta por ámbito incluso si el responsable es otro SST.
  await pool.query("UPDATE sst_intervenciones SET assigned_to='usr-3' WHERE id=$1",[interventionId]);
  const scoped=(await call(supervisorToken,'get','/supervisor/actions').expect(200)).body.data.find(row=>row.id===interventionId);
  assert.ok(scoped);assert.equal(scoped.assigned_to,'usr-3');
});

test('apoyo identificado conserva canal y franja; descripción opcional y tipo inválido devuelve 400',async()=>{
  const data={mode:'identificado',urgency:'baja',reason:'Fixture técnico',description:'Descripción técnica de prueba',contactPreference:'correo',timeWindow:'Tarde'};
  await call(agentToken,'post','/sst/support-requests',{...data,description:123}).expect(400);
  const optional=await call(agentToken,'post','/sst/support-requests',{...data,description:undefined}).expect(201);otherSupports.push(optional.body.data.id);
  const created=await call(agentToken,'post','/sst/support-requests',data).expect(201);otherSupports.push(created.body.data.id);
  const item=(await call(sstToken,'get','/sst/support-requests').expect(200)).body.data.find(r=>r.id===created.body.data.id);
  assert.equal(item.solicitante,'Fixture SST');assert.equal(item.contact_preference,'correo');assert.equal(item.time_window,'Tarde');
  const own=(await call(agentToken,'get','/agent/support-requests').expect(200)).body.data.find(r=>r.id===created.body.data.id);
  assert.equal(own.contact_preference,item.contact_preference);assert.equal(own.time_window,item.time_window);
});
test('apoyo conserva preferencias, omite identidad anónima y audita actor autenticado',async()=>{
  const created=await call(agentToken,'post','/sst/support-requests',{mode:'anonimo',urgency:'media',reason:'Fixture técnico',description:'Solicitud de prueba',contactPreference:'telefono',timeWindow:'10:00'}).expect(201);
  supportId=created.body.data.id;
  const list=await call(sstToken,'get','/sst/support-requests').expect(200),item=list.body.data.find(r=>r.id===supportId);
  assert.equal(item.solicitante,null);assert.equal(item.contact_preference,'app');assert.equal(item.time_window,'No aplica');assert.equal(item.owner_user_id,undefined);
  await call(sstToken,'patch',`/sst/support-requests/${supportId}/status`,{status:'En gestion'}).expect(200);
  const audit=await pool.query("SELECT usuario_id FROM auditoria_logs WHERE resource_id=$1 AND action='ACTUALIZACION_APOYO' ORDER BY id DESC LIMIT 1",[supportId]);
  assert.equal(audit.rows[0].usuario_id,'usr-3');
  await call(sstToken,'patch','/sst/support-requests/ajena/status',{status:'Cerrada'}).expect(404);
});
