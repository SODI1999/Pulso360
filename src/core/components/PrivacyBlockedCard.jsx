// src/core/components/PrivacyBlockedCard.jsx
// Componente de bloqueo visual ante violación del umbral de k-anonimato (RF-07 / RF-11)

import { Icon } from './Icon';

export function PrivacyBlockedCard({ sampleCount = 3, respondentsCount, minThreshold = 5, customMessage }) {
  const visibleSampleCount = respondentsCount ?? sampleCount;

  return (
    <div className="umbral-blocked-card" role="alert" aria-live="polite">
      <div className="umbral-blocked-icon" aria-hidden="true">
        <Icon name="lock" size={24} />
      </div>
      <h2 className="umbral-blocked-title">Información protegida</h2>
      <p className="umbral-blocked-message">
        {customMessage ||
          `Información protegida: no se alcanza el umbral mínimo de participantes (${minThreshold} agentes) para reducir el riesgo de reidentificación de respuestas.`}
      </p>
      <div className="umbral-sample-count">
        Muestra actual N={visibleSampleCount} · Umbral mínimo N={minThreshold}
      </div>
    </div>
  );
}
