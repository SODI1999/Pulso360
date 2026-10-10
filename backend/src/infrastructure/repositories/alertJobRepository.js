/**
 * @fileoverview Repositorio para ejecución, cursor temporal y persistencia del job semanal de evaluación de alertas preventivas.
 * Capa: P10 · infrastructure/repositories
 * @module infrastructure/repositories/alertJobRepository
 */
import crypto from 'node:crypto';
import pool, {transaction} from '../db.js';
import { createLog } from './auditorRepository.js';

export const alertJobRepository = {
  /**
   * Verifica si la tabla de estado del job de alertas (alert_job_state) existe en el catálogo de PostgreSQL.
   *
   * @param {import('pg').PoolClient|import('pg').Pool} [client=pool] - Cliente de base de datos.
   * @returns {Promise<boolean>} True si la tabla existe.
   */
  async ready(client = pool) {
    const result = await client.query("SELECT to_regclass('public.alert_job_state') IS NOT NULL AS ready");
    return result.rows[0].ready;
  },

  /**
   * Intenta adquirir un bloqueo no bloqueante por asesoría (lock ID 360021) para exclusión mutua de ejecución del job.
   *
   * @param {import('pg').PoolClient} client - Cliente transaccional.
   * @returns {Promise<boolean>} True si el bloqueo fue adquirido satisfactoriamente.
   */
  async lock(client) {
    return (await client.query('SELECT pg_try_advisory_xact_lock(360021) AS acquired')).rows[0].acquired;
  },
  /**
   * Inicializa el cursor del período evaluado si no existe previamente.
   *
   * @param {string} periodEnd - Fecha de fin de período (YYYY-MM-DD).
   * @returns {Promise<void>}
   */
  async initializeCursor(periodEnd) {
    await pool.query(`INSERT INTO alert_job_state(job_name,last_period_end) VALUES('weekly-alerts',$1)
      ON CONFLICT(job_name) DO NOTHING`, [periodEnd]);
  },

  /**
   * Obtiene la fecha del último corte de período evaluado por el job.
   *
   * @param {import('pg').PoolClient|import('pg').Pool} [client=pool] - Cliente de base de datos.
   * @returns {Promise<string|undefined>} Fecha del período como string YYYY-MM-DD.
   */
  async cursor(client = pool) {
    return (await client.query("SELECT last_period_end::text AS period_end FROM alert_job_state WHERE job_name='weekly-alerts'")).rows[0]?.period_end;
  },

  /**
   * Hace avanzar el cursor de períodos evaluados asegurando avance monotónico.
   *
   * @param {string} periodEnd - Nueva fecha de período evaluado.
   * @param {import('pg').PoolClient} client - Cliente transaccional.
   * @returns {Promise<void>}
   */
  async advanceCursor(periodEnd, client) {
    await client.query(`UPDATE alert_job_state SET last_period_end=GREATEST(last_period_end,$1::date)
      WHERE job_name='weekly-alerts'`, [periodEnd]);
  },
  /**
   * Consulta las reglas de alerta activas y formalmente aprobadas con bloqueo FOR SHARE.
   *
   * @param {import('pg').PoolClient} client - Cliente transaccional.
   * @returns {Promise<Array<Object>>} Lista de reglas evaluables.
   */
  async approvedRules(client) {
    return (await client.query(`SELECT * FROM reglas_alerta WHERE activa=TRUE AND pending_approval=FALSE
      ORDER BY id FOR SHARE`)).rows;
  },

  /**
   * Resuelve la lista de alcances (pares de campaña y equipo) a evaluar para una regla según su configuración.
   *
   * @param {Object} rule - Objeto de regla de alerta con propiedad alcance.
   * @param {import('pg').PoolClient} client - Cliente transaccional.
   * @returns {Promise<Array<{campana_id: string, equipo_id: string|null}>>} Ámbitos aplicables.
   */
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
  /**
   * Registra el inicio de una corrida del job de alertas en alert_job_runs.
   *
   * @param {string} id - Identificador UUID de la corrida.
   * @param {string} periodEnd - Fecha de fin de período evaluado (YYYY-MM-DD).
   * @param {import('pg').PoolClient} client - Cliente transaccional.
   * @returns {Promise<void>}
   */
  async createRun(id, periodEnd, client) {
    await client.query("INSERT INTO alert_job_runs(id,period_end,status) VALUES($1,$2,'COMPLETED')", [id,periodEnd]);
  },

  /**
   * Registra la evaluación individual de una regla sobre un ámbito específico.
   *
   * @param {string} runId - Identificador de la corrida del job.
   * @param {string} ruleId - Identificador de la regla evaluada.
   * @param {{campana_id: string, equipo_id: string|null}} scope - Ámbito evaluado.
   * @param {string} outcome - Resultado de la evaluación ('TRIGGERED', 'EVALUATED_NO_TRIGGER', etc.).
   * @param {import('pg').PoolClient} client - Cliente transaccional.
   * @returns {Promise<void>}
   */
  async recordEvaluation(runId, ruleId, scope, outcome, client) {
    await client.query(`INSERT INTO alert_job_evaluations(run_id,rule_id,campana_id,equipo_id,outcome)
      VALUES($1,$2,$3,$4,$5)`, [runId,ruleId,scope.campana_id,scope.equipo_id,outcome]);
  },
  /**
   * Inserta una alerta preventiva emitida por el job en sst_alertas con log de auditoría atómico.
   *
   * @param {Object} params - Datos de la alerta.
   * @param {Object} params.rule - Objeto de la regla detonada.
   * @param {{campana_id: string, equipo_id: string|null}} params.scope - Ámbito de la alerta.
   * @param {string} params.periodEnd - Fecha de fin de período evaluado.
   * @param {number} params.respondents - Cantidad de participantes en la cohorte.
   * @param {Object} params.values - Evidencia cuantitativa evaluada.
   * @param {Object} params.metadata - Metadatos de la evaluación.
   * @param {string} params.description - Descripción generada de la alerta.
   * @param {import('pg').PoolClient} client - Cliente transaccional.
   * @returns {Promise<boolean>} True si la alerta fue insertada satisfactoriamente.
   */
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

  /**
   * Finaliza una corrida exitosa del job actualizando su resumen y emitiendo auditoría.
   *
   * @param {string} id - Identificador de la corrida.
   * @param {Object} summary - Objeto de resumen con conteos de evaluaciones y alertas.
   * @param {import('pg').PoolClient} client - Cliente transaccional.
   * @returns {Promise<void>}
   */
  async completeRun(id, summary, client) {
    await client.query('UPDATE alert_job_runs SET summary=$2 WHERE id=$1', [id,summary]);
    await createLog({action:'EVALUACION_REGLAS_SEMANALES',resource:'alert_job_runs',resourceId:id,
      details:{source:'weekly-alert-job',...summary}},client);
  },

  /**
   * Registra una corrida fallida con código de error normalizado y log de auditoría (sin registrar trazas SQL ni PII).
   *
   * @param {string} id - Identificador de la corrida fallida.
   * @param {string} periodEnd - Fecha de fin de período evaluado.
   * @returns {Promise<void>}
   */
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
