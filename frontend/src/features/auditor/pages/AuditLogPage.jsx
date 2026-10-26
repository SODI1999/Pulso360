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
    handleExportCrypto, error, loading, busy, pagination, loadMore, reload
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

      {error && (
        <div
          className="alert-banner danger"
          role="alert"
          style={{
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="alertTriangle" size={18} />
            <span>{error}</span>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={reload}>
            Reintentar
          </button>
        </div>
      )}
      {loading && filteredLogs.length === 0 && (
        <div
          className="supervisor-loading"
          style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--c-texto-suave)' }}
          role="status"
          aria-live="polite"
        >
          <Icon name="refresh" size={24} className="icon-spin" />
          <p style={{ marginTop: 'var(--space-2)' }}>Cargando registros de auditoría del servidor…</p>
        </div>
      )}
      {/* Tabla Modular de Registros */}
      <AuditLogTable
        logs={filteredLogs}
        integrityStatus={integrityStatus}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
      <div className="audit-footer-bar">
        <span>{filteredLogs.length} registros visibles de {pagination.total} consultados.</span>
        {pagination.hasMore && (
          <button type="button" className="btn btn-secondary btn-sm" disabled={busy} onClick={loadMore}>
            Cargar siguientes 50
          </button>
        )}
      </div>
    </div>
  );
}
