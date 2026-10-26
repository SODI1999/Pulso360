import { apiClient } from '../../../core/api/apiClient';
import { normalizeRule } from '../../../core/api/ruleContract';

export async function fetchRules() {
  const response = await apiClient.get('/sst/rules');
  return response.data.map(normalizeRule);
}

export async function saveRule(newRule) {
  try {
    const response = await apiClient.post('/sst/rules', newRule);
    return { success: true, data: normalizeRule(response.data) };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'No se pudo registrar la propuesta.'
    };
  }
}
