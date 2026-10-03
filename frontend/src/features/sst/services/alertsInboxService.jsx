import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export async function updateStatus(alertId, newStatus, user) {
  if (!env.useMockStorage && getAuthToken()) {
    try {
      const res = await apiClient.patch('/sst/alerts/' + alertId, { status: newStatus });
      return { alertItem: res.data };
    } catch (error) {
      return { error: error.response?.data?.error?.message || 'Error al actualizar alerta en el servidor' };
    }
  }

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

export async function confirmDismiss(alertId, reason, user) {
  if (!env.useMockStorage && getAuthToken()) {
    try {
      await apiClient.patch('/sst/alerts/' + alertId, { status: 'DESCARTADA', dismissReason: reason });
      return {};
    } catch (error) {
      return { error: error.response?.data?.error?.message || 'Error al descartar alerta en el servidor' };
    }
  }

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

export async function createIntervention(alertItem, user) {
  if (!env.useMockStorage && getAuthToken()) {
    try {
      await apiClient.post('/sst/interventions', {
        alertaId: alertItem.id,
        title: `Plan preventivo · ${alertItem.rule}`,
        type: 'Pausas cognitivas',
        campanaId: alertItem.campaignId || 'camp-1',
        equipoId: alertItem.teamId || 'team-alpha-1',
        startDate: new Date().toISOString().substring(0, 10),
        endDate: new Date(Date.now() + 28 * 86400000).toISOString().substring(0, 10),
        indicator: 'Recuperación agregada',
        baseline: alertItem.evidence?.slice(-1)[0] || 58,
        targetDesc: 'Intervención preventiva coordinada con supervisión para mitigar la tendencia de alerta.'
      });
      return {};
    } catch (err) {
      return { error: err.response?.data?.error?.message || 'Error al crear intervención en el servidor' };
    }
  }

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

  targetAlert.status = 'INTERVENIDA';
  targetAlert.interventionId = newIntervention.id;
  pulsoStore.save(storeData);

  pulsoStore.audit({
    actor: `${user?.name || 'Profesional SST'} (${user?.role || 'sst'})`,
    action: 'CREACION_INTERVENCION_DESDE_ALERTA',
    target: `${newIntervention.title} asignada a ${targetAlert.campaign}`
  });

  return {};
}
