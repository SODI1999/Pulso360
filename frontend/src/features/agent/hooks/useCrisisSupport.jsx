import { getAgentRecords } from '../services/agentQueries';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';

import { GROUNDING_STEPS, STEP_INTRO_SPEECH, ANCHOR_FEEDBACK_SPEECH } from '../data/crisisSupportData';

export function useCrisisSupport() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const currentUserId = currentUser?.id;
  const currentUserRole = currentUser?.role;

  const data = getAgentRecords(currentUser?.id);
  const consent = data.consents?.[currentUserId];

  // Estado para modal de respiración guiada de emergencia
  const [isBpoResetOpen, setIsBpoResetOpen] = useState(false);

  // Estado interactivo para Grounding 5-4-3-2-1
  const [activeGroundingIndex, setActiveGroundingIndex] = useState(0);
  const [completedAnchors, setCompletedAnchors] = useState({ 5: [], 4: [], 3: [], 2: [], 1: [] });
  const [groundingMode, setGroundingMode] = useState('tactile'); // 'tactile' | 'assisted'
  const [isAssistedPlaying, setIsAssistedPlaying] = useState(false);
  const [assistedAnchorIndex, setAssistedAnchorIndex] = useState(0);

  // Guía por voz nativa del sistema
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [currentSubtitle, setCurrentSubtitle] = useState(STEP_INTRO_SPEECH[5]);

  const assistedTimerRef = useRef(null);

  // Motor de voz del sistema (Web Speech API)
  const speakText = useCallback(
    (text) => {
      setCurrentSubtitle(text);
      if (!isVoiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 0.85;
        utterance.pitch = 0.95;

        const voices = window.speechSynthesis.getVoices();
        const esVoice = voices.find((v) => v.lang && v.lang.startsWith('es'));
        if (esVoice) utterance.voice = esVoice;

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('SpeechSynthesis error:', err);
      }
    },
    [isVoiceEnabled]
  );

  // Limpiar síntesis de voz al desmontar
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Locución automática de guía al cambiar de sentido
  useEffect(() => {
    const stepNum = GROUNDING_STEPS[activeGroundingIndex]?.number;
    if (stepNum && STEP_INTRO_SPEECH[stepNum]) {
      speakText(STEP_INTRO_SPEECH[stepNum]);
    }
  }, [activeGroundingIndex, speakText]);

  // Registro de auditoría al acceder a la ruta de apoyo prioritario
  useEffect(() => {
    if (!currentUserId) return;
    pulsoStore.audit({
      actor: `${currentUserId} (${roleLabels[currentUserRole] || currentUserRole})`,
      action: 'RUTA_APOYO_MOSTRADA',
      target: 'Ruta de apoyo prioritario y primeros auxilios psicológicos'
    });
  }, [currentUserId, currentUserRole]);

  const currentStep = GROUNDING_STEPS[activeGroundingIndex];
  const currentStepNumber = currentStep.number;
  const currentStepAnchors = currentStep.anchors;
  const stepCompletedList = completedAnchors[currentStepNumber] || [];
  const isStepFullyCompleted = stepCompletedList.length === currentStepAnchors.length;

  // Conteo global de anclaje somático (sobre 15)
  const totalAnchorsCompleted = Object.values(completedAnchors).reduce((acc, list) => acc + list.length, 0);
  const isFullGroundingCompleted = totalAnchorsCompleted === 15;

  // Conmutar ancla individual con confirmación de voz
  const toggleAnchor = useCallback(
    (stepNum, anchorId) => {
      setCompletedAnchors((prev) => {
        const list = prev[stepNum] || [];
        const exists = list.includes(anchorId);
        const updated = exists ? list.filter((id) => id !== anchorId) : [...list, anchorId];
        return { ...prev, [stepNum]: updated };
      });

      const list = completedAnchors[stepNum] || [];
      if (!list.includes(anchorId)) {
        const feedback = ANCHOR_FEEDBACK_SPEECH[anchorId] || 'Punto fijado.';
        speakText(feedback);
      }
    },
    [completedAnchors, speakText]
  );

  // Reiniciar anclaje
  const resetGrounding = useCallback(() => {
    setCompletedAnchors({ 5: [], 4: [], 3: [], 2: [], 1: [] });
    setActiveGroundingIndex(0);
    setIsAssistedPlaying(false);
    setAssistedAnchorIndex(0);
    speakText(STEP_INTRO_SPEECH[5]);
  }, [speakText]);

  // Modo Asistido: avance temporizado automático (cadencia de 6 segundos)
  useEffect(() => {
    if (groundingMode !== 'assisted' || !isAssistedPlaying) {
      if (assistedTimerRef.current) clearInterval(assistedTimerRef.current);
      return;
    }

    assistedTimerRef.current = setInterval(() => {
      // Marcar el ancla actual como completada
      const targetAnchor = currentStepAnchors[assistedAnchorIndex];
      if (targetAnchor) {
        toggleAnchor(currentStepNumber, targetAnchor.id);
      }

      // Avanzar al siguiente ancla o al siguiente paso
      if (assistedAnchorIndex + 1 < currentStepAnchors.length) {
        setAssistedAnchorIndex((prev) => prev + 1);
      } else {
        // Paso completado: pasar al siguiente sentido si existe
        if (activeGroundingIndex + 1 < GROUNDING_STEPS.length) {
          setActiveGroundingIndex((prev) => prev + 1);
          setAssistedAnchorIndex(0);
        } else {
          // Fin del ejercicio
          setIsAssistedPlaying(false);
        }
      }
    }, 5500);

    return () => {
      if (assistedTimerRef.current) clearInterval(assistedTimerRef.current);
    };
  }, [
    groundingMode,
    isAssistedPlaying,
    assistedAnchorIndex,
    currentStepAnchors,
    currentStepNumber,
    activeGroundingIndex,
    toggleAnchor
  ]);

  // Atajos de teclado ergonómicos: teclas 1-5 marcan anclas del paso activo
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignorar si el usuario está en un input o textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const keyNum = parseInt(e.key, 10);
      if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= currentStepAnchors.length) {
        e.preventDefault();
        const targetAnchor = currentStepAnchors[keyNum - 1];
        if (targetAnchor) {
          toggleAnchor(currentStepNumber, targetAnchor.id);
        }
      } else if (e.key === 'ArrowRight' && activeGroundingIndex < GROUNDING_STEPS.length - 1) {
        e.preventDefault();
        setActiveGroundingIndex((prev) => prev + 1);
        setAssistedAnchorIndex(0);
      } else if (e.key === 'ArrowLeft' && activeGroundingIndex > 0) {
        e.preventDefault();
        setActiveGroundingIndex((prev) => prev - 1);
        setAssistedAnchorIndex(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGroundingIndex, currentStepAnchors, currentStepNumber, toggleAnchor]);

  return {
    navigate,
    consent,
    isBpoResetOpen,
    setIsBpoResetOpen,
    activeGroundingIndex,
    setActiveGroundingIndex,
    completedAnchors,
    setCompletedAnchors,
    groundingMode,
    setGroundingMode,
    isAssistedPlaying,
    setIsAssistedPlaying,
    assistedAnchorIndex,
    setAssistedAnchorIndex,
    isVoiceEnabled,
    setIsVoiceEnabled,
    currentSubtitle,
    currentStep,
    currentStepNumber,
    currentStepAnchors,
    stepCompletedList,
    isStepFullyCompleted,
    totalAnchorsCompleted,
    isFullGroundingCompleted,
    toggleAnchor,
    resetGrounding
  };
}
