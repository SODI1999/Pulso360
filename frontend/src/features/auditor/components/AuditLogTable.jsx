import { useState } from 'react';
import { Icon } from '../../../core/components/Icon';

// src/features/auditor/components/AuditLogTable.jsx
// Tabla modular de eventos auditables con filtros reactivos y trazabilidad criptográfica (RF-13)

export function AuditLogTable({
  logs = [],
  integrityStatus = { checked: false, valid: true, message: 'Cadena inmutable activa' },
  searchTerm = '',
  onSearchChange = () => {},
  statusFilter = 'ALL',
  onStatusFilterChange = () => {}
}) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyId = (id) => {
    if (!id) return;
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Eventos del sistema registrados</div>
          <div className="card-subtitle">Trazabilidad de metadatos de operaciones críticas.</div>
        </div>
        <span
          className={`badge ${integrityStatus.checked ? (integrityStatus.valid ? 'badge-ok' : 'badge-danger') : 'badge-info'}`}
        >
          {integrityStatus.message}
        </span>
      </div>

      {/* Barra de Filtros */}
      <div className="audit-filter-bar">
        <input
          type="search"
          className="form-input audit-filter-input"
          placeholder="Buscar por ID, actor, acción, objetivo o IP..."
          aria-label="Buscar en los eventos cargados"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <select
          className="form-select audit-filter-select"
          aria-label="Resultado de los eventos cargados"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          <option value="ALL">Todos los resultados</option>
          <option value="EXITO">Solo Éxito</option>
          <option value="DENEGADO">Solo Denegado</option>
          <option value="NO_REGISTRADO">Resultado no registrado</option>
        </select>
      </div>

      {/* Tabla de Eventos */}
      <p className="form-hint" style={{ margin: 'var(--space-2) 0 var(--space-3)' }}>
        Los filtros se aplican a los eventos cargados. “No registrado” indica que el evento no contiene un resultado; no se presume éxito.
      </p>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID Evento</th>
              <th>Fecha y Hora</th>
              <th>Actor Responsable</th>
              <th>Acción Ejecutada</th>
              <th>Objetivo / Entidad</th>
              <th>Dirección IP</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--c-texto-suave)' }}
                >
                  No se encontraron registros de auditoría que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const isDeny = log.status === 'DENEGADO';
                const isOk = log.status === 'EXITO';
                const isCopied = copiedId === log.id;
                const isLongId = String(log.id).length > 12;

                return (
                  <tr key={log.id} className="audit-table-row">
                    <td>
                      <div className="audit-id-cell">
                        <span className="audit-code-cell" title={log.id}>
                          {isLongId ? `${String(log.id).slice(0, 8)}…` : log.id}
                        </span>
                        <button
                          type="button"
                          className="audit-copy-btn"
                          onClick={() => handleCopyId(log.id)}
                          title={isCopied ? '¡Copiado!' : 'Copiar ID completo'}
                          aria-label={`Copiar ID ${log.id}`}
                        >
                          <Icon name={isCopied ? 'check' : 'copy'} size={12} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className="audit-date-cell">{log.date}</span>
                    </td>
                    <td>
                      <strong className="audit-actor-name">{log.actor}</strong>
                    </td>
                    <td>
                      <span className="badge badge-info audit-action-badge">{log.action}</span>
                    </td>
                    <td>
                      <span className="audit-target-text">{log.target}</span>
                    </td>
                    <td>
                      <span className="audit-code-cell">{log.ip}</span>
                    </td>
                    <td>
                      <span className={`badge ${isDeny ? 'badge-danger' : isOk ? 'badge-ok' : 'badge-muted'}`}>
                        <Icon name={isOk ? 'checkCircle' : isDeny ? 'alertTriangle' : 'info'} size={12} />
                        <span>{log.status === 'NO_REGISTRADO' ? 'No registrado' : isOk ? 'Éxito' : isDeny ? 'Denegado' : log.status}</span>
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
