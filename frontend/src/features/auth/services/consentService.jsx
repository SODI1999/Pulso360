import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { normalizeConsent } from '../../../core/auth/consentContract';
export { normalizeConsent } from '../../../core/auth/consentContract';

export async function fetchConsent() {
  if (!getAuthToken()) throw new Error('Sesión no válida o expirada.');
  try {
    const res = await apiClient.get('/agent/consent');
    return normalizeConsent(res.data?.data || res.data);
  } catch (error) {
    throw new Error(error.response?.data?.error?.message || 'No se pudo consultar el consentimiento.');
  }
}

export async function saveConsent(settings, currentUser, consents) {
  if (!getAuthToken()) return { success: false, data: null, error: 'Sesión no válida o expirada.' };
  try {
    const res = await apiClient.put('/agent/consent', {
      policyVersion: settings.policyVersion,
      c1_checkin: Boolean(consents.c1),
      c2_bitacora: Boolean(consents.c2),
      c3_apoyo: Boolean(consents.c3),
      c4_analitica: Boolean(consents.c4),
      c5_contacto: Boolean(consents.c5),
      acepta_politica: Boolean(consents.policyAccepted),
      acepta_aviso_privacidad: Boolean(consents.noticeAccepted || consents.policyAccepted)
    });
    return { ...res, payload: normalizeConsent(res.data) };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.response?.data?.error?.message || 'Error al guardar consentimiento en el servidor'
    };
  }
}
