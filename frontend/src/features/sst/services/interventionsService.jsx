import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { clearSstCache } from './sstQueries';

export async function saveIntervention(newIntervention) {
  if (!getAuthToken()) return { success: false, data: null, error: 'Sesión no válida o expirada.' };
  try {
    const res = await apiClient.post('/sst/interventions', {
      ...newIntervention,
      status: 'Activa'
    });
    clearSstCache();
    return { ...res, payload: res.data };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err.response?.data?.error?.message || 'Error al crear intervención en el servidor'
    };
  }
}
