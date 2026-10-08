// src/features/sst/components/AlertCard.jsx
// Tarjeta de alerta temprana con ciclo de vida interactivo y auditoría (RF-08)

import { Icon } from '../../../core/components/Icon';

export function AlertCard({ alertItem, onUpdateStatus, onDismissRequest, onCreateIntervention }) {
  const severityClass =
    alertItem.severity === 'Alta'
      ? 'severity-alta'
      : alertItem.severity === 'Media'
        ? 'severity-media'
        : 'severity-baja';
  const severityBadge =
    alertItem.severity === 'Alta'
      ? 'badge-danger'
      : alertItem.severity === 'Media'
        ? 'badge-warn'
        : 'badge-info';

  const statusBadges = {
    GENERADA: 'badge-info',
    EN_REVISION: 'badge-warn',
    INTERVENIDA: 'badge-ok',
    DESCARTADA: 'badge-neutral'
  };

  return (
    <div className={`alert-card ${severityClass}`} id={`alert-${alertItem.id}`}>
      <div className="alert-card-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className={`badge ${severityBadge}`}>{alertItem.severity}</span>
            <h2 className="alert-card-title">{alertItem.rule}</h2>
          </div>
          <div className="alert-card-meta">
            <span>{alertItem.campaign}</span>
            <span>·</span>
            <span>{alertItem.team}</span>
            <span>·</span>
            <span className="privacy-badge" style={{ padding: '1px 8px', fontSize: '11px' }}>
              N = {alertItem.respondents} participantes
            </span>
          </div>
        </div>
        <span className={`badge ${statusBadges[alertItem.status] || 'badge-neutral'}`}>
          {alertItem.status.replace('_', ' ')}
        </span>
      </div>

      <p className="alert-card-desc">{alertItem.protected
        ? 'Evidencia protegida: esta alerta tiene menos de 5 participantes. El servidor omite la descripción y los valores agregados.'
        : alertItem.description}</p>

      {/* Evidencia histórica agregada */}
      {alertItem.evidence && alertItem.evidence.length > 0 && (
        <div className="alert-evidence-box">
          <strong style={{ color: 'var(--c-texto)' }}>Evidencia agregada de semanas previas:</strong>
          {alertItem.evidence.map((point, index) => (
            <span key={index} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span className="evidence-pill">{point} / 100</span>
              {index < alertItem.evidence.length - 1 && (
                <span style={{ color: 'var(--c-texto-mutado)' }}>→</span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Si fue descartada, mostrar el motivo */}
      {alertItem.status === 'DESCARTADA' && alertItem.dismissReason && (
        <div className="alert-banner info" style={{ marginBottom: 'var(--space-3)', padding: '10px 14px' }}>
          <div>
            <strong>Motivo de descarte registrado:</strong> {alertItem.dismissReason}
          </div>
        </div>
      )}

      {/* Barra de acciones según el estado de la alerta */}
      <div className="alert-actions-toolbar">
        {alertItem.status === 'GENERADA' && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onUpdateStatus(alertItem.id, 'EN_REVISION')}
          >
            <Icon name="Search" size={14} />
            <span>Tomar en revisión</span>
          </button>
        )}

        {alertItem.status === 'EN_REVISION' && (
          <>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onCreateIntervention(alertItem)}
            >
              <Icon name="ClipboardList" size={14} />
              <span>Crear plan de intervención</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onDismissRequest(alertItem)}
            >
              <Icon name="x" size={14} />
              <span>Descartar</span>
            </button>
          </>
        )}

        {alertItem.status === 'INTERVENIDA' && (
          <span style={{ fontSize: '12px', color: 'var(--c-texto-suave)' }}>
            Plan de intervención creado y en seguimiento preventivo.
          </span>
        )}

        {alertItem.status === 'DESCARTADA' && (
          <span style={{ fontSize: '12px', color: 'var(--c-texto-suave)' }}>
            Alerta descartada.
          </span>
        )}
      </div>
    </div>
  );
}
