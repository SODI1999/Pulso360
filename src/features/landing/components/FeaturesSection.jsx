// src/features/landing/components/FeaturesSection.jsx
// Sección de funcionalidades asimétrica con foco en la Bitácora Privada interactiva y el Panel Colectivo SST

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../core/components/Icon';

const JOURNAL_SITUATIONS = [
  {
    id: 'llamada',
    title: 'Llamada conflictiva',
    badge: 'Tensión verbal',
    text: '«La tarde estuvo muy pesada. Tuve tres llamadas seguidas con clientes sumamente molestos gritando por cobros indebidos. Siento los hombros muy tensos y un fuerte dolor de cabeza...»',
    nlpTitle: 'Sobrecarga Emocional & Tensión Muscular',
    nlpFeedback: 'Identificamos menciones de alta tensión por agresión verbal y fatiga física acumulada. Te sugerimos realizar ejercicios de relajación cervical y una pausa breve de hidratación.'
  },
  {
    id: 'falla',
    title: 'Falla de aplicativo',
    badge: 'Obstáculo técnico',
    text: '«El sistema de radicación se congeló a las 2:00 PM en pleno pico de llamadas. Los clientes reclamaban por la demora y el AHT se disparó sin ser nuestra culpa. Mucha impotencia.»',
    nlpTitle: 'Estrés por Factores Fuera de Control',
    nlpFeedback: 'Detectamos frustración generada por bloqueos tecnológicos. Recuerda que las fallas del sistema son eventualidades técnicas de la infraestructura, no reflejan tu calidad profesional.'
  },
  {
    id: 'sobrecarga',
    title: 'Sobrecarga de turno',
    badge: 'Volumen continuo',
    text: '«Cola continua con más de 25 llamadas en espera durante 5 horas sin un solo segundo de respiro. No alcancé a tomar agua y siento agotamiento mental total al cerrar el turno.»',
    nlpTitle: 'Fatiga Cognitiva Extrema',
    nlpFeedback: 'Registramos señales de sobrecarga cognitiva sostenida y falta de pausas. Esta tendencia colectiva ha sido agregada para que SST evalúe la redistribución de turnos en tu campaña.'
  }
];

