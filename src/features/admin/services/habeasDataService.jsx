import { pulsoStore } from '../../../core/storage/pulsoStore';

export function confirmAdvance(requestId, nextStatus, note, actorLabel) {
  const data = pulsoStore.get();
  const req = (data.habeasRequests || []).find((item) => item.id === requestId);
  if (!req) return null;

  req.status = nextStatus;
  if (note) req.note = note;

  pulsoStore.save(data);

  pulsoStore.audit({
    actor: actorLabel,
    action: 'GESTION_HABEAS_DATA',
    target: `${req.id} (${req.type}) -> Estado: ${nextStatus} · Constancia: ${note || 'Sin nota'}`
  });
  return { req };
}
