import { roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export function saveConsent(settings, currentUser, consents) {
  const data = pulsoStore.get();
  const activeVersion = data.settings?.policyVersion || settings.policyVersion;

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

  if (!env.useMockStorage && getAuthToken()) {
    apiClient.put('/agent/consent', {
      c1_checkin: Boolean(consents.c1),
      c2_bitacora: Boolean(consents.c2),
      c3_apoyo: Boolean(consents.c3),
      c4_analitica: Boolean(consents.c4),
      c5_contacto: Boolean(consents.c5)
    }).catch((error) => {
      console.warn('Backend: Sincronización de consentimientos fallida', error.message);
    });
  }

  return {};
}
