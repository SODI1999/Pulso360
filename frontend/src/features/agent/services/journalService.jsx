import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { clearAgentCache } from './agentQueries';

/**
 * Saves a private journal entry (new creation or text modification).
 * Enforces privacy isolation and updates the backend.
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
  if (!getAuthToken()) return { success: false, data: null, error: 'Sesión no válida o expirada.' };
  try {
    if (isNew) {
      const res = await apiClient.post('/agent/journal', { context: contextTag, content: trimmed });
      clearAgentCache(currentUser?.id);
      const payload = res.data?.data || res.data;
      return { success: true, ...res, data: payload, journalPayload: payload };
    } else {
      const res = await apiClient.put('/agent/journal/' + currentJournalId, { content: trimmed, context: contextTag });
      clearAgentCache(currentUser?.id);
      const payload = res.data?.data || res.data;
      return { success: true, ...res, data: payload, journalPayload: payload };
    }
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err.response?.data?.error?.message || 'Error al guardar bitácora en el servidor'
    };
  }
}

/**
 * Permanently deletes a private journal entry owned by the agent.
 *
 * @param {string} currentJournalId - ID of the journal entry to delete.
 * @param {Object} currentUser - Current user session.
 * @returns {Promise<{success: boolean, error?: string}>} Operation outcome.
 */
export async function deleteJournal(currentJournalId, currentUser) {
  if (!getAuthToken()) return { success: false, data: null, error: 'Sesión no válida o expirada.' };
  try {
    const res = await apiClient.delete('/agent/journal/' + currentJournalId);
    clearAgentCache(currentUser?.id);
    return { success: true, ...res.data };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err.response?.data?.error?.message || 'Error al eliminar bitácora en el servidor'
    };
  }
}

/**
 * Saves agent feedback or correction over automated NLP factor detection.
 *
 * @param {string} currentJournalId - Journal entry identifier.
 * @param {string[]} selectedCategories - Corrected occupational factors selected by the agent.
 * @param {string} correctionNote - Optional user explanation/note.
 * @param {Object} currentUser - Current user session.
 * @param {string} [contentHash] - Integrity hash of entry content.
 * @returns {Promise<{success: boolean, error?: string, journalPayload?: Object}>} Operation outcome.
 */
export function saveCorrection(currentJournalId, selectedCategories, correctionNote, currentUser, contentHash) {
  if (!getAuthToken()) return Promise.resolve({ success: false, data: null, error: 'Sesión no válida o expirada.' });
  return apiClient
    .post(`/agent/journal/${currentJournalId}/corrections`, {
      categories: selectedCategories.filter((c) => c !== 'Ninguna aplica'),
      note: correctionNote.trim(),
      contentHash
    })
    .then((res) => ({ ...res, journalPayload: res.data }))
    .catch((err) => ({
      success: false,
      error: err.response?.data?.error?.message || 'No se pudo guardar la corrección.'
    }));
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
  const payloadId = journalPayload?.id || journalPayload?.data?.id;
  if (!getAuthToken() || !payloadId) {
    return Promise.resolve({ success: false, data: null, error: 'Sesión o entrada no válida.' });
  }
  return apiClient
    .put(`/agent/journal/${payloadId}`, {
      analysis: analysisResult,
      contentHash: journalPayload.content_hash || journalPayload.contentHash
    })
    .then((res) => {
      clearAgentCache(currentUser?.id);
      return { success: true, ...res, journalPayload: res.data?.data || res.data };
    })
    .catch((err) => ({
      success: false,
      error: err.response?.data?.error?.message || 'No se pudo guardar el análisis.'
    }));
}

/**
 * Creates a priority SST support request originated directly from the private journal or crisis modal.
 *
 * @param {Object} currentUser - Current user session.
 * @param {'anonimo'|'identificado'} crisisMode - Support modality selected by the agent.
 * @returns {Promise<{success: boolean, code?: string, error?: string, data?: Object}>} Generated case radicado.
 */
export async function createPriorityRequest(currentUser, crisisMode) {
  if (!getAuthToken()) {
    return { success: false, data: null, error: 'Sesión no válida o token ausente' };
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
    return { ...res, code: res.data.code };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err.response?.data?.error?.message || 'Error al solicitar contacto prioritario en el servidor'
    };
  }
}
