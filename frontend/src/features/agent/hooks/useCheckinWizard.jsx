// src/features/agent/hooks/useCheckinWizard.jsx
import { fetchAgentRecords, getAgentRecords } from '../services/agentQueries';
import { saveCheckin } from '../services/checkinWizardService';
import { preferences } from '../../../core/storage/preferences';
import { useState, useEffect, useCallback, useRef } from 'react';
import { env } from '../../../core/config/env';
import { authService } from '../../../core/auth/authService';
import { QUESTIONS } from '../data/checkinWizardData';

/**
 * Hook para la orquestación del asistente de Check-in diario de bienestar (RF-03).
 * Gestiona el paso a paso de las 6 dimensiones somáticas y operativas, borrador local,
 * atajos de teclado (1-5), ventana de edición de 2 horas y envío persistente.
 *
 * @returns {Object} Estado del wizard de check-in y manejadores de evento.
 * @property {boolean} loading - Indica si los registros se encuentran cargando.
 * @property {string} loadError - Mensaje de error si la carga falla.
 * @property {Function} reload - Función interactiva para reintentar la carga.
 * @property {Object} data - Registros globales y consentimientos del agente.
 * @property {Object} consent - Objeto de finalidades activas (C1-C5) del usuario.
 * @property {string} journeyKey - Identificador único de jornada (YYYY-MM-DD).
 * @property {number} shiftStartHour - Hora de inicio de turno programada.
 * @property {boolean} isOutsideShift - Indica si el registro se realiza fuera de jornada.
 * @property {number} currentStep - Índice del paso activo (0 a 5).
 * @property {Function} setCurrentStep - Actualiza el índice del paso.
 * @property {Object} draft - Respuestas acumuladas en el borrador en memoria.
 * @property {Function} setDraft - Modifica el borrador.
 * @property {Object|null} existingCheckin - Registro previo si ya se completó el turno.
 * @property {boolean} isEditing - Si el usuario está en modo de edición de su registro.
 * @property {Function} setIsEditing - Habilita/deshabilita la edición dentro de la ventana de 2h.
 * @property {boolean} submittedSuccess - Indica si el check-in fue guardado con éxito.
 * @property {string} draftNotice - Mensaje sutil de autoguardado en almacenamiento local.
 * @property {string} validationError - Mensaje de error si faltan dimensiones por contestar.
 * @property {boolean} dismissDisconnectNotice - Estado del aviso de desconexión.
 * @property {Function} setDismissDisconnectNotice - Controla el descarte del aviso.
 * @property {Object} stepTimerRef - Referencia al temporizador de avance automático.
 * @property {Function} updateDraftValue - Guarda una dimensión y avanza de paso suavemente.
 * @property {Function} handleSubmit - Envía y persiste formalmente el check-in.
 */
