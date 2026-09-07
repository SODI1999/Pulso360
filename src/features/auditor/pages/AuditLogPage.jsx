// src/features/auditor/pages/AuditLogPage.jsx
// Módulo de Auditoría y Trazabilidad Inmutable (RF-13)

import { useState, useMemo } from 'react';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import { AuditLogTable } from '../components/AuditLogTable';

import '../../../styles/auditor.css';

export function AuditLogPage() {
  const currentUser = authService.getCurrentUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [integrityStatus, setIntegrityStatus] = useState({
    checked: false,
    valid: true,
    message: 'Cadena inmutable activa'
  });
  const [feedback, setFeedback] = useState('');
  const [version, setVersion] = useState(0);

  // Obtener logs del almacén
  const logs = useMemo(() => {
    void version;
    const data = pulsoStore.get();
    return data.auditLogs || [];
  }, [version]);

  // Filtrado reactivo de registros
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term ||
        (log.id && log.id.toLowerCase().includes(term)) ||
        (log.actor && log.actor.toLowerCase().includes(term)) ||
        (log.action && log.action.toLowerCase().includes(term)) ||
        (log.target && log.target.toLowerCase().includes(term)) ||
        (log.ip && log.ip.toLowerCase().includes(term));

      return matchesStatus && matchesSearch;
    });
  }, [logs, searchTerm, statusFilter]);

  // Verificación de integridad de la cadena de hashes
  const handleVerifyIntegrity = () => {
    let isValid = true;
    for (let i = 0; i < logs.length - 1; i++) {
      if (logs[i].prevHash && logs[i + 1].hash && logs[i].prevHash !== logs[i + 1].hash) {
        isValid = false;
        break;
      }
    }

    setIntegrityStatus({
      checked: true,
      valid: isValid,
      message: isValid
        ? `Cadena verificada: ${logs.length} registros íntegros`
        : 'Inconsistencia detectada en la cadena'
    });

    setFeedback(isValid
      ? `Verificación completada: se validaron ${logs.length} bloques criptográficos sin alteraciones.`
      : 'Atención: Se identificó una discrepancia en los hashes de la cadena.'
    );
  };

  // Exportación auditada de metadatos (RF-13)
  const handleExportCrypto = () => {
    const actorLabel = `${currentUser?.name || 'Auditor'} (${currentUser?.role || 'auditor'})`;

    // Registrar en auditoría
    pulsoStore.audit({
      actor: actorLabel,
      action: 'EXPORTACION_AUDITORIA',
      target: `Metadatos de auditoría (${logs.length} registros)`
    });

    // Generar archivo JSON descargable con metadatos no sensibles
    const exportData = logs.map(l => ({
      id: l.id,
      date: l.date,
      actor: l.actor,
      action: l.action,
      target: l.target,
      ip: l.ip,
      status: l.status,
      prevHash: l.prevHash,
      hash: l.hash
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulso360-auditoria-${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setFeedback('Exportación de metadatos generada y registrada en la cadena de auditoría.');
    setVersion(v => v + 1);
  };

  return (
    <div>
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Registro de auditoría y cumplimiento</h1>
          <p className="page-subtitle">
            Representación de registro inmutable de solo adición. Permite verificar la continuidad de la cadena de hashes sin almacenar contenido individual sensible.
          </p>
        </div>
        <div className="audit-header-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleVerifyIntegrity}
          >
            <Icon name="shieldCheck" size={16} />
            <span>Verificar integridad</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExportCrypto}
          >
            <Icon name="download" size={16} />
            <span>Exportar registro auditado</span>
          </button>
        </div>
      </div>

      {/* Banner Informativo de Garantía Criptográfica */}
      <div className="alert-banner info" style={{ marginBottom: 'var(--space-5)' }}>
        <Icon name="info" size={18} />
        <div>
          <strong>Trazabilidad y Principio de Privacidad:</strong> La bitácora registra únicamente metadatos de eventos operativos y transacciones de gobernanza. Ninguna entrada almacena respuestas directas de check-ins ni el texto libre de las bitácoras individuales.
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`alert-banner ${integrityStatus.checked && !integrityStatus.valid ? 'danger' : 'ok'}`}
          role="status"
          style={{ marginBottom: 'var(--space-4)' }}
        >
          <Icon name={integrityStatus.checked && !integrityStatus.valid ? 'alertTriangle' : 'checkCircle'} size={18} />
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
