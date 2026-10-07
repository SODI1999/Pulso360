import { ROLE_LABELS } from '../data/usersRolesData';

import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';
import { clearAdminCache } from './adminQueries';

export async function saveCreateUser(email, orgScopes, orgScopeId, name, role, status, password) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) {
      return { success:false,data:null,error: 'Sesión no válida o token ausente' };
    }
    const targetScope = orgScopes.find((s) => s.id === orgScopeId);
    if (!targetScope) {
      return { success:false,data:null,error: 'La asignación organizacional seleccionada no es válida.' };
    }
    const parts = name.trim().split(/\s+/);
    const nombres = parts[0] || name.trim();
    const apellidos = parts.slice(1).join(' ') || '.';
    try {
      const res = await apiClient.post('/admin/users', {
        correo: email,
        nombres,
        apellidos,
        rolCodigo: role.toUpperCase(),
        equipoId: targetScope?.teamId, status, contrasena: password
      });
      clearAdminCache();
      return { ...res, newUser: res.data };
    } catch (error) {
      return { success:false,data:null,error: error.response?.data?.error?.message || 'Error al registrar usuario en el servidor.' };
    }
  }

  const data = pulsoStore.get();

  // Validación atómica: correo único
  const emailExists = (data.users || []).some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (emailExists) {
    return { success:false,data:null,error: `El correo institucional "${email}" ya se encuentra asignado a otra cuenta.` };
  }

  const targetScope = orgScopes.find((s) => s.id === orgScopeId);
  if (!targetScope) {
    return { success:false,data:null,error: 'La asignación organizacional seleccionada no es válida.' };
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

  return { success:true,data:newUser, newUser };
}

export async function manageUser(userId, newRole, newOrgScopeId, newStatus, orgScopes, actorLabel) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) {
      return { success:false,data:null,error: 'Sesión no válida o token ausente' };
    }
    try {
      const scope = orgScopes.find(s => s.id === newOrgScopeId);
      if (!scope) return { success:false,data:null,error: 'La asignación seleccionada no es válida.' };
      const res = await apiClient.patch('/admin/users/' + userId, { status: newStatus, rolCodigo: newRole.toUpperCase(), equipoId: scope.teamId });
      clearAdminCache();
      return { ...res,user: { ...res.data, name: [res.data.nombres, res.data.apellidos].join(' ') } };
    } catch (error) {
      return { success:false,data:null,error: error.response?.data?.error?.message || 'Error al actualizar estado en el servidor.' };
    }
  }

  const data = pulsoStore.get();
  const userIndex = (data.users || []).findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return { success:false,data:null,error: 'El usuario no existe.' };
  }

  const targetScope = orgScopes.find((s) => s.id === newOrgScopeId);
  if (!targetScope) {
    return { success:false,data:null,error: 'La asignación organizacional no es válida.' };
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
    return {success:true,data:user,unchanged:true};
  }

  pulsoStore.save(data);
  auditEntries.forEach((entry) => pulsoStore.audit(entry));

  return { success:true,data:user,user };
}
