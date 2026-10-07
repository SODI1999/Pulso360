import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';
import { onLogout } from '../../../core/auth/authService';
import { normalizeRule } from '../../../core/api/ruleContract';
import { pulsoStore } from '../../../core/storage/pulsoStore';

let adminUsersCache = null;
let adminOrgCache = null;
let adminParamsCache = null;
let adminHabeasCache = null;

export function clearAdminCache() {
  adminUsersCache = null;
  adminOrgCache = null;
  adminParamsCache = null;
  adminHabeasCache = null;
}

onLogout(clearAdminCache);

export function getOrganizationData() {
  if (!env.useMockStorage) {
    if (adminOrgCache) return { organization: adminOrgCache, settings: adminParamsCache || {}, users: adminUsersCache || [] };
    return { organization: { campaigns: [] }, settings: {}, users: [] };
  }
  const { organization, settings, users } = pulsoStore.get();
  return { organization, settings, users };
}

export function getUserManagementData() {
  if (!env.useMockStorage) {
    if (adminUsersCache) return { users: adminUsersCache, organization: adminOrgCache || { campaigns: [] } };
    return { users: [], organization: { campaigns: [] } };
  }
  const { users, organization } = pulsoStore.get();
  return { users, organization };
}

export function getSystemParameters() {
  if (!env.useMockStorage) {
    if (adminParamsCache) return { settings: adminParamsCache, rules: adminParamsCache.rules || [] };
    return { settings: {}, rules: [] };
  }
  const { settings, rules } = pulsoStore.get();
  return { settings, rules };
}

export function getHabeasData() {
  if (!env.useMockStorage) {
    if (adminHabeasCache) return { habeasRequests: adminHabeasCache, users: adminUsersCache || [] };
    return { habeasRequests: [], users: [] };
  }
  const { habeasRequests, users } = pulsoStore.get();
  return { habeasRequests, users };
}

/**
 * Recupera la lista de usuarios del sistema, incluyendo su equipo y campaña.
 * @returns {Promise<Array>} Lista normalizada de usuarios.
 */
export async function fetchAdminUsers() {
  if (!env.useMockStorage) {
    if (!getAuthToken()) throw new Error('Sesión no válida o expirada.');
    try {
      const res = await apiClient.get('/admin/users');
      const payload = res.data?.data || res.data;
      const arrayPayload = Array.isArray(payload) ? payload : [];
      const usersList = arrayPayload.map((u) => ({
        ...u,
        name: u.nombres && u.apellidos ? `${u.nombres} ${u.apellidos}` : u.name,
        role: u.rol_codigo?.toLowerCase() || u.role,
        status: u.estado || u.status,
        email: u.correo || u.email, teamId: u.equipo_id, teamName: u.equipo_nombre, campaignId: u.campana_id, campaign: u.campana_nombre
      }));
      adminUsersCache = usersList;
      return usersList;
    } catch (error) {
      throw new Error(error.response?.data?.error?.message || 'No se pudieron cargar los datos del servidor.');
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
    if (!getAuthToken()) throw new Error('Sesión no válida o expirada.');
    try {
      const res = await apiClient.get('/admin/organization');
      const payload = res.data?.data || res.data || { campaigns: [] };
      const campaignsRaw = payload.campaigns || (Array.isArray(payload) ? payload : []);
      const orgData = {
        ...payload,
        campaigns: (Array.isArray(campaignsRaw) ? campaignsRaw : []).map((c) => ({
          ...c,
          name: c.nombre || c.name,
          active: c.activa !== undefined ? c.activa : (c.activo !== undefined ? c.activo : c.active),
          teams: (c.equipos || c.teams || []).map((t) => ({
            ...t,
            name: t.nombre || t.name,
            supervisor: t.supervisor_nombre || t.supervisor, supervisorId: t.supervisor_id,
            n: t.n_miembros !== undefined ? t.n_miembros : t.n,
            active: t.activo !== undefined ? t.activo : (t.activa !== undefined ? t.activa : t.active)
          }))
        }))
      };
      adminOrgCache = orgData;
      return orgData;
    } catch (error) {
      throw new Error(error.response?.data?.error?.message || 'No se pudieron cargar los datos del servidor.');
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
    if (!getAuthToken()) throw new Error('Sesión no válida o expirada.');
    try {
      const res = await apiClient.get('/admin/params');
      const raw = res.data?.data || res.data || {};
      const versions = (await apiClient.get('/admin/nlp/versions')).data;
      const policies = (raw.policies || []).filter(p => p.estado === 'PUBLICADA' && new Date(p.vigente_desde) <= new Date())
        .sort((a,b) => new Date(b.vigente_desde) - new Date(a.vigente_desde));
      const params = Object.fromEntries((raw.params || []).map(p => [p.clave, p.valor]));
      const governance = params.gobernanza_checkin || {};
      const sla = params.slas_atencion || {};
      const paramsData = { umbralMinimo: 5, checkinEditHours: 2, minGranularity: governance.granularidad_minima,
        auditRetentionYears: governance.retencion_auditoria_anios, slaAltaHoras: sla.alta_horas,
        slaMediaHoras: sla.media_horas, slaBajaHoras: sla.baja_horas, slaSolicitudesHoras: sla.solicitudes_horas,
        policyVersion: policies[0]?.version || null, policyVersions: policies.map(p => p.version),
        nlpVersion:versions.find(v => v.estado === 'ACTIVA')?.version || null,
        nlpVersions:versions.map(v => v.version), lexiconCatalog:versions,
        rules:(raw.rules || []).map(normalizeRule) };
      adminParamsCache = paramsData;
      return paramsData;
    } catch (error) {
      throw new Error(error.response?.data?.error?.message || 'No se pudieron cargar los datos del servidor.');
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
    if (!getAuthToken()) throw new Error('Sesión no válida o expirada.');
    try {
      const res = await apiClient.get('/admin/habeas-data');
      const payload = res.data?.data || res.data;
      const habeasList = Array.isArray(payload) ? payload.map(h => ({ ...h, userId:h.usuario_id, createdAt:h.created_at,
        date:h.created_at?.slice(0,10), deadline:h.deadline?.slice(0,10), type:h.type ?? h.request_type, code:h.code || h.id })) : [];
      adminHabeasCache = habeasList;
      return habeasList;
    } catch (error) {
      throw new Error(error.response?.data?.error?.message || 'No se pudieron cargar los datos del servidor.');
    }
  }
  return pulsoStore.get().habeasRequests || [];
}
