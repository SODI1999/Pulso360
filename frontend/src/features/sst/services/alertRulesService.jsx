import { pulsoStore } from '../../../core/storage/pulsoStore';
import { env } from '../../../core/config/env';
import { apiClient } from '../../../core/api/apiClient';
import { normalizeRule } from '../../../core/api/ruleContract';

export async function fetchRules() {
  if (env.useMockStorage) return pulsoStore.get().rules || [];
  const response = await apiClient.get('/sst/rules');
  return response.data.map(normalizeRule);
}

export async function saveRule(newRule) {
  if (!env.useMockStorage) {
    try {
      const response = await apiClient.post('/sst/rules',newRule);
      return { success:true,data:normalizeRule(response.data) };
    } catch(error) { return { success:false,error:error.response?.data?.error?.message || error.message || 'No se pudo registrar la propuesta.' }; }
  }
  const storeData = pulsoStore.get();
  storeData.rules = storeData.rules || [];
  storeData.rules.unshift(newRule);
  pulsoStore.save(storeData);
  return { success:true,data:newRule };
}
