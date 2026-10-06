import { useAuditLog } from '../hooks/useAuditLog';
// src/features/auditor/pages/AuditLogPage.jsx
// Módulo de Auditoría y Trazabilidad Inmutable (RF-13)

import { Icon } from '../../../core/components/Icon';
import { DownloadLink } from '../../../core/components/DownloadLink';
import { AuditLogTable } from '../components/AuditLogTable';

import '../../../styles/auditor.css';

export function AuditLogPage() {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    integrityStatus,
    feedback,
    filteredLogs,
    exportContent,
    handleVerifyIntegrity,
    handleExportCrypto, error, loading, busy, pagination, loadMore
  } = useAuditLog();

  return (
    <div>
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Registro de auditoría y cumplimiento</h1>
          <p className="page-subtitle">
            Registro de operaciones con hashes encadenados. La comprobación indica qué enlaces y contenidos se pudieron verificar, incluidos sus límites históricos.
          </p>
        </div>
        <div className="audit-header-actions">
          <button type="button" className="btn btn-secondary" onClick={handleVerifyIntegrity} disabled={busy}>
            <Icon name="shieldCheck" size={16} />
            <span>Verificar integridad</span>
          </button>
          <button type="button" className="btn btn-primary" onClick={handleExportCrypto} disabled={busy}>Preparar exportación (máx. 10 000)</button>
          {exportContent && <DownloadLink
            className="btn btn-primary"
            content={exportContent}
            mimeType="application/json"
            fileName={`pulso360-auditoria-${new Date().toISOString().substring(0, 10)}.json`}
          >
            <Icon name="download" size={16} />
            <span>Exportar registro auditado</span>
          </DownloadLink>}
        </div>
      </div>

      {/* Banner Informativo de Garantía Criptográfica */}
      <div className="alert-banner info" style={{ marginBottom: 'var(--space-5)' }}>
        <Icon name="info" size={18} />
        <div>
          <strong>Trazabilidad y Principio de Privacidad:</strong> Los eventos nuevos registran metadatos
          de operaciones y gobernanza sin copiar respuestas individuales de check-ins, notas de acompañamiento ni texto de bitácoras. Los registros históricos se conservan.
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`alert-banner ${integrityStatus.checked && !integrityStatus.valid ? 'danger' : 'ok'}`}
          role="status"
          style={{ marginBottom: 'var(--space-4)' }}
        >
          <Icon
            name={integrityStatus.checked && !integrityStatus.valid ? 'alertTriangle' : 'checkCircle'}
            size={18}
          />
          <span>{feedback}</span>
        </div>
      )}

      {error && <p className="alert-banner danger" role="alert">{error}</p>}
      {loading && <p role="status">Cargando registros…</p>}
      {/* Tabla Modular de Registros */}
      <AuditLogTable
        logs={filteredLogs}
        integrityStatus={integrityStatus}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
      <p>{filteredLogs.length} registros visibles de {pagination.total} consultados.</p>
      {pagination.hasMore && <button type="button" className="btn btn-secondary" disabled={busy} onClick={loadMore}>Cargar siguientes 50</button>}
    </div>
  );
}
