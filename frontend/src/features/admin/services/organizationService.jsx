import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { clearAdminCache } from './adminQueries';

export async function toggleCampaign(campId, currentActive) {
  const newActive = !currentActive;
  if (!getAuthToken()) {
    return { success: false, data: null, error: 'Sesión no válida o token ausente' };
  }
  try {
    const response = await apiClient.patch('/admin/campaigns/' + campId, { activa: newActive });
    clearAdminCache();
    return { ...response, camp: response.data, newStatus: response.data.activa ? 'Activa' : 'Inactiva' };
  } catch (error) {
    return { success: false, data: null, error: error.response?.data?.error?.message || 'Error en el servidor' };
  }
}

export async function toggleTeam(campId, teamId, currentActive) {
  const newActive = !currentActive;
  if (!getAuthToken()) {
    return { success: false, data: null, error: 'Sesión no válida o token ausente' };
  }
  try {
    const response = await apiClient.patch('/admin/teams/' + teamId, { activo: newActive });
    clearAdminCache();
    return { ...response, team: response.data, newStatus: response.data.activo ? 'Activo' : 'Inactivo' };
  } catch (error) {
    return { success: false, data: null, error: error.response?.data?.error?.message || 'Error en el servidor' };
  }
}

export async function saveSupervisorAssignment(campId, teamId, newSupervisor) {
  if (!getAuthToken()) {
    return { success: false, data: null, error: 'Sesión no válida o token ausente' };
  }
  try {
    const response = await apiClient.patch('/admin/teams/' + teamId, { supervisorId: newSupervisor });
    clearAdminCache();
    return { ...response, team: response.data };
  } catch (error) {
    return { success: false, data: null, error: error.response?.data?.error?.message || 'Error en el servidor' };
  }
}

export async function saveCampaign(id, name, active) {
  if (!getAuthToken()) {
    return { success: false, data: null, error: 'Sesión no válida o token ausente' };
  }
  try {
    if (id) {
      const response = await apiClient.patch('/admin/campaigns/' + id, { nombre: name, activa: active });
      clearAdminCache();
      return { ...response, message: `Campaña "${name}" actualizada con éxito.` };
    } else {
      const codigo = name.toUpperCase().replace(/\s+/g, '-').slice(0, 20);
      const response = await apiClient.post('/admin/campaigns', {
        codigo,
        nombre: name,
        descripcion: 'Campaña ' + name,
        activa: active
      });
      clearAdminCache();
      return { ...response, message: `Campaña "${name}" creada exitosamente.` };
    }
  } catch (error) {
    return { success: false, data: null, error: error.response?.data?.error?.message || 'Error en el servidor' };
  }
}

export async function saveTeam(campId, teamId, name, n, supervisor, active) {
  if (!getAuthToken()) {
    return { success: false, data: null, error: 'Sesión no válida o token ausente' };
  }
  try {
    if (teamId) {
      const response = await apiClient.patch('/admin/teams/' + teamId, {
        nombre: name,
        nMiembros: n,
        supervisorId: supervisor,
        activo: active
      });
      clearAdminCache();
      return { ...response, message: `Equipo "${name}" modificado con éxito.` };
    } else {
      const codigo = name.toUpperCase().replace(/\s+/g, '-').slice(0, 20);
      const response = await apiClient.post('/admin/teams', {
        campanaId: campId,
        codigo,
        nombre: name,
        descripcion: 'Equipo ' + name,
        supervisorId: supervisor,
        nMiembros: n,
        activo: active
      });
      clearAdminCache();
      return { ...response, message: `Equipo "${name}" creado exitosamente.` };
    }
  } catch (error) {
    return { success: false, data: null, error: error.response?.data?.error?.message || 'Error en el servidor' };
  }
}

export function resetDemo() {
  return { success: false, error: 'El restablecimiento no está disponible sin conexión con el backend.' };
}
