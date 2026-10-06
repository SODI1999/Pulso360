import crypto from 'node:crypto';
import { transaction } from '../../infrastructure/db.js';
import { alertJobRepository } from '../../infrastructure/repositories/alertJobRepository.js';
import { analyticsRepository } from '../../infrastructure/repositories/analyticsRepository.js';
import { addDays, latestDueWeek, ruleEvaluationDefinition, evaluateWeeklyRule } from '../../domain/weeklyAlertRules.js';
import { isCalendarDate } from '../../domain/calendarDate.js';

export async function runAlertWeek({periodEnd, now = new Date(), advanceCursor = false}) {
  if (!isCalendarDate(periodEnd) || new Date(periodEnd + 'T12:00:00Z').getUTCDay() !== 0 || periodEnd > latestDueWeek(now)) {
    throw new Error('Solo se pueden evaluar semanas cerradas y vencidas.');
  }
  const runId = crypto.randomUUID();
  try {
    return await transaction(async client => {
      if (!await alertJobRepository.lock(client)) return {status:'BUSY'};
      // Otra instancia pudo completar esta semana mientras esperábamos la conexión.
      if (advanceCursor && await alertJobRepository.cursor(client) >= periodEnd) return {status:'ALREADY_COMPLETED'};
      await alertJobRepository.createRun(runId,periodEnd,client);
      const summary = {periodEnd,evaluated:0,generated:0,outcomes:{}};
      const count = outcome => { summary.outcomes[outcome] = (summary.outcomes[outcome] || 0) + 1; };
      for (const rule of await alertJobRepository.approvedRules(client)) {
        const definition = ruleEvaluationDefinition(rule);
        const scopes = await alertJobRepository.scopes(rule,client);
        if (!scopes.length) count('NO_ACTIVE_SCOPE');
        for (const scope of scopes) {
          let result;
          // No emitir retrospectivamente una regla que se aprobó después del cierre.
          const approvedAt = rule.aprobada_en || rule.created_at;
          if (approvedAt && new Date(approvedAt) >= new Date(addDays(periodEnd,1) + 'T00:00:00-05:00')) {
            result = {outcome:'BEFORE_APPROVAL'};
          } else if (!definition.supported) {
            result = {outcome:definition.reason};
          } else {
            const needed = definition.periods + (definition.falling ? 1 : 0);
            const samples = [];
            for (let index = needed - 1; index >= 0; index--) {
              const end = addDays(periodEnd,-index * 7), start = addDays(end,-6);
              const snapshot = await analyticsRepository.getSnapshot({campanaId:scope.campana_id,
                equipoId:scope.equipo_id || undefined,desde:start,hasta:end,activeOnly:true},client);
              const average = snapshot.metrics?.[definition.field];
              // La escala /100 coincide con las vistas actuales: promedio de 1..5 * 20.
              samples.push({start,end,participants:snapshot.participant_counts?.[definition.field] || 0,
                value:average == null ? null : Number((average * 20).toFixed(1))});
            }
            result = evaluateWeeklyRule(rule,samples);
            if (result.outcome === 'MATCHED') {
              const condition = definition.falling
                ? `${rule.metrica} descendió más de ${definition.threshold}% respecto a la semana anterior durante ${definition.periods} semanas consecutivas.`
                : `${rule.metrica} superó ${definition.threshold} / 100 durante ${definition.periods} semanas consecutivas.`;
              const description = `${condition} Periodo evaluado: ${samples[0].start} a ${periodEnd}.`;
              const created = await alertJobRepository.createAlert({rule,scope,periodEnd,
                respondents:result.respondents,values:result.values,description,
                metadata:{version:1,metric:rule.metrica,operator:rule.operador,threshold:definition.threshold,
                  persistence:definition.periods,comparison:definition.falling?'RELATIVE_PREVIOUS_WEEK':'ABOVE_SCORE',
                  weeks:samples.map(sample=>({desde:sample.start,hasta:sample.end}))}},client);
              if (created) summary.generated++;
              else result = {outcome:'ALREADY_EXISTS'};
            }
          }
          summary.evaluated++;
          count(result.outcome);
          await alertJobRepository.recordEvaluation(runId,rule.id,scope,result.outcome,client);
        }
      }
      await alertJobRepository.completeRun(runId,summary,client);
      if (advanceCursor) await alertJobRepository.advanceCursor(periodEnd,client);
      return {status:'COMPLETED',runId,...summary};
    });
  } catch (error) {
    await alertJobRepository.failedRun(runId,periodEnd);
    throw error;
  }
}

export async function runScheduledAlerts(now = new Date()) {
  if (!await alertJobRepository.ready()) return {status:'MIGRATION_REQUIRED'};
  const latest = latestDueWeek(now);
  // Primer arranque: última semana vencida; después se recuperan cierres pendientes.
  await alertJobRepository.initializeCursor(addDays(latest,-7));
  let cursor = await alertJobRepository.cursor();
  const runs = [];
  // Acotar trabajo por pasada; las siguientes recuperan el resto sin saltar semanas.
  while (cursor < latest && runs.length < 8) {
    const periodEnd = addDays(cursor,7);
    const result = await runAlertWeek({periodEnd,now,advanceCursor:true});
    runs.push(result);
    if (result.status === 'BUSY') break;
    cursor = await alertJobRepository.cursor();
  }
  return {status:'CHECKED',runs};
}
