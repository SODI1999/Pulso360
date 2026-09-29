import { QUESTIONS } from '../data/checkinWizardData';
import { roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';

export function saveCheckin(existingCheckin, user, journeyKey, draft) {
  const storeData = pulsoStore.get();
  const payload = {
    id: existingCheckin?.id || `chk-${Date.now()}`,
    userId: user.id,
    journeyKey,
    date: journeyKey,
    submittedAt: existingCheckin?.submittedAt || new Date().toISOString(),
    ...Object.fromEntries(
      QUESTIONS.map((q) => [q.key, Object.prototype.hasOwnProperty.call(draft, q.key) ? draft[q.key] : null])
    )
  };

  if (existingCheckin) {
    const index = storeData.checkins.findIndex((c) => c.id === existingCheckin.id);
    if (index >= 0) storeData.checkins[index] = payload;
  } else {
    storeData.checkins.unshift(payload);
  }

  pulsoStore.save(storeData);
  pulsoStore.audit({
    actor: `${user.id} (${roleLabels[user.role] || user.role})`,
    action: existingCheckin ? 'EDICION_CHECKIN' : 'REGISTRO_CHECKIN',
    target: `Jornada ${journeyKey}`
  });
  return { payload };
}
