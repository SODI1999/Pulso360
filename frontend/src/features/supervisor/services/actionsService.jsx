import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';
import { clearSupervisorCache } from './supervisorQueries';


export async function saveFollowup(interventionId, actionType, notes, progress, user) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) {
      return { success:false,data:null,error: 'Sesión no válida o token ausente' };
    }
    try {
      const response = await apiClient.post('/supervisor/actions/' + interventionId + '/followup', { actionType, notes, progress });
      clearSupervisorCache();

      return { ...response,message:`Seguimiento guardado exitosamente. Avance actualizado al ${progress}%.` };
    } catch (err) {
      return { success:false,data:null,error: err.response?.data?.error?.message || 'Error en el servidor' };
    }
  }

  const data = pulsoStore.get();
  const intervention = (data.interventions || []).find((i) => i.id === interventionId);

  if (intervention && user?.role === 'supervisor' && intervention.assignedTo === user.id) {
    intervention.progress = progress;
    intervention.lastFollowup = {
      date: new Date().toISOString().substring(0, 10),
      actionType,
      notes,
      supervisor: user?.name
    };

    if (progress >= 100) {
      intervention.status = 'Cerrada';
    } else if (intervention.status === 'Pendiente') {
      intervention.status = 'Activa';
    }

    pulsoStore.save(data);

    // Registrar el seguimiento en la auditoría local (RF-09)
    pulsoStore.audit({
      actor: `${user?.name || 'Supervisor'} (${user?.role || 'supervisor'})`,
      action: 'SEGUIMIENTO_INTERVENCION',
      target: `${intervention.title} · ${actionType} (${progress}% avance)`
    });

    return {success:true,data:intervention,message:`Seguimiento guardado exitosamente para "${intervention.title}". Avance actualizado al ${progress}%.`};
  }
  return {success:false,data:null,error:'Intervención no disponible para este supervisor.'};
}
