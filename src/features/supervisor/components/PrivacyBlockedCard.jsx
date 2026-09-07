// src/features/supervisor/components/PrivacyBlockedCard.jsx
// Componente de bloqueo visual ante violación del umbral de k-anonimato (RF-07 / RF-11)

import { Icon } from '../../../core/components/Icon';

export function PrivacyBlockedCard({ sampleCount = 3, minThreshold = 5 }) {
    return (
        <div className="umbral-blocked-card" role="alert" aria-live="polite">
            <div className="umbral-blocked-icon" aria-hidden="true">
                <Icon name="lock" size={24} />
            </div>
            <h2 className="umbral-blocked-title">Información protegida</h2>
            <p className="umbral-blocked-message">
                Información protegida: no se alcanza el umbral mínimo de participantes ({minThreshold} agentes) para garantizar la confidencialidad y prevenir la reidentificación de respuestas.
            </p>
            <div className="umbral-sample-count">
                Muestra actual N={sampleCount} · Umbral mínimo N={minThreshold}
            </div>
        </div>
    );
}
