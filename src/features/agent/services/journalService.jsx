import { roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';

const unavailableJournal = () => ({ error: 'La entrada no está disponible para este usuario.' });
const ownsJournal = (journal, user) =>
  Boolean(user?.id && user.role === 'agente' && journal?.userId === user.id);

export function saveJournal(currentJournalId, currentUser, currentJournal, contextTag, trimmed) {
  let storeData = pulsoStore.get();
  const isNew = !currentJournalId;
  if (!currentUser?.id || currentUser.role !== 'agente') return unavailableJournal();
  const storedJournal = isNew ? null : storeData.journals.find((journal) => journal.id === currentJournalId);
  if (!isNew && !ownsJournal(storedJournal, currentUser)) return unavailableJournal();
  // Los metadatos proceden del registro guardado, no de una copia enviada por la vista.
  currentJournal = storedJournal;
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);

  const journalPayload = {
    id: currentJournalId || `jrn-${Date.now()}`,
    userId: currentUser.id,
    date: currentJournal?.date || dateStr,
    createdAt: currentJournal?.createdAt || now.toISOString(),
    updatedAt: now.toISOString(),
    context: contextTag,
    text: trimmed,
    analysis: currentJournal?.analysis || null,
    correctedCategories: currentJournal?.correctedCategories || null,
    correctionNote: currentJournal?.correctionNote || null,
    correctionHistory: currentJournal?.correctionHistory || []
  };

  if (isNew) {
    storeData.journals.unshift(journalPayload);
  } else {
    const index = storeData.journals.findIndex((j) => j.id === currentJournalId);
    if (index >= 0) storeData.journals[index] = journalPayload;
  }

  pulsoStore.save(storeData);
  pulsoStore.audit({
    actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
    action: isNew ? 'REGISTRO_BITACORA' : 'ACTUALIZACION_BITACORA',
    target: `Bitácora ${journalPayload.id}`
  });
  return { journalPayload };
}

export function deleteJournal(currentJournalId, currentUser) {
  const storeData = pulsoStore.get();
  const target = storeData.journals.find((journal) => journal.id === currentJournalId);
  if (!ownsJournal(target, currentUser)) return unavailableJournal();
  storeData.journals = storeData.journals.filter((j) => j.id !== currentJournalId);
  pulsoStore.save(storeData);

  pulsoStore.audit({
    actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
    action: 'ELIMINACION_BITACORA',
    target: `Bitácora ${currentJournalId}`
  });
  return {};
}

export function saveCorrection(currentJournalId, selectedCategories, correctionNote, currentUser) {
  const storeData = pulsoStore.get();
  const target = storeData.journals.find((j) => j.id === currentJournalId);
  if (!ownsJournal(target, currentUser)) return unavailableJournal();

  let finalCategories = selectedCategories.filter((c) => c !== 'Ninguna aplica');
  const previousCats = target.correctedCategories
    ? [...target.correctedCategories]
    : (target.analysis?.categories || []).map((c) => c.name);

  const noteText = correctionNote.trim().slice(0, 200);

  const newCorrectionRecord = {
    id: `corr-${Date.now()}`,
    timestamp: new Date().toISOString(),
    dateFormatted: new Date().toLocaleString('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short'
    }),
    modelVersion: target.analysis?.version || 'lexico-v1.2',
    categories: finalCategories,
    previousCategories: previousCats,
    note: noteText
  };

  target.correctionHistory = target.correctionHistory || [];
  target.correctionHistory.unshift(newCorrectionRecord);
  target.correctedCategories = finalCategories;
  target.correctionNote = noteText;

  pulsoStore.save(storeData);
  pulsoStore.audit({
    actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
    action: 'CORRECCION_NLP',
    target: `Bitácora ${target.id} (Corrección #${target.correctionHistory.length})`
  });
  return {};
}
export function saveJournalAnalysis(journalPayload, analysisResult, currentUser) {
  const storeData = pulsoStore.get();
  const target = storeData.journals.find((j) => j.id === journalPayload.id);
  if (!ownsJournal(target, currentUser)) return unavailableJournal();
  if (target) {
    target.analysis = analysisResult;
    pulsoStore.save(storeData);
  }

  pulsoStore.audit({
    actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
    action: 'EJECUCION_NLP',
    target: `Bitácora ${journalPayload.id}`
  });
  return {};
}

export function createPriorityRequest(currentUser, crisisMode) {
  const storeData = pulsoStore.get();
  const currentConsent = storeData.consents?.[currentUser?.id];

  if (!currentConsent?.c5) {
    return {
      error: 'Se requiere tener activa la finalidad C5 de consentimiento para canalizar solicitudes a SST.'
    };
  }

  const now = new Date();
  const year = now.getFullYear();
  const isAnonymous = crisisMode === 'anonimo';
  const prefix = isAnonymous ? 'ANON-PRI' : 'CONF-PRI';
  storeData.supportRequests = storeData.supportRequests || [];
  const existingCount = storeData.supportRequests.filter((r) =>
    String(r.code || '').startsWith(`${prefix}-${year}-`)
  ).length;
  const code = `${prefix}-${year}-${String(existingCount + 1).padStart(4, '0')}`;

  const newRequest = {
    id: `req-${Date.now()}`,
    code,
    mode: crisisMode,
    ownerUserId: currentUser.id,
    identityUserId: isAnonymous ? null : currentUser.id,
    date: new Date().toISOString().slice(0, 10),
    reason: 'Contacto prioritario solicitado por el titular',
    description: 'Contacto prioritario originado desde la bitácora.',
    urgency: 'alta',
    contactPreference: isAnonymous ? 'app' : 'directo',
    timeWindow: isAnonymous ? 'No aplica' : 'Prioritario',
    status: 'Recibida',
    assignedTo: 'usr-3',
    sla: 'Prioritario'
  };

  storeData.supportRequests = storeData.supportRequests || [];
  storeData.supportRequests.unshift(newRequest);
  pulsoStore.save(storeData);

  pulsoStore.audit({
    actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
    action: 'SOLICITUD_CONTACTO_PRIORITARIO',
    target: `Caso ${code} (${isAnonymous ? 'Modalidad Anónima' : 'Modalidad Confidencial Identificada'})`
  });

  return { code };
}
