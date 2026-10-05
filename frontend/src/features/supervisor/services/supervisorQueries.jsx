import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export function getSupervisorData() {
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
export async function fetchSupervisorMetrics(campanaId = 'camp-1', equipoId = 'team-alpha-1', scopeFilter = 'all') {
  let cId = campanaId;
  let eqId = equipoId;
  let sFilter = scopeFilter;

  if (typeof campanaId === 'object' && campanaId !== null) {
    cId = campanaId.campanaId || 'camp-1';
    eqId = campanaId.equipoId || 'team-alpha-1';
    sFilter = campanaId.scopeFilter || 'all';
  }

  // Simulación contextual si se selecciona un subgrupo deliberadamente protegido (N < 5)
  if (sFilter === 'small') {
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
      const response = await apiClient.get('/sst/metrics', { params: { campana_id: cId, equipo_id: eqId } });
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
    if (!getAuthToken()) return [];
    try {
      const res = await apiClient.get('/supervisor/actions');
      const payload = res.data?.data !== undefined ? res.data.data : res.data;
      const arrayPayload = Array.isArray(payload) ? payload : [];
      return arrayPayload.map(item => ({
        ...item,
        assignedTo: item.assigned_to || item.assignedTo
      }));
    } catch (err) {
      console.warn('Backend inalcanzable, retornando vacío.', err.message);
      return [];
    }
  }

  // Fallback: Datos mock locales
  const data = pulsoStore.get();
  return data.interventions || [];
}
