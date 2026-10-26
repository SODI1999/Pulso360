// src/features/auditor/pages/AuditLogPage.jsx
// Módulo de Auditoría y Trazabilidad Inmutable (RF-13)

import { useAuditLog } from '../hooks/useAuditLog';
import { Icon } from '../../../core/components/Icon';
import { AuditLogTable } from '../components/AuditLogTable';

import '../../../styles/auditor.css';

/**
 * Página principal de auditoría y cumplimiento para consulta de logs criptográficos.
 *
 * @returns {JSX.Element} Vista de auditoría.
 */
export function AuditLogPage() {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    integrityStatus,
    notification,
    clearNotification,
    error,
    loading,
    busy,
    pagination,
    filteredLogs,
    handleVerifyIntegrity,
    handleExportCrypto,
    loadMore,
    reload
  } = useAuditLog();

  return (
    <div className="audit-page-container">
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Registro de auditoría y cumplimiento</h1>
          <p className="page-subtitle">
            Registro de operaciones con hashes encadenados. La comprobación indica qué enlaces y contenidos se pudieron verificar, incluidos sus límites históricos.
          </p>
        </div>
        <div className="audit-header-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleVerifyIntegrity}
            disabled={busy}
            title="Comprobar encadenamiento SHA-256 de todos los registros"
          >
            <Icon name="shieldCheck" size={16} />
            <span>Verificar integridad</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExportCrypto}
            disabled={busy}
            title="Descargar archivo JSON con registros auditados y sellado criptográfico"
          >
            <Icon
              name={busy ? 'refresh' : 'download'}
              size={16}
              className={busy ? 'icon-spin' : ''}
            />
            <span>{busy ? 'Exportando auditoría…' : 'Exportar auditoría'}</span>
          </button>
        </div>
      </div>

      {/* Banner de Notificaciones Tipadas */}
      {notification && (
        <div
          className={`alert-banner ${notification.type === 'danger' ? 'danger' : 'ok'}`}
          role="status"
          style={{
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon
              name={notification.type === 'danger' ? 'alertTriangle' : 'checkCircle'}
              size={18}
            />
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={clearNotification}
            aria-label="Cerrar notificación"
            style={{ cursor: 'pointer', background: 'transparent', border: 'none', fontSize: '18px', color: 'inherit' }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Banner de Error de Servidor */}
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

      {/* Estado de Carga Inicial */}
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

      {/* Tabla Modular de Registros con Inspector Drawer */}
      <AuditLogTable
        logs={filteredLogs}
        integrityStatus={integrityStatus}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Barra de Paginación */}
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
