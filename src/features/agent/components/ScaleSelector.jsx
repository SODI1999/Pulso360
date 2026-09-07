// src/features/agent/components/ScaleSelector.jsx
// Selector de escala de percepción (1 a 5) y opción de omitir respuesta

import { Icon } from '../../../core/components/Icon';

export function ScaleSelector({ question, currentValue, onSelectValue, onSkip }) {
    if (!question) return null;

    const isSkipped = currentValue === null;

    return (
        <section className="check-step">
            <h2 className="check-step-title">
                {question.title}
            </h2>

            {/* Escala del 1 al 5 */}
            <div className="scale-selector" role="radiogroup" aria-label={question.title}>
                {question.labels.map((label, labelIndex) => {
                    const val = labelIndex + 1;
                    const isActive = currentValue === val;
                    return (
                        <button
                            key={val}
                            type="button"
                            className={`scale-btn ${isActive ? 'active' : ''}`}
                            onClick={() => onSelectValue(val)}
                            aria-pressed={isActive}
                        >
                            <strong>{val}</strong>
                            <span style={{ fontSize: '11px' }}>{label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Botón de Omitir / No Responder */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <button
                    type="button"
                    className={`skip-btn ${isSkipped ? 'active' : ''}`}
                    onClick={onSkip}
                >
                    <Icon name="eyeOff" size={14} />
                    <span>Prefiero no responder a esta dimensión</span>
                </button>
            </div>
        </section>
    );
}
