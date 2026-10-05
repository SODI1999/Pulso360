import { QUESTIONS } from '../data/checkinWizardData';
import { roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export async function saveCheckin(existingCheckin, user, journeyKey, draft) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) return { error: 'Sesión no válida o expirada.' };
    try {
      const payloadBody = {
        journey_key: journeyKey,
        checkin_date: journeyKey,
        energia: draft.energia != null ? Number(draft.energia) : null,
        carga_emocional: (draft.cargaEmocional ?? draft.carga_emocional) != null ? Number(draft.cargaEmocional ?? draft.carga_emocional) : null,
        recuperacion: draft.recuperacion != null ? Number(draft.recuperacion) : null,
        apoyo: draft.apoyo != null ? Number(draft.apoyo) : null,
        distanciamiento: draft.distanciamiento != null ? Number(draft.distanciamiento) : null,
        ineficacia: draft.ineficacia != null ? Number(draft.ineficacia) : null
      };

      let res;
      if (existingCheckin && existingCheckin.id) {
        res = await apiClient.put(`/agent/checkin/${existingCheckin.id}`, payloadBody);
      } else {
        res = await apiClient.post('/agent/checkin', payloadBody);
      }
      return { payload: res.data };
    } catch (err) {
      return { error: err.response?.data?.error?.message || 'Error al registrar check-in' };
    }
  }

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

  return { payload };
}
