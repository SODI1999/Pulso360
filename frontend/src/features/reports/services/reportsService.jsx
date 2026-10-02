import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export async function generateReport(newReportRecord) {
  if (!env.useMockStorage && getAuthToken()) {
    try {
      await apiClient.post('/reports', newReportRecord);
      return {};
    } catch (err) {
      return { error: err.response?.data?.error?.message || 'Error en el servidor' };
    }
  }

  const data = pulsoStore.get();
  data.reportHistory = data.reportHistory || [];
  data.reportHistory.unshift(newReportRecord);
  pulsoStore.save(data);

  return {};
}
