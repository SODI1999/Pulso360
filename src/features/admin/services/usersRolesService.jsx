import { ROLE_LABELS } from '../data/usersRolesData';

import { pulsoStore } from '../../../core/storage/pulsoStore';

export function saveCreateUser(email, orgScopes, orgScopeId, name, role, status) {
  const data = pulsoStore.get();

  // Validación atómica: correo único
  const emailExists = (data.users || []).some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (emailExists) {
    return { error: `El correo institucional "${email}" ya se encuentra asignado a otra cuenta.` };
  }

  const targetScope = orgScopes.find((s) => s.id === orgScopeId);
  if (!targetScope) {
    return { error: 'La asignación organizacional seleccionada no es válida.' };
  }

  const newUserId = `usr-${Date.now()}`;
  const newUser = {
    id: newUserId,
    name,
    email,
    role,
    teamId: targetScope.teamId || null,
    teamName: targetScope.name,
    campaign: targetScope.campaign || undefined,
    status: status === 'Suspendido' ? 'Suspendido' : 'Activo'
  };

  // Si es agente, inicializar su estructura de consentimientos
  if (role === 'agente') {
    data.consents = data.consents || {};
    data.consents[newUserId] = {
      policyAccepted: false,
      policyVersion: null,
      c1: false,
      c2: false,
      c3: false,
      c4: false,
      c5: false,
      updatedAt: null
    };
  }

  data.users.push(newUser);
  pulsoStore.save(data);
  return { newUser };
}
export function manageUser(userId, newRole, newOrgScopeId, newStatus, orgScopes, actorLabel) {
  const data = pulsoStore.get();
  const userIndex = (data.users || []).findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return { error: 'El usuario no existe.' };
  }

  const targetScope = orgScopes.find((s) => s.id === newOrgScopeId);
  if (!targetScope) {
    return { error: 'La asignación organizacional no es válida.' };
  }

  const user = data.users[userIndex];
  const auditEntries = [];

  // 1. Cambio de rol
  if (user.role !== newRole) {
    auditEntries.push({
      actor: actorLabel,
      action: 'CAMBIO_ROL',
      target: `${user.id} (${user.email}) · ${ROLE_LABELS[user.role] || user.role} -> ${ROLE_LABELS[newRole] || newRole}`
    });
    user.role = newRole;
  }

  // 2. Traslado organizacional
  const currentTeamId = user.teamId || null;
  const targetTeamId = targetScope.teamId || null;
  const currentTeamName = user.teamName || '';
  if (currentTeamId !== targetTeamId || currentTeamName !== targetScope.name) {
    auditEntries.push({
      actor: actorLabel,
      action: 'TRASLADO_ORGANIZACIONAL',
      target: `${user.id} (${user.email}) · ${user.teamName || 'Sin asignar'} -> ${targetScope.label}`
    });
    user.teamId = targetTeamId;
    user.teamName = targetScope.name;
    user.campaign = targetScope.campaign || undefined;
  }

  // 3. Cambio de estado de cuenta
  const currentStatus = user.status || 'Activo';
  if (currentStatus !== newStatus) {
    const action = newStatus === 'Suspendido' ? 'SUSPENSION_USUARIO' : 'ACTIVACION_USUARIO';
    auditEntries.push({
      actor: actorLabel,
      action,
      target: `${user.id} (${user.email}) · Estado: ${currentStatus} -> ${newStatus}`
    });
    user.status = newStatus;
  }

  if (auditEntries.length === 0) {
    return { unchanged: true };
  }

  pulsoStore.save(data);
  auditEntries.forEach((entry) => pulsoStore.audit(entry));

  return { user };
}
