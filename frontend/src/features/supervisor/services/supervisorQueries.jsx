import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { normalizeIntervention } from '../../../core/api/interventionContract';
import { onLogout } from '../../../core/auth/authService';
import { bogotaCalendarDate } from '../../../core/time/calendarDate';

let supervisorActionsCache = null;
let supervisorMetricsCache = new Map();

export function clearSupervisorCache() {
  supervisorActionsCache = null;
  supervisorMetricsCache.clear();
}

onLogout(clearSupervisorCache);

export function getCachedSupervisorMetrics(campanaId = null, equipoId = null, scopeFilter = 'all', periodFilter = '') {
  let cId = campanaId;
  let eqId = equipoId;
  let sFilter = scopeFilter;
  let pFilter = periodFilter;
  if (typeof campanaId === 'object' && campanaId !== null) {
    cId = campanaId.campanaId || null;
    eqId = campanaId.equipoId || null;
    sFilter = campanaId.scopeFilter || 'all';
    pFilter = campanaId.periodFilter || '';
  }
  const key = `${cId}_${eqId}_${sFilter}_${pFilter}`;
  return supervisorMetricsCache.get(key) || null;
}

export function recordSupervisorAudit() {
  // Auditoría gestionada en el backend
}

export function getSupervisorData() {
  return { settings: { umbralMinimo: 5 }, interventions: supervisorActionsCache || [] };
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
export async function fetchSupervisorMetrics(
  campanaId = null,
  equipoId = null,
  scopeFilter = 'all',
  periodFilter = `${bogotaCalendarDate().slice(0, 7)}-01|${bogotaCalendarDate()}`
) {
  let cId = campanaId;
  let eqId = equipoId;
  let sFilter = scopeFilter;

  if (typeof campanaId === 'object' && campanaId !== null) {
    cId = campanaId.campanaId || null;
    eqId = campanaId.equipoId || null;
    sFilter = campanaId.scopeFilter || 'all';
  }

  if (!getAuthToken()) return { error: 'No autorizado' };
  try {
    if (!cId && !eqId) return { error: 'No tienes un ámbito operativo asignado.' };
    const [desde, hasta] = periodFilter.split('|');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(desde || '') || !/^\d{4}-\d{2}-\d{2}$/.test(hasta || '') || desde > hasta) {
      return { error: 'Selecciona un intervalo de fechas válido.' };
    }
    const period = { desde, hasta };
    const response = await apiClient.get('/sst/metrics', {
      params: { campana_id: cId, equipo_id: eqId, ...period }
    });
    const payload = response?.data !== undefined ? response.data : response;
    if (payload) {
      const key = `${cId}_${eqId}_${sFilter}_${periodFilter}`;
      supervisorMetricsCache.set(key, payload);
      return payload;
    }
  } catch (err) {
    return { error: err.response?.data?.error?.message || 'Error al obtener métricas en el servidor' };
  }

  return { error: 'Las métricas reales requieren un backend conectado.' };
}

/**
 * Recupera las acciones e intervenciones asignadas al supervisor desde el backend.
 *
 * @returns {Promise<Array>} Arreglo de intervenciones
 */
export async function fetchSupervisorActions() {
  if (!getAuthToken()) throw new Error('Sesión no válida o expirada.');
  try {
    const res = await apiClient.get('/supervisor/actions');
    const payload = res.data?.data !== undefined ? res.data.data : res.data;
    const arrayPayload = Array.isArray(payload) ? payload : [];
    const mapped = arrayPayload.map(normalizeIntervention);
    supervisorActionsCache = mapped;
    return mapped;
  } catch (err) {
    throw new Error(err.response?.data?.error?.message || 'No se pudieron cargar las acciones.');
  }
}
