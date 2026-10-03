import { roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export async function saveConsent(settings, currentUser, consents) {
  const data = pulsoStore.get();
  const activeVersion = data.settings?.policyVersion || settings.policyVersion;

  if (!env.useMockStorage && getAuthToken()) {
    try {
      await apiClient.put('/agent/consent', {
        c1_checkin: Boolean(consents.c1),
        c2_bitacora: Boolean(consents.c2),
        c3_apoyo: Boolean(consents.c3),
        c4_analitica: Boolean(consents.c4),
        c5_contacto: Boolean(consents.c5),
        acepta_politica: Boolean(consents.policyAccepted),
        acepta_aviso_privacidad: Boolean(consents.noticeAccepted || consents.policyAccepted)
      });
      return {};
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
