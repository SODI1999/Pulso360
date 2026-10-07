import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';
import { clearSstCache } from './sstQueries';

export async function saveIntervention(newIntervention) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) return { success:false,data:null,error: 'Sesión no válida o expirada.' };
    try {
      const res = await apiClient.post('/sst/interventions', {
        ...newIntervention,
        status: 'Activa'
      });
      clearSstCache();
      return { ...res, payload: res.data };
    } catch (err) {
      return { success:false,data:null,error: err.response?.data?.error?.message || 'Error al crear intervención en el servidor' };
    }
  }

  const storeData = pulsoStore.get();
  storeData.interventions = storeData.interventions || [];
  storeData.interventions.unshift({ ...newIntervention, status: 'Planeada' });
  pulsoStore.save(storeData);
  return {success:true,data:null};
}
