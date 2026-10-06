import { isCalendarDate } from './calendarDate.js';
import { K_ANONYMITY_THRESHOLD } from './privacyRules.js';

const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const metricFields = {
  'recuperacion agregada': 'recuperacion',
  'carga emocional agregada': 'carga_emocional',
  'percepcion de ineficacia': 'ineficacia',
  'distanciamiento laboral': 'distanciamiento'
};

export function addDays(date, days) {
  if (!isCalendarDate(date)) throw new Error('Fecha de evaluación inválida.');
  const value = new Date(date + 'T12:00:00Z');
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

// Una semana se evalúa desde el lunes a las 06:00 de Bogotá (UTC-5).
export function latestDueWeek(now = new Date()) {
  if (!Number.isFinite(now.getTime())) throw new Error('Reloj inválido.');
  const local = new Date(now.getTime() - 5 * 60 * 60 * 1000);
  const today = local.toISOString().slice(0, 10);
  const sinceMonday = (local.getUTCDay() + 6) % 7;
  const monday = addDays(today, -sinceMonday);
  return addDays(monday, sinceMonday === 0 && local.getUTCHours() < 6 ? -8 : -1);
}

export function ruleEvaluationDefinition(rule) {
  const field = metricFields[normalize(rule.metrica)];
  const operator = normalize(rule.operador);
  if (!field) return { supported: false, reason: 'UNSUPPORTED_METRIC' };
  if (!['supere', 'supere el', 'baje mas de'].includes(operator) ||
      rule.unidad_tiempo !== 'semanas' || ![2, 3, 4].includes(Number(rule.persistencia_periodos)) ||
      !Number.isFinite(Number(rule.valor_umbral)) || Number(rule.valor_umbral) < 5 || Number(rule.valor_umbral) > 90) {
    return { supported: false, reason: 'UNSUPPORTED_RULE' };
  }
  return { supported: true, field, falling: operator === 'baje mas de',
    periods: Number(rule.persistencia_periodos), threshold: Number(rule.valor_umbral) };
}

export function evaluateWeeklyRule(rule, samples) {
  const definition = ruleEvaluationDefinition(rule);
  if (!definition.supported) return { outcome: definition.reason };
  const needed = definition.periods + (definition.falling ? 1 : 0);
  if (samples.length !== needed || samples.some(sample =>
    sample.participants < K_ANONYMITY_THRESHOLD || sample.value == null || !Number.isFinite(sample.value))) {
    return { outcome: 'INSUFFICIENT_DATA' };
  }
  const matches = definition.falling
    ? samples.slice(1).every((sample, index) => samples[index].value > 0 &&
      ((samples[index].value - sample.value) / samples[index].value) * 100 > definition.threshold)
    : samples.every(sample => sample.value > definition.threshold);
  return { outcome: matches ? 'MATCHED' : 'NOT_MATCHED',
    respondents: Math.min(...samples.map(sample => sample.participants)),
    values: samples.map(sample => sample.value) };
}
