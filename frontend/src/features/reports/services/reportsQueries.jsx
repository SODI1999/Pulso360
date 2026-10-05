import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export function getReportData() {
  const { settings, reportHistory } = pulsoStore.get();
  return { settings, reportHistory };
}

export async function fetchReports(campanaId = null, equipoId = null) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) return [];
    try {
      const params = {};
      if (campanaId && campanaId !== 'all') params.campanaId = campanaId;
      if (equipoId && equipoId !== 'all') params.equipoId = equipoId;

      const response = await apiClient.get('/reports', { params });
      return response.data?.data || response.data || [];
    } catch (err) {
      console.warn('Error fetching reports from API', err);
      return [];
    }
  }
  return pulsoStore.get().reportHistory || [];
}
