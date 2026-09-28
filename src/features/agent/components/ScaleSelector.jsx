// src/features/agent/components/ScaleSelector.jsx
// Selector de escala somática de percepción (1 a 5) con notas empáticas y atajos ergonómicos

import { Icon } from '../../../core/components/Icon';
import { EnergyFace } from './EnergyFace';

const FACE_DIRECTION = {
  energia: 'positive',
  cargaEmocional: 'negative',
  recuperacion: 'positive',
  apoyo: 'positive',
  distanciamiento: 'negative',
  ineficacia: 'negative'
};

export function ScaleSelector({ question, currentValue, onSelectValue, onSkip }) {
  if (!question) return null;

  const isSkipped = currentValue === null;

  return (
    <section className="check-step">
      <h2 className="check-step-title">{question.title}</h2>

      {/* Micro-nota empática contextual de la pregunta (desculpabilizadora) */}
      {question.contextNote && (
        <div className="scale-context-note" role="note">
          <span className="scale-context-icon-wrapper" aria-hidden="true">
            <Icon name="info" size={16} />
          </span>
          <p className="scale-context-text">{question.contextNote}</p>
        </div>
      )}

      {/* Escala somática, ergonómica y táctil del 1 al 5 en pista continua */}
      <div
        className="scale-selector scale-selector-track"
        role="radiogroup"
        aria-label={question.title}
        aria-keyshortcuts="1 2 3 4 5"
      >
        {question.labels.map((label, labelIndex) => {
          const val = labelIndex + 1;
          const isActive = currentValue === val;
          const visualValue = FACE_DIRECTION[question.key] === 'negative' ? 6 - val : val;
          return (
            <button
              key={val}
              type="button"
              role="radio"
              className={`scale-btn scale-btn--heat-${visualValue} ${isActive ? 'active' : ''}`}
              onClick={() => onSelectValue(val)}
              aria-checked={isActive}
              aria-label={`Opción ${val}: ${label}. Atajo de teclado: número ${val}`}
            >
              <span className="scale-energy-face" aria-hidden="true">
                <EnergyFace value={FACE_DIRECTION[question.key] === 'negative' ? 6 - val : val} />
              </span>
              <span className="scale-label">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Botón de Omisión empático */}
      <div className="scale-skip-wrapper">
        <button
          type="button"
          className={`skip-btn ${isSkipped ? 'active' : ''}`}
          onClick={onSkip}
          aria-pressed={isSkipped}
        >
          <Icon name="eyeOff" size={15} />
          <span>Prefiero omitir esta pregunta hoy</span>
        </button>
      </div>
    </section>
  );
}
