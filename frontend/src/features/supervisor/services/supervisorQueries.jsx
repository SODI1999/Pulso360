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
export async function fetchSupervisorMetrics(equipoId, campanaId) {
  if (!env.useMockStorage && getAuthToken()) {
    try {
      const response = await apiClient.get('/sst/metrics', { params: { equipoId, campanaId } });
      // response ya fue desempaquetado por el interceptor (.data)
      // Se espera que contenga { protected, reason, cohort_count, k_threshold, metrics }
      return response;
    } catch (err) {
      console.warn('Backend inalcanzable, proveyendo datos mockeados de métricas.', err.message);
    }
  }

  // Fallback: Datos mock basados en umbral mínimo
  return {
    protected: false,
    reason: 'Mock fallback',
    cohort_count: 5,
    k_threshold: 5,
    metrics: {
      agotamiento: 2.5,
      despersonalizacion: 2.1,
      ineficacia: 1.8
    }
  };
}
