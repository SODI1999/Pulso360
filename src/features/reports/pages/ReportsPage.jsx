// src/features/reports/pages/ReportsPage.jsx
// Módulo de Generación y Exportación de Reportes Consolidados (RF-12)

import { useState, useMemo } from 'react';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import { PrivacyBlockedCard } from '../../supervisor/components/PrivacyBlockedCard';
import { ReportPreviewCard } from '../components/ReportPreviewCard';
import { ReportHistoryTable } from '../components/ReportHistoryTable';

import '../../../styles/reports.css';

// Alcances institucionales de referencia
const BASE_SCOPES = {
  'team-alpha-1': { id: 'team-alpha-1', label: 'Equipo Alpha 1 · Soporte Alpha', n: 14, allowed: ['supervisor', 'sst', 'admin'] },
  'camp-1': { id: 'camp-1', label: 'Campaña Soporte Alpha (Consolidado)', n: 18, allowed: ['supervisor', 'sst', 'admin'] },
  'camp-2': { id: 'camp-2', label: 'Campaña Retención Beta (Consolidado)', n: 22, allowed: ['sst', 'admin'] },
  'team-alpha-2': { id: 'team-alpha-2', label: 'Equipo Alpha 2 · Corte protegido', n: 4, allowed: ['supervisor', 'sst', 'admin'] }
};

