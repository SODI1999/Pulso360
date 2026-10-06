import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { bogotaCalendarDate } from '../../../core/time/calendarDate';
import { env } from '../../../core/config/env';

export async function updateStatus(alertId, newStatus, user) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) {
      return { success:false,data:null,error: 'Sesión no válida o token ausente' };
    }
    try {
      const res = await apiClient.patch('/sst/alerts/' + alertId, { status: newStatus });
      return { ...res, alertItem: res.data };
    } catch (error) {
      return { success:false,data:null,error: error.response?.data?.error?.message || 'Error al actualizar alerta en el servidor' };
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

  return { success:true,data:alertItem, alertItem };
}

export async function confirmDismiss(alertId, reason, user) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) {
      return { success:false,data:null,error: 'Sesión no válida o token ausente' };
    }
    try {
      await apiClient.patch('/sst/alerts/' + alertId, { status: 'DESCARTADA', dismissReason: reason });
      return {success:true,data:null};
    } catch (error) {
      return { success:false,data:null,error: error.response?.data?.error?.message || 'Error al descartar alerta en el servidor' };
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

  return {success:true,data:null};
}

export async function createIntervention(alertItem, user) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) {
      return { success:false,data:null,error: 'Sesión no válida o token ausente' };
    }
    try {
      const campanaId = alertItem.campana_id || alertItem.campaignId;
      const equipoId = alertItem.equipo_id || alertItem.teamId;
      if (!campanaId || !equipoId) {
        return { success:false,data:null,error: 'Faltan parámetros requeridos de campaña o equipo para crear la intervención.' };
      }
      const now = new Date();
      const startDate = bogotaCalendarDate(now);
      const endDate = bogotaCalendarDate(now, 28);
      const ruleTitle = alertItem.rule || alertItem.description || 'Alerta preventiva';

      const res = await apiClient.post('/sst/interventions', {
        alerta_id: alertItem.id,
        alertaId: alertItem.id,
        title: `Plan preventivo · ${ruleTitle}`,
        type: 'Pausas cognitivas',
        campana_id: campanaId,
        campanaId: campanaId,
        equipo_id: equipoId,
        equipoId: equipoId,
        start_date: startDate,
        startDate: startDate,
        end_date: endDate,
        endDate: endDate,
        indicator: 'Recuperación agregada',
        baseline: alertItem.baseline || alertItem.evidence?.[0] || null,
        target_desc: 'Intervención preventiva coordinada con supervisión para mitigar la tendencia de alerta.',
        targetDesc: 'Intervención preventiva coordinada con supervisión para mitigar la tendencia de alerta.'
      });
      return { ...res, intervention: res.data };
    } catch (err) {
      return { success:false,data:null,error: err.response?.data?.error?.message || 'Error al crear intervención en el servidor' };
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
    startDate: bogotaCalendarDate(),
    endDate: bogotaCalendarDate(new Date(), 28),
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

  return {success:true,data:null};
}
