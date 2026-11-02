// src/features/auditor/components/AuditLogTable.jsx
// Tabla ergonómica de eventos auditables con filtros e inspector criptográfico tipo Drawer lateral (RF-13)

import { useState, useEffect, useRef } from 'react';
import { Icon } from '../../../core/components/Icon';
import { useModalA11y } from '../../../core/hooks/useModalA11y';
import { formatAuditDate, formatAuditAction } from '../utils/auditDisplay';

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
  integrityStatus = { checked: false, valid: null, badgeText: 'Integridad pendiente de comprobar', badgeType: 'badge-info' },
  searchTerm = '',
  onSearchChange = () => {},
  statusFilter = 'ALL',
  onStatusFilterChange = () => {},
  onInspectLogById
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [inspectingFailure, setInspectingFailure] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('');
  const [copyError, setCopyError] = useState('');
  const drawerRef = useRef(null);
  const copyTimerRef = useRef(null);
  const copyAttemptRef = useRef(0);
  useModalA11y({ isOpen: Boolean(selectedLog), onClose: () => setSelectedLog(null), modalRef: drawerRef });

  useEffect(() => {
    return () => {
      copyAttemptRef.current += 1;
      clearTimeout(copyTimerRef.current);
    };
  }, []);

  useEffect(() => {
    copyAttemptRef.current += 1;
    clearTimeout(copyTimerRef.current);
    setCopiedId(null);
    setCopyFeedback('');
    setCopyError('');
  }, [selectedLog]);

  const handleCopy = async (text, key) => {
    if (!text) return;
    const attempt = ++copyAttemptRef.current;
    clearTimeout(copyTimerRef.current);
    setCopiedId(null);
    setCopyFeedback('');
    setCopyError('');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard no disponible');
      await navigator.clipboard.writeText(text);
      if (attempt !== copyAttemptRef.current) return;
      setCopiedId(key);
      setCopyFeedback('Copiado al portapapeles.');
      copyTimerRef.current = setTimeout(() => setCopiedId(null), 2000);
    } catch {
      if (attempt !== copyAttemptRef.current) return;
      setCopyError('No se pudo copiar. Selecciona el texto y cópialo con el menú del navegador o con Ctrl+C.');
    }
  };

  const handleInspectFailure = async (failureId) => {
    setInspectingFailure(true);
    try {
      if (onInspectLogById) {
        const targetLog = await onInspectLogById(failureId);
        if (targetLog) {
          setSelectedLog(targetLog);
          return;
        }
      }
      const found = logs.find((l) => String(l.id) === String(failureId));
      if (found) setSelectedLog(found);
    } finally {
      setInspectingFailure(false);
    }
  };

  return (
    <div className="card audit-card">
      <div role="status" className="audit-copy-feedback">{!selectedLog ? copyFeedback : ''}</div>
      <div role="alert" className="audit-copy-feedback">{!selectedLog ? copyError : ''}</div>
      {/* Encabezado de la Tarjeta */}
      <div className="card-header audit-card-header">
        <div>
          <div className="card-title">Eventos del sistema registrados</div>
          <div className="card-subtitle">
            Trazabilidad de metadatos de operaciones críticas con encadenamiento criptográfico.
          </div>
        </div>
        <span className={`badge ${integrityStatus.badgeType || 'badge-info'} audit-header-badge`}>
          {integrityStatus.badgeText || (integrityStatus.checked ? (integrityStatus.valid ? 'Cadena íntegra' : 'Discrepancia') : 'Integridad pendiente de comprobar')}
        </span>
      </div>

      {/* Franja de Resumen Criptográfico (Visible solo al verificar) */}
      {integrityStatus.checked && (
        <div className="audit-integrity-strip" role="status">
          <div className="audit-integrity-stat">
            <span className="audit-stat-label">Cadena de hashes:</span>
            <strong className={`audit-stat-value ${integrityStatus.chainValid ? 'ok' : 'danger'}`}>
              <Icon name={integrityStatus.chainValid ? 'checkCircle' : 'alertTriangle'} size={13} />{' '}
              {integrityStatus.chainValid ? '100% íntegra' : `${integrityStatus.failures?.length || 1} enlace(s) roto(s)`}
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

      {/* Banner de Acción Rápida para Inspeccionar Registro Comprometido */}
      {integrityStatus.checked && !integrityStatus.chainValid && integrityStatus.failures?.length > 0 && (
        <div className="audit-failure-banner" role="alert">
          <div className="audit-failure-banner-text">
            <Icon name="alertTriangle" size={16} />
            <span>
              Discrepancia localizada en registro{' '}
              <strong>#{integrityStatus.failures[0].id}</strong> (
              {integrityStatus.failures[0].kind === 'LINK'
                ? 'Enlace previo no coincide'
                : integrityStatus.failures[0].kind === 'CONTENT'
                  ? 'Contenido alterado'
                  : 'Génesis inválido'}
              )
            </span>
          </div>
          <button
            type="button"
            className="btn btn-danger btn-xs"
            onClick={() => handleInspectFailure(integrityStatus.failures[0].id)}
            disabled={inspectingFailure}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}
            title={`Abrir panel de inspección del evento #${integrityStatus.failures[0].id}`}
          >
            <Icon name={inspectingFailure ? 'refresh' : 'search'} size={12} className={inspectingFailure ? 'icon-spin' : ''} />
            <span>{inspectingFailure ? 'Cargando…' : `Inspeccionar Registro #${integrityStatus.failures[0].id}`}</span>
          </button>
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
                const failure = integrityStatus.failures?.find(
                  (f) => String(f.id) === String(log.id)
                );

                return (
                  <tr
                    key={log.id}
                    className={`audit-table-row ${isSelected ? 'audit-table-row-selected' : ''} ${failure ? 'audit-table-row-compromised' : ''}`}
                  >
                    <td>
                      <div className="audit-id-cell">
                        <span className="audit-code-cell" title={log.id}>
                          {isLongId ? `${String(log.id).slice(0, 8)}…` : log.id}
                        </span>
                        {failure && (
                          <span
                            className="badge badge-danger audit-compromised-pill"
                            title={`Fallo de integridad: ${failure.kind === 'LINK' ? 'Enlace roto' : failure.kind}`}
                          >
                            <Icon name="alertTriangle" size={10} /> Discrepancia
                          </span>
                        )}
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
                      <span className="audit-date-cell">{formatAuditDate(log.date)}</span>
                    </td>
                    <td>
                      <strong className="audit-actor-name">{log.actor}</strong>
                    </td>
                    <td>
                      <span className="badge badge-info audit-action-badge">{formatAuditAction(log.action)}</span>
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
            ref={drawerRef}
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
              <div role="status" className="audit-copy-feedback">{copyFeedback}</div>
              <div role="alert" className="audit-copy-feedback">{copyError}</div>
              {/* Alerta de discrepancia criptográfica si el evento inspeccionado está marcado */}
              {(() => {
                const failure = integrityStatus.failures?.find(
                  (f) => String(f.id) === String(selectedLog.id)
                );
                if (!failure) return null;
                return (
                  <div className="audit-drawer-failure-alert" role="alert">
                    <div className="audit-drawer-failure-title">
                      <Icon name="alertTriangle" size={15} />
                      <span>Falla de integridad criptográfica detectada</span>
                    </div>
                    <p className="audit-drawer-failure-desc">
                      {failure.kind === 'LINK'
                        ? `Enlace roto: el hash previo encadenado (prev_hash) de este evento no coincide con el hash del evento anterior en la secuencia.`
                        : failure.kind === 'CONTENT'
                          ? `Contenido alterado: el hash calculado a partir de los datos actuales no coincide con el hash sellado registrado.`
                          : `Génesis inválido: el primer registro de la cadena no apunta al bloque Génesis oficial.`}
                    </p>
                  </div>
                );
              })()}

              {/* Información principal de la operación */}
              <div className="audit-detail-grid">
                <div className="audit-detail-item">
                  <span className="audit-detail-label">Código de acción</span>
                  <code className="audit-detail-value">{selectedLog.action}</code>
                </div>
                <div className="audit-detail-item">
                  <span className="audit-detail-label">Fecha exacta registrada</span>
                  <span className="audit-detail-value">{selectedLog.date || 'No registrada'}</span>
                </div>
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
