import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export async function saveFollowup(interventionId, actionType, notes, progress, user) {
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

    if (!env.useMockStorage && getAuthToken()) {
      try {
        await apiClient.post('/supervisor/actions/' + interventionId + '/followup', { actionType, notes, progress });
      } catch (err) {
        console.warn('Backend inalcanzable, fallo al guardar en servidor pero persistido en local.', err.message);
      }
    }

    return `Seguimiento guardado exitosamente para "${intervention.title}". Avance actualizado al ${progress}%.`;
  }
}
