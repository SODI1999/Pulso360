import { useState } from 'react';
import { Icon } from '../../../core/components/Icon';

// src/features/auditor/components/AuditLogTable.jsx
// Tabla ergonómica de eventos auditables con filtros e inspector criptográfico (RF-13)

export function AuditLogTable({
  logs = [],
  integrityStatus = { checked: false, valid: true, message: 'Cadena inmutable activa' },
  searchTerm = '',
  onSearchChange = () => {},
  statusFilter = 'ALL',
  onStatusFilterChange = () => {}
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Eventos del sistema registrados</div>
          <div className="card-subtitle">Trazabilidad de metadatos de operaciones críticas con encadenamiento criptográfico.</div>
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

      <p className="form-hint" style={{ margin: 'var(--space-2) 0 var(--space-3)' }}>
        Los filtros se aplican a los eventos cargados. “No registrado” indica que el evento no contiene un resultado explícito; no se presume éxito.
      </p>

      {/* Tabla de Eventos */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '13%' }}>ID Evento</th>
              <th style={{ width: '17%' }}>Fecha y Hora</th>
              <th style={{ width: '17%' }}>Actor Responsable</th>
              <th style={{ width: '15%' }}>Acción</th>
              <th style={{ width: '20%' }}>Objetivo / Entidad</th>
              <th style={{ width: '10%' }}>Resultado</th>
              <th style={{ width: '8%', textAlign: 'right' }}>Detalle</th>
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
                          onClick={() => handleCopy(log.id, log.id)}
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
                      <span className="audit-target-text" title={log.target}>
                        {log.target}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isDeny ? 'badge-danger' : isOk ? 'badge-ok' : 'badge-muted'}`}>
                        <Icon name={isOk ? 'checkCircle' : isDeny ? 'alertTriangle' : 'info'} size={12} />
                        <span>{log.status === 'NO_REGISTRADO' ? 'No reg.' : isOk ? 'Éxito' : isDeny ? 'Denegado' : log.status}</span>
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-xs"
                        onClick={() => setSelectedLog(log)}
                        title="Inspeccionar metadatos y hash criptográfico"
                        aria-label={`Inspeccionar evento ${log.id}`}
                      >
                        <Icon name="Search" size={12} />
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal / Inspector de Evento Auditado */}
      {selectedLog && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="auditDetailTitle">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <h3 id="auditDetailTitle" className="modal-title" style={{ margin: 0 }}>
                  Inspección de evento #{selectedLog.id}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'var(--c-texto-suave)' }}>
                  {selectedLog.date} · IP: {selectedLog.ip || 'Interna / Local'}
                </p>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setSelectedLog(null)}
                aria-label="Cerrar modal"
              >
                &times;
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div>
                  <span className="form-label" style={{ fontSize: '11.5px' }}>Actor responsable</span>
                  <div style={{ fontWeight: 600 }}>{selectedLog.actor}</div>
                </div>
                <div>
                  <span className="form-label" style={{ fontSize: '11.5px' }}>Acción registrada</span>
                  <div><span className="badge badge-info">{selectedLog.action}</span></div>
                </div>
              </div>

              <div>
                <span className="form-label" style={{ fontSize: '11.5px' }}>Objetivo / Entidad</span>
                <div style={{ fontSize: '13px', color: 'var(--c-texto)' }}>{selectedLog.target}</div>
              </div>

              {selectedLog.hash && (
                <div>
                  <span className="form-label" style={{ fontSize: '11.5px' }}>Hash SHA-256 del evento</span>
                  <div className="audit-code-cell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px' }}>
                    <code style={{ fontSize: '11px', wordBreak: 'break-all' }}>{selectedLog.hash}</code>
                    <button
                      type="button"
                      className="audit-copy-btn"
                      onClick={() => handleCopy(selectedLog.hash, 'hash')}
                      title="Copiar hash"
                    >
                      <Icon name={copiedId === 'hash' ? 'check' : 'copy'} size={12} />
                    </button>
                  </div>
                </div>
              )}

              {selectedLog.prevHash && (
                <div>
                  <span className="form-label" style={{ fontSize: '11.5px' }}>Hash previo encadenado (prev_hash)</span>
                  <div className="audit-code-cell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px' }}>
                    <code style={{ fontSize: '11px', wordBreak: 'break-all' }}>{selectedLog.prevHash}</code>
                    <button
                      type="button"
                      className="audit-copy-btn"
                      onClick={() => handleCopy(selectedLog.prevHash, 'prevHash')}
                      title="Copiar hash previo"
                    >
                      <Icon name={copiedId === 'prevHash' ? 'check' : 'copy'} size={12} />
                    </button>
                  </div>
                </div>
              )}

              {selectedLog.rawDetails && Object.keys(selectedLog.rawDetails).length > 0 && (
                <div>
                  <span className="form-label" style={{ fontSize: '11.5px' }}>Metadatos de la operación (Payload)</span>
                  <pre
                    style={{
                      background: 'var(--c-fondo-alt, #f8fafc)',
                      border: '1px solid var(--c-borde-suave)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 'var(--space-3)',
                      fontSize: '11.5px',
                      maxHeight: '180px',
                      overflowY: 'auto',
                      margin: 0
                    }}
                  >
                    {JSON.stringify(selectedLog.rawDetails, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'flex-end', borderTop: '1px solid var(--c-borde-suave)', paddingTop: 'var(--space-3)' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedLog(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
