import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export async function generateReport(newReportRecord) {
  const data = pulsoStore.get();
  data.reportHistory = data.reportHistory || [];
  data.reportHistory.unshift(newReportRecord);
  pulsoStore.save(data);

  if (!env.useMockStorage && getAuthToken()) {
    try {
      apiClient.post('/reports', newReportRecord).catch(err => console.warn('Error saving report to API in background', err));
    } catch {
      // Ignored
    }
  }

  return {};
}
