import { getAgentRecords } from '../services/agentQueries';
import { createHabeasRequest as registerHabeasRequest } from '../services/myDataPrivacyService';
import { useState, useMemo } from 'react';

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
  const summary = useMemo(() => {
    void requestsVersion;
    const storeData = getAgentRecords(currentUser?.id);
    return {
      checkins: (storeData.checkins || []).filter((c) => c.userId === currentUser?.id),
      journals: (storeData.journals || []).filter((j) => j.userId === currentUser?.id),
      support: (storeData.supportRequests || []).filter((s) => s.ownerUserId === currentUser?.id),
      consent: storeData.consents?.[currentUser?.id],
      requests: (storeData.habeasRequests || []).filter((r) => r.userId === currentUser?.id)
    };
  }, [currentUser?.id, requestsVersion]);

  // Crear solicitud de Habeas Data
  const createHabeasRequest = (requestType, noteText) => {
    const { generatedId } = registerHabeasRequest(requestType, currentUser, noteText);

    setRequestsVersion((prev) => prev + 1);
    return generatedId;
  };

  // Portabilidad de datos (JSON / CSV)
  const handleDownloadPortability = (format) => {
    const payload = {
      titular: { id: currentUser.id, email: currentUser.email, name: currentUser.name },
      generado: new Date().toISOString(),
      checkins: summary.checkins,
      bitacoras: summary.journals,
      solicitudesAcompanamiento: summary.support,
      consentimiento: summary.consent
    };

    let content, mimeType, fileName;

    if (format === 'json') {
      content = JSON.stringify(payload, null, 2);
      mimeType = 'application/json';
      fileName = `pulso360_${currentUser.id}.json`;
    } else {
      const rows = ['tipo,id,fecha'];
      summary.checkins.forEach((item) => rows.push(`checkin,${item.id},${item.date}`));
      summary.journals.forEach((item) => rows.push(`bitacora,${item.id},${item.date}`));
      summary.support.forEach((item) => rows.push(`solicitud_acompanamiento,${item.id},${item.date}`));
      content = rows.join('\n');
      mimeType = 'text/csv';
      fileName = `pulso360_${currentUser.id}.csv`;
    }

    const blob = new Blob([content], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = blobUrl;
    downloadAnchor.download = fileName;
    downloadAnchor.click();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 500);

    pulsoStore.audit({
      actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
      action: 'PORTABILIDAD_DATOS',
      target: format.toUpperCase()
    });
  };

  // Solicitar rectificación
  const handleRectificationSubmit = (e) => {
    e.preventDefault();
    const detail = rectificationText.trim();
    if (detail.length < 10) {
      setRectificationFeedback(
        'Describe con un poco más de detalle el dato que deseas rectificar (mínimo 10 caracteres).'
      );
      return;
    }

    const reqId = createHabeasRequest('Rectificación', detail);
    setRectificationFeedback(`Solicitud ${reqId} recibida. No se modifica ningún dato automáticamente.`);
    setRectificationText('');
  };

  // Solicitar supresión
  const handleSuppressionSubmit = () => {
    const reqId = createHabeasRequest(
      'Supresión',
      'Solicitud de supresión de datos conforme a la Ley 1581 de 2012.'
    );
    setSuppressionFeedback(`Solicitud ${reqId} radicada exitosamente. Se gestionará administrativamente.`);
    setSuppressionConfirmText('');
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
    handleDownloadPortability,
    handleRectificationSubmit,
    handleSuppressionSubmit,
    isSuppressionConfirmed
  };
}
