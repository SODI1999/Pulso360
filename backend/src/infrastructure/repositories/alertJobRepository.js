import crypto from 'node:crypto';
import pool, {transaction} from '../db.js';
import { createLog } from './auditorRepository.js';

export const alertJobRepository = {
  async ready(client = pool) {
    const result = await client.query("SELECT to_regclass('public.alert_job_state') IS NOT NULL AS ready");
    return result.rows[0].ready;
  },
  async lock(client) {
    return (await client.query('SELECT pg_try_advisory_xact_lock(360021) AS acquired')).rows[0].acquired;
  },
  async initializeCursor(periodEnd) {
    await pool.query(`INSERT INTO alert_job_state(job_name,last_period_end) VALUES('weekly-alerts',$1)
      ON CONFLICT(job_name) DO NOTHING`, [periodEnd]);
  },
  async cursor(client = pool) {
    return (await client.query("SELECT last_period_end::text AS period_end FROM alert_job_state WHERE job_name='weekly-alerts'")).rows[0]?.period_end;
  },
  async advanceCursor(periodEnd, client) {
    await client.query(`UPDATE alert_job_state SET last_period_end=GREATEST(last_period_end,$1::date)
      WHERE job_name='weekly-alerts'`, [periodEnd]);
  },
  async approvedRules(client) {
    return (await client.query(`SELECT * FROM reglas_alerta WHERE activa=TRUE AND pending_approval=FALSE
      ORDER BY id FOR SHARE`)).rows;
  },
  async scopes(rule, client) {
    if (rule.alcance === 'cualquier equipo') {
      return (await client.query(`SELECT e.campana_id,e.id AS equipo_id FROM equipos e
        JOIN campanas c ON c.id=e.campana_id WHERE e.activo=TRUE AND c.activa=TRUE ORDER BY e.id`)).rows;
    }
    return (await client.query(`SELECT c.id AS campana_id,NULL::varchar AS equipo_id
      FROM campanas c WHERE c.id=$1 AND c.activa=TRUE
      UNION ALL SELECT e.campana_id,e.id AS equipo_id FROM equipos e
      JOIN campanas c ON c.id=e.campana_id WHERE e.id=$1 AND e.activo=TRUE AND c.activa=TRUE`, [rule.alcance])).rows;
  },
  async createRun(id, periodEnd, client) {
    await client.query("INSERT INTO alert_job_runs(id,period_end,status) VALUES($1,$2,'COMPLETED')", [id,periodEnd]);
  },
  async recordEvaluation(runId, ruleId, scope, outcome, client) {
    await client.query(`INSERT INTO alert_job_evaluations(run_id,rule_id,campana_id,equipo_id,outcome)
      VALUES($1,$2,$3,$4,$5)`, [runId,ruleId,scope.campana_id,scope.equipo_id,outcome]);
  },
  async createAlert({rule, scope, periodEnd, respondents, values, metadata, description}, client) {
    const id = 'alt-' + crypto.randomUUID();
    const result = await client.query(`INSERT INTO sst_alertas
      (id,regla_id,campana_id,equipo_id,alert_date,severity,respondents,status,description,evidence,period_end,evaluation_metadata)
      VALUES($1,$2,$3,$4,$5,$6,$7,'GENERADA',$8,$9,$5,$10) ON CONFLICT DO NOTHING RETURNING id`,
    [id,rule.id,scope.campana_id,scope.equipo_id,periodEnd,rule.severidad,respondents,description,JSON.stringify(values),JSON.stringify(metadata)]);
    if (!result.rowCount) return false;
    await createLog({action:'GENERACION_ALERTA_SEMANAL',resource:'sst_alertas',resourceId:id,
      details:{source:'weekly-alert-job',ruleId:rule.id,periodEnd}},client);
    return true;
  },
  async completeRun(id, summary, client) {
    await client.query('UPDATE alert_job_runs SET summary=$2 WHERE id=$1', [id,summary]);
    await createLog({action:'EVALUACION_REGLAS_SEMANALES',resource:'alert_job_runs',resourceId:id,
      details:{source:'weekly-alert-job',...summary}},client);
  },
  async failedRun(id, periodEnd) {
    // No almacenar mensajes de SQL, respuestas personales ni credenciales.
    await transaction(async client => {
      await client.query(`INSERT INTO alert_job_runs(id,period_end,status,error_code)
        VALUES($1,$2,'FAILED','EVALUATION_FAILED')`, [id,periodEnd]);
      await createLog({action:'FALLO_EVALUACION_SEMANAL',resource:'alert_job_runs',resourceId:id,
        details:{source:'weekly-alert-job',periodEnd,errorCode:'EVALUATION_FAILED'}},client);
    });
  }
};
