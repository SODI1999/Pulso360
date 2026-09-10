// src/features/landing/components/HeroSection.jsx
// Sección principal Hero de la Landing con propuesta de valor y simulador de encuesta

import { Link } from 'react-router-dom';
import { SurveyDemoCard } from './SurveyDemoCard';

export function HeroSection() {
  const scrollToDemo = () => {
    document.getElementById('encuesta-demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" id="inicio" aria-labelledby="hero-title">
      <div className="hero-pattern" aria-hidden="true"></div>
      <div className="landing-container hero-layout">
        <div className="hero-copy">
          <h1 id="hero-title">
            <strong>Pulso360</strong> ayuda a detectar señales de desgaste laboral antes de que se conviertan en una crisis.
          </h1>
          <p className="hero-lead">
            Los agentes responden seis preguntas breves sobre su jornada. Pulso360 mantiene cada respuesta en privado y muestra a Seguridad y Salud en el Trabajo únicamente tendencias colectivas para orientar acciones de prevención.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="button button-primary"
              onClick={scrollToDemo}
            >
              Probar encuesta
            </button>
            <Link className="button button-secondary" to="/login">
              Abrir plataforma
            </Link>
          </div>

          <dl className="hero-facts" aria-label="Resumen de Pulso360">
            <div>
              <dt>6</dt>
              <dd>preguntas por jornada</dd>
            </div>
            <div>
              <dt>1 min</dt>
              <dd>para responder</dd>
            </div>
            <div>
              <dt>Privado</dt>
              <dd>para cada agente</dd>
            </div>
          </dl>
        </div>

        {/* Simulador Interactivo de Encuesta */}
        <SurveyDemoCard />
      </div>
    </section>
  );
}
