import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';
import { pulsoStore } from '../../../core/storage/pulsoStore';

export function getOrganizationData() {
  const { organization, settings, users } = pulsoStore.get();
  return { organization, settings, users };
}

export function getUserManagementData() {
  const { users, organization } = pulsoStore.get();
  return { users, organization };
}

export function getSystemParameters() {
  const { settings, rules } = pulsoStore.get();
  return { settings, rules };
}

export function getHabeasData() {
  const { habeasRequests, users } = pulsoStore.get();
  return { habeasRequests, users };
}

/**
 * Recupera la lista de usuarios del sistema, incluyendo su equipo y campaña.
 * @returns {Promise<Array>} Lista normalizada de usuarios.
 */
export async function fetchAdminUsers() {
  if (!env.useMockStorage) {
    if (!getAuthToken()) return [];
    try {
      const res = await apiClient.get('/admin/users');
      const payload = res.data?.data || res.data;
      const arrayPayload = Array.isArray(payload) ? payload : [];
      return arrayPayload.map((u) => ({
        ...u,
        name: u.nombres && u.apellidos ? `${u.nombres} ${u.apellidos}` : u.name,
        role: u.rol_codigo?.toLowerCase() || u.role,
        status: u.estado || u.status,
        email: u.correo || u.email
      }));
    } catch (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }
  }
  return pulsoStore.get().users || [];
}

/**
 * Recupera la estructura organizacional (campañas y equipos).
 * @returns {Promise<Object>} Organización estructurada.
 */
export async function fetchAdminOrganization() {
  if (!env.useMockStorage) {
    if (!getAuthToken()) return { campaigns: [] };
    try {
      const res = await apiClient.get('/admin/organization');
      const payload = res.data?.data || res.data || { campaigns: [] };
      const campaignsRaw = payload.campaigns || (Array.isArray(payload) ? payload : []);
      return {
        ...payload,
        campaigns: (Array.isArray(campaignsRaw) ? campaignsRaw : []).map((c) => ({
          ...c,
          name: c.nombre || c.name,
          active: c.activa !== undefined ? c.activa : (c.activo !== undefined ? c.activo : c.active),
          teams: (c.equipos || c.teams || []).map((t) => ({
            ...t,
            name: t.nombre || t.name,
            supervisor: t.supervisor_nombre || t.supervisor,
            n: t.n_miembros !== undefined ? t.n_miembros : t.n,
            active: t.activo !== undefined ? t.activo : (t.activa !== undefined ? t.activa : t.active)
          }))
        }))
      };
    } catch (error) {
      console.error('Error fetching admin organization:', error);
      return { campaigns: [] };
    }
  }
  return pulsoStore.get().organization || { campaigns: [] };
}

/**
 * Recupera los parámetros y políticas del sistema.
 * @returns {Promise<Object>} Objeto con parámetros del sistema.
 */
export async function fetchAdminParams() {
  if (!env.useMockStorage) {
    if (!getAuthToken()) return {};
    try {
      const res = await apiClient.get('/admin/params');
      return res.data?.data || res.data || {};
    } catch (error) {
      console.error('Error fetching admin params:', error);
      return {};
    }
  }
  return pulsoStore.get().settings || {};
}

/**
 * Recupera las solicitudes de Habeas Data (ARCO).
 * @returns {Promise<Array>} Lista de solicitudes.
 */
export async function fetchHabeasData() {
  if (!env.useMockStorage) {
    if (!getAuthToken()) return [];
    try {
      const res = await apiClient.get('/admin/habeas-data');
      const payload = res.data?.data || res.data;
      return Array.isArray(payload) ? payload : [];
    } catch (error) {
      console.error('Error fetching habeas data:', error);
      return [];
    }
  }
  return pulsoStore.get().habeasRequests || [];
}
