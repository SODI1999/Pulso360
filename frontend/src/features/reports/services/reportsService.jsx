import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';
import { clearReportsCache } from './reportsQueries';

export async function generateReport(newReportRecord) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) {
      return { success:false,data:null,error: 'Sesión no válida o token ausente' };
    }
    try {
      const res = await apiClient.post('/reports', newReportRecord);
      clearReportsCache();
      return { ...res, reportPayload: res.data };
    } catch (err) {
      return { success:false,data:null,error: err.response?.data?.error?.message || 'Error en el servidor' };
    }
  }

  const data = pulsoStore.get();
  data.reportHistory = data.reportHistory || [];
  data.reportHistory.unshift(newReportRecord);
  pulsoStore.save(data);

  return {success:true,data:null};
}
