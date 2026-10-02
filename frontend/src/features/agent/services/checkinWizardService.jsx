import { QUESTIONS } from '../data/checkinWizardData';
import { roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export function saveCheckin(existingCheckin, user, journeyKey, draft) {
  const storeData = pulsoStore.get();
  const payload = {
    id: existingCheckin?.id || `chk-${Date.now()}`,
    userId: user.id,
    journeyKey,
    date: journeyKey,
    submittedAt: existingCheckin?.submittedAt || new Date().toISOString(),
    ...Object.fromEntries(
      QUESTIONS.map((q) => [q.key, Object.prototype.hasOwnProperty.call(draft, q.key) ? draft[q.key] : null])
    )
  };

  if (existingCheckin) {
    const index = storeData.checkins.findIndex((c) => c.id === existingCheckin.id);
    if (index >= 0) storeData.checkins[index] = payload;
  } else {
    storeData.checkins.unshift(payload);
  }

  pulsoStore.save(storeData);
  pulsoStore.audit({
    actor: `${user.id} (${roleLabels[user.role] || user.role})`,
    action: existingCheckin ? 'EDICION_CHECKIN' : 'REGISTRO_CHECKIN',
    target: `Jornada ${journeyKey}`
  });

  // Sincronización asíncrona desacoplada con el backend
  /**
   * ¿POR QUÉ se hace un fire-and-forget al backend?
   * Mantenemos la UI ultra rápida (optimistic UI) basándonos en la
   * actualización local del pulsoStore. El guardado remoto se hace
   * en segundo plano. Si falla (por red inestable en BPO), se loguea,
   * pero el agente sigue su proceso sin ver errores técnicos bloqueantes.
   */
  if (!env.useMockStorage && getAuthToken()) {
    apiClient.post('/agent/checkin', {
      journeyKey,
      checkinDate: journeyKey,
      energia: Number(draft.energia || 3),
      cargaEmocional: Number(draft.cargaEmocional || 3),
      recuperacion: Number(draft.recuperacion || 3),
      apoyo: Number(draft.apoyo || 3),
      distanciamiento: Number(draft.distanciamiento || 3),
      ineficacia: Number(draft.ineficacia || 3)
    }).catch((err) => {
      console.warn('Backend: Sincronización de checkin fallida (modo offline).', err.message);
    });
  }

  return { payload };
}
