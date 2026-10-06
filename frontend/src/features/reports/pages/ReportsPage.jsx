import { Link } from 'react-router-dom';
import { ReportResult } from '../components/ReportResult';
import { ReportConfiguration } from '../components/ReportConfiguration';
import { useReports } from '../hooks/useReports';
import { roleHomePaths } from '../../../core/auth/roleNavigation';

// src/features/reports/pages/ReportsPage.jsx
// Módulo de Generación y Exportación de Reportes Consolidados (RF-12, Workbench Sin Carditis)

import { Icon } from '../../../core/components/Icon';
import { PrivacyBlockedCard } from '../../../core/components/PrivacyBlockedCard';
import { ReportPreviewCard } from '../components/ReportPreviewCard';
import { ReportHistoryTable } from '../components/ReportHistoryTable';

import '../../../styles/reports.css';

export function ReportsPage() {
  const {
    historyLoading, historyError,
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
    downloadFileBaseName,
    handlePrintPdf,
    reportHistory
  } = useReports();

  return (
    <div className="reports-container">
      {/* Navegación secundaria */}
      <nav className="supervisor-subnav" aria-label="Navegación secundaria">
        <Link to={roleHomePaths[currentUser?.role] || '/panel'} className="supervisor-back-btn">
          <Icon name="arrow_back" size={16} />
          <span>Volver al inicio</span>
        </Link>
      </nav>

      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Centro de reportes consolidados</h1>
          <p className="page-subtitle">
            Generación y exportación de tendencias colectivas de bienestar y métricas operativas protegidas
            (RF-12). Muestra mínima confidencial N &ge; {minThreshold}.
          </p>
        </div>
      </div>

      {/* Mensaje de feedback si aplica */}
      {feedback && (
        <div className={`alert-banner ${feedback.startsWith('Error') || !isAllowedByPrivacy ? 'danger' : 'ok'}`} role={feedback.startsWith("Error") ? "alert" : "status"}>
          <Icon name={isAllowedByPrivacy ? 'checkCircle' : 'alertTriangle'} size={18} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Workbench en 2 Columnas Coordinadas (Controles a la izquierda, Previsualización/Resultado a la derecha) */}
      <div className="reports-workspace">
        {/* Columna Izquierda: Parámetros de Generación */}
        <ReportConfiguration
          handleGenerateReport={handleGenerateReport}
          selectedScopeId={selectedScopeId}
          setSelectedScopeId={setSelectedScopeId}
          setGeneratedReport={setGeneratedReport}
          availableScopes={availableScopes}
          currentScope={currentScope}
          minThreshold={minThreshold}
          periodStart={periodStart} setPeriodStart={setPeriodStart}
          periodEnd={periodEnd} setPeriodEnd={setPeriodEnd}
          sections={sections}
          setSections={setSections}
          format={format}
          setFormat={setFormat}
          isAllowedByPrivacy={isAllowedByPrivacy}
        />

        {/* Columna Derecha: Previsualización en Vivo y Descarga Inmediata */}
        <div className="reports-live-preview-panel">
          {!isAllowedByPrivacy ? (
            <PrivacyBlockedCard
              teamName={currentScope?.label || 'Corte seleccionado'}
              respondentsCount={currentScope?.n || 0}
              customMessage="Este corte organizacional no cumple el umbral mínimo institucional de confidencialidad (N ≥ 5). Para proteger el anonimato de los agentes, la previsualización y exportación de reportes están deshabilitadas."
            />
          ) : (
            <ReportPreviewCard
              scopeLabel={generatedReport?.scope || currentScope?.label}
              period={generatedReport?.period || selectedPeriod}
              minThreshold={minThreshold}
              sections={generatedReport?.sections || sections}
              metrics={generatedReport?.metrics || null}
              requesterName={currentUser?.name}
              nlpVersion={storeData.settings?.nlpVersion}
            />
          )}

          {/* Resultado de Generación con Descarga Inmediata en el mismo panel */}
          {generatedReport && (
            <ReportResult
              generatedReport={generatedReport}
              csvContent={csvContent}
              jsonContent={jsonContent}
              downloadFileBaseName={downloadFileBaseName}
              handlePrintPdf={handlePrintPdf}
            />
          )}
        </div>
      </div>

      {/* Historial Modular Abierto de Reportes Generados */}
      <ReportHistoryTable loading={historyLoading} error={historyError} reportHistory={reportHistory} />
    </div>
  );
}
