import { Icon } from '../../../core/components/Icon';

/**
 * Línea de Tiempo de Radicados de Habeas Data.
 * Presenta el estado de tramitación de cada solicitud con plazos legales de la Ley 1581.
 */
export function HabeasRequestsTimeline({ requests = [], formatDate }) {
  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('respondida') || s.includes('completada') || s.includes('resuelta')) {
      return { label: status || 'Respondida', badgeClass: 'badge-success', icon: 'CheckCircle2' };
    }
    if (s.includes('tramite') || s.includes('revisión') || s.includes('proceso')) {
      return { label: status || 'En trámite', badgeClass: 'badge-warning', icon: 'Clock' };
    }
    return { label: status || 'Recibida', badgeClass: 'badge-info', icon: 'Info' };
  };

  const getTypeIcon = (type) => {
    const t = String(type || '').toLowerCase();
    if (t.includes('rectifica')) return 'Pencil';
    if (t.includes('supres')) return 'Scale';
    if (t.includes('porta')) return 'Download';
    return 'FileText';
  };

  return (
    <div className="card" style={{ marginTop: '20px' }}>
      <div className="card-header">
        <div>
          <h2 className="card-title" style={{ fontSize: '15px' }}>
            Seguimiento de Mis Solicitudes de Habeas Data
          </h2>
          <p className="card-subtitle">
            Trazabilidad de radicados conforme a los plazos legales de la Ley Estatutaria 1581 de 2012 (10 días hábiles para consultas, 15 días hábiles para reclamos y supresiones).
          </p>
        </div>
      </div>

      <div className="habeas-timeline-list" id="habeas-requests-container">
        {requests.length === 0 ? (
          <div className="records-empty-state">
            <Icon name="FileText" size={32} style={{ color: 'var(--c-texto-suave)', marginBottom: '8px' }} />
            <strong style={{ fontSize: '13.5px', color: 'var(--c-texto)' }}>
              No tienes solicitudes de Habeas Data registradas
            </strong>
            <p style={{ fontSize: '12.5px', color: 'var(--c-texto-suave)', margin: '4px 0 0' }}>
              Cuando radique una consulta, rectificación o solicitud de supresión, podrás monitorear aquí su avance y plazos legales.
            </p>
          </div>
        ) : (
          requests.map((req) => {
            const statusInfo = getStatusBadge(req.status);
            const iconName = getTypeIcon(req.type);

            return (
              <div key={req.id} className="habeas-request-card">
                <div className="habeas-card-top">
                  <div className="habeas-code-group">
                    <div className="habeas-type-icon-box">
                      <Icon name={iconName} size={15} />
                    </div>
                    <div>
                      <strong className="habeas-id-text">{req.id}</strong>
                      <span className="habeas-type-sep">·</span>
                      <span className="habeas-type-text">{req.type}</span>
                    </div>
                  </div>

                  <span className={`badge ${statusInfo.badgeClass} habeas-status-pill`}>
                    <Icon name={statusInfo.icon} size={12} />
                    <span>{statusInfo.label}</span>
                  </span>
                </div>

                <div className="habeas-dates-row">
                  <span className="habeas-date-item">
                    <Icon name="Calendar" size={12} />
                    <span>Radicada: {formatDate(req.createdAt)}</span>
                  </span>
                  <span className="habeas-date-sep">·</span>
                  <span className="habeas-date-item">
                    <Icon name="Clock" size={12} />
                    <span>Fecha límite legal: {formatDate(req.deadline)}</span>
                  </span>
                </div>

                {req.note && (
                  <div className="habeas-note-box">
                    <span className="habeas-note-label">Nota del titular:</span> {req.note}
                  </div>
                )}

                {req.response && (
                  <div className="habeas-response-box">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <Icon name="CheckCircle2" size={13} style={{ color: 'var(--c-exito)' }} />
                      <strong style={{ fontSize: '11.5px', color: 'var(--c-texto)' }}>
                        Respuesta del Oficial de Privacidad:
                      </strong>
                    </div>
                    <p style={{ fontSize: '12px', margin: 0, color: 'var(--c-texto)' }}>
                      {req.response}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
