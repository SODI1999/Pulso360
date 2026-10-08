import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { normalizeIntervention } from '../../../core/api/interventionContract';
import { env } from '../../../core/config/env';
import { onLogout } from '../../../core/auth/authService';

let sstAlertsCache = null;
let sstInterventionsCache = null;
let sstSupportCache = null;
let sstMetricsCache = new Map();

export function clearSstCache() {
  sstAlertsCache = null;
  sstInterventionsCache = null;
  sstSupportCache = null;
  sstMetricsCache.clear();
}

onLogout(clearSstCache);

export function getSstData() {
  if (!env.useMockStorage) return { settings: { umbralMinimo: 5 }, alerts: sstAlertsCache || [], supportRequests: sstSupportCache || [], users: [], rules: [], interventions: sstInterventionsCache || [] };
  const { settings, alerts, supportRequests, users, rules, interventions } = pulsoStore.get();
  return { settings, alerts, supportRequests, users, rules, interventions };
}

export async function fetchSstAlerts() {
  if (!env.useMockStorage) {
    if (!getAuthToken()) throw new Error('Sesión no válida o expirada.');
    try {
      const res = await apiClient.get('/sst/alerts');
      const payload = res.data?.data !== undefined ? res.data.data : res.data;
      const arrayPayload = Array.isArray(payload) ? payload : [];
      const mapped = arrayPayload.map(item => ({
        ...item, date: item.alert_date?.slice(0,10), n: item.respondents, dismissReason:item.dismiss_reason,
        rule: item.regla_nombre || item.rule,
        campaign: item.campana_nombre || item.campaign,
        team: item.equipo_nombre || item.team,
        campana_id: item.campana_id,
        equipo_id: item.equipo_id
      }));
      sstAlertsCache = mapped;
      return mapped;
    } catch (error) {
      throw new Error(error.response?.data?.error?.message || 'No se pudieron cargar los registros SST.');
    }
  }
  return pulsoStore.get().alerts || [];
}

export async function fetchSstInterventions() {
  if (!env.useMockStorage) {
    if (!getAuthToken()) throw new Error('Sesión no válida o expirada.');
    try {
      const res = await apiClient.get('/sst/interventions');
      const payload = res.data?.data !== undefined ? res.data.data : res.data;
      const mapped = Array.isArray(payload) ? payload.map(normalizeIntervention) : [];
      sstInterventionsCache = mapped;
      return mapped;
    } catch (error) {
      throw new Error(error.response?.data?.error?.message || 'No se pudieron cargar los registros SST.');
    }
  }
  return pulsoStore.get().interventions || [];
}

export async function fetchSstSupportRequests() {
  if (!env.useMockStorage) {
    if (!getAuthToken()) throw new Error('Sesión no válida o expirada.');
    try {
      const res = await apiClient.get('/sst/support-requests');
      const payload = res.data?.data !== undefined ? res.data.data : res.data;
      const mapped = Array.isArray(payload) ? payload.map(r => ({ ...r, date: r.request_date?.slice(0,10),
        userName: r.mode === 'anonimo' ? null : r.solicitante, contactPreference:r.contact_preference, timeWindow:r.time_window,
        chatStatus: r.chat_status || r.chatStatus || null, chatSessionId: r.chat_session_id || r.chatSessionId || null })) : [];
      sstSupportCache = mapped;
      return mapped;
    } catch (error) {
      throw new Error(error.response?.data?.error?.message || 'No se pudieron cargar los registros SST.');
    }
  }
  return pulsoStore.get().supportRequests || [];
}

/**
 * Recupera las métricas agregadas de vigilancia epidemiológica para el rol SST.
 * Aplica k-anonimato del lado del servidor (k >= 5) de acuerdo al principio de Privacy by Design.
 *
 * @param {Object} [params]
 * @param {string} [params.campanaId]
 * @param {string} [params.equipoId]
 * @param {string} [params.desde]
 * @param {string} [params.hasta]
 * @returns {Promise<Object>} Objeto con { protected, cohort_count, k_threshold, metrics, reason }
 */
export async function fetchSstMetrics(params = {}) {
  const { campanaId, equipoId, desde, hasta } = params;
  if (!env.useMockStorage) {
    if (!getAuthToken()) throw new Error('Sesión no válida o expirada.');
    try {
      const res = await apiClient.get('/sst/metrics', {
        params: {
          campana_id: campanaId,
          equipo_id: equipoId,
          desde,
          hasta
        }
      });
      const payload = res?.data !== undefined ? res.data : res;
      if (payload) {
        return payload;
      }
    } catch (error) {
      throw new Error(error.response?.data?.error?.message || 'Error al obtener métricas SST en el servidor');
    }
  }

  return { error: 'Las métricas reales requieren un backend conectado.' };
}
