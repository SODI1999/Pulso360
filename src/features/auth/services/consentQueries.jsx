import { pulsoStore } from '../../../core/storage/pulsoStore';

export function getConsentData(userId) {
  const data = pulsoStore.get();
  return {
    settings: data.settings,
    consents: { [userId]: data.consents?.[userId] },
    consentHistory: (data.consentHistory || []).filter((row) => row.userId === userId)
  };
}