export function ReportsPage() {
  const currentUser = authService.getCurrentUser();
  const [version, setVersion] = useState(0);

  const storeData = useMemo(() => {
    void version;
    return pulsoStore.get();
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
    fechaFormateada: new Intl.DateTimeFormat('es-CO', { dateStyle: 'short', timeStyle: 'short' }).format(new Date()),
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
      setFeedback('No se puede generar el reporte: el corte seleccionado no cumple las reglas de k-anonimato (N < 5).');
      return;
    }

    const activeSections = Object.entries(sections).filter(([, val]) => val).map(([key]) => key);
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
    const data = pulsoStore.get();
    data.reportHistory = data.reportHistory || [];
    data.reportHistory.unshift(newReportRecord);
    pulsoStore.save(data);

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
      ['ALCANCE DE PRIVACIDAD', 'Este documento contiene datos agregados del corte seleccionado. No incluye check-ins individuales ni bitácoras personales.']
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
      clausulaPrivacidad: 'Datos agregados protegidos bajo la Ley 1581 de 2012 y lineamientos de k-anonimato N >= 5.'
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

  return (
    <div className="reports-container">
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Centro de reportes consolidados</h1>
          <p className="page-subtitle">
            Generación y exportación de tendencias colectivas de bienestar y métricas operativas protegidas (RF-12).
          </p>
        </div>
      </div>

      {/* Banner Informativo de K-Anonimato */}
      <div className="alert-banner info">
        <Icon name="info" size={18} />
        <div>
          <strong>Garantía de Confidencialidad Institucional:</strong> Los reportes se generan estrictamente consolidados a nivel de equipo o campaña. Si un subgrupo cuenta con menos de {minThreshold} integrantes, el reporte se bloquea automáticamente para evitar reidentificación.
        </div>
      </div>

      {/* Mensaje de feedback */}
      {feedback && (
        <div className={`alert-banner ${isAllowedByPrivacy ? 'ok' : 'danger'}`} role="status">
          <Icon name={isAllowedByPrivacy ? 'checkCircle' : 'alertTriangle'} size={18} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Configuración del Reporte */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Parámetros de generación de reporte</h2>
            <div className="card-subtitle">Selecciona el alcance organizacional, periodo y dimensiones de análisis.</div>
          </div>
        </div>

        <form onSubmit={handleGenerateReport}>
          <div className="reports-controls-grid">
            {/* Selector de Alcance */}
            <div className="form-group">
              <label className="form-label" htmlFor="reportScopeSelect">
                Alcance / Corte organizacional <span style={{ color: 'var(--c-critico)' }}>*</span>
              </label>
              <select
                id="reportScopeSelect"
                className="form-select"
                value={selectedScopeId}
                onChange={(e) => {
                  setSelectedScopeId(e.target.value);
                  setGeneratedReport(null);
                }}
              >
                {availableScopes.map((scope) => (
                  <option key={scope.id} value={scope.id}>
                    {scope.label} (N = {scope.n})
                  </option>
                ))}
              </select>
              <span className="form-hint">
                {currentScope?.n < minThreshold ? (
                  <strong style={{ color: 'var(--c-alerta)' }}>
                    Corte con N = {currentScope.n} (Bajo umbral confidencial N &ge; {minThreshold})
                  </strong>
                ) : (
                  `Corte con N = ${currentScope?.n} (Publicable)`
                )}
              </span>
            </div>

            {/* Selector de Periodo */}
            <div className="form-group">
              <label className="form-label" htmlFor="reportPeriodSelect">
                Periodo temporal
              </label>
              <select
                id="reportPeriodSelect"
                className="form-select"
                value={selectedPeriod}
                onChange={(e) => {
                  setSelectedPeriod(e.target.value);
                  setGeneratedReport(null);
                }}
              >
                <option value="Semana 34 (18–24 Ago 2026)">Semana 34 (18–24 Ago 2026)</option>
                <option value="Semana 33 (11–17 Ago 2026)">Semana 33 (11–17 Ago 2026)</option>
                <option value="Mes de Agosto 2026">Mes de Agosto 2026</option>
                <option value="Trimestre Q3 2026">Trimestre Q3 2026</option>
              </select>
            </div>
          </div>

          {/* Checkboxes de Dimensiones */}
          <div className="form-group">
            <label className="form-label">Dimensiones incluidas en el reporte</label>
            <div className="reports-checkbox-group">
              <label className="reports-checkbox-item">
                <input
                  type="checkbox"
                  checked={sections.energia}
                  onChange={(e) => setSections({ ...sections, energia: e.target.checked })}
                />
                <span>Energía agregada</span>
              </label>
              <label className="reports-checkbox-item">
                <input
                  type="checkbox"
                  checked={sections.carga}
                  onChange={(e) => setSections({ ...sections, carga: e.target.checked })}
                />
                <span>Carga emocional agregada</span>
              </label>
              <label className="reports-checkbox-item">
                <input
                  type="checkbox"
                  checked={sections.recuperacion}
                  onChange={(e) => setSections({ ...sections, recuperacion: e.target.checked })}
                />
                <span>Recuperación percibida</span>
              </label>
              <label className="reports-checkbox-item">
                <input
                  type="checkbox"
                  checked={sections.participacion}
                  onChange={(e) => setSections({ ...sections, participacion: e.target.checked })}
                />
                <span>Participación en check-in</span>
              </label>
            </div>
          </div>

          {/* Formato de Exportación */}
          <div className="form-group" style={{ marginTop: 'var(--space-3)' }}>
            <label className="form-label">Formato de exportación</label>
            <div className="reports-format-radios">
              <label className="reports-radio-label">
                <input
                  type="radio"
                  name="reportFormat"
                  value="CSV"
                  checked={format === 'CSV'}
                  onChange={() => setFormat('CSV')}
                />
                <span>CSV delimitado</span>
              </label>
              <label className="reports-radio-label">
                <input
                  type="radio"
                  name="reportFormat"
                  value="PDF"
                  checked={format === 'PDF'}
                  onChange={() => setFormat('PDF')}
                />
                <span>PDF imprimible</span>
              </label>
              <label className="reports-radio-label">
                <input
                  type="radio"
                  name="reportFormat"
                  value="JSON"
                  checked={format === 'JSON'}
                  onChange={() => setFormat('JSON')}
                />
                <span>JSON estructurado</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isAllowedByPrivacy}
            >
              <Icon name="summarize" size={16} />
              <span>Generar y exportar reporte</span>
            </button>
          </div>
        </form>
      </div>

      {/* Previsualización en Vivo o Bloqueo por K-Anonimato */}
      {!isAllowedByPrivacy ? (
        <PrivacyBlockedCard
          teamName={currentScope?.label || 'Corte seleccionado'}
          respondentsCount={currentScope?.n || 0}
          customMessage="Este corte organizacional no cumple el umbral mínimo institucional de confidencialidad (N ≥ 5). Para proteger el anonimato de los agentes, la previsualización y exportación de reportes están deshabilitadas."
        />
      ) : (
        <ReportPreviewCard
          scopeLabel={currentScope?.label}
          period={selectedPeriod}
          minThreshold={minThreshold}
          sections={sections}
          requesterName={currentUser?.name}
          nlpVersion={storeData.settings?.nlpVersion}
        />
      )}

      {/* Resultado de Generación con Descarga Inmediata */}
      {generatedReport && (
        <div className="reports-result-box">
          <div className="reports-result-header">
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--c-texto)' }}>
                Reporte preparado y certificado
              </h3>
              <div style={{ fontSize: '13px', color: 'var(--c-texto-suave)', marginTop: '2px' }}>
                {generatedReport.scope} · {generatedReport.format}
              </div>
            </div>
            <span className="badge badge-ok">Hash verificado</span>
          </div>

          <p style={{ fontSize: '13px', margin: 'var(--space-2) 0' }}>
            Hash criptográfico demo: <code className="audit-code-cell">{generatedReport.hash}</code>
          </p>

          <div className="reports-actions-row">
            {generatedReport.format === 'CSV' && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleDownloadCsv}
              >
                <Icon name="download" size={14} />
                <span>Descargar archivo CSV</span>
              </button>
            )}
            {generatedReport.format === 'JSON' && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleDownloadJson}
              >
                <Icon name="download" size={14} />
                <span>Descargar archivo JSON</span>
              </button>
            )}
            {generatedReport.format === 'PDF' && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handlePrintPdf}
              >
                <Icon name="fileText" size={14} />
                <span>Imprimir / Guardar en PDF</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Historial Modular de Reportes Generados */}
      <ReportHistoryTable reportHistory={reportHistory} />
    </div>
  );
}
