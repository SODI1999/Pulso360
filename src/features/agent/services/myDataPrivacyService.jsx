import { roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';

export function createHabeasRequest(requestType, currentUser, noteText) {
  const storeData = pulsoStore.get();
  storeData.habeasRequests = storeData.habeasRequests || [];

  const now = new Date();
  const currentYear = now.getFullYear();
  const seq =
    storeData.habeasRequests.filter((r) => String(r.id).startsWith(`HD-${currentYear}-`)).length + 1;
  const generatedId = `HD-${currentYear}-${String(seq).padStart(3, '0')}`;

  const businessDays = requestType === 'Rectificación' || requestType === 'Supresión' ? 15 : 10;

  storeData.habeasRequests.unshift({
    id: generatedId,
    userId: currentUser.id,
    type: requestType,
    createdAt: now.toISOString(),
    status: 'Recibida',
    deadline: addBusinessDays(now, businessDays),
    note: noteText
  });

  pulsoStore.save(storeData);
  pulsoStore.audit({
    actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
    action: 'SOLICITUD_HABEAS_DATA',
    target: `${generatedId} · ${requestType}`
  });
  return { generatedId };
}

const addBusinessDays = (startDate, daysCount) => {
  const target = new Date(startDate);
  let added = 0;
  while (added < daysCount) {
    target.setDate(target.getDate() + 1);
    const dayOfWeek = target.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) added++;
  }
  return target.toISOString().slice(0, 10);
};
