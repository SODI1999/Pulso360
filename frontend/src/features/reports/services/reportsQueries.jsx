import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { onLogout } from '../../../core/auth/authService';

let reportsHistoryCache = new Map();

export function getCachedReports(campanaId = null, equipoId = null) {
  const key = `${campanaId || 'all'}_${equipoId || 'all'}`;
  return reportsHistoryCache.get(key) || null;
}

export function clearReportsCache() {
  reportsHistoryCache.clear();
}

onLogout(clearReportsCache);

export function getReportData() {
  return { settings: { umbralMinimo: 5 }, reportHistory: [] };
}

export async function fetchReports(campanaId = null, equipoId = null) {
  if (!getAuthToken()) throw new Error('Sesión no válida o expirada.');
  try {
    const params = {};
    if (campanaId && campanaId !== 'all') params.campanaId = campanaId;
    if (equipoId && equipoId !== 'all') params.equipoId = equipoId;

    const response = await apiClient.get('/reports', { params });
    const mapped = (response.data || []).map((r) => ({
      ...r,
      date: r.createdAt || r.created_at,
      user: r.parametrosFiltro?.requester_name || r.autorId,
      scope: r.parametrosFiltro?.scope_label || r.equipoId || r.campanaId || 'Organización',
      format: r.parametrosFiltro?.format?.toUpperCase(),
      hash: r.hashIntegridad,
      metrics: r.metrics
    }));
    const key = `${campanaId || 'all'}_${equipoId || 'all'}`;
    reportsHistoryCache.set(key, mapped);
    return mapped;
  } catch (err) {
    throw new Error(err.response?.data?.error?.message || 'No se pudo cargar el historial de reportes.');
  }
}
