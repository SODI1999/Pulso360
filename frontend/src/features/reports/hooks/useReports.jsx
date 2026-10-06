import { useExpiredFormDraft } from '../../../core/auth/useExpiredFormDraft';
import { getReportData, fetchReports } from '../services/reportsQueries';
import { generateReport } from '../services/reportsService';
import { useState, useMemo, useEffect } from 'react';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

import { BASE_SCOPES } from '../data/reportsData';
import { bogotaCalendarDate } from '../../../core/time/calendarDate';

export function useReports() {
  const currentUser = authService.getCurrentUser();
  const [version, setVersion] = useState(0);
  const [apiHistory, setApiHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');

  const storeData = useMemo(() => {
    void version;
    return getReportData();
  }, [version]);

  // Filtrar alcances según el rol del usuario
  const availableScopes = useMemo(() => {
    if (env.useMockStorage) return Object.values(BASE_SCOPES).filter(s => s.allowed.includes(currentUser?.role));
    const scopes = new Map();
    for (const team of currentUser?.scopes || []) {
      scopes.set(team.id,{id:team.id,label:team.campana_nombre+' · '+team.nombre,campanaId:team.campana_id,equipoId:team.id});
      scopes.set(team.campana_id,{id:team.campana_id,label:team.campana_nombre,campanaId:team.campana_id,equipoId:null});
    }
    return [...scopes.values()];
  }, [currentUser?.role,currentUser?.scopes]);

  const [selectedScopeId, setSelectedScopeId] = useState(availableScopes[0]?.id || '');
  const [periodStart, setPeriodStart] = useState(() => bogotaCalendarDate().slice(0, 7) + '-01');
  const [periodEnd, setPeriodEnd] = useState(() => bogotaCalendarDate());
  const selectedPeriod = `${periodStart} — ${periodEnd}`;
  const historyScope = availableScopes.find(scope => scope.id === selectedScopeId);
  const historyCampaignId = historyScope?.campanaId;
  const historyTeamId = historyScope?.equipoId;

  useEffect(() => {
    let active = true; setHistoryLoading(true); setHistoryError('');
    fetchReports(historyCampaignId, historyTeamId).then(data => {
      if (active && data) {
        setApiHistory(data);
      }
    }).catch(error => { if (active) setHistoryError(error.message); }).finally(() => { if (active) setHistoryLoading(false); });
    return () => { active = false; };
  // La sesión se deserializa al leerla: depender del array reiniciaría la consulta en cada render.
  }, [version, selectedScopeId, currentUser?.id, historyCampaignId, historyTeamId]);

  const minThreshold = storeData.settings?.umbralMinimo || 5;

  const [sections, setSections] = useState({
    energia: true,
    carga: true,
    recuperacion: true,
    participacion: env.useMockStorage
  });
  const [format, setFormat] = useState('CSV');

  const [generatedReport, setGeneratedReport] = useState(null);
  const [feedback, setFeedback] = useState('');

  useExpiredFormDraft('report:configuration', { selectedScopeId, periodStart, periodEnd, sections, format }, draft => {
    setSelectedScopeId(draft.selectedScopeId);
    if (draft.periodStart) setPeriodStart(draft.periodStart);
    if (draft.periodEnd) setPeriodEnd(draft.periodEnd);
    setSections(draft.sections); setFormat(draft.format);
  });

  const currentScope = availableScopes.find((s) => s.id === selectedScopeId) || availableScopes[0];
  const isAllowedByPrivacy = currentScope && (!env.useMockStorage || currentScope.n >= minThreshold);

  useEffect(() => { setGeneratedReport(null); }, [selectedScopeId,selectedPeriod,sections,format]);

  // Función determinista de hash demo (RF-12)
  const computeHash = (str) => {
    let hashValue = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hashValue ^= str.charCodeAt(i);
      hashValue = Math.imul(hashValue, 16777619);
    }
    return `demo-${(hashValue >>> 0).toString(16).padStart(8, '0')}`;
  };

  const getReportMetadata = () => ({
    solicitante: currentUser?.name || 'Usuario',
    rol: currentUser?.role || 'supervisor',
    fecha: new Date().toISOString(),
    fechaFormateada: new Intl.DateTimeFormat('es-CO', { dateStyle: 'short', timeStyle: 'short' }).format(
      new Date()
    ),
    alcance: currentScope?.label || 'Alcance',
    periodo: selectedPeriod,
    umbral: minThreshold,
    modeloNLP: storeData.settings?.nlpVersion || 'lexico-v1.2'
  });

  // Generar reporte
  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setFeedback('');

    if (!periodStart || !periodEnd || periodStart > periodEnd) {
      setFeedback('Error: selecciona un intervalo de fechas válido.');
      return;
    }

    if (!isAllowedByPrivacy) {
      setFeedback(
        'No se puede generar el reporte: el corte seleccionado no cumple las reglas de k-anonimato (N < 5).'
      );
      return;
    }

    const activeSections = Object.entries(sections)
      .filter(([, val]) => val)
      .map(([key]) => key);
    if (activeSections.length === 0) {
      setFeedback('Debes seleccionar al menos una dimensión de indicadores para el reporte.');
      return;
    }

    const meta = getReportMetadata();
    const hash = computeHash(JSON.stringify({ ...meta, sections: activeSections, format, ts: Date.now() }));

    const isTeam = selectedScopeId.startsWith('team-');
    const isCamp = selectedScopeId.startsWith('camp-');
    
    const newReportRecord = {
      tipoReporte: selectedScopeId === 'all' ? 'general' : (isTeam ? 'equipo' : 'campana'),
      campanaId: env.useMockStorage ? (isCamp ? selectedScopeId : null) : currentScope.campanaId,
      equipoId: env.useMockStorage ? (isTeam ? selectedScopeId : null) : currentScope.equipoId,
      fechaCorte: new Date().toISOString().slice(0, 10),
      desde:periodStart, hasta:periodEnd, dimensions:activeSections,
      parametrosFiltro: { scope: selectedScopeId, format, sections, scope_label:currentScope.label, requester_name:currentUser.name },
      rutaArchivo: null,
      ...(env.useMockStorage ? {id:`rep-${Date.now()}`} : {}),
      date: meta.fecha,
      user: meta.solicitante,
      scope: meta.alcance,
      format,
      hash
    };

    const res = await generateReport(newReportRecord);
    if (res?.success !== true) {
      setFeedback(`Error: ${res.error.message || res.error}`);
      return;
    }

    const isApi = !!res.reportPayload;
    let finalReport = isApi ? {
      ...newReportRecord,
      ...res.reportPayload,
      reportPayload: res.reportPayload,
      hash: res.reportPayload.hashIntegridad || res.reportPayload.hash || hash,
      id: res.reportPayload.id || newReportRecord.id
    } : newReportRecord;

    if (isApi && finalReport.id) {
      try {
        const downloadRes = await apiClient.get(`/reports/${finalReport.id}/download`, { responseType: 'text' });
        const content = downloadRes?.data ?? downloadRes;
        finalReport.serverContent = typeof content === 'string' ? content : JSON.stringify(content);
        finalReport.metrics = res.reportPayload.metrics;
      } catch (err) {
        setFeedback(`Error al descargar reporte del servidor: ${err.response?.data?.error?.message || err.message}`);
        setGeneratedReport(null);
        return;
      }
    }

    const finalHash = finalReport.hash;
    if (isApi) {
      finalReport.scope = res.reportPayload.parametrosFiltro.scope_label || currentScope.label;
      finalReport.sections = res.reportPayload.parametrosFiltro.sections;
      finalReport.period = res.reportPayload.parametrosFiltro.desde+' — '+res.reportPayload.parametrosFiltro.hasta;
    }

    // Auditoría inmutable (RF-12 / RF-13)
    if (env.useMockStorage) {
      pulsoStore.audit({
        actor: `${meta.solicitante} (${meta.rol})`,
        action: 'EXPORTACION_REPORTE',
        target: `${format} · ${meta.alcance} · Hash: ${finalHash}`
      });
    }

    setGeneratedReport({ ...finalReport, meta });
    setFeedback(`Reporte generado exitosamente con código de integridad ${finalHash}.`);
    setVersion((v) => v + 1);
  };

  // Descargar archivo CSV
  const csvContent = useMemo(() => {
    if (!generatedReport) return null;
    if (generatedReport.serverContent) {
       return typeof generatedReport.serverContent === 'object' && generatedReport.serverContent.csv 
         ? generatedReport.serverContent.csv 
         : generatedReport.serverContent;
    }
    
    // Solo si no hay respuesta real de API:
    const { meta, hash } = generatedReport;
    const csvRows = [
      ['METADATO', 'VALOR'],
      ['Sistema', 'Pulso360 - Plataforma de Bienestar Laboral'],
      ['Tipo', 'Reporte Consolidado Agregado (RF-12)'],
      ['Solicitante', meta.solicitante],
      ['Fecha Generacion', meta.fechaFormateada],
      ['Alcance / Corte', meta.alcance],
      ['Periodo', meta.periodo],
      ['Umbral Confidencial', `N >= ${meta.umbral}`],
      ['Modelo NLP', meta.modeloNLP],
      ['Hash Criptografico Demo', hash],
      [],
      ['INDICADOR AGREGADO', 'VALOR (0-100)', 'INTERPRETACION']
    ];

    return csvRows
      .map((row) => row.map((val) => `"${String(val ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n');
  }, [generatedReport]);

  // Descargar archivo JSON
  const jsonContent = useMemo(() => {
    if (!generatedReport) return null;
    if (generatedReport.serverContent) {
       return typeof generatedReport.serverContent === 'object' 
         ? JSON.stringify(generatedReport.serverContent.json || generatedReport.serverContent, null, 2)
         : generatedReport.serverContent;
    }

    // Solo si no hay respuesta real de API:
    const { meta, hash } = generatedReport;
    const exportObj = {
      sistema: 'Pulso360',
      tipo: 'Reporte Consolidado Agregado (RF-12)',
      metadatos: meta,
      hashCriptograficoDemo: hash
    };
    return JSON.stringify(exportObj, null, 2);
  }, [generatedReport]);

  // Imprimir / Guardar PDF
  const handlePrintPdf = () => {
    window.print();
  };

  const reportHistory = env.useMockStorage ? (storeData.reportHistory || []) : apiHistory;

  return { historyLoading, historyError,
    currentUser,
    storeData,
    minThreshold,
    availableScopes,
    selectedScopeId,
    setSelectedScopeId,
    selectedPeriod,
    periodStart, setPeriodStart, periodEnd, setPeriodEnd,
    sections,
    setSections,
    format,
    setFormat,
    generatedReport,
    setGeneratedReport,
    feedback,
    currentScope,
    isAllowedByPrivacy,
    handleGenerateReport,
    csvContent,
    jsonContent,
    downloadFileBaseName: `pulso360_reporte_${selectedScopeId}_${generatedReport?.date?.substring(0, 10) || new Date().toISOString().substring(0, 10)}`,
    handlePrintPdf,
    reportHistory
  };
}