export function useCheckinWizard() {
  const user = authService.getCurrentUser();
  const [data, setData] = useState(() => getAgentRecords(user?.id));

  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(() => {
    if (env.useMockStorage) return false;
    const initial = getAgentRecords(user?.id);
    return !initial?.consents?.[user?.id];
  });

  const reload = useCallback(() => {
    if (!user?.id) return;
    setLoading(true);
    setLoadError('');
    if (!env.useMockStorage) {
      fetchAgentRecords(user.id)
        .then((remoteData) => {
          if (remoteData) setData(remoteData);
        })
        .catch((error) => {
          setLoadError(error.message || 'Error al conectar con el servidor.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setData(getAgentRecords(user.id));
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    let mounted = true;
    if (!env.useMockStorage && user?.id) {
      fetchAgentRecords(user.id).then((remoteData) => {
        if (mounted && remoteData) setData(remoteData);
      }).catch(error => { if (mounted) setLoadError(error.message); })
        .finally(() => { if (mounted) setLoading(false); });
    }
    return () => { mounted = false; };
  }, [user?.id]);

  const consent = data.consents?.[user?.id];

  // 1. Calcular la jornada laboral según la hora de inicio de turno y zona horaria
  const calculateJourneyKey = useCallback(() => {
    const now = new Date();
    const dateParts = Object.fromEntries(
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hourCycle: 'h23'
      })
        .formatToParts(now)
        .filter((item) => item.type !== 'literal')
        .map((item) => [item.type, item.value])
    );

    const shiftStartHour = Number(user?.shiftStartHour ?? 8);
    const currentHour = Number(dateParts.hour);
    let key = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;

    if (currentHour < shiftStartHour) {
      const previousDate = new Date(`${key}T12:00:00Z`);
      previousDate.setUTCDate(previousDate.getUTCDate() - 1);
      key = previousDate.toISOString().slice(0, 10);
    }

    // Fuera de horario regular: más de 8 horas tras el inicio o antes del inicio
    const hoursSinceStart = (currentHour - shiftStartHour + 24) % 24;
    const isOutsideShift = hoursSinceStart >= 8;

    return { journeyKey: key, shiftStartHour, currentHour, isOutsideShift };
  }, [user]);

  const { journeyKey, shiftStartHour, isOutsideShift } = calculateJourneyKey();
  const draftKey = `pulso360_checkin_draft_${user?.id}_${journeyKey}`;

  // Estados del flujo
  const [currentStep, setCurrentStep] = useState(0);
  const [draft, setDraft] = useState({});
  const [existingCheckin, setExistingCheckin] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [draftNotice, setDraftNotice] = useState('');
  const [validationError, setValidationError] = useState('');
  const [dismissDisconnectNotice, setDismissDisconnectNotice] = useState(false);

  const stepTimerRef = useRef(null);

  // Cargar registro existente o borrador
  useEffect(() => {
    const found = (data.checkins || []).find(
      (c) => c.userId === user?.id && c.journeyKey === journeyKey
    );
    if (found) {
      setExistingCheckin(found);
    } else {
      try {
        const savedDraft = preferences.readCheckinDraft(draftKey);
        setDraft(savedDraft);
      } catch {
        setDraft({});
      }
    }
  }, [user?.id, journeyKey, draftKey, data.checkins]);

  // Limpiar temporizador al desmontar
  useEffect(() => {
    return () => {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    };
  }, []);

  // Guardar respuesta y avanzar automáticamente de paso (220ms para confirmación visual)
  const updateDraftValue = useCallback(
    (key, value) => {
      setDraft((prevDraft) => {
        const updated = { ...prevDraft, [key]: value };
        preferences.saveCheckinDraft(draftKey, updated);
        return updated;
      });

      setDraftNotice('Borrador guardado localmente');
      setValidationError('');

      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
      }

      stepTimerRef.current = setTimeout(() => {
        setCurrentStep((prev) => Math.min(5, prev + 1));
      }, 220);
    },
    [draftKey]
  );

  // Manejo de atajos por teclado (1-5 para escala, ArrowLeft para volver)
  useEffect(() => {
    if (!consent?.c1 || (existingCheckin && !isEditing) || submittedSuccess) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }

      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const currentQuestion = QUESTIONS[currentStep];
        updateDraftValue(currentQuestion.key, Number(e.key));
      } else if (e.key === 'ArrowLeft') {
        if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
        setCurrentStep((prev) => Math.max(0, prev - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, consent?.c1, existingCheckin, isEditing, submittedSuccess, updateDraftValue]);

  // Envío del Check-in
  const handleSubmit = async (e) => {
    e.preventDefault();

    const missing = QUESTIONS.some((q) => !Object.prototype.hasOwnProperty.call(draft, q.key));
    if (missing) {
      setValidationError('Por favor responde cada dimensión o utiliza "Prefiero omitir esta pregunta hoy".');
      return;
    }

    const result = await saveCheckin(existingCheckin, user, journeyKey, draft);

    if (result.success !== true) {
      setValidationError(result.error);
      return;
    }

    preferences.removeCheckinDraft(draftKey);
    setExistingCheckin(result.payload);
    setIsEditing(false);
    setSubmittedSuccess(true);
  };

  return {
    loading,
    loadError,
    reload,
    data,
    consent,
    journeyKey,
    shiftStartHour,
    isOutsideShift,
    currentStep,
    setCurrentStep,
    draft,
    setDraft,
    existingCheckin,
    isEditing,
    setIsEditing,
    submittedSuccess,
    draftNotice,
    validationError,
    dismissDisconnectNotice,
    setDismissDisconnectNotice,
    stepTimerRef,
    updateDraftValue,
    handleSubmit
  };
}
