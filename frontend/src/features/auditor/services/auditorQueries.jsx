import { apiClient } from '../../../core/api/apiClient';
import { onLogout } from '../../../core/auth/authService';

let auditLogsCache = null;

export function getCachedAuditLogs() {
  return auditLogsCache;
}

export function clearAuditorCache() {
  auditLogsCache = null;
}

onLogout(clearAuditorCache);

export function getAuditData() {
  return { auditLogs: auditLogsCache ? auditLogsCache.logs : [] };
}

const RESOURCE_LABELS = {
  daily_checkins: 'Check-ins diarios',
  reports: 'Reportes consolidados',
  campaigns: 'Campañas operativas',
  teams: 'Equipos de trabajo',
  users: 'Usuarios y roles',
  alerts: 'Reglas y alertas SST',
  consent: 'Consentimiento / Habeas Data',
  system: 'Configuración del sistema'
};

function formatTargetHuman(resource, details, fallback) {
  if (!resource && fallback) return fallback;
  const friendlyResource = RESOURCE_LABELS[resource] || resource || 'Entidad';
  if (!details || typeof details !== 'object' || Object.keys(details).length === 0) {
    return friendlyResource;
  }
  const parts = Object.entries(details)
    .filter(([key, v]) => Boolean(key) && v !== undefined && v !== null && v !== '')
    .slice(0, 2)
    .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`);
  return parts.length > 0 ? `${friendlyResource} (${parts.join(', ')})` : friendlyResource;
}

const normalizeLog = (log) => ({
  id: String(log.id),
  date: log.created_at || log.date || '',
  actor: log.nombres
    ? `${log.nombres} ${log.apellidos}`
    : log.actor_reference || log.usuario_id || log.actor || 'Sistema',
  action: log.action || 'OPERACION',
  resource: log.resource || '',
  details: log.details || null,
  target: formatTargetHuman(log.resource, log.details, log.target),
  rawDetails: log.details || (log.target ? { target: log.target } : {}),
  ip: log.ip_address || log.ip || '',
  status: log.status === 'SUCCESS' ? 'EXITO' : log.status || 'NO_REGISTRADO',
  prevHash: log.prev_hash || log.prevHash,
  hash: log.hash
});

export async function fetchAuditPage(filters = {}) {
  const response = await apiClient.get('/auditor/logs', { params: filters });
  const result = { logs: response.data.map(normalizeLog), pagination: response.pagination };
  if (!filters.offset || filters.offset === 0) {
    auditLogsCache = result;
  }
  return result;
}

export async function fetchAuditLogs(filters = {}) {
  return (await fetchAuditPage(filters)).logs;
}

export async function verifyAudit() {
  return (await apiClient.get('/auditor/integrity')).data;
}

export async function exportAudit(filters) {
  return (await apiClient.post('/auditor/export', filters)).data;
}
