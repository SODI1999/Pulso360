import { useExpiredFormDraft } from '../../../core/auth/useExpiredFormDraft';
import { env } from '../../../core/config/env';
import { fetchAgentRecords, getAgentRecords } from '../services/agentQueries';
import { createHabeasRequest as registerHabeasRequest } from '../services/myDataPrivacyService';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';

import { authService, roleLabels } from '../../../core/auth/authService';

/**
 * Hook para la gestión del Centro de Privacidad, Salvaguardas y Habeas Data del Agente.
 * Administra el ejercicio de derechos ARCO (Acceso, Rectificación, Cancelación/Supresión, Oposición),
 * generación de archivos de portabilidad en cliente y navegación por pestañas WAI-ARIA.
 *
 * @returns {Object} Estado del centro de privacidad, feedback tipado y acciones de trámite.
 * isRectifying/isSuppressing indican una operación pendiente; cada guardia evita envíos simultáneos
 * de la misma operación en esta página, sin atribuir idempotencia al servidor.
 * hasSnapshot distingue la primera carga de una actualización; reload solo vuelve a consultar registros.
 */
export function useMyDataPrivacy() {
  const currentUser = authService.getCurrentUser();

  const [activeTab, setActiveTab] = useState('safeguards');
  const [isSuppressionModalOpen, setIsSuppressionModalOpen] = useState(false);

  const [rectificationText, setRectificationText] = useState('');
  const [rectificationFeedback, setRectificationFeedback] = useState(null);
  const [isRectifying, setIsRectifying] = useState(false);
  const rectificationPendingRef = useRef(false);

  const [suppressionConfirmText, setSuppressionConfirmText] = useState('');
  const [suppressionFeedback, setSuppressionFeedback] = useState(null);
  const [isSuppressing, setIsSuppressing] = useState(false);
  const suppressionPendingRef = useRef(false);

  useExpiredFormDraft('habeas:new', { rectificationText, suppressionConfirmText }, draft => {
    setRectificationText(draft.rectificationText);
    setSuppressionConfirmText(draft.suppressionConfirmText);
  });

  const [requestsVersion, setRequestsVersion] = useState(0);

  // Formatear fechas en formato colombiano
  const formatDate = useCallback((val) => {
    if (!val) return '–';
    const str = val.includes('T') ? val : `${val}T12:00:00Z`;
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(str));
  }, []);

  const formatDateTime = useCallback((val) => {
    if (!val) return '–';
    const str = val.includes('T') ? val : `${val}T12:00:00Z`;
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(str));
  }, []);

  // Calcular rango de fechas
  const calculateDateRange = useCallback((rows, dateField) => {
    const values = rows
      .map((item) => item[dateField])
      .filter(Boolean)
      .map((val) => new Date(val.includes('T') ? val : `${val}T12:00:00Z`))
      .sort((a, b) => a - b);

    if (!values.length) return 'Sin registros';
    return `${formatDate(values[0].toISOString())} – ${formatDate(values.at(-1).toISOString())}`;
  }, [formatDate]);

  // Resumen de datos propios
  const [summary, setSummary] = useState(() => {
    const initial = getAgentRecords(currentUser?.id);
    return {
      checkins: initial?.checkins || [],
      journals: initial?.journals || [],
      support: initial?.supportRequests || [],
      consent: initial?.consents?.[currentUser?.id] || null,
      requests: initial?.habeasRequests || []
    };
  });

  const [loadError, setLoadError] = useState('');
  const [hasSnapshot, setHasSnapshot] = useState(() => Boolean(getAgentRecords(currentUser?.id)?.consents?.[currentUser?.id]));
  const [loading, setLoading] = useState(() => {
    if (env.useMockStorage) return false;
    const initial = getAgentRecords(currentUser?.id);
    return !initial?.consents?.[currentUser?.id];
  });

  const reload = useCallback(() => setRequestsVersion(previous => previous + 1), []);

  useEffect(() => {
    let mounted = true;
    if (!env.useMockStorage) setLoading(true);
    async function load() {
      if (!currentUser?.id) return;
      const storeData = env.useMockStorage ? getAgentRecords(currentUser.id) : await fetchAgentRecords(currentUser.id);
      if (!mounted) return;
      setSummary({
        checkins: storeData.checkins || [],
        journals: storeData.journals || [],
        support: storeData.supportRequests || [],
        consent: storeData.consents?.[currentUser.id],
        requests: storeData.habeasRequests || []
      });
      setHasSnapshot(true);
      setLoadError('');
    }
    load()
      .catch((error) => {
        if (mounted) setLoadError(error.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [currentUser?.id, requestsVersion]);

  // Navegación accesible por teclado entre pestañas (WAI-ARIA)
  const tabsList = useMemo(() => ['safeguards', 'records', 'habeas'], []);

  const handleTabKeyDown = (e, currentTabId) => {
    const currentIndex = tabsList.indexOf(currentTabId);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % tabsList.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + tabsList.length) % tabsList.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = tabsList.length - 1;
    }

    if (nextIndex !== currentIndex) {
      const nextTabId = tabsList[nextIndex];
      setActiveTab(nextTabId);
      const nextButton = document.getElementById(`tab-${nextTabId}`);
      if (nextButton) {
        nextButton.focus();
      }
    }
  };

  // Preseleccionar registro para rectificación y pasar a pestaña de trámites
  const handleSelectForRectification = (record) => {
    setActiveTab('habeas');
    const typeLabels = {
      checkin: 'Check-in de turno',
      journal: 'Bitácora personal',
      support: 'Solicitud de apoyo'
    };
    const label = record.typeLabel || typeLabels[record.type] || record.type || 'registro';
    const refDate = formatDate(record.date || record.createdAt);
    setRectificationText(`Solicito rectificar el registro de ${label} del ${refDate} (Ref: ${record.id}): `);
  };

  // Crear solicitud de Habeas Data
  const createHabeasRequest = async (requestType, noteText) => {
    const result = await registerHabeasRequest(requestType, currentUser, noteText);
    if (result.success !== true) {
      throw new Error(result.error);
    }
    setRequestsVersion((prev) => prev + 1);
    return result.generatedId;
  };

  // Preparar la copia propia para los enlaces de descarga
  const currentUserId = currentUser?.id;
  const currentUserEmail = currentUser?.email;
  const currentUserName = currentUser?.name;

  const portabilityFiles = useMemo(() => {
    if (!currentUserId) return { json: '', csv: '', fileNameBase: 'pulso360_mis-datos' };

    const payload = {
      titular: { id: currentUserId, email: currentUserEmail, name: currentUserName },
      generado: new Date().toISOString(),
      checkins: summary.checkins,
      bitacoras: summary.journals,
      solicitudesAcompanamiento: summary.support,
      consentimiento: summary.consent
    };
    const rows = ['tipo,id,fecha'];
    summary.checkins.forEach((item) => rows.push(`checkin,${item.id},${item.date}`));
    summary.journals.forEach((item) => rows.push(`bitacora,${item.id},${item.date}`));
    summary.support.forEach((item) => rows.push(`solicitud_acompanamiento,${item.id},${item.date}`));

    return {
      json: JSON.stringify(payload, null, 2),
      csv: rows.join('\n'),
      fileNameBase: `pulso360_${currentUserId}`
    };
  }, [currentUserId, currentUserEmail, currentUserName, summary]);

  const handleDownloadPortability = (format) => {
    authService.recordSecurityAudit({
      actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
      action: 'PORTABILIDAD_DATOS',
      target: format.toUpperCase()
    });
  };

  // Solicitar rectificación
  const handleRectificationSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (rectificationPendingRef.current) return;
    const submittedText = rectificationText;
    const detail = submittedText.trim();
    if (detail.length < 10) {
      setRectificationFeedback({ type: 'error', message: 'Describe el dato que deseas rectificar con al menos 10 caracteres.' });
      return;
    }

    rectificationPendingRef.current = true;
    setIsRectifying(true);
    setRectificationFeedback(null);
    try {
      const reqId = await createHabeasRequest('Rectificacion', detail);
      setRectificationFeedback({ type: 'success', message: `Solicitud ${reqId} registrada. Consulta su estado y cualquier plazo registrado en el historial de trámites.` });
      setRectificationText(previous => previous === submittedText ? '' : previous);
    } catch (err) {
      setRectificationFeedback({ type: 'error', message: `No se confirmó la solicitud: ${err.message}. El texto se conserva; revisa el historial antes de volver a intentarlo.` });
    } finally {
      rectificationPendingRef.current = false;
      setIsRectifying(false);
    }
  };

  // Solicitar supresión
  const handleSuppressionSubmit = async () => {
    if (suppressionPendingRef.current || suppressionConfirmText.trim() !== 'SUPRIMIR') return;
    suppressionPendingRef.current = true;
    setIsSuppressing(true);
    setSuppressionFeedback(null);
    const submittedConfirmation = suppressionConfirmText;
    try {
      const reqId = await createHabeasRequest(
        'Supresion',
        'Solicitud formal de supresión de datos personales conforme a la Ley 1581 de 2012.'
      );
      setSuppressionFeedback({ type: 'success', message: `Solicitud ${reqId} registrada. Consulta su estado y cualquier plazo registrado en el historial de trámites.` });
      setSuppressionConfirmText(previous => previous === submittedConfirmation ? '' : previous);
    } catch (err) {
      setSuppressionFeedback({ type: 'error', message: `No se confirmó la solicitud: ${err.message}. La confirmación se conserva; revisa el historial antes de volver a intentarlo.` });
    } finally {
      suppressionPendingRef.current = false;
      setIsSuppressing(false);
    }
  };

  const isSuppressionConfirmed = suppressionConfirmText.trim() === 'SUPRIMIR';

  return {
    loading,
    hasSnapshot,
    isRefreshing: loading && hasSnapshot,
    loadError,
    reload,
    currentUser,
    activeTab,
    setActiveTab,
    handleTabKeyDown,
    isSuppressionModalOpen,
    setIsSuppressionModalOpen,
    rectificationText,
    setRectificationText,
    rectificationFeedback,
    isRectifying,
    suppressionConfirmText,
    setSuppressionConfirmText,
    suppressionFeedback,
    isSuppressing,
    formatDate,
    formatDateTime,
    calculateDateRange,
    summary,
    portabilityFiles,
    handleDownloadPortability,
    handleRectificationSubmit,
    handleSuppressionSubmit,
    handleSelectForRectification,
    isSuppressionConfirmed
  };
}