export function FeaturesSection() {
  const [selectedSituation, setSelectedSituation] = useState(JOURNAL_SITUATIONS[0]);

  return (
    <section className="landing-section features-section" id="funcionalidades" aria-labelledby="features-title">
      <div className="landing-container">
        {/* Cabecera */}
        <div className="section-heading centered">
          <p className="eyebrow eyebrow-dark">Funcionalidades del Sistema</p>
          <h2 id="features-title">Herramientas diseñadas para la dignidad del agente y la eficacia de SST.</h2>
          <p>
            Pulso360 combina un espacio íntimo de reflexión para quien atiende llamadas con herramientas éticas de prevención para la organización.
          </p>
        </div>

        {/* Feature Principal Ancha: La Bitácora Privada */}
        <div className="feature-hero-card">
          <div className="feature-hero-content">
            <div className="feature-category-badge">
              <Icon name="edit_note" size={16} />
              <span>Espacio Personal del Agente</span>
            </div>
            <h3>Bitácora Confidencial con Orientación Empática</h3>
            <p className="feature-hero-desc">
              Un agente de Contact Center lidia diariamente con situaciones de alta carga emocional. La Bitácora es su refugio seguro: un espacio libre de juicio donde puede escribir lo que vivió durante la jornada y recibir una devolución comprensiva basada en procesamiento de lenguaje natural no clínico.
            </p>

            <div className="feature-guarantees">
              <div className="guarantee-pill">
                <Icon name="lock" size={14} />
                <span>100% Inaccesible para Supervisores y SST</span>
              </div>
              <div className="guarantee-pill">
                <Icon name="policy" size={14} />
                <span>Análisis explicable, no diagnóstico médico</span>
              </div>
              <div className="guarantee-pill">
                <Icon name="checkCircle" size={14} />
                <span>El agente puede editar o reevaluar su registro</span>
              </div>
            </div>

            <div className="feature-hero-action">
              <Link to="/login" className="button button-primary">
                Explorar Bitácora en el Demo
              </Link>
            </div>
          </div>

          {/* Muestra Realista e Interactiva de Bitácora */}
          <div className="feature-journal-preview">
            <div className="journal-situation-selector" role="group" aria-label="Seleccionar ejemplo de situación">
              <span className="situation-selector-title">Probar situación real:</span>
              <div className="situation-buttons-row">
                {JOURNAL_SITUATIONS.map((sit) => (
                  <button
                    key={sit.id}
                    type="button"
                    className={`situation-pill-btn ${selectedSituation.id === sit.id ? 'active' : ''}`}
                    onClick={() => setSelectedSituation(sit)}
                  >
                    {sit.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="journal-window">
              <div className="journal-window-bar">
                <span className="journal-status-dot"></span>
                <span className="journal-title">Bitácora de Turno — Confidencial</span>
                <span className="journal-badge-situation">{selectedSituation.badge}</span>
                <span className="journal-date">Hoy, 16:45</span>
              </div>

              <div className="journal-body">
                <p className="journal-entry-text">
                  {selectedSituation.text}
                </p>

                <div className="journal-nlp-response">
                  <div className="nlp-header">
                    <span className="nlp-badge">
                      <Icon name="insights" size={13} />
                      {selectedSituation.nlpTitle}
                    </span>
                    <small>Solo visible para ti</small>
                  </div>
                  <p>
                    {selectedSituation.nlpFeedback}
                  </p>
                </div>
              </div>

              <div className="journal-window-footer">
                <Icon name="shieldCheck" size={14} />
                <span>Texto cifrado en la base de datos local del usuario · Cero acceso a terceros</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dúo Asimétrico: Encuesta Rápida + Panel SST */}
        <div className="features-duo-grid">
          {/* Módulo 1: Encuesta Diaria de 60 Segundos */}
          <article className="feature-subcard">
            <div className="subcard-header">
              <div className="subcard-icon-wrap icon-teal">
                <Icon name="favorite" size={20} />
              </div>
              <span className="subcard-tag">Rápido y Validado</span>
            </div>
            <h3>Encuesta Diaria de 6 Factores</h3>
            <p>
              Diseñada específicamente para no interrumpir los tiempos de descanso de los agentes. En menos de 60 segundos registra seis dimensiones basadas en la literatura de burnout:
            </p>
            <div className="factors-pills">
              <span className="factor-pill">Energía</span>
              <span className="factor-pill">Carga</span>
              <span className="factor-pill">Recuperación</span>
              <span className="factor-pill">Apoyo</span>
              <span className="factor-pill">Distanciamiento</span>
              <span className="factor-pill">Ineficacia</span>
            </div>
            <div className="subcard-footer">
              <span className="footer-note">Opción de omisión sin penalización</span>
              <Link to="/login" className="subcard-link">
                Ver factores <Icon name="arrowRight" size={14} />
              </Link>
            </div>
          </article>

          {/* Módulo 2: Panel Colectivo para SST */}
          <article className="feature-subcard">
            <div className="subcard-header">
              <div className="subcard-icon-wrap icon-purple">
                <Icon name="analytics" size={20} />
              </div>
              <span className="subcard-tag">Gestión Institucional</span>
            </div>
            <h3>Radar de Tendencias y Acciones para SST</h3>
            <p>
              El equipo de Seguridad y Salud en el Trabajo cuenta con un panel analítico ético para monitorear el pulso de las campañas y documentar planes de intervención preventivos:
            </p>
            <ul className="subcard-checklist">
              <li>
                <Icon name="check" size={14} />
                <span>Mapas de calor por campaña con semaforización ética</span>
              </li>
              <li>
                <Icon name="check" size={14} />
                <span>Alertas tempranas de riesgo de sobrecarga acumulada</span>
              </li>
              <li>
                <Icon name="check" size={14} />
                <span>Registro y trazabilidad de acciones de mejora laboral</span>
              </li>
            </ul>
            <div className="subcard-footer">
              <span className="footer-note">Cumplimiento de anonimato k ≥ 5</span>
              <Link to="/login" className="subcard-link">
                Ver panel SST <Icon name="arrowRight" size={14} />
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
