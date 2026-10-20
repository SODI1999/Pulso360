import { useExpiredFormDraft } from '../../../core/auth/useExpiredFormDraft';
import { env } from '../../../core/config/env';
import { fetchAgentRecords, getAgentRecords } from '../services/agentQueries';
import { createHabeasRequest as registerHabeasRequest } from '../services/myDataPrivacyService';
import { useState, useMemo, useEffect, useCallback } from 'react';

import { authService, roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';

/**
 * Hook para la gestión del Centro de Privacidad, Salvaguardas y Habeas Data del Agente.
 * Administra el ejercicio de derechos ARCO (Acceso, Rectificación, Cancelación/Supresión, Oposición),
 * generación de archivos de portabilidad en cliente y navegación por pestañas WAI-ARIA.
 *
 * @returns {Object} Estado del centro de privacidad y manejadores de acción ARCO.
 */
export function useMyDataPrivacy() {
  const currentUser = authService.getCurrentUser();

  const [activeTab, setActiveTab] = useState('safeguards');
  const [isSuppressionModalOpen, setIsSuppressionModalOpen] = useState(false);

  const [rectificationText, setRectificationText] = useState('');
  const [rectificationFeedback, setRectificationFeedback] = useState('');

  const [suppressionConfirmText, setSuppressionConfirmText] = useState('');
  const [suppressionFeedback, setSuppressionFeedback] = useState('');

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
  const [loading, setLoading] = useState(() => {
    if (env.useMockStorage) return false;
    const initial = getAgentRecords(currentUser?.id);
    return !initial?.consents?.[currentUser?.id];
  });

  const reload = useCallback(() => {
    if (!currentUser?.id) return;
    setLoading(true);
    setLoadError('');
    if (!env.useMockStorage) {
      fetchAgentRecords(currentUser.id)
        .then((storeData) => {
          setSummary({
            checkins: storeData.checkins || [],
            journals: storeData.journals || [],
            support: storeData.supportRequests || [],
            consent: storeData.consents?.[currentUser.id],
            requests: storeData.habeasRequests || []
          });
        })
        .catch((error) => {
          setLoadError(error.message || 'Error al conectar con el servidor.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      const initial = getAgentRecords(currentUser.id);
      setSummary({
        checkins: initial?.checkins || [],
        journals: initial?.journals || [],
        support: initial?.supportRequests || [],
        consent: initial?.consents?.[currentUser.id] || null,
        requests: initial?.habeasRequests || []
      });
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!currentUser?.id) return;
      const storeData = await fetchAgentRecords(currentUser.id);
      if (!mounted) return;
      setSummary({
        checkins: storeData.checkins || [],
        journals: storeData.journals || [],
        support: storeData.supportRequests || [],
        consent: storeData.consents?.[currentUser.id],
        requests: storeData.habeasRequests || []
      });
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
    if (env.useMockStorage) {
      pulsoStore.audit({
        actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
        action: 'PORTABILIDAD_DATOS',
        target: format.toUpperCase()
      });
    }
  };

  // Solicitar rectificación
  const handleRectificationSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const detail = rectificationText.trim();
    if (detail.length < 10) {
      setRectificationFeedback(
        'Describe con un poco más de detalle el dato que deseas rectificar (mínimo 10 caracteres).'
      );
      return;
    }

    try {
      const reqId = await createHabeasRequest('Rectificacion', detail);
      setRectificationFeedback(`Solicitud ${reqId} radicada exitosamente. Se gestionará administrativamente en un plazo de hasta 15 días hábiles.`);
      setRectificationText('');
    } catch (err) {
      setRectificationFeedback(`Error: ${err.message}`);
    }
  };

  // Solicitar supresión
  const handleSuppressionSubmit = async () => {
    try {
      const reqId = await createHabeasRequest(
        'Supresion',
        'Solicitud formal de supresión de datos personales conforme a la Ley 1581 de 2012.'
      );
      setSuppressionFeedback(`Solicitud ${reqId} radicada con éxito. Será evaluada administrativamente dentro de los 15 días hábiles siguientes.`);
      setSuppressionConfirmText('');
    } catch (err) {
      setSuppressionFeedback(`Error: ${err.message}`);
    }
  };

  const isSuppressionConfirmed = suppressionConfirmText.trim() === 'SUPRIMIR';

  return {
    loading,
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
    suppressionConfirmText,
    setSuppressionConfirmText,
    suppressionFeedback,
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
