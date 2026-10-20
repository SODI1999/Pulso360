// src/features/agent/components/SupportTimelineBadge.jsx
// Trazabilidad del ciclo de vida del radicado institucional (SG-SST / Res. 2646)

import PropTypes from 'prop-types';
import { Icon } from '../../../core/components/Icon';

export function SupportTimelineBadge({ status, hasActiveChat, isChatClosed }) {
  const normStatus = (status || '').toLowerCase().trim();

  // Calcular la fase actual (1 a 4)
  let currentStep = 1;
  let currentLabel = 'Radicado emitido';

  if (normStatus === 'cerrada' || isChatClosed) {
    currentStep = 4;
    currentLabel = 'Cierre y recomendaciones preventivas';
  } else if (hasActiveChat || normStatus === 'en gestion' || normStatus === 'en gestión') {
    currentStep = hasActiveChat ? 3 : 2;
    currentLabel = hasActiveChat ? 'Orientación interactiva con SST' : 'Revisión técnica de SST';
  } else if (normStatus === 'recibida') {
    currentStep = 2;
    currentLabel = 'En cola de revisión por SST';
  }

  const steps = [
    { num: 1, label: 'Radicación' },
    { num: 2, label: 'Revisión SST' },
    { num: 3, label: 'Orientación' },
    { num: 4, label: 'Cierre' }
  ];

  return (
    <div className="support-timeline-wrap" aria-label={`Estado del trámite: Fase ${currentStep} de 4. ${currentLabel}`}>
      <div className="support-timeline-rail" aria-hidden="true">
        {steps.map((st) => {
          const isDone = st.num < currentStep;
          const isCurrent = st.num === currentStep;
          return (
            <div
              key={st.num}
              className={`support-timeline-step ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}`}
            >
              <span className="support-timeline-dot">
                {isDone ? (
                  <Icon name="check" size={10} />
                ) : (
                  <span className="support-timeline-dot-inner" />
                )}
              </span>
              <span className="support-timeline-label">{st.label}</span>
            </div>
          );
        })}
      </div>
      <div className="support-timeline-status-text">
        <span className="support-timeline-status-indicator" aria-hidden="true" />
        <span className="support-timeline-current-title">{currentLabel}</span>
      </div>
    </div>
  );
}

SupportTimelineBadge.propTypes = {
  status: PropTypes.string,
  hasActiveChat: PropTypes.bool,
  isChatClosed: PropTypes.bool
};
