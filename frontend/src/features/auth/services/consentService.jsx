import { roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export async function fetchConsent(userId) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) return null;
    try {
      const res = await apiClient.get('/agent/consent');
      return res.data?.data || res.data || null;
    } catch (error) {
      console.error('Error fetching consent from server', error);
      return null;
    }
  }
  const data = pulsoStore.get();
  return data.consents?.[userId] || null;
}

export async function saveConsent(settings, currentUser, consents) {
  const data = pulsoStore.get();
  const activeVersion = data.settings?.policyVersion || settings.policyVersion;

  if (!env.useMockStorage) {
    if (!getAuthToken()) return { error: 'Sesión no válida o expirada.' };
    try {
      const res = await apiClient.put('/agent/consent', {
        c1_checkin: Boolean(consents.c1),
        c2_bitacora: Boolean(consents.c2),
        c3_apoyo: Boolean(consents.c3),
        c4_analitica: Boolean(consents.c4),
        c5_contacto: Boolean(consents.c5),
        acepta_politica: Boolean(consents.policyAccepted),
        acepta_aviso_privacidad: Boolean(consents.noticeAccepted || consents.policyAccepted)
      });
      return { payload: res.data, ...res.data };
    } catch (error) {
      return { error: error.response?.data?.error?.message || 'Error al guardar consentimiento en el servidor' };
    }
  }

  const updatedRecord = {
    userId: currentUser.id,
    policyAccepted: true,
    policyVersion: activeVersion,
    updatedAt: new Date().toISOString(),
    ...consents
  };

  data.consents = data.consents || {};
  data.consents[currentUser.id] = { ...updatedRecord };
  delete data.consents[currentUser.id].userId;

  data.consentHistory = data.consentHistory || [];
  data.consentHistory.unshift(updatedRecord);

  pulsoStore.save(data);
  pulsoStore.audit({
    actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
    action: 'ACTUALIZACION_CONSENTIMIENTO',
    target: `Política ${activeVersion} · C1-C5`
  });

  return {};
}
