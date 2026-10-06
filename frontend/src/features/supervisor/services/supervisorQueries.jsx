import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { normalizeIntervention } from '../../../core/api/interventionContract';
import { env } from '../../../core/config/env';
import { bogotaCalendarDate } from '../../../core/time/calendarDate';

export function getSupervisorData() {
  if (!env.useMockStorage) return { settings: { umbralMinimo:5 }, interventions:[] };
  const { settings, interventions } = pulsoStore.get();
  return { settings, interventions };
}

/**
 * Recupera las métricas calculadas del equipo desde el backend aplicando k-anonimato.
 * Implementa el principio de Privacy by Design: la agregación matemática y evaluación
 * de k-anonimato ocurre del lado del servidor para impedir la transferencia
 * de microdatos no agregados al cliente.
 *
 * @param {string} equipoId
 * @param {string} campanaId
 * @returns {Promise<Object>}
 */
export async function fetchSupervisorMetrics(campanaId = null, equipoId = null, scopeFilter = 'all', periodFilter = `${bogotaCalendarDate().slice(0,7)}-01|${bogotaCalendarDate()}`) {
  let cId = campanaId;
  let eqId = equipoId;
  let sFilter = scopeFilter;

  if (typeof campanaId === 'object' && campanaId !== null) {
    cId = campanaId.campanaId || null;
    eqId = campanaId.equipoId || null;
    sFilter = campanaId.scopeFilter || 'all';
  }

  // Simulación contextual si se selecciona un subgrupo deliberadamente protegido (N < 5)
  if (env.useMockStorage && sFilter === 'small') {
    return {
      protected: true,
      reason: 'Información protegida: la cohorte seleccionada (N=3) no alcanza el umbral mínimo de k-anonimato (k < 5) para prevenir la reidentificación de respuestas.',
      cohort_count: 3,
      k_threshold: 5,
      metrics: null
    };
  }

  if (!env.useMockStorage) {
    if (!getAuthToken()) return { error: 'No autorizado' };
    try {
      if (!cId && !eqId) return { error: 'No tienes un ámbito operativo asignado.' };
      const [desde, hasta] = periodFilter.split('|');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(desde || '') || !/^\d{4}-\d{2}-\d{2}$/.test(hasta || '') || desde > hasta) {
        return { error:'Selecciona un intervalo de fechas válido.' };
      }
      const period = { desde, hasta };
      const response = await apiClient.get('/sst/metrics', { params: { campana_id: cId, equipo_id: eqId, ...period } });
      const payload = response?.data !== undefined ? response.data : response;
      if (payload) {
        return payload;
      }
    } catch (err) {
      return { error: err.response?.data?.error?.message || 'Error al obtener métricas en el servidor' };
    }
  }

  return { error: 'Las métricas reales requieren un backend conectado.' };
}

/**
 * Recupera las acciones e intervenciones asignadas al supervisor desde el backend.
 *
 * @returns {Promise<Array>} Arreglo de intervenciones
 */
export async function fetchSupervisorActions() {
  if (!env.useMockStorage) {
    if (!getAuthToken()) throw new Error('Sesión no válida o expirada.');
    try {
      const res = await apiClient.get('/supervisor/actions');
      const payload = res.data?.data !== undefined ? res.data.data : res.data;
      const arrayPayload = Array.isArray(payload) ? payload : [];
      return arrayPayload.map(normalizeIntervention);
    } catch (err) {
      throw new Error(err.response?.data?.error?.message || 'No se pudieron cargar las acciones.');
    }
  }

  // Fallback: Datos mock locales
  const data = pulsoStore.get();
  return data.interventions || [];
}
