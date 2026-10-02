import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export function getSstData() {
  const { settings, alerts, supportRequests, users, rules, interventions } = pulsoStore.get();
  return { settings, alerts, supportRequests, users, rules, interventions };
}

export async function fetchSstAlerts() {
  if (!env.useMockStorage && getAuthToken()) {
    try {
      return await apiClient.get('/sst/alerts');
    } catch (error) {
      console.warn('Fallback a datos locales', error.message);
    }
  }
  return pulsoStore.get().alerts || [];
}

export async function fetchSstInterventions() {
  if (!env.useMockStorage && getAuthToken()) {
    try {
      return await apiClient.get('/sst/interventions');
    } catch (error) {
      console.warn('Fallback a datos locales', error.message);
    }
  }
  return pulsoStore.get().interventions || [];
}

export async function fetchSstSupportRequests() {
  if (!env.useMockStorage && getAuthToken()) {
    try {
      return await apiClient.get('/sst/support-requests');
    } catch (error) {
      console.warn('Fallback a datos locales', error.message);
    }
  }
  return pulsoStore.get().supportRequests || [];
}
