import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export function getReportData() {
  const { settings, reportHistory } = pulsoStore.get();
  return { settings, reportHistory };
}

export async function fetchReports() {
  if (!env.useMockStorage && getAuthToken()) {
    try {
      const response = await apiClient.get('/reports');
      if (response.success && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('Error fetching reports from API, falling back to local.', err);
    }
  }
  return pulsoStore.get().reportHistory || [];
}
