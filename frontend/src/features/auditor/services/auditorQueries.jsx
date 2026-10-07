import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';
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
  return env.useMockStorage ? { auditLogs:pulsoStore.get().auditLogs || [] } : { auditLogs: auditLogsCache ? auditLogsCache.logs : [] };
}
const normalizeLog = log => ({
  id:String(log.id),date:log.created_at || log.date || '',
  actor:log.nombres ? `${log.nombres} ${log.apellidos}` : log.actor_reference || log.usuario_id || log.actor || 'Sistema',
  action:log.action,target:log.resource ? `${log.resource}: ${JSON.stringify(log.details || {})}` : log.target || '',
  ip:log.ip_address || log.ip || '',status:log.status === 'SUCCESS' ? 'EXITO' : log.status || 'NO_REGISTRADO',prevHash:log.prev_hash || log.prevHash,hash:log.hash
});
export async function fetchAuditPage(filters={}) {
  if (env.useMockStorage) {
    const logs = getAuditData().auditLogs;
    const offset=filters.offset || 0,limit=filters.limit || 50;
    return { logs:logs.slice(offset,offset+limit).map(normalizeLog),pagination:{ total:logs.length,hasMore:offset+limit<logs.length } };
  }
  const response = await apiClient.get('/auditor/logs',{ params:filters });
  const result = { logs:response.data.map(normalizeLog),pagination:response.pagination };
  if (!filters.offset || filters.offset === 0) {
    auditLogsCache = result;
  }
  return result;
}
export async function fetchAuditLogs(filters={}) { return (await fetchAuditPage(filters)).logs; }
export async function verifyAudit() {
  if (env.useMockStorage) return { chainValid:true,contentValid:false,totalRecords:getAuditData().auditLogs.length,
    verifiedRecords:0,legacyUnverifiable:getAuditData().auditLogs.length,coverage:'Demostración local sin verificación criptográfica del servidor.' };
  return (await apiClient.get('/auditor/integrity')).data;
}
export async function exportAudit(filters) {
  if (env.useMockStorage) return { logs:getAuditData().auditLogs,metadata:{ demonstration:true } };
  return (await apiClient.post('/auditor/export',filters)).data;
}
