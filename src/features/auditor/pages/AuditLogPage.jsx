import { useAuditLog } from '../hooks/useAuditLog';
// src/features/auditor/pages/AuditLogPage.jsx
// Módulo de Auditoría y Trazabilidad Inmutable (RF-13)

import { Icon } from '../../../core/components/Icon';
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
    handleVerifyIntegrity,
    handleExportCrypto
  } = useAuditLog();

  return (
    <div>
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Registro de auditoría y cumplimiento</h1>
          <p className="page-subtitle">
            Representación de registro inmutable de solo adición. Permite verificar la continuidad de la
            cadena de hashes sin almacenar contenido individual sensible.
          </p>
        </div>
        <div className="audit-header-actions">
          <button type="button" className="btn btn-secondary" onClick={handleVerifyIntegrity}>
            <Icon name="shieldCheck" size={16} />
            <span>Verificar integridad</span>
          </button>
          <button type="button" className="btn btn-primary" onClick={handleExportCrypto}>
            <Icon name="download" size={16} />
            <span>Exportar registro auditado</span>
          </button>
        </div>
      </div>

      {/* Banner Informativo de Garantía Criptográfica */}
      <div className="alert-banner info" style={{ marginBottom: 'var(--space-5)' }}>
        <Icon name="info" size={18} />
        <div>
          <strong>Trazabilidad y Principio de Privacidad:</strong> La bitácora registra únicamente metadatos
          de eventos operativos y transacciones de gobernanza. Ninguna entrada almacena respuestas directas de
          check-ins ni el texto libre de las bitácoras individuales.
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

      {/* Tabla Modular de Registros */}
      <AuditLogTable
        logs={filteredLogs}
        integrityStatus={integrityStatus}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
    </div>
  );
}
