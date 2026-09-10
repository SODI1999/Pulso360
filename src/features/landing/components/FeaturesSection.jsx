// src/features/landing/components/FeaturesSection.jsx
// Sección de funcionalidades destacadas de Pulso360 con ilustraciones CSS nativas completas

import { Link } from 'react-router-dom';

export function FeaturesSection() {
  return (
    <section className="landing-section features-section" id="funcionalidades" aria-labelledby="features-title">
      <div className="landing-container">
        <div className="section-heading centered">
          <p className="eyebrow eyebrow-dark">Las tres funcionalidades principales</p>
          <h2 id="features-title">¿Qué puede hacer una persona dentro de Pulso360?</h2>
          <p>Estas son las tres funciones que definen el proyecto y que pueden comprobarse dentro de la plataforma.</p>
        </div>

        <div className="features-grid">
          {/* Funcionalidad 1: Encuesta Diaria */}
          <article className="feature-card">
            <div className="feature-visual feature-visual-survey" aria-hidden="true">
              <div className="visual-question"><span></span><span></span></div>
              <div className="visual-options"><i></i><i></i><i className="selected"></i><i></i><i></i></div>
            </div>
            <div className="feature-number">Funcionalidad 1</div>
            <h3>Encuesta diaria de bienestar</h3>
            <p>El agente registra en menos de un minuto cómo vivió seis aspectos de su jornada laboral.</p>
            <ul>
              <li>Seis preguntas fáciles de responder</li>
              <li>Opción consciente de no responder</li>
              <li>Historial personal de bienestar</li>
            </ul>
            <Link to="/login">Probar esta funcionalidad</Link>
          </article>

          {/* Funcionalidad 2: Bitácora Privada */}
          <article className="feature-card feature-card-highlight">
            <div className="feature-visual feature-visual-journal" aria-hidden="true">
              <div><span></span><span></span><span></span><span></span></div>
              <i>✓</i>
            </div>
            <div className="feature-number">Funcionalidad 2</div>
            <h3>Bitácora personal y privada</h3>
            <p>El agente puede escribir lo que ocurrió en su jornada y recibir un análisis orientativo sobre el texto.</p>
            <ul>
              <li>Notas visibles solo para su titular</li>
              <li>Análisis NLP explicable, no clínico</li>
              <li>Control para corregir la clasificación</li>
            </ul>
            <Link to="/login">Probar esta funcionalidad</Link>
          </article>

          {/* Funcionalidad 3: Panel Colectivo SST */}
          <article className="feature-card">
            <div className="feature-visual feature-visual-dashboard" aria-hidden="true">
              <div className="visual-bars"><i></i><i></i><i></i><i></i><i></i></div>
              <span>Tendencia del equipo</span>
            </div>
            <div className="feature-number">Funcionalidad 3</div>
            <h3>Panel colectivo para SST</h3>
            <p>SST consulta tendencias protegidas del equipo, recibe alertas y registra acciones preventivas.</p>
            <ul>
              <li>Resultados agrupados y redondeados</li>
              <li>Alertas automáticas tempranas</li>
              <li>Seguimiento de intervenciones</li>
            </ul>
            <Link to="/login">Probar esta funcionalidad</Link>
          </article>
        </div>
      </div>
    </section>
  );
}
