export function normalizeRule(row) {
  return { ...row, metric:row.metrica ?? row.metric, operator:row.operador ?? row.operator,
    value:Number(row.valor_umbral ?? row.value), persistence:row.persistencia_periodos ?? row.persistence,
    unit:row.unidad_tiempo ?? row.unit, scope:row.alcance ?? row.scope, severity:row.severidad ?? row.severity,
    active:row.activa ?? row.active, pendingApproval:row.pending_approval ?? row.pendingApproval };
}

export function ruleScopeLabel(scope, scopes = []) {
  return scopes.find(item => item.campana_id === scope)?.campana_nombre || scope;
}
