import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export async function saveIntervention(newIntervention) {
  if (!env.useMockStorage && getAuthToken()) {
    try {
      const res = await apiClient.post('/sst/interventions', {
        ...newIntervention,
        status: 'Activa'
      });
      return { payload: res.data };
    } catch (err) {
      return { error: err.response?.data?.error?.message || 'Error al crear intervención en el servidor' };
    }
  }

  const storeData = pulsoStore.get();
  storeData.interventions = storeData.interventions || [];
  storeData.interventions.unshift({ ...newIntervention, status: 'Planeada' });
  pulsoStore.save(storeData);
  return {};
}
