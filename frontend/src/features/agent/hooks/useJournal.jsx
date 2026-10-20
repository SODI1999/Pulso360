// src/features/agent/hooks/useJournal.jsx
import { useExpiredFormDraft } from '../../../core/auth/useExpiredFormDraft';
import { fetchAgentRecords, getAgentRecords } from '../services/agentQueries';
import { createPriorityRequest } from '../services/journalService';
import { saveJournalAnalysis } from '../services/journalService';
import { saveJournal, deleteJournal, saveCorrection } from '../services/journalService';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { env } from '../../../core/config/env';

import { authService, roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { nlpEngine } from '../../../core/nlp/nlpEngine';

/**
 * Hook para la gestión de la Bitácora Privada de Desahogo del Agente.
 * Integra análisis determinista léxico local, detección pedagógica de datos de terceros,
 * corrección humana de categorizaciones, protocolo de apoyo en crisis y aislamiento de datos.
 *
 * @returns {Object} Estado reactivo de la bitácora y manejadores de interacción.
 */
export function useJournal() {
  const currentUser = authService.getCurrentUser();
  const [storeState, setStoreState] = useState(() => getAgentRecords(currentUser?.id));
  const [loading, setLoading] = useState(() => {
    if (env.useMockStorage) return false;
    const initial = getAgentRecords(currentUser?.id);
    return !initial?.consents?.[currentUser?.id];
  });
  const [loadError, setLoadError] = useState('');
  const savingRef = useRef(false);
  const consent = storeState.consents?.[currentUser?.id] || {};

  // Estados del editor
  const [journals, setJournals] = useState(() => {
    const initial = getAgentRecords(currentUser?.id);
    return (initial?.journals || []).filter((j) => j.userId === currentUser?.id);
  });
  const [currentJournalId, setCurrentJournalId] = useState(null);
  const [journalText, setJournalText] = useState('');
  const [contextTag, setContextTag] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Modales
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [crisisPriorityStep, setCrisisPriorityStep] = useState(false);
  const [crisisMode, setCrisisMode] = useState('anonimo');

  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [correctionNote, setCorrectionNote] = useState('');

  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useExpiredFormDraft('journal:editor', { currentJournalId, journalText, contextTag, selectedCategories, correctionNote,
    showCorrectionModal, showCrisisModal, crisisPriorityStep, crisisMode }, draft => {
    setCurrentJournalId(draft.currentJournalId); setJournalText(draft.journalText); setContextTag(draft.contextTag);
    setSelectedCategories(draft.selectedCategories); setCorrectionNote(draft.correctionNote);
    setShowCorrectionModal(draft.showCorrectionModal); setShowCrisisModal(draft.showCrisisModal);
    setCrisisPriorityStep(draft.crisisPriorityStep); setCrisisMode(draft.crisisMode);
  });

  const pendingAnalysisRef = useRef(null);
  const textareaRef = useRef(null);

  // Cargar bitácoras del agente
  const loadJournals = useCallback(async () => {
    if (!currentUser?.id) return [];
    let data;
    if (!env.useMockStorage) {
      data = await fetchAgentRecords(currentUser.id);
      setStoreState(data);
    } else {
      data = getAgentRecords(currentUser.id);
      setStoreState(data);
    }
    const myJournals = (data?.journals || []).filter((j) => j.userId === currentUser.id);
    setJournals(myJournals);
    return myJournals;
  }, [currentUser?.id]);

  const reload = useCallback(() => {
    setLoading(true);
    setLoadError('');
    loadJournals()
      .catch((error) => setLoadError(error.message || 'Error al cargar bitácora.'))
      .finally(() => setLoading(false));
  }, [loadJournals]);

  useEffect(() => {
    loadJournals().catch(error => setLoadError(error.message)).finally(() => setLoading(false));
  }, [loadJournals]);

  // Detección pedagógica de datos de terceros (nombres en mitad de frase, cédulas/teléfonos de 7+ dígitos o emails)
  const hasThirdPartyData = useMemo(() => {
    const pattern =
      /(?<!(^|[.!?¿¡]\s*))\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}\b|\b\d{7,}\b|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    return pattern.test(journalText);
  }, [journalText]);

  // Obtener la entrada actualmente cargada
  const currentJournal = useMemo(() => {
    return journals.find((j) => j.id === currentJournalId) || null;
  }, [journals, currentJournalId]);

  // Seleccionar una entrada de la lista
  const handleSelectJournal = (journal) => {
    setCurrentJournalId(journal.id);
    setJournalText(journal.text);
    setContextTag(journal.context || '');
    setFeedback({ type: '', message: '' });
  };

  // Crear una nueva entrada limpia
  const handleNewEntry = () => {
    setCurrentJournalId(null);
    setJournalText('');
    setContextTag('');
    setFeedback({ type: '', message: '' });
  };

  // Guardar / Guardar y analizar
  const handleSaveJournal = async (e) => {
    e.preventDefault();
    const trimmed = journalText.trim();
    if (!trimmed) {
      setFeedback({
        type: 'warn',
        message: 'Escribe algunas palabras sobre lo vivido en tu turno antes de guardar.'
      });
      textareaRef.current?.focus();
      return;
    }

    if (savingRef.current) return;
    savingRef.current = true;
    setIsAnalyzing(true);
    try {
      const result = await saveJournal(currentJournalId, currentUser, currentJournal, contextTag, trimmed);

      if (result.success !== true) {
        setFeedback({ type: 'warn', message: result.error });
        return;
      }
      const { journalPayload } = result;
      const savedId = journalPayload?.id || journalPayload?.data?.id;
      if (savedId) setCurrentJournalId(savedId);
      await loadJournals();

      const currentData = await fetchAgentRecords(currentUser.id);
      const latestConsent = currentData.consents?.[currentUser.id] || {};

      // Si no tiene C3 autorizado, no analiza con NLP
      if (!latestConsent.c3) {
        setFeedback({
          type: 'success',
          message: 'Entrada guardada sin análisis NLP por preferencia de consentimiento.'
        });
        return;
      }

      // Ejecución de análisis NLP con estado de carga visual
      setIsAnalyzing(true);

      try {
        const activeConsent = latestConsent;
        if (
          !activeConsent?.policyAccepted ||
          activeConsent.policyVersion !== currentData.settings.policyVersion ||
          !activeConsent.c2 ||
          !activeConsent.c3
        ) {
          setIsAnalyzing(false);
          setFeedback({
            type: 'warn',
            message: 'Entrada guardada sin análisis porque cambió tu consentimiento.'
          });
          return;
        }
        await nlpEngine.loadActiveLexicon();
        const analysisResult = nlpEngine.analyze(trimmed);

        const finishProcessing = async () => {
          try {
            const result = await saveJournalAnalysis(journalPayload, analysisResult, currentUser);
            if (result.success !== true) {
              setIsAnalyzing(false);
              setFeedback({ type: 'warn', message: result.error });
              return false;
            }

            setIsAnalyzing(false);
            await loadJournals();
            setFeedback({
              type: 'success',
              message: 'Entrada analizada y guardada con éxito.'
            });
            return true;
          } catch (error) {
            setFeedback({ type: 'warn', message: `No se pudo completar o recargar el análisis: ${error.message}` });
            return false;
          } finally {
            setIsAnalyzing(false);
          }
        };

        if (analysisResult.isCrisisAlert) {
          if (env.useMockStorage) {
            pulsoStore.audit({
              actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
              action: 'RUTA_APOYO_MOSTRADA',
              target: 'Ruta de apoyo prioritario'
            });
          }
          pendingAnalysisRef.current = finishProcessing;
          setShowCrisisModal(true);
          setCrisisPriorityStep(false);
        } else {
          await finishProcessing();
        }
      } catch (error) {
        setIsAnalyzing(false);
        setFeedback({ type: 'warn', message: error.message });
      }
    } catch (error) {
      setFeedback({ type: 'warn', message: error.message || 'No se pudo guardar la entrada.' });
    } finally {
      savingRef.current = false;
      setIsAnalyzing(false);
    }
  };

  // Eliminar entrada (con confirmación de 2 pasos y escritura de palabra ELIMINAR)
  const handleDeleteJournal = async () => {
    if (!currentJournalId) return;

    if (
      !window.confirm('Esta acción es irreversible. Se borrará el texto y su análisis. ¿Deseas continuar?')
    ) {
      return;
    }

    const typedConfirmation =
      window.prompt('Para confirmar la eliminación definitiva, escribe ELIMINAR:') || '';
    if (typedConfirmation !== 'ELIMINAR') {
      setFeedback({ type: 'warn', message: 'Confirmación no válida. No se eliminó la entrada.' });
      return;
    }

    const result = await deleteJournal(currentJournalId, currentUser);
    if (result.success !== true) {
      setFeedback({ type: 'warn', message: result.error });
      return;
    }

    handleNewEntry();
    try {
      await loadJournals();
    } catch (error) {
      setFeedback({ type: 'warn', message: `Entrada eliminada; no se pudo recargar: ${error.message}` });
      return;
    }
    setFeedback({ type: 'success', message: 'Entrada eliminada definitivamente.' });
  };

  // Abrir modal de corrección humana
  const handleOpenCorrection = async () => {
    try {
      await nlpEngine.loadActiveLexicon();
    } catch (error) {
      setFeedback({ type: 'warn', message: error.response?.data?.error?.message || error.message });
      return;
    }
    if (!currentJournal?.analysis) return;
    const initial = currentJournal.correctedCategories
      ? [...currentJournal.correctedCategories]
      : currentJournal.analysis.categories.map((c) => c.name);

    setSelectedCategories(initial);
    setCorrectionNote('');
    setShowCorrectionModal(true);
  };

  // Manejo de checkboxes en la corrección
  const toggleCategorySelection = (catName) => {
    if (catName === 'Ninguna aplica') {
      if (selectedCategories.includes('Ninguna aplica')) {
        setSelectedCategories([]);
      } else {
        setSelectedCategories(['Ninguna aplica']);
      }
      return;
    }

    setSelectedCategories((prev) => {
      const withoutNone = prev.filter((c) => c !== 'Ninguna aplica');
      if (withoutNone.includes(catName)) {
        return withoutNone.filter((c) => c !== catName);
      } else {
        return [...withoutNone, catName];
      }
    });
  };

  // Guardar corrección humana
  const handleSaveCorrection = async () => {
    const operationResult = await saveCorrection(currentJournalId, selectedCategories, correctionNote, currentUser, currentJournal?.contentHash);
    if (operationResult.success !== true) {
      setFeedback({ type: 'warn', message: operationResult.error });
      return;
    }

    try {
      await loadJournals();
    } catch (error) {
      setFeedback({ type: 'warn', message: `Corrección guardada; no se pudo recargar: ${error.message}` });
      return;
    }
    setShowCorrectionModal(false);
    setFeedback({ type: 'success', message: 'Corrección humana aplicada y registrada en auditoría.' });
  };

  // Confirmar solicitud prioritaria de crisis con SST
  const handleConfirmCrisisPriority = async () => {
    const result = await createPriorityRequest(currentUser, crisisMode);
    if (result.success !== true) {
      setFeedback({ type: 'warn', message: result.error });
      return;
    }
    const { code } = result;
    setShowCrisisModal(false);
    if (pendingAnalysisRef.current) {
      const analyzed = await pendingAnalysisRef.current();
      pendingAnalysisRef.current = null;
      if (!analyzed) {
        setFeedback({
          type: 'warn',
          message: `Solicitud registrada (Caso ${code}); el análisis no se pudo completar o recargar. El texto de tu bitácora no se transmitió a SST.`
        });
        return;
      }
    }

    setFeedback({
      type: 'success',
      message: `Solicitud prioritaria registrada (Caso ${code}). SST gestionará tu caso prioritariamente. No se transmitió texto de tu bitácora.`
    });
  };

  const handleContinueFromCrisis = async () => {
    setShowCrisisModal(false);
    if (pendingAnalysisRef.current) {
      await pendingAnalysisRef.current();
      pendingAnalysisRef.current = null;
    }
  };

  return {
    loading,
    loadError,
    reload,
    consent,
    journals,
    currentJournalId,
    journalText,
    setJournalText,
    contextTag,
    setContextTag,
    feedback,
    isAnalyzing,
    showCrisisModal,
    setShowCrisisModal,
    crisisPriorityStep,
    setCrisisPriorityStep,
    crisisMode,
    setCrisisMode,
    showCorrectionModal,
    setShowCorrectionModal,
    selectedCategories,
    correctionNote,
    setCorrectionNote,
    showHistoryModal,
    setShowHistoryModal,
    textareaRef,
    hasThirdPartyData,
    currentJournal,
    handleSelectJournal,
    handleNewEntry,
    handleSaveJournal,
    handleDeleteJournal,
    handleOpenCorrection,
    toggleCategorySelection,
    handleSaveCorrection,
    handleConfirmCrisisPriority,
    handleContinueFromCrisis
  };
}
