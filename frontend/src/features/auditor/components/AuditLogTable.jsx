// src/features/auditor/components/AuditLogTable.jsx
// Tabla ergonómica de eventos auditables con filtros e inspector criptográfico tipo Drawer lateral (RF-13)

import { useState, useEffect } from 'react';
import { Icon } from '../../../core/components/Icon';

/**
 * Componente modular de visualización de eventos de auditoría con soporte de Drawer lateral.
 *
 * @param {object} props Propiedades del componente.
 * @param {Array} props.logs Registros filtrados a mostrar.
 * @param {object} props.integrityStatus Estado de integridad criptográfica.
 * @param {string} props.searchTerm Término de búsqueda actual.
 * @param {Function} props.onSearchChange Callback al cambiar la búsqueda.
 * @param {string} props.statusFilter Filtro de estado actual.
 * @param {Function} props.onStatusFilterChange Callback al cambiar el filtro de estado.
 * @returns {JSX.Element} Tabla de auditoría e inspector lateral.
 */
export function AuditLogTable({
  logs = [],
  integrityStatus = { checked: false, valid: true, badgeText: 'Cadena inmutable activa', badgeType: 'badge-info' },
  searchTerm = '',
  onSearchChange = () => {},
  statusFilter = 'ALL',
  onStatusFilterChange = () => {}
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  // Cierre accesible con tecla Escape
  useEffect(() => {
    if (!selectedLog) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedLog(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLog]);

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="card audit-card">
      {/* Encabezado de la Tarjeta */}
      <div className="card-header audit-card-header">
        <div>
          <div className="card-title">Eventos del sistema registrados</div>
          <div className="card-subtitle">
            Trazabilidad de metadatos de operaciones críticas con encadenamiento criptográfico.
          </div>
        </div>
        <span className={`badge ${integrityStatus.badgeType || 'badge-info'} audit-header-badge`}>
          {integrityStatus.badgeText || (integrityStatus.checked ? (integrityStatus.valid ? 'Cadena íntegra' : 'Discrepancia') : 'Cadena activa')}
        </span>
      </div>

      {/* Franja de Resumen Criptográfico (Visible solo al verificar) */}
      {integrityStatus.checked && (
        <div className="audit-integrity-strip" role="status">
          <div className="audit-integrity-stat">
            <span className="audit-stat-label">Cadena de hashes:</span>
            <strong className="audit-stat-value ok">
              <Icon name="checkCircle" size={13} /> 100% íntegra
            </strong>
          </div>
          <div className="audit-integrity-stat">
            <span className="audit-stat-label">Formato v2 verificado:</span>
            <strong className="audit-stat-value">{integrityStatus.verifiedRecords || 0} eventos</strong>
          </div>
          <div className="audit-integrity-stat">
            <span className="audit-stat-label">Históricos v1 sellados:</span>
            <strong className="audit-stat-value">{integrityStatus.legacyUnverifiable || 0} registros</strong>
          </div>
          {integrityStatus.hasLegacy && (
            <span className="audit-integrity-legacy-note">
              Los registros históricos v1 conservan su sellado original.
            </span>
          )}
        </div>
      )}

      {/* Barra de Filtros Horizontal Compacta */}
      <div className="audit-filter-bar">
        <div className="audit-search-box">
          <Icon name="Search" size={15} className="audit-search-icon" />
          <input
            type="search"
            className="form-input audit-filter-input"
            placeholder="Buscar por ID, actor, acción, objetivo o IP..."
            aria-label="Buscar en los eventos cargados"
            style={{ paddingLeft: '38px', paddingRight: '34px' }}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="audit-search-clear"
              onClick={() => onSearchChange('')}
              title="Limpiar búsqueda"
              aria-label="Limpiar campo de búsqueda"
            >
              &times;
            </button>
          )}
        </div>

        <div className="audit-select-wrapper">
          <select
            className="form-select audit-filter-select"
            aria-label="Filtrar por resultado de la operación"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="ALL">Todos los estados</option>
            <option value="EXITO">Solo Éxito</option>
            <option value="DENEGADO">Solo Denegado</option>
            <option value="NO_REGISTRADO">Sin registrar</option>
          </select>
        </div>
      </div>

      <div className="audit-filter-hint">
        <Icon name="info" size={12} />
        <span>Los filtros aplican a los eventos en memoria. “Sin registrar” indica eventos sin resultado explícito (no se presume éxito).</span>
      </div>

      {/* Tabla de Eventos */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '13%' }}>ID Evento</th>
              <th style={{ width: '16%' }}>Fecha y Hora</th>
              <th style={{ width: '17%' }}>Actor Responsable</th>
              <th style={{ width: '15%' }}>Acción</th>
              <th style={{ width: '21%' }}>Objetivo / Entidad</th>
              <th style={{ width: '10%' }}>Resultado</th>
              <th style={{ width: '8%', textAlign: 'right' }}>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--c-texto-suave)' }}
                >
                  <Icon name="search" size={24} style={{ opacity: 0.4, marginBottom: 'var(--space-2)' }} />
                  <p style={{ margin: 0 }}>No se encontraron registros de auditoría que coincidan con los filtros.</p>
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const isDeny = log.status === 'DENEGADO';
                const isOk = log.status === 'EXITO';
                const isCopied = copiedId === log.id;
                const isLongId = String(log.id).length > 12;
                const isSelected = selectedLog?.id === log.id;

                return (
                  <tr
                    key={log.id}
                    className={`audit-table-row ${isSelected ? 'audit-table-row-selected' : ''}`}
                  >
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
                        className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'} btn-xs`}
                        onClick={() => setSelectedLog(isSelected ? null : log)}
                        title="Inspeccionar metadatos y hash en el panel lateral"
                        aria-expanded={isSelected}
                        aria-label={`Inspeccionar evento ${log.id}`}
                      >
                        <Icon name="search" size={12} />
                        <span>{isSelected ? 'Viendo' : 'Ver'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Inspector Flotante tipo Drawer Lateral */}
      {selectedLog && (
        <div
          className="audit-drawer-overlay"
          role="presentation"
          onClick={() => setSelectedLog(null)}
        >
          <aside
            className="audit-drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auditDrawerTitle"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="audit-drawer-header">
              <div>
                <div className="audit-drawer-badges">
                  <span className="badge badge-info">{selectedLog.action}</span>
                  <span
                    className={`badge ${selectedLog.status === 'EXITO' ? 'badge-ok' : selectedLog.status === 'DENEGADO' ? 'badge-danger' : 'badge-muted'}`}
                  >
                    {selectedLog.status === 'NO_REGISTRADO'
                      ? 'No reg.'
                      : selectedLog.status === 'EXITO'
                        ? 'Éxito'
                        : selectedLog.status === 'DENEGADO'
                          ? 'Denegado'
                          : selectedLog.status}
                  </span>
                </div>
                <h3 id="auditDrawerTitle" className="audit-drawer-title">
                  Evento #{selectedLog.id}
                </h3>
                <div className="audit-drawer-meta">
                  <Icon name="clock" size={13} />
                  <span>{selectedLog.date}</span>
                  <span className="audit-drawer-sep">·</span>
                  <span>IP: {selectedLog.ip || 'Interna / Local'}</span>
                </div>
              </div>
              <button
                type="button"
                className="audit-drawer-close"
                onClick={() => setSelectedLog(null)}
                aria-label="Cerrar panel de inspección"
              >
                &times;
              </button>
            </div>

            <div className="audit-drawer-body">
              {/* Información principal de la operación */}
              <div className="audit-detail-grid">
                <div className="audit-detail-item">
                  <span className="audit-detail-label">Actor Responsable</span>
                  <strong className="audit-detail-value">{selectedLog.actor}</strong>
                </div>
                <div className="audit-detail-item">
                  <span className="audit-detail-label">Objetivo / Entidad</span>
                  <span className="audit-detail-value audit-detail-target">{selectedLog.target}</span>
                </div>
              </div>

              {/* Hash SHA-256 del evento */}
              <div className="audit-detail-section">
                <span className="audit-detail-label">Hash SHA-256 del evento</span>
                <div className="audit-hash-box">
                  <code className="audit-hash-code">{selectedLog.hash || 'Hash sellado no disponible'}</code>
                  {selectedLog.hash && (
                    <button
                      type="button"
                      className="audit-copy-btn"
                      onClick={() => handleCopy(selectedLog.hash, 'hash')}
                      title={copiedId === 'hash' ? '¡Copiado!' : 'Copiar hash'}
                      aria-label="Copiar hash SHA-256"
                    >
                      <Icon name={copiedId === 'hash' ? 'check' : 'copy'} size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Hash previo encadenado */}
              <div className="audit-detail-section">
                <span className="audit-detail-label">Hash previo encadenado (prev_hash)</span>
                <div className="audit-hash-box">
                  <code className="audit-hash-code">{selectedLog.prevHash || 'Génesis / Raíz inicial'}</code>
                  {selectedLog.prevHash && (
                    <button
                      type="button"
                      className="audit-copy-btn"
                      onClick={() => handleCopy(selectedLog.prevHash, 'prevHash')}
                      title={copiedId === 'prevHash' ? '¡Copiado!' : 'Copiar hash previo'}
                      aria-label="Copiar hash previo"
                    >
                      <Icon name={copiedId === 'prevHash' ? 'check' : 'copy'} size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Payload JSON de metadatos */}
              <div className="audit-detail-section">
                <div className="audit-payload-header">
                  <span className="audit-detail-label">Metadatos de la operación (Payload)</span>
                  {selectedLog.rawDetails && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleCopy(JSON.stringify(selectedLog.rawDetails, null, 2), 'payload')}
                      title="Copiar JSON completo"
                    >
                      <Icon name={copiedId === 'payload' ? 'check' : 'copy'} size={12} />
                      <span>{copiedId === 'payload' ? 'Copiado' : 'Copiar JSON'}</span>
                    </button>
                  )}
                </div>
                <pre className="audit-payload-code">
                  {selectedLog.rawDetails && Object.keys(selectedLog.rawDetails).length > 0
                    ? JSON.stringify(selectedLog.rawDetails, null, 2)
                    : '// Sin metadatos adicionales en el payload de este evento'}
                </pre>
              </div>
            </div>

            <div className="audit-drawer-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedLog(null)}
              >
                Cerrar panel
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
