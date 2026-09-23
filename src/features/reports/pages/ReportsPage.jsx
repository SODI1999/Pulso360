import { ReportResult } from '../components/ReportResult';
import { ReportConfiguration } from '../components/ReportConfiguration';
import { useReports } from '../hooks/useReports';

// src/features/reports/pages/ReportsPage.jsx
// Módulo de Generación y Exportación de Reportes Consolidados (RF-12)

import { Icon } from '../../../core/components/Icon';
import { PrivacyBlockedCard } from '../../../core/components/PrivacyBlockedCard';
import { ReportPreviewCard } from '../components/ReportPreviewCard';
import { ReportHistoryTable } from '../components/ReportHistoryTable';

import '../../../styles/reports.css';

// Alcances institucionales de referencia

export function ReportsPage() {
  const {
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
  } = useReports();

  return (
    <div className="reports-container">
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Centro de reportes consolidados</h1>
          <p className="page-subtitle">
            Generación y exportación de tendencias colectivas de bienestar y métricas operativas protegidas
            (RF-12).
          </p>
        </div>
      </div>

      {/* Banner Informativo de K-Anonimato */}
      <div className="alert-banner info">
        <Icon name="info" size={18} />
        <div>
          <strong>Garantía de Confidencialidad Institucional:</strong> Los reportes se generan estrictamente
          consolidados a nivel de equipo o campaña. Si un subgrupo cuenta con menos de {minThreshold}{' '}
          integrantes, el reporte se bloquea automáticamente para evitar reidentificación.
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
      <ReportConfiguration
        handleGenerateReport={handleGenerateReport}
        selectedScopeId={selectedScopeId}
        setSelectedScopeId={setSelectedScopeId}
        setGeneratedReport={setGeneratedReport}
        availableScopes={availableScopes}
        currentScope={currentScope}
        minThreshold={minThreshold}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        sections={sections}
        setSections={setSections}
        format={format}
        setFormat={setFormat}
        isAllowedByPrivacy={isAllowedByPrivacy}
      />

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
        <ReportResult
          generatedReport={generatedReport}
          handleDownloadCsv={handleDownloadCsv}
          handleDownloadJson={handleDownloadJson}
          handlePrintPdf={handlePrintPdf}
        />
      )}

      {/* Historial Modular de Reportes Generados */}
      <ReportHistoryTable reportHistory={reportHistory} />
    </div>
  );
}
