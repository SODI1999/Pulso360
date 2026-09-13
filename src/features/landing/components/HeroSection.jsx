// src/features/landing/components/HeroSection.jsx
// Hero Editorial Principal de Pulso360 con marca de agua BPO y tooltip pedagógico de k-anonimato

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../core/components/Icon';

export function HeroSection() {
  const [showTooltip, setShowTooltip] = useState(false);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-editorial" id="inicio" aria-labelledby="hero-main-title">
      {/* Capa de Marca de Agua Fotográfica BPO y Gradiente de Difuminado */}
      <div className="hero-watermark-bg" aria-hidden="true" />
      <div className="hero-watermark-gradient" aria-hidden="true" />

      <div className="landing-container hero-editorial-inner">
        {/* Cabecera Principal y Titular Editorial */}
        <div className="hero-editorial-top">
          <h1 id="hero-main-title" className="hero-editorial-title">
            Detección temprana del agotamiento en Contact Centers. <br />
            <em>Anticipa la rotación y la fatiga, sin invadir la privacidad.</em>
          </h1>

          <p className="hero-editorial-lead">
            Desarrollado para centros de contacto y operaciones de alta presión: un sistema preventivo no médico que reemplaza encuestas anuales tardías por micro-pulsos de 60 segundos, bitácoras privadas y estricto{' '}
            <button
              type="button"
              className="kanonymity-tooltip-wrapper"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(prev => !prev)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setShowTooltip(false);
              }}
              aria-expanded={showTooltip}
              aria-haspopup="dialog"
              aria-label="Explicación de qué significa k-anonimato k mayor o igual a 5"
            >
              <strong className="kanonymity-term">
                k-anonimato (k &ge; 5)
                <Icon name="info" size={14} className="kanonymity-info-icon" />
              </strong>
              {showTooltip && (
                <span className="kanonymity-tooltip-popover" role="tooltip" id="kanonymity-tooltip-popover">
                  <span className="tooltip-title">¿Qué significa k &ge; 5?</span>
                  <span className="tooltip-desc">
                    Garantiza que SST nunca ve datos individuales: las tendencias y métricas solo se calculan si al menos 5 personas del mismo equipo respondieron, haciendo matemáticamente imposible saber quién dijo qué.
                  </span>
                </span>
              )}
            </button>{' '}
            para que Seguridad y Salud en el Trabajo (SST) intervenga antes de que el desgaste se transforme en ausentismo o rotación.
          </p>

          <div className="hero-editorial-cta-bar">
            <button
              type="button"
              className="btn-editorial btn-editorial-primary"
              onClick={() => scrollToSection('demostracion')}
            >
              Ver demostración interactiva
              <Icon name="arrowRight" size={16} />
            </button>
            <Link to="/login" className="btn-editorial btn-editorial-outline">
              Acceder a la plataforma
            </Link>
            <span className="hero-guarantee-note">
              <Icon name="shieldCheck" size={16} />
              Garantía Habeas Data: confidencialidad individual blindada
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
