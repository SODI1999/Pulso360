import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export function getSstData() {
  const { settings, alerts, supportRequests, users, rules, interventions } = pulsoStore.get();
  return { settings, alerts, supportRequests, users, rules, interventions };
}

export async function fetchSstAlerts() {
  if (!env.useMockStorage && getAuthToken()) {
    try {
      const res = await apiClient.get('/sst/alerts');
      const payload = res.data?.data !== undefined ? res.data.data : res.data;
      const arrayPayload = Array.isArray(payload) ? payload : [];
      return arrayPayload.map(item => ({
        ...item,
        rule: item.regla_nombre || item.rule,
        campaign: item.campana_nombre || item.campaign,
        team: item.equipo_nombre || item.team,
        campana_id: item.campana_id,
        equipo_id: item.equipo_id
      }));
    } catch (error) {
      console.warn('Fallback a datos locales', error.message);
    }
  }
  return pulsoStore.get().alerts || [];
}

export async function fetchSstInterventions() {
  if (!env.useMockStorage && getAuthToken()) {
    try {
      const res = await apiClient.get('/sst/interventions');
      const payload = res.data?.data !== undefined ? res.data.data : res.data;
      return Array.isArray(payload) ? payload : [];
    } catch (error) {
      console.warn('Fallback a datos locales', error.message);
    }
  }
  return pulsoStore.get().interventions || [];
}

export async function fetchSstSupportRequests() {
  if (!env.useMockStorage && getAuthToken()) {
    try {
      const res = await apiClient.get('/sst/support-requests');
      const payload = res.data?.data !== undefined ? res.data.data : res.data;
      return Array.isArray(payload) ? payload : [];
    } catch (error) {
      console.warn('Fallback a datos locales', error.message);
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
  if (!env.useMockStorage && getAuthToken()) {
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
      console.warn('Fallback a datos locales de métricas SST:', error.message);
    }
  }

  // Fallback: Datos mock basados en umbral mínimo del sistema
  const data = pulsoStore.get();
  const minThreshold = data.settings?.umbralMinimo || 5;
  return {
    protected: false,
    reason: null,
    cohort_count: 48,
    k_threshold: minThreshold,
    metrics: {
      bienestar_general: 64.2,
      energia: 66.8,
      carga_emocional: 74.0,
      recuperacion: 58.0,
      apoyo: 82.0,
      distanciamiento: 52.0,
      ineficacia: 48.0
    }
  };
}
