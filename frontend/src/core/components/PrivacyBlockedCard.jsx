// src/core/components/PrivacyBlockedCard.jsx
// Componente de bloqueo visual ante violación del umbral de k-anonimato (RF-07 / RF-11)

import { Icon } from './Icon';

export function PrivacyBlockedCard({ sampleCount = 3, respondentsCount, minThreshold = 5, customMessage }) {
  const visibleSampleCount = respondentsCount ?? sampleCount;
  const quorumPercent = Math.min(100, Math.max(0, Math.round((visibleSampleCount / minThreshold) * 100)));
  const missingParticipants = Math.max(0, minThreshold - visibleSampleCount);

  return (
    <div className="umbral-blocked-card" role="alert" aria-live="polite">
      {/* Badge normativo superior */}
      <div className="umbral-compliance-pill">
        <Icon name="shield" size={14} />
        <span>Reserva de Identidad &amp; Privacidad · Ley 1581 / Res. 2646</span>
      </div>

      {/* Avatar protector institucional */}
      <div className="umbral-guardian-container">
        <div className="umbral-guardian-avatar">
          <img
            src="/assets/fotos/bpo-sst-guardian.jpg"
            alt="Especialista en Bienestar y Protección de Identidad"
            className="umbral-guardian-img"
            onError={(e) => {
              // Fallback discreto en caso de error de carga
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="umbral-guardian-badge" title="Garantía de Confidencialidad SST">
            <Icon name="lock" size={12} />
          </div>
        </div>
      </div>

      <h2 className="umbral-blocked-title">Información colectiva protegida</h2>
      
      <p className="umbral-blocked-message">
        {customMessage ||
          `Por mandato ético y normativo de SST, los resultados solo se publican cuando el equipo cuenta con al menos ${minThreshold} respuestas activas. Esta salvaguarda previene la reidentificación por deducción en turnos o grupos reducidos.`}
      </p>

      {/* Medidor visual de quórum */}
      <div className="umbral-quorum-meter">
        <div className="umbral-quorum-header">
          <span className="umbral-quorum-label">
            Quórum de anonimato: <strong>{visibleSampleCount}</strong> de <strong>{minThreshold}</strong> participantes requeridos
          </span>
          <span className="umbral-quorum-percent">{quorumPercent}%</span>
        </div>
        <div className="umbral-quorum-track" aria-hidden="true">
          <div
            className="umbral-quorum-fill"
            style={{ width: `${quorumPercent}%` }}
          />
        </div>
        <div className="umbral-quorum-hint">
          {missingParticipants > 0
            ? `Faltan ${missingParticipants} participante${missingParticipants > 1 ? 's' : ''} con check-in activo para habilitar la vista agregada.`
            : 'Umbral de quórum alcanzado para análisis agregado.'}
        </div>
      </div>

      {/* Garantías de seguridad psicológica */}
      <div className="umbral-guarantees-grid">
        <div className="umbral-guarantee-item">
          <div className="umbral-guarantee-icon">
            <Icon name="checkCircle" size={16} />
          </div>
          <div className="umbral-guarantee-body">
            <strong>Sin inferencia individual</strong>
            <p>Ningún supervisor o analista puede deducir valoraciones particulares.</p>
          </div>
        </div>
        <div className="umbral-guarantee-item">
          <div className="umbral-guarantee-icon">
            <Icon name="heart" size={16} />
          </div>
          <div className="umbral-guarantee-body">
            <strong>Participación voluntaria</strong>
            <p>El bienestar emocional no constituye un indicador punitivo ni contractual.</p>
          </div>
        </div>
      </div>

      {/* Muestra compatible para inspección y accesibilidad */}
      <div className="umbral-sample-count">
        Muestra actual N={visibleSampleCount} · Umbral mínimo N={minThreshold}
      </div>
    </div>
  );
}

