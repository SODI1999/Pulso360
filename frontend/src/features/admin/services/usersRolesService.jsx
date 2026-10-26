import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { clearAdminCache } from './adminQueries';

export async function saveCreateUser(email, orgScopes, orgScopeId, name, role, status, password) {
  if (!getAuthToken()) {
    return { success: false, data: null, error: 'Sesión no válida o token ausente' };
  }
  const targetScope = orgScopes.find((s) => s.id === orgScopeId);
  if (!targetScope) {
    return { success: false, data: null, error: 'La asignación organizacional seleccionada no es válida.' };
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
      equipoId: targetScope?.teamId,
      status,
      contrasena: password
    });
    clearAdminCache();
    return { ...res, newUser: res.data };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.response?.data?.error?.message || 'Error al registrar usuario en el servidor.'
    };
  }
}

export async function manageUser(userId, newRole, newOrgScopeId, newStatus, orgScopes) {
  if (!getAuthToken()) {
    return { success: false, data: null, error: 'Sesión no válida o token ausente' };
  }
  try {
    const scope = orgScopes.find((s) => s.id === newOrgScopeId);
    if (!scope) return { success: false, data: null, error: 'La asignación seleccionada no es válida.' };
    const res = await apiClient.patch('/admin/users/' + userId, {
      status: newStatus,
      rolCodigo: newRole.toUpperCase(),
      equipoId: scope.teamId
    });
    clearAdminCache();
    return {
      ...res,
      user: {
        ...res.data,
        role: res.data.rol_codigo?.toLowerCase() || res.data.role,
        status: res.data.estado || res.data.status,
        name: [res.data.nombres, res.data.apellidos].filter(Boolean).join(' ') || res.data.name
      }
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.response?.data?.error?.message || 'Error al actualizar estado en el servidor.'
    };
  }
}
