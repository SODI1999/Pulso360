import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { clearSupervisorCache } from './supervisorQueries';

export async function saveFollowup(interventionId, actionType, notes, progress) {
  if (!getAuthToken()) {
    return { success: false, data: null, error: 'Sesión no válida o token ausente' };
  }
  try {
    const response = await apiClient.post('/supervisor/actions/' + interventionId + '/followup', {
      actionType,
      notes,
      progress
    });
    clearSupervisorCache();
    return { ...response, message: `Seguimiento guardado exitosamente. Avance actualizado al ${progress}%.` };
  } catch (err) {
    return { success: false, data: null, error: err.response?.data?.error?.message || 'Error en el servidor' };
  }
}
