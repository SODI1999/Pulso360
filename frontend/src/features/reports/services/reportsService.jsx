import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { clearReportsCache } from './reportsQueries';

export async function generateReport(newReportRecord) {
  if (!getAuthToken()) {
    return { success: false, data: null, error: 'Sesión no válida o token ausente' };
  }
  try {
    const res = await apiClient.post('/reports', newReportRecord);
    clearReportsCache();
    return { ...res, reportPayload: res.data };
  } catch (err) {
    return { success: false, data: null, error: err.response?.data?.error?.message || 'Error en el servidor' };
  }
}
