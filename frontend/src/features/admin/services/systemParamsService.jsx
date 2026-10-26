import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { clearAdminCache } from './adminQueries';

export async function saveParams() {
  return { success: false, error: 'Estos parámetros son de solo lectura en esta versión.' };
}

export async function publishPolicy(v, actorLabel, title, policyText, noticeText) {
  if (!getAuthToken()) {
    return { success: false, data: null, error: 'Sesión no válida o token ausente' };
  }
  try {
    const response = await apiClient.post('/admin/policies', {
      version: v,
      titulo: title,
      textoPolitica: policyText,
      textoAviso: noticeText
    });
    clearAdminCache();
    return response;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.response?.data?.error?.message || error.message || 'Error en el servidor'
    };
  }
}

export async function activateNlp(v) {
  try {
    const response = await apiClient.post(`/admin/nlp/versions/${encodeURIComponent(v)}/activate`);
    clearAdminCache();
    return { ...response, ...response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error?.message || error.message };
  }
}

export async function approveRule(ruleId) {
  try {
    const response = await apiClient.patch(`/admin/rules/${encodeURIComponent(ruleId)}/approval`, {});
    clearAdminCache();
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error?.message || error.message };
  }
}

export async function revertNlp() {
  try {
    const response = await apiClient.post('/admin/nlp/revert');
    clearAdminCache();
    return { ...response, ...response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error?.message || error.message };
  }
}
