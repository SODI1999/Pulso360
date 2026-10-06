import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export function getReportData() {
  if (!env.useMockStorage) return { settings: { umbralMinimo:5 }, reportHistory:[] };
  const { settings, reportHistory } = pulsoStore.get();
  return { settings, reportHistory };
}

export async function fetchReports(campanaId = null, equipoId = null) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) throw new Error('Sesión no válida o expirada.');
    try {
      const params = {};
      if (campanaId && campanaId !== 'all') params.campanaId = campanaId;
      if (equipoId && equipoId !== 'all') params.equipoId = equipoId;

      const response = await apiClient.get('/reports', { params });
      return (response.data || []).map(r => ({ ...r, date:r.createdAt || r.created_at,
        user:r.parametrosFiltro?.requester_name || r.autorId, scope:r.parametrosFiltro?.scope_label || r.equipoId || r.campanaId || 'Organización',
        format:r.parametrosFiltro?.format?.toUpperCase(), hash:r.hashIntegridad, metrics:r.metrics }));
    } catch (err) {
      throw new Error(err.response?.data?.error?.message || 'No se pudo cargar el historial de reportes.');
    }
  }
  return pulsoStore.get().reportHistory || [];
}
