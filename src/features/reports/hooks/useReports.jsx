import { getReportData } from '../services/reportsQueries';
import { generateReport } from '../services/reportsService';
import { useState, useMemo } from 'react';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';

import { BASE_SCOPES } from '../data/reportsData';

export function useReports() {
  const currentUser = authService.getCurrentUser();
  const [version, setVersion] = useState(0);

  const storeData = useMemo(() => {
    void version;
    return getReportData();
  }, [version]);
  const minThreshold = storeData.settings?.umbralMinimo || 5;

  // Filtrar alcances según el rol del usuario
  const availableScopes = useMemo(() => {
    return Object.values(BASE_SCOPES).filter((s) => s.allowed.includes(currentUser?.role || 'admin'));
  }, [currentUser?.role]);

  const [selectedScopeId, setSelectedScopeId] = useState(availableScopes[0]?.id || 'team-alpha-1');
  const [selectedPeriod, setSelectedPeriod] = useState('Semana 34 (18–24 Ago 2026)');
  const [sections, setSections] = useState({
    energia: true,
    carga: true,
    recuperacion: true,
    participacion: true
  });
  const [format, setFormat] = useState('CSV');

  const [generatedReport, setGeneratedReport] = useState(null);
  const [feedback, setFeedback] = useState('');

  const currentScope = availableScopes.find((s) => s.id === selectedScopeId) || availableScopes[0];
  const isAllowedByPrivacy = currentScope && currentScope.n >= minThreshold;

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
  const handleGenerateReport = (e) => {
    e.preventDefault();
    setFeedback('');

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

    const newReportRecord = {
      id: `rep-${Date.now()}`,
      date: meta.fecha,
      user: meta.solicitante,
      scope: meta.alcance,
      format,
      hash
    };

    // Guardar en almacén
    generateReport(newReportRecord);

    // Auditoría inmutable (RF-12 / RF-13)
    pulsoStore.audit({
      actor: `${meta.solicitante} (${meta.rol})`,
      action: 'EXPORTACION_REPORTE',
      target: `${format} · ${meta.alcance} · Hash: ${hash}`
    });

    setGeneratedReport({ ...newReportRecord, meta });
    setFeedback(`Reporte generado exitosamente con código de integridad ${hash}.`);
    setVersion((v) => v + 1);
  };

  // Descargar archivo CSV
  const handleDownloadCsv = () => {
    if (!generatedReport) return;
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
      ['INDICADOR AGREGADO', 'VALOR (0-100)', 'INTERPRETACION'],
      ['Energia agregada', '76', 'Nivel Optimo'],
      ['Carga emocional agregada', '68', 'Nivel Moderado'],
      ['Recuperacion agregada', '58', 'Atencion Preventiva'],
      ['Tasa de participacion', '92%', 'Muestra representativa'],
      [],
      [
        'ALCANCE DE PRIVACIDAD',
        'Este documento contiene datos agregados del corte seleccionado. No incluye check-ins individuales ni bitácoras personales.'
      ]
    ];

    const csvContent = csvRows
      .map((row) => row.map((val) => `"${String(val ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulso360_reporte_${selectedScopeId}_${new Date().toISOString().substring(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Descargar archivo JSON
  const handleDownloadJson = () => {
    if (!generatedReport) return;
    const { meta, hash } = generatedReport;

    const exportObj = {
      sistema: 'Pulso360',
      tipo: 'Reporte Consolidado Agregado (RF-12)',
      metadatos: meta,
      hashCriptograficoDemo: hash,
      indicadores: {
        energiaAgregada: 76,
        cargaEmocionalAgregada: 68,
        recuperacionAgregada: 58,
        tasaParticipacion: '92%'
      },
      clausulaPrivacidad:
        'Datos agregados protegidos bajo la Ley 1581 de 2012 y lineamientos de k-anonimato N >= 5.'
    };

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulso360_reporte_${selectedScopeId}_${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Imprimir / Guardar PDF
  const handlePrintPdf = () => {
    window.print();
  };

  const reportHistory = storeData.reportHistory || [];

  return {
    currentUser,
    storeData,
    minThreshold,
    availableScopes,
    selectedScopeId,
    setSelectedScopeId,
    selectedPeriod,
    setSelectedPeriod,
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
    handleDownloadCsv,
    handleDownloadJson,
    handlePrintPdf,
    reportHistory
  };
}
