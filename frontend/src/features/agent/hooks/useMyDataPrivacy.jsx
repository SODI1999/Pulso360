import { fetchAgentRecords } from '../services/agentQueries';
import { createHabeasRequest as registerHabeasRequest } from '../services/myDataPrivacyService';
import { useState, useMemo, useEffect } from 'react';

import { authService, roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';

export function useMyDataPrivacy() {
  const currentUser = authService.getCurrentUser();

  const [rectificationText, setRectificationText] = useState('');
  const [rectificationFeedback, setRectificationFeedback] = useState('');

  const [suppressionConfirmText, setSuppressionConfirmText] = useState('');
  const [suppressionFeedback, setSuppressionFeedback] = useState('');

  const [requestsVersion, setRequestsVersion] = useState(0);

  // Formatear fechas en formato colombiano
  const formatDate = (val) => {
    if (!val) return '–';
    const str = val.includes('T') ? val : `${val}T12:00:00`;
    return new Intl.DateTimeFormat('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(
      new Date(str)
    );
  };

  // Calcular rango de fechas
  const calculateDateRange = (rows, dateField) => {
    const values = rows
      .map((item) => item[dateField])
      .filter(Boolean)
      .map((val) => new Date(val.includes('T') ? val : `${val}T12:00:00`))
      .sort((a, b) => a - b);

    if (!values.length) return 'Sin registros';
    return `${formatDate(values[0].toISOString())} – ${formatDate(values.at(-1).toISOString())}`;
  };

  // Calcular días hábiles

  // Resumen de datos propios
  const [summary, setSummary] = useState({
    checkins: [],
    journals: [],
    support: [],
    consent: null,
    requests: []
  });


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
    load();
    return () => { mounted = false; };
  }, [currentUser?.id, requestsVersion]);

  // Crear solicitud de Habeas Data
  const createHabeasRequest = async (requestType, noteText) => {
    const result = await registerHabeasRequest(requestType, currentUser, noteText);
    if (result.error) {
      throw new Error(result.error);
    }
    setRequestsVersion((prev) => prev + 1);
    return result.generatedId;
  };

  // Preparar la copia propia para los enlaces de descarga.
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
    pulsoStore.audit({
      actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
      action: 'PORTABILIDAD_DATOS',
      target: format.toUpperCase()
    });
  };

  // Solicitar rectificación
  const handleRectificationSubmit = async (e) => {
    e.preventDefault();
    const detail = rectificationText.trim();
    if (detail.length < 10) {
      setRectificationFeedback(
        'Describe con un poco más de detalle el dato que deseas rectificar (mínimo 10 caracteres).'
      );
      return;
    }

    try {
      const reqId = await createHabeasRequest('Rectificacion', detail);
      setRectificationFeedback(`Solicitud ${reqId} recibida. No se modifica ningún dato automáticamente.`);
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
        'Solicitud de supresión de datos conforme a la Ley 1581 de 2012.'
      );
      setSuppressionFeedback(`Solicitud ${reqId} radicada exitosamente. Se gestionará administrativamente.`);
      setSuppressionConfirmText('');
    } catch (err) {
      setSuppressionFeedback(`Error: ${err.message}`);
    }
  };

  const isSuppressionConfirmed = suppressionConfirmText.trim() === 'SUPRIMIR';

  return {
    rectificationText,
    setRectificationText,
    rectificationFeedback,
    suppressionConfirmText,
    setSuppressionConfirmText,
    suppressionFeedback,
    formatDate,
    calculateDateRange,
    summary,
    portabilityFiles,
    handleDownloadPortability,
    handleRectificationSubmit,
    handleSuppressionSubmit,
    isSuppressionConfirmed
  };
}
