import { roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';
import { clearAgentCache } from './agentQueries';

const unavailableJournal = () => ({ success:false,error: 'La entrada no está disponible para este usuario.' });
const missingConsent = () => ({ success:false,error: 'La finalidad requerida no está activa para este usuario.' });

/**
 * Validates if the user has active informed consent for private journal usage (Finalidad C2).
 *
 * @param {Object} data - PulsoStore snapshot.
 * @param {Object} user - Current user session.
 * @returns {boolean} True if consent is explicitly active.
 */
const canUseJournal = (data, user) => {
  const consent = data.consents?.[user?.id];
  return Boolean(
    consent?.policyAccepted && consent.policyVersion === data.settings.policyVersion && consent.c2
  );
};

/**
 * Validates if the user has active consent for NLP analysis on private journal entries (Finalidad C3).
 *
 * @param {Object} data - PulsoStore snapshot.
 * @param {Object} user - Current user session.
 * @returns {boolean} True if NLP analysis consent is active.
 */
const canAnalyze = (data, user) => canUseJournal(data, user) && Boolean(data.consents?.[user?.id]?.c3);

/**
 * Ensures strict ownership of a journal entry by the agent.
 *
 * @param {Object|null} journal - Journal entry record.
 * @param {Object} user - Current user session.
 * @returns {boolean} True if the journal belongs to the agent.
 */
const ownsJournal = (journal, user) =>
  Boolean(user?.id && user.role === 'agente' && journal?.userId === user.id);

/**
 * Saves a private journal entry (new creation or text modification).
 * Enforces privacy isolation, versioning of prior analyses, and audit logging.
 *
 * @param {string|null} currentJournalId - Entry ID if updating, or null/empty if creating.
 * @param {Object} currentUser - Authenticated agent user object.
 * @param {Object|null} currentJournal - Existing journal object in state.
 * @param {string} contextTag - Shift context tag (e.g., 'Campaña general', 'Turno tarde').
 * @param {string} trimmed - Sanitized journal text content.
 * @returns {Promise<{success: boolean, data?: Object, journalPayload?: Object, error?: string}>} Operation outcome.
 */
export async function saveJournal(currentJournalId, currentUser, currentJournal, contextTag, trimmed) {
  const isNew = !currentJournalId;

  if (!env.useMockStorage) {
    if (!getAuthToken()) return { success:false,data:null,error: 'Sesión no válida o expirada.' };
    try {
      if (isNew) {
        const res = await apiClient.post('/agent/journal', { context: contextTag, content: trimmed });
        clearAgentCache(currentUser?.id);
        const payload = res.data?.data || res.data;
        return { success: true, ...res, data: payload, journalPayload: payload };
      } else {
        const res = await apiClient.put('/agent/journal/' + currentJournalId, { content: trimmed,context:contextTag });
        clearAgentCache(currentUser?.id);
        const payload = res.data?.data || res.data;
        return { success: true, ...res, data: payload, journalPayload: payload };
      }
    } catch (err) {
      return { success:false,data:null,error: err.response?.data?.error?.message || 'Error al guardar bitácora en el servidor' };
    }
  }

  let storeData = pulsoStore.get();
  if (!currentUser?.id || currentUser.role !== 'agente') return unavailableJournal();
  if (!canUseJournal(storeData, currentUser)) return missingConsent();
  const storedJournal = isNew ? null : storeData.journals.find((journal) => journal.id === currentJournalId);
  if (!isNew && !ownsJournal(storedJournal, currentUser)) return unavailableJournal();
  // Los metadatos proceden del registro guardado, no de una copia enviada por la vista.
  currentJournal = storedJournal;
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const contentChanged = currentJournal && currentJournal.text !== trimmed;
  const analysisHistory = [...(currentJournal?.analysisHistory || [])];
  if (contentChanged && currentJournal.analysis) analysisHistory.unshift({
    ...currentJournal.analysis,content:currentJournal.text,correctionHistory:currentJournal.correctionHistory || [],archivedAt:now.toISOString()
  });

  const journalPayload = {
    id: currentJournalId || `jrn-${Date.now()}`,
    userId: currentUser.id,
    date: currentJournal?.date || dateStr,
    createdAt: currentJournal?.createdAt || now.toISOString(),
    updatedAt: now.toISOString(),
    context: contextTag,
    text: trimmed,
    analysis: contentChanged ? null : currentJournal?.analysis || null,
    correctedCategories: contentChanged ? null : currentJournal?.correctedCategories || null,
    correctionNote: contentChanged ? null : currentJournal?.correctionNote || null,
    correctionHistory: contentChanged ? [] : currentJournal?.correctionHistory || [],
    analysisHistory
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

  return { success:true,data:journalPayload,journalPayload };
}

/**
 * Permanently deletes a private journal entry owned by the agent.
 *
 * @param {string} currentJournalId - ID of the journal entry to delete.
 * @param {Object} currentUser - Current user session.
 * @returns {Promise<{success: boolean, error?: string}>} Operation outcome.
 */
export async function deleteJournal(currentJournalId, currentUser) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) return { success:false,data:null,error: 'Sesión no válida o expirada.' };
    try {
      const res = await apiClient.delete('/agent/journal/' + currentJournalId);
      clearAgentCache(currentUser?.id);
      return { success: true, ...res.data };
    } catch (err) {
      return { success:false,data:null,error: err.response?.data?.error?.message || 'Error al eliminar bitácora en el servidor' };
    }
  }

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

  return {success:true};
}

