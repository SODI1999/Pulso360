import { pulsoStore } from '../../../core/storage/pulsoStore';

export function updateStatus(alertId, newStatus, user) {
  const storeData = pulsoStore.get();
  const alertItem = (storeData.alerts || []).find((a) => a.id === alertId);
  if (!alertItem) return null;

  alertItem.status = newStatus;
  pulsoStore.save(storeData);

  pulsoStore.audit({
    actor: `${user?.name || 'Profesional SST'} (${user?.role || 'sst'})`,
    action: 'CAMBIO_ESTADO_ALERTA',
    target: `${alertItem.id} (${alertItem.rule}) -> ${newStatus}`
  });
  return { alertItem };
}

export function confirmDismiss(alertId, reason, user) {
  const storeData = pulsoStore.get();
  const alertItem = (storeData.alerts || []).find((a) => a.id === alertId);
  if (!alertItem) return null;

  alertItem.status = 'DESCARTADA';
  alertItem.dismissReason = reason;
  pulsoStore.save(storeData);

  pulsoStore.audit({
    actor: `${user?.name || 'Profesional SST'} (${user?.role || 'sst'})`,
    action: 'DESCARTE_ALERTA',
    target: `${alertItem.id} -> DESCARTADA | Justificación: "${reason}"`
  });
  return {};
}

export function createIntervention(alertItem, user) {
  const storeData = pulsoStore.get();
  const targetAlert = (storeData.alerts || []).find((a) => a.id === alertItem.id);
  if (!targetAlert) return null;

  const newIntervention = {
    id: `int-${Date.now()}`,
    alertId: targetAlert.id,
    title: `Plan preventivo · ${targetAlert.rule}`,
    type: 'Pausas cognitivas',
    campaign: targetAlert.campaign,
    team: targetAlert.team,
    creator: user?.id || 'usr-3',
    assignedTo: 'usr-2',
    status: 'Planeada',
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date(Date.now() + 28 * 86400000).toISOString().substring(0, 10),
    indicator: 'Recuperación agregada',
    baseline: targetAlert.evidence?.slice(-1)[0] || 58,
    after: null,
    progress: 0,
    target: 'Intervención preventiva coordinada con supervisión para mitigar la tendencia de alerta.',
    externalAction: true
  };

  storeData.interventions = storeData.interventions || [];
  storeData.interventions.unshift(newIntervention);

  targetAlert.status = 'INTERVENCION_CREADA';
  targetAlert.interventionId = newIntervention.id;
  pulsoStore.save(storeData);

  pulsoStore.audit({
    actor: `${user?.name || 'Profesional SST'} (${user?.role || 'sst'})`,
    action: 'CREACION_INTERVENCION_DESDE_ALERTA',
    target: `${newIntervention.title} asignada a ${targetAlert.campaign}`
  });
  return {};
}
