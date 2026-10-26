import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { bogotaCalendarDate } from '../../../core/time/calendarDate';
import { clearSstCache } from './sstQueries';

export async function updateStatus(alertId, newStatus) {
  if (!getAuthToken()) {
    return { success: false, data: null, error: 'Sesión no válida o token ausente' };
  }
  try {
    const res = await apiClient.patch('/sst/alerts/' + alertId, { status: newStatus });
    clearSstCache();
    return { ...res, alertItem: res.data };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.response?.data?.error?.message || 'Error al actualizar alerta en el servidor'
    };
  }
}

export async function confirmDismiss(alertId, reason) {
  if (!getAuthToken()) {
    return { success: false, data: null, error: 'Sesión no válida o token ausente' };
  }
  try {
    await apiClient.patch('/sst/alerts/' + alertId, { status: 'DESCARTADA', dismissReason: reason });
    clearSstCache();
    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.response?.data?.error?.message || 'Error al descartar alerta en el servidor'
    };
  }
}

export async function createIntervention(alertItem) {
  if (!getAuthToken()) {
    return { success: false, data: null, error: 'Sesión no válida o token ausente' };
  }
  try {
    const campanaId = alertItem.campana_id || alertItem.campaignId;
    const equipoId = alertItem.equipo_id || alertItem.teamId;
    if (!campanaId || !equipoId) {
      return {
        success: false,
        data: null,
        error: 'Faltan parámetros requeridos de campaña o equipo para crear la intervención.'
      };
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
    clearSstCache();
    return { ...res, intervention: res.data };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err.response?.data?.error?.message || 'Error al crear intervención en el servidor'
    };
  }
}
