import { getAgentRecords } from '../services/agentQueries';
import { createPriorityRequest } from '../services/journalService';
import { saveJournalAnalysis } from '../services/journalService';
import { saveJournal, deleteJournal, saveCorrection } from '../services/journalService';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

import { authService, roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { nlpEngine } from '../../../core/nlp/nlpEngine';

export function useJournal() {
  const currentUser = authService.getCurrentUser();
  const storeState = getAgentRecords(currentUser?.id);
  const consent = storeState.consents?.[currentUser?.id] || {};

  // Estados del editor
  const [journals, setJournals] = useState([]);
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

  const pendingAnalysisRef = useRef(null);
  const textareaRef = useRef(null);

  // Cargar bitácoras del agente
  const loadJournals = useCallback(() => {
    const storeData = getAgentRecords(currentUser?.id);
    const myJournals = (storeData.journals || []).filter((j) => j.userId === currentUser?.id);
    setJournals(myJournals);
    return myJournals;
  }, [currentUser?.id]);

  useEffect(() => {
    loadJournals();
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

    const result = await saveJournal(currentJournalId, currentUser, currentJournal, contextTag, trimmed);

    if (result.error) {
      setFeedback({ type: 'warn', message: result.error });
      return;
    }
    const { journalPayload } = result;
    setCurrentJournalId(journalPayload.id);
    loadJournals();

    const latestConsent = getAgentRecords(currentUser?.id).consents?.[currentUser?.id] || {};

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

    setTimeout(() => {
      const currentData = getAgentRecords(currentUser?.id);
      const activeConsent = currentData.consents?.[currentUser?.id];
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
      const analysisResult = nlpEngine.analyze(trimmed);

      const finishProcessing = () => {
        const result = saveJournalAnalysis(journalPayload, analysisResult, currentUser);
        if (result.error) {
          setIsAnalyzing(false);
          setFeedback({ type: 'warn', message: result.error });
          return;
        }

        setIsAnalyzing(false);
        loadJournals();
        setFeedback({
          type: 'success',
          message: 'Entrada analizada y guardada con éxito.'
        });
      };

      if (analysisResult.isCrisisAlert) {
        pulsoStore.audit({
          actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
          action: 'RUTA_APOYO_MOSTRADA',
          target: 'Ruta de apoyo prioritario'
        });
        pendingAnalysisRef.current = finishProcessing;
        setShowCrisisModal(true);
        setCrisisPriorityStep(false);
      } else {
        finishProcessing();
      }
    }, 450);
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
    if (result.error) {
      setFeedback({ type: 'warn', message: result.error });
      return;
    }

    handleNewEntry();
    loadJournals();
    setFeedback({ type: 'success', message: 'Entrada eliminada definitivamente.' });
  };

  // Abrir modal de corrección humana
  const handleOpenCorrection = () => {
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
  const handleSaveCorrection = () => {
    const operationResult = saveCorrection(currentJournalId, selectedCategories, correctionNote, currentUser);
    if (operationResult.error) {
      setFeedback({ type: 'warn', message: operationResult.error });
      return;
    }

    loadJournals();
    setShowCorrectionModal(false);
    setFeedback({ type: 'success', message: 'Corrección humana aplicada y registrada en auditoría.' });
  };

  // Confirmar solicitud prioritaria de crisis con SST
  const handleConfirmCrisisPriority = async () => {
    const result = await createPriorityRequest(currentUser, crisisMode);
    if (result.error) {
      setFeedback({ type: 'warn', message: result.error });
      return;
    }
    const { code } = result;
    setShowCrisisModal(false);
    if (pendingAnalysisRef.current) {
      pendingAnalysisRef.current();
      pendingAnalysisRef.current = null;
    }

    setFeedback({
      type: 'success',
      message: `Solicitud prioritaria registrada (Caso ${code}). SST gestionará tu caso prioritariamente. No se transmitió texto de tu bitácora.`
    });
  };

  const handleContinueFromCrisis = () => {
    setShowCrisisModal(false);
    if (pendingAnalysisRef.current) {
      pendingAnalysisRef.current();
      pendingAnalysisRef.current = null;
    }
  };

  // 1. Caso: Bloqueo por falta de consentimiento C2
  // 1. Caso: Bloqueo por falta de consentimiento C2

  return {
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
