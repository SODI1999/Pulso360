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
  if (!env.useMockStorage && getAuthToken()) {
    try {
      const res = await apiClient.get('/admin/users');
      const payload = res.data?.data || res.data;
      return Array.isArray(payload) ? payload : [];
    } catch (error) {
      console.error('Error fetching admin users:', error);
    }
  }
  return pulsoStore.get().users || [];
}

/**
 * Recupera la estructura organizacional (campañas y equipos).
 * @returns {Promise<Object>} Organización estructurada.
 */
export async function fetchAdminOrganization() {
  if (!env.useMockStorage && getAuthToken()) {
    try {
      const res = await apiClient.get('/admin/organization');
      return res.data?.data || res.data || { campaigns: [] };
    } catch (error) {
      console.error('Error fetching admin organization:', error);
    }
  }
  return pulsoStore.get().organization || { campaigns: [] };
}

/**
 * Recupera los parámetros y políticas del sistema.
 * @returns {Promise<Object>} Objeto con parámetros del sistema.
 */
export async function fetchAdminParams() {
  if (!env.useMockStorage && getAuthToken()) {
    try {
      const res = await apiClient.get('/admin/params');
      return res.data?.data || res.data || {};
    } catch (error) {
      console.error('Error fetching admin params:', error);
    }
  }
  return pulsoStore.get().settings || {};
}

/**
 * Recupera las solicitudes de Habeas Data (ARCO).
 * @returns {Promise<Array>} Lista de solicitudes.
 */
export async function fetchHabeasData() {
  if (!env.useMockStorage && getAuthToken()) {
    try {
      const res = await apiClient.get('/admin/habeas-data');
      const payload = res.data?.data || res.data;
      return Array.isArray(payload) ? payload : [];
    } catch (error) {
      console.error('Error fetching habeas data:', error);
    }
  }
  return pulsoStore.get().habeasRequests || [];
}