/**
 * Saves agent feedback or correction over automated NLP factor detection.
 * Enforces ownership, consent C3, and records an auditable correction timeline.
 *
 * @param {string} currentJournalId - Journal entry identifier.
 * @param {string[]} selectedCategories - Corrected occupational factors selected by the agent.
 * @param {string} correctionNote - Optional user explanation/note.
 * @param {Object} currentUser - Current user session.
 * @param {string} [contentHash] - Integrity hash of entry content.
 * @returns {Promise<{success: boolean, error?: string, journalPayload?: Object}>} Operation outcome.
 */
export function saveCorrection(currentJournalId, selectedCategories, correctionNote, currentUser, contentHash) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) return Promise.resolve({ success:false,data:null,error: 'Sesión no válida o expirada.' });
    return apiClient.post(`/agent/journal/${currentJournalId}/corrections`, {
      categories: selectedCategories.filter(c => c !== 'Ninguna aplica'),
      note: correctionNote.trim(), contentHash
    }).then(res => ({ ...res, journalPayload: res.data }))
      .catch(err => ({ success: false, error: err.response?.data?.error?.message || 'No se pudo guardar la corrección.' }));
  }
  const storeData = pulsoStore.get();
  const target = storeData.journals.find((j) => j.id === currentJournalId);
  if (!ownsJournal(target, currentUser)) return unavailableJournal();
  if (!canAnalyze(storeData, currentUser)) return missingConsent();

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
  return {success:true};
}

/**
 * Persists local lexical NLP analysis results into a journal entry.
 *
 * @param {Object} journalPayload - Journal entry object or reference.
 * @param {Object} analysisResult - Lexical engine analysis outcome.
 * @param {Object} currentUser - Current user session.
 * @returns {Promise<{success: boolean, error?: string, journalPayload?: Object}>} Operation outcome.
 */
export function saveJournalAnalysis(journalPayload, analysisResult, currentUser) {
  if (!env.useMockStorage) {
    const payloadId = journalPayload?.id || journalPayload?.data?.id;
    if (!getAuthToken() || !payloadId) return Promise.resolve({ success:false,data:null,error: 'Sesión o entrada no válida.' });
    return apiClient.put(`/agent/journal/${payloadId}`, {
      analysis: analysisResult, contentHash: journalPayload.content_hash || journalPayload.contentHash
    }).then(res => { clearAgentCache(currentUser?.id); return { success: true, ...res, journalPayload: res.data?.data || res.data }; })
      .catch(err => ({ success: false, error: err.response?.data?.error?.message || 'No se pudo guardar el análisis.' }));
  }
  const storeData = pulsoStore.get();
  const target = storeData.journals.find((j) => j.id === journalPayload.id);
  if (!ownsJournal(target, currentUser)) return unavailableJournal();
  if (!canAnalyze(storeData, currentUser)) return missingConsent();
  if (target.text !== (journalPayload.text ?? journalPayload.content)) return {success:false,error:'Cambió el texto. Vuelve a analizar la entrada.'};
  if (target) {
    target.analysis = analysisResult;
    pulsoStore.save(storeData);
  }

  pulsoStore.audit({
    actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
    action: 'EJECUCION_NLP',
    target: `Bitácora ${journalPayload.id}`
  });
  return {success:true};
}

/**
 * Creates a priority SST support request originated directly from the private journal or crisis modal.
 *
 * @param {Object} currentUser - Current user session.
 * @param {'anonimo'|'identificado'} crisisMode - Support modality selected by the agent.
 * @returns {Promise<{success: boolean, code?: string, error?: string, data?: Object}>} Generated case radicado.
 */
export async function createPriorityRequest(currentUser, crisisMode) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) {
      return { success:false,data:null,error: 'Sesión no válida o token ausente' };
    }
    try {
      const isAnonymous = crisisMode === 'anonimo';
      const res = await apiClient.post('/sst/support-requests', {
        mode: isAnonymous ? 'anonimo' : 'identificado',
        urgency: 'alta',
        reason: 'Contacto prioritario solicitado por el titular',
        description: 'Contacto prioritario originado desde la bitácora.',
        contactPreference: isAnonymous ? 'app' : 'directo'
      });
      return { ...res,code: res.data.code };
    } catch (err) {
      return { success:false,data:null,error: err.response?.data?.error?.message || 'Error al solicitar contacto prioritario en el servidor' };
    }
  }

  const storeData = pulsoStore.get();
  const currentConsent = storeData.consents?.[currentUser?.id];

  if (!currentConsent?.c3) {
    return {
      error: 'Se requiere tener activa la finalidad C3 de consentimiento para solicitar apoyo a SST.'
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

  return { success:true,data:{code},code };
}
