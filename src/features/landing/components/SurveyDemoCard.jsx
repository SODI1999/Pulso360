// src/features/landing/components/SurveyDemoCard.jsx
// Componente interactivo tipo Card que demuestra el simulador diario de energía del agente

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../core/components/Icon';

const ENERGY_OPTIONS = [
  { val: 1, label: 'Muy baja' },
  { val: 2, label: 'Baja' },
  { val: 3, label: 'Media' },
  { val: 4, label: 'Alta' },
  { val: 5, label: 'Muy alta' }
];

export function SurveyDemoCard() {
  // Manejo de estado interactivo del widget (useState)
  const [surveySelected, setSurveySelected] = useState(null);
  const [surveyFeedback, setSurveyFeedback] = useState('Selecciona una opción para probar la encuesta.');
  const [surveyAnswered, setSurveyAnswered] = useState(false);

  const handleSurveyOption = (val, label) => {
    setSurveySelected(val);
    setSurveyAnswered(true);
    setSurveyFeedback(
      `Seleccionaste ${val} de 5: energía ${label.toLowerCase()}. En la encuesta completa continuarías con carga, recuperación, apoyo, distanciamiento e ineficacia.`
    );
  };

  const handleSurveySkip = () => {
    setSurveySelected('skip');
    setSurveyAnswered(true);
    setSurveyFeedback(
      'Elegiste no responder en esta ocasión. Pulso360 respeta tu decisión y no penaliza la omisión de preguntas.'
    );
  };

  return (
    <div className="survey-showcase" id="encuesta-demo">
      <div className="survey-window">
        <header className="survey-header">
          <div>
            <span className="survey-app-label">Así lo usa un agente</span>
            <strong>Encuesta diaria de bienestar</strong>
          </div>
          <span className="survey-duration">1 minuto</span>
        </header>

        <div className="survey-progress" aria-label="Pregunta 1 de 6">
          <div className="survey-progress-copy">
            <strong>Pregunta 1 de 6</strong>
            <span>Energía</span>
          </div>
          <div className="survey-progress-track">
            <span style={{ width: '16.6%' }}></span>
          </div>
        </div>

        <div className="survey-question">
          <p>¿Cómo sientes tu energía al terminar la jornada?</p>
          <div className="survey-scale" role="group" aria-label="Selecciona un nivel de energía">
            {ENERGY_OPTIONS.map((opt) => (
              <button
                key={opt.val}
                type="button"
                className={`survey-option ${surveySelected === opt.val ? 'selected' : ''}`}
                aria-pressed={surveySelected === opt.val}
                onClick={() => handleSurveyOption(opt.val, opt.label)}
              >
                <strong>{opt.val}</strong>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
          <button
            className={`survey-skip ${surveySelected === 'skip' ? 'selected' : ''}`}
            type="button"
            onClick={handleSurveySkip}
          >
            Prefiero no responder
          </button>
        </div>

        <div className={`survey-feedback ${surveyAnswered ? 'answered' : ''}`} aria-live="polite">
          {surveyFeedback}
        </div>

        <footer className="survey-footer">
          <span className="privacy-icon" aria-hidden="true"><Icon name="check" size={14} /></span>
          <p><strong>Tu respuesta individual es privada.</strong> Ningún supervisor puede verla.</p>
          <Link to="/login">Ver encuesta completa</Link>
        </footer>
      </div>

      <div className="survey-caption">
        <span>Lo que responde el agente</span>
        <strong>se transforma en una tendencia colectiva, nunca en una evaluación personal.</strong>
      </div>
    </div>
  );
}
