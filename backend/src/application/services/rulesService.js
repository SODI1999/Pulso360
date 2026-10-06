import crypto from 'node:crypto';
import { transaction } from '../../infrastructure/db.js';
import { rulesRepository } from '../../infrastructure/repositories/rulesRepository.js';
import { AppError } from '../errors/AppError.js';
import { createLog } from '../../infrastructure/repositories/auditorRepository.js';
import { ruleEvaluationDefinition } from '../../domain/weeklyAlertRules.js';
import { alertJobRepository } from '../../infrastructure/repositories/alertJobRepository.js';
import { alertJobEnabled } from '../../infrastructure/alertJobConfig.js';

export async function listRules() {
  const enabled = alertJobEnabled() && await alertJobRepository.ready();
  return (await rulesRepository.list()).map(rule => {
    const definition = ruleEvaluationDefinition(rule);
    return {...rule,evaluation_supported:definition.supported,
      evaluation_reason:definition.reason || null,evaluation_enabled:enabled};
  });
}

export async function proposeRule(data, actor) {
  const metrics = ['Recuperación agregada','Carga emocional agregada','Percepción de ineficacia','Distanciamiento laboral','Sobrecarga percibida'];
  const operators = ['baje más de','baje mas de','supere el','supere'];
  if (!metrics.includes(data.metric) || !operators.includes(data.operator) ||
      !Number.isFinite(Number(data.value)) || Number(data.value) < 5 || Number(data.value) > 90 ||
      ![2,3,4].includes(Number(data.persistence)) || !['Baja','Media','Alta'].includes(data.severity) ||
      data.unit !== 'semanas') throw new AppError('Los campos de la propuesta son inválidos.', 'RULE_INVALID', 400);
  const scope = data.scope || 'cualquier equipo';
  return transaction(async client => {
    if (scope !== 'cualquier equipo') {
      if (!await rulesRepository.scopeExists(scope, client)) throw new AppError('Ámbito operativo no disponible.', 'RULE_SCOPE_INVALID', 400);
    }
    const id = 'rule-' + crypto.randomUUID();
    const row = await rulesRepository.createProposal({ ...data, id, value:Number(data.value),
      persistence:Number(data.persistence), scope, actorId:actor.id }, client);
    await createLog({ usuarioId: actor.id, rol: actor.rol_codigo, action: 'PROPUESTA_REGLA_ALERTA', resource: 'reglas_alerta', resourceId: id },client);
    return row;
  });
}

export async function approveRule(id, actor) {
  return transaction(async client => {
    const rule = await rulesRepository.findForUpdate(id, client);
    if (!rule) throw new AppError('Propuesta no encontrada.', 'RULE_NOT_FOUND',404);
    if (!rule.pending_approval) throw new AppError('La regla ya fue revisada.', 'RULE_ALREADY_REVIEWED',409);
    const row = await rulesRepository.approve(id, actor.id, client);
    await createLog({ usuarioId: actor.id, rol: actor.rol_codigo, action: 'APROBACION_REGLA_ALERTA', resource: 'reglas_alerta', resourceId: id },client);
    return row;
  });
}
