import { QUESTIONS } from '../data/checkinWizardData';
import { roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export async function saveCheckin(existingCheckin, user, journeyKey, draft) {
  if (!env.useMockStorage && getAuthToken()) {
    try {
      const res = await apiClient.post('/agent/checkin', {
        journey_key: journeyKey,
        checkin_date: journeyKey,
        energia: Number(draft.energia),
        carga_emocional: Number(draft.cargaEmocional ?? draft.carga_emocional),
        recuperacion: Number(draft.recuperacion),
        apoyo: Number(draft.apoyo),
        distanciamiento: Number(draft.distanciamiento),
        ineficacia: Number(draft.ineficacia)
      });
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
