import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export function getAuditData() {
  const { auditLogs } = pulsoStore.get();
  return { auditLogs };
}

/**
 * Recupera los registros de auditoría del sistema de manera asíncrona.
 * Consulta al backend si la integración está activa, de lo contrario
 * utiliza el almacenamiento local como respaldo.
 *
 * @param {Object} filters - Parámetros de filtrado para la consulta.
 * @returns {Promise<Array>} Lista de registros normalizados.
 */
export async function fetchAuditLogs(filters = {}) {
  const token = getAuthToken();

  if (!env.useMockStorage && token) {
    try {
      const res = await apiClient.get('/auditor/logs', { params: filters });
      const payload = res.data?.data?.logs || res.data?.logs || (Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []));
      const records = Array.isArray(payload) ? payload : [];
      
      return records.map((log) => ({
        id: log.id,
        date: log.created_at || log.timestamp || '',
        actor: log.usuario_nombre || log.actor || 'Sistema',
        action: log.action || 'SISTEMA',
        target: log.resource ? `${log.resource}: ${log.details || ''}` : (log.target || log.details || ''),
        ip: log.ip_address || log.ip || '0.0.0.0',
        status: log.status || 'SUCCESS',
        prevHash: log.prev_hash || log.prevHash || '',
        hash: log.hash || ''
      }));
    } catch (error) {
      console.error('Error al recuperar registros de auditoría desde el backend:', error);
      // Retorna fallback en caso de error
    }
  }

  return pulsoStore.get().auditLogs || [];
}
