import {test,before,after,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import pool from '../../src/infrastructure/db.js';
import {runAlertWeek,runScheduledAlerts} from '../../src/application/services/weeklyAlertService.js';
import {alertJobRepository} from '../../src/infrastructure/repositories/alertJobRepository.js';
import {addDays,latestDueWeek,evaluateWeeklyRule} from '../../src/domain/weeklyAlertRules.js';
import {startAlertScheduler} from '../../src/jobs/alertScheduler.js';
import {listRules} from '../../src/application/services/rulesService.js';
import {createLog,verifyIntegrity} from '../../src/infrastructure/repositories/auditorRepository.js';

const fixture = 'fxj-' + crypto.randomUUID(), campaign = fixture, team = 'fxj-' + crypto.randomUUID();
const users = [], rules = [], runs = [], now = new Date('2030-01-07T11:00:00Z'), end = '2030-01-06';
let originalCursor;
const ruleData = {metrica:'Carga emocional agregada',operador:'supere el',valor_umbral:65,persistencia_periodos:2,unidad_tiempo:'semanas'};

before(async()=>{
  assert.equal(process.env.NODE_ENV,'test');
  assert.equal((await pool.query('SELECT current_database() AS name')).rows[0].name,process.env.DB_NAME_TEST);
  assert.notEqual(process.env.DB_NAME_TEST,process.env.DB_NAME);
  originalCursor = await alertJobRepository.cursor();
  await pool.query("INSERT INTO campanas(id,codigo,nombre,activa) VALUES($1,$2,'Fixture job semanal',TRUE)",[campaign,campaign.slice(0,20)]);
  await pool.query("INSERT INTO equipos(id,campana_id,codigo,nombre,activo) VALUES($1,$2,$3,'Fixture job equipo',TRUE)",[team,campaign,team.slice(0,20)]);
  await pool.query(`INSERT INTO politicas_privacidad(id,version,titulo,texto_politica,texto_aviso_privacidad,hash_contenido,estado)
    VALUES($1,$2,'Fixture política no vigente','Fixture','Fixture',$3,'BORRADOR')`,[fixture,fixture.slice(0,20),'0'.repeat(64)]);
  for(let index=0;index<5;index++) {
    const id='fxj-'+crypto.randomUUID();users.push(id);
    await pool.query(`INSERT INTO usuarios(id,rol_codigo,correo_institucional,contrasena_hash,nombres,apellidos,estado)
      SELECT $1,'AGENTE',$2,contrasena_hash,'Fixture','Job','Activo' FROM usuarios WHERE id='usr-1'`,[id,id+'@example.test']);
    await pool.query("INSERT INTO asignaciones_usuario_equipo(id,usuario_id,equipo_id,fecha_inicio,activa) VALUES($1,$2,$3,'2000-01-01',TRUE)",[id,id,team]);
    await pool.query(`INSERT INTO consentimientos(id,usuario_id,politica_id,tipo_evento,acepta_politica,c4_analitica)
      SELECT $1,$1,id,'ACTUALIZACION',TRUE,TRUE FROM politicas_privacidad WHERE estado='PUBLICADA' AND vigente_desde<=NOW()
      ORDER BY vigente_desde DESC,created_at DESC,id DESC LIMIT 1`,[id]);
  }
});

after(async()=>{
  // Solo fixtures propios. Los eventos de auditoría quedan para conservar la cadena.
  await pool.query('DELETE FROM alert_job_runs WHERE id=ANY($1::uuid[])',[runs]);
  await pool.query('DELETE FROM sst_alertas WHERE regla_id=ANY($1::varchar[])',[rules]);
  await pool.query('DELETE FROM reglas_alerta WHERE id=ANY($1::varchar[])',[rules]);
  await pool.query('DELETE FROM daily_checkins WHERE usuario_id=ANY($1::varchar[])',[users]);
  await pool.query('DELETE FROM consentimientos WHERE usuario_id=ANY($1::varchar[])',[users]);
  await pool.query('DELETE FROM asignaciones_usuario_equipo WHERE usuario_id=ANY($1::varchar[])',[users]);
  await pool.query('DELETE FROM usuarios WHERE id=ANY($1::varchar[])',[users]);
  await pool.query('DELETE FROM equipos WHERE id=$1',[team]);
  await pool.query('DELETE FROM campanas WHERE id=$1',[campaign]);
  await pool.query('DELETE FROM politicas_privacidad WHERE id=$1',[fixture]);
  if(originalCursor) await pool.query("UPDATE alert_job_state SET last_period_end=$1 WHERE job_name='weekly-alerts'",[originalCursor]);
  else await pool.query("DELETE FROM alert_job_state WHERE job_name='weekly-alerts'");
  await pool.end();
});

beforeEach(async()=>{
  await pool.query('UPDATE reglas_alerta SET activa=FALSE WHERE id=ANY($1::varchar[])',[rules]);
  await pool.query('DELETE FROM daily_checkins WHERE usuario_id=ANY($1::varchar[])',[users]);
  await pool.query('UPDATE consentimientos SET c4_analitica=TRUE,acepta_politica=TRUE WHERE usuario_id=ANY($1::varchar[])',[users]);
});

async function createRule(overrides={}) {
  const rule={...ruleData,id:'fxj-'+crypto.randomUUID(),alcance:team,...overrides};rules.push(rule.id);
  await pool.query(`INSERT INTO reglas_alerta(id,nombre,metrica,operador,valor_umbral,persistencia_periodos,unidad_tiempo,
    alcance,severidad,activa,pending_approval,aprobada_en,created_at)
    VALUES($1,'Fixture regla',$2,$3,$4,$5,$6,$7,'Media',TRUE,FALSE,'2000-01-01','2000-01-01')`,
  [rule.id,rule.metrica,rule.operador,rule.valor_umbral,rule.persistencia_periodos,rule.unidad_tiempo,rule.alcance]);
  return rule;
}
async function sampleWeeks(values,participants=5,field='carga_emocional') {
  for(let index=0;index<values.length;index++) {
    const date=addDays(end,-7*(values.length-1-index));
    for(const id of users.slice(0,participants)) {
      await pool.query(`INSERT INTO daily_checkins(id,usuario_id,asignacion_id,journey_key,checkin_date,${field}) VALUES($1,$2,$2,'REGULAR',$3,$4)`,
        ['fxj-'+crypto.randomUUID(),id,date,values[index]]);
    }
  }
}
async function run(options={}) {
  const result=await runAlertWeek({periodEnd:end,now,...options});
  if(result.runId) runs.push(result.runId);
  return result;
}
async function alerts(rule) { return (await pool.query('SELECT * FROM sst_alertas WHERE regla_id=$1',[rule.id])).rows; }
async function outcome(result,rule) {
  return (await pool.query('SELECT outcome FROM alert_job_evaluations WHERE run_id=$1 AND rule_id=$2',[result.runId,rule.id])).rows[0]?.outcome;
}

test('Bogotá: lunes 05:59 todavía no vence; 06:00 sí, martes y domingo usan el mismo cierre',()=>{
  assert.equal(latestDueWeek(new Date('2030-01-07T10:59:59Z')),'2029-12-30');
  for(const value of ['2030-01-07T11:00:00Z','2030-01-08T18:00:00Z','2030-01-13T23:00:00Z']) {
    assert.equal(latestDueWeek(new Date(value)),end);
  }
  assert.equal(latestDueWeek(new Date('2030-01-14T11:00:00Z')),'2030-01-13');
});

test('carga elevada genera snapshot persistente; reintento no duplica ni reabre una alerta descartada',async()=>{
  const rule=await createRule();await sampleWeeks([4,4]);
  const first=await run();assert.equal(await outcome(first,rule),'MATCHED');
  const [alert]=await alerts(rule);assert.equal(alert.respondents,5);assert.deepEqual(alert.evidence,[80,80]);
  assert.equal(alert.status,'GENERADA');assert.equal(alert.owner_id,null);
  assert.equal(alert.evaluation_metadata.comparison,'ABOVE_SCORE');
  assert.deepEqual(alert.evaluation_metadata.weeks.at(-1),{desde:'2029-12-31',hasta:end});
  assert.equal(JSON.stringify(alert.evaluation_metadata).includes(users[0]),false);
  await pool.query("UPDATE sst_alertas SET status='DESCARTADA',dismiss_reason='Fixture revisión' WHERE id=$1",[alert.id]);
  const second=await run();assert.equal(await outcome(second,rule),'ALREADY_EXISTS');
  assert.equal((await alerts(rule)).length,1);assert.equal((await alerts(rule))[0].status,'DESCARTADA');
  const audit=(await pool.query("SELECT * FROM auditoria_logs WHERE resource_id=$1 AND action='GENERACION_ALERTA_SEMANAL'",[alert.id])).rows;
  assert.equal(audit.length,1);assert.equal(audit[0].usuario_id,null);assert.equal(audit[0].rol,null);
  assert.equal(audit[0].details.source,'weekly-alert-job');
});

test('caída relativa: tres descensos requieren cuatro semanas; un rebote rompe la persistencia',async()=>{
  const rule=await createRule({metrica:'Recuperacion agregada',operador:'baje mas de',valor_umbral:15,persistencia_periodos:3});
  await sampleWeeks([5,4,3,2],5,'recuperacion');
  const first=await run();assert.equal(await outcome(first,rule),'MATCHED');
  assert.deepEqual((await alerts(rule))[0].evidence,[100,80,60,40]);
  const samples=[100,80,90,40].map(value=>({value,participants:5}));
  assert.equal(evaluateWeeklyRule(rule,samples).outcome,'NOT_MATCHED');
  assert.equal(evaluateWeeklyRule(rule,samples.slice(1)).outcome,'INSUFFICIENT_DATA');
});

test('N=4, muchas filas de cuatro personas y dimensión omitida nunca generan alerta',async()=>{
  const rule=await createRule();await sampleWeeks([4,4],4);
  for(const id of users.slice(0,4)) await pool.query(`INSERT INTO daily_checkins(id,usuario_id,asignacion_id,journey_key,checkin_date,carga_emocional)
    VALUES($1,$2,$2,'REGULAR','2030-01-05',5)`,['fxj-'+crypto.randomUUID(),id]);
  const first=await run();assert.equal(await outcome(first,rule),'INSUFFICIENT_DATA');
  await pool.query("INSERT INTO daily_checkins(id,usuario_id,asignacion_id,journey_key,checkin_date,recuperacion) VALUES($1,$2,$2,'REGULAR',$3,4)",
    ['fxj-'+crypto.randomUUID(),users[4],end]);
  const second=await run();assert.equal(await outcome(second,rule),'INSUFFICIENT_DATA');
  assert.equal((await alerts(rule)).length,0);
  const stored=(await pool.query('SELECT * FROM alert_job_evaluations WHERE run_id=$1 AND rule_id=$2',[second.runId,rule.id])).rows[0];
  assert.equal(Object.hasOwn(stored,'evidence'),false);
});

test('C4 revocado o política no vigente, semana ausente y condición incumplida se distinguen sin ceros fabricados',async()=>{
  const rule=await createRule();await sampleWeeks([4,4]);
  await pool.query('UPDATE consentimientos SET c4_analitica=FALSE WHERE usuario_id=$1',[users[4]]);
  assert.equal(await outcome(await run(),rule),'INSUFFICIENT_DATA');
  await pool.query('UPDATE consentimientos SET c4_analitica=TRUE,politica_id=$2 WHERE usuario_id=$1',[users[4],fixture]);
  assert.equal(await outcome(await run(),rule),'INSUFFICIENT_DATA');
  await pool.query(`UPDATE consentimientos SET politica_id=(SELECT id FROM politicas_privacidad WHERE estado='PUBLICADA'
    AND vigente_desde<=NOW() ORDER BY vigente_desde DESC,created_at DESC,id DESC LIMIT 1) WHERE usuario_id=$1`,[users[4]]);
  await pool.query('DELETE FROM daily_checkins WHERE usuario_id=ANY($1::varchar[]) AND checkin_date<$2',[users,end]);
  assert.equal(await outcome(await run(),rule),'INSUFFICIENT_DATA');
  await pool.query('DELETE FROM daily_checkins WHERE usuario_id=ANY($1::varchar[])',[users]);
  await sampleWeeks([3,4]);
  assert.equal(await outcome(await run(),rule),'NOT_MATCHED');assert.equal((await alerts(rule)).length,0);
});

test('propuesta, regla inactiva o aprobada después del cierre no emiten; Sobrecarga queda sin evaluación',async()=>{
  const rule=await createRule();await sampleWeeks([5,5]);
  await pool.query('UPDATE reglas_alerta SET pending_approval=TRUE WHERE id=$1',[rule.id]);
  assert.equal(await outcome(await run(),rule),undefined);
  await pool.query('UPDATE reglas_alerta SET pending_approval=FALSE,activa=FALSE WHERE id=$1',[rule.id]);
  assert.equal(await outcome(await run(),rule),undefined);
  await pool.query("UPDATE reglas_alerta SET activa=TRUE,aprobada_en='2030-01-07T00:00:00-05:00' WHERE id=$1",[rule.id]);
  assert.equal(await outcome(await run(),rule),'BEFORE_APPROVAL');
  const unsupported=await createRule({metrica:'Sobrecarga percibida'});
  assert.equal(await outcome(await run(),unsupported),'UNSUPPORTED_METRIC');
  const previous=process.env.ALERT_JOB_ENABLED;process.env.ALERT_JOB_ENABLED='true';
  try { const row=(await listRules()).find(item=>item.id===unsupported.id);assert.equal(row.evaluation_supported,false);assert.equal(row.evaluation_enabled,true); }
  finally { if(previous===undefined)delete process.env.ALERT_JOB_ENABLED;else process.env.ALERT_JOB_ENABLED=previous; }
});

test('ámbito campaña usa solo sus equipos; equipo inactivo o inexistente no produce alertas',async()=>{
  const rule=await createRule({alcance:campaign});await sampleWeeks([4,4]);
  assert.equal(await outcome(await run(),rule),'MATCHED');assert.equal((await alerts(rule))[0].equipo_id,null);
  const invalid=await createRule({alcance:'fxj-inexistente'});
  assert.equal(await outcome(await run(),invalid),undefined);assert.equal((await alerts(invalid)).length,0);
  await pool.query('UPDATE equipos SET activo=FALSE WHERE id=$1',[team]);
  try { assert.equal(await outcome(await run(),rule),'INSUFFICIENT_DATA'); }
  finally { await pool.query('UPDATE equipos SET activo=TRUE WHERE id=$1',[team]); }
});

test('bloqueo entre instancias: un proceso ocupado no escribe; ejecuciones concurrentes conservan una sola alerta',async()=>{
  const rule=await createRule();await sampleWeeks([4,4]);
  const client=await pool.connect();
  try {
    await client.query('BEGIN');assert.equal(await alertJobRepository.lock(client),true);
    assert.deepEqual(await run(),{status:'BUSY'});
  } finally { await client.query('ROLLBACK');client.release(); }
  const results=await Promise.all([run(),run()]);
  assert.equal(results.reduce((sum,result)=>sum+(result.generated||0),0),1);
  assert.equal((await alerts(rule)).length,1);
});

test('auditoría del job y operaciones concurrentes mantienen enlaces y contenido verificables',async()=>{
  const rule=await createRule();await sampleWeeks([4,4]);
  const [result,event]=await Promise.all([run(),createLog({action:'FIXTURE_JOB_CONCURRENT',resource:'fixture'})]);
  const jobLogs=(await pool.query('SELECT id FROM auditoria_logs WHERE resource_id=ANY($1::text[])',
    [ [result.runId,...(await alerts(rule)).map(row=>row.id)] ])).rows;
  const ids=new Set([...jobLogs.map(row=>String(row.id)),String(event.id)]);
  assert.ok(jobLogs.length>=2);
  const integrity=await verifyIntegrity();
  assert.equal(integrity.failures.some(failure=>ids.has(failure.id)),false);
});

test('fallo revierte alerta, auditoría y cursor; el reintento completa y recupera cierres pendientes',async()=>{
  const rule=await createRule();await sampleWeeks([4,4]);
  await pool.query(`INSERT INTO alert_job_state(job_name,last_period_end) VALUES('weekly-alerts',$1)
    ON CONFLICT(job_name) DO UPDATE SET last_period_end=EXCLUDED.last_period_end`,[addDays(end,-7)]);
  const record=alertJobRepository.recordEvaluation;
  alertJobRepository.recordEvaluation=async(...args)=>{ if(args[1]===rule.id)throw new Error('Fixture fallo después de insertar');return record.apply(alertJobRepository,args); };
  try { await assert.rejects(run({advanceCursor:true}),/Fixture fallo/); }
  finally { alertJobRepository.recordEvaluation=record; }
  const failed=(await pool.query("SELECT * FROM alert_job_runs WHERE status='FAILED' AND period_end=$1 ORDER BY created_at DESC LIMIT 1",[end])).rows[0];runs.push(failed.id);
  assert.equal(failed.error_code,'EVALUATION_FAILED');assert.equal((await alerts(rule)).length,0);
  assert.equal(await alertJobRepository.cursor(),addDays(end,-7));
  const scheduled=await runScheduledAlerts(now);runs.push(...scheduled.runs.map(result=>result.runId).filter(Boolean));
  assert.equal((await alerts(rule)).length,1);assert.equal(await alertJobRepository.cursor(),end);
  assert.deepEqual((await runScheduledAlerts(now)).runs,[]);
  const later=await runScheduledAlerts(new Date('2030-01-21T11:00:00Z'));runs.push(...later.runs.map(result=>result.runId).filter(Boolean));
  assert.deepEqual(later.runs.map(result=>result.periodEnd),['2030-01-13','2030-01-20']);
  assert.equal(await alertJobRepository.cursor(),'2030-01-20');
});

test('planificador: deshabilitado no ejecuta, no solapa ticks, se detiene y reintenta tras error',async()=>{
  let calls=0,release;
  const disabled=startAlertScheduler({enabled:false,run:async()=>{calls++;}});
  await disabled.tick();await disabled.stop();assert.equal(calls,0);
  const scheduler=startAlertScheduler({enabled:true,intervalMs:600000,
    run:()=>{calls++;return new Promise(resolve=>release=resolve);},onResult:()=>{}});
  await scheduler.tick();assert.equal(calls,1);release({status:'CHECKED'});await scheduler.stop();
  await scheduler.tick();assert.equal(calls,1);
  let errors=0,attempts=0;
  const retry=startAlertScheduler({enabled:true,intervalMs:600000,run:async()=>{
    if(++attempts===1)throw new Error('Fixture');return {status:'CHECKED',runs:[]};
  },onError:()=>{errors++;},onResult:()=>{}});
  // Esperar a que termine el primer tick fallido antes de solicitar el reintento.
  await new Promise(resolve=>setImmediate(resolve));
  await retry.tick();await retry.stop();assert.equal(errors,1);assert.equal(attempts,2);
});

test('umbral estricto: igualdad no cumple; una dimensión con null permanece no evaluable',()=>{
  assert.equal(evaluateWeeklyRule(ruleData,[{value:65,participants:5},{value:80,participants:5}]).outcome,'NOT_MATCHED');
  assert.equal(evaluateWeeklyRule({...ruleData,operador:'baje más de',valor_umbral:15},
    [100,85,60].map(value=>({value,participants:5}))).outcome,'NOT_MATCHED');
  assert.equal(evaluateWeeklyRule(ruleData,[{value:null,participants:5},{value:80,participants:5}]).outcome,'INSUFFICIENT_DATA');
});

test('no acepta fecha futura ni una semana todavía sin vencer',async()=>{
  await assert.rejects(run({periodEnd:'2030-01-13'}),/cerradas/);
  await assert.rejects(run({now:new Date('2030-01-07T10:00:00Z')}),/cerradas/);
  await assert.rejects(run({periodEnd:'2030-01-05'}),/cerradas/);
});
