import { roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';

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
  return {};
}
