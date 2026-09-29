import { roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';

export function createSupportRequest(
  isAnonymous,
  urgency,
  supportMode,
  currentUser,
  reason,
  details,
  contactPreference,
  timeWindow
) {
  const storeData = pulsoStore.get();
  storeData.supportRequests = storeData.supportRequests || [];

  const now = new Date();
  const year = now.getFullYear();
  const prefix = isAnonymous ? 'ANON' : 'CONF';
  const existingCount = storeData.supportRequests.filter((r) =>
    String(r.code || '').startsWith(`${prefix}-${year}-`)
  ).length;
  const code = `${prefix}-${year}-${String(existingCount + 1).padStart(4, '0')}`;

  const responseWindowLabel = urgency === 'alta' ? 'Prioritario' : 'Jornada habitual SST';

  storeData.supportRequests.unshift({
    id: `req-${Date.now()}`,
    code,
    mode: supportMode,
    ownerUserId: currentUser.id,
    identityUserId: !isAnonymous ? currentUser.id : null,
    date: new Date().toISOString().slice(0, 10),
    reason,
    description: details.trim(),
    urgency,
    contactPreference: isAnonymous ? 'app' : contactPreference,
    timeWindow: isAnonymous ? 'No aplica' : timeWindow,
    status: 'Recibida',
    assignedTo: 'usr-3',
    sla: responseWindowLabel
  });

  pulsoStore.save(storeData);
  pulsoStore.audit({
    actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
    action: 'SOLICITUD_ACOMPANAMIENTO',
    target: `Caso ${code}`
  });
  return { code };
}
