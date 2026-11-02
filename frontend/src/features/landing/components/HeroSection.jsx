// src/features/landing/components/HeroSection.jsx
// Hero Split Canónico (60/40): Claridad Industrial & Serenidad Humana
// Ficha de Cierre de Turno y Desconexión Laboral (Ley 2191) + Popover Accesible de k-Anonimato

import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../core/components/Icon';

export function HeroSection() {
  const [isKPopoverOpen, setIsKPopoverOpen] = useState(false);
  const popoverRef = useRef(null);
  const popoverTriggerRef = useRef(null);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Manejo de teclado (Escape) y click exterior para accesibilidad WCAG AA
  useEffect(() => {
    if (!isKPopoverOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsKPopoverOpen(false);
        popoverTriggerRef.current?.focus();
      }
    };

    const handleClickOutside = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        popoverTriggerRef.current &&
        !popoverTriggerRef.current.contains(e.target)
      ) {
        setIsKPopoverOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isKPopoverOpen]);

  return (
    <section className="hero-editorial" id="inicio" aria-labelledby="hero-main-title">
      <div className="landing-container hero-split-grid">
        {/* =========================================================================
            COLUMNA IZQUIERDA (60%): Manifiesto Editorial Humano
            ========================================================================= */}
        <div className="hero-editorial-col">
          {/* Eyebrow tipográfico puro */}
          <span className="hero-editorial-eyebrow">Salud Ocupacional & Prevención en Contact Centers</span>

          <h1 id="hero-main-title" className="hero-editorial-title">
            Bienestar y apoyo preventivo <br /> en Contact Centers.
            <span className="hero-title-sub">
              Registra cómo vives el turno y solicita orientación a SST.
            </span>
          </h1>

          <p className="hero-editorial-lead">
            Check-ins voluntarios y analítica agregada para que SST revise tendencias del
            equipo sin convertir el bienestar en una métrica de desempeño.
          </p>

          {/* Acciones principales */}
          <div className="hero-cta-group">
            <button
              type="button"
              className="btn-editorial btn-editorial-primary"
              onClick={() => scrollToSection('los-tres-actos')}
            >
              Probar demostración interactiva
            </button>
            <Link to="/login" className="btn-editorial btn-editorial-outline">
              Acceso a plataforma
            </Link>
          </div>

          {/* Pie editorial continuo y fluido con Popover accesible de k-anonimato */}
          <div className="hero-trust-editorial">
            <Icon name="shieldCheck" size={16} className="hero-trust-icon" />
            <div className="hero-trust-text">
              La aplicación separa los registros individuales de las tendencias agregadas y bloquea{' '}
              <span className="hero-k-popover-anchor">
                <button
                  type="button"
                  ref={popoverTriggerRef}
                  className="hero-k-popover-trigger"
                  onClick={() => setIsKPopoverOpen((prev) => !prev)}
                  aria-expanded={isKPopoverOpen}
                  aria-haspopup="dialog"
                  aria-controls="hero-k-dialog"
                >
                  <strong>k-anonimato (k &ge; 5)</strong>
                  <Icon name="info" size={13} className="k-popover-info-icon" />
                </button>

                {isKPopoverOpen && (
                  <div
                    id="hero-k-dialog"
                    ref={popoverRef}
                    className="kanonymity-popover"
                    role="dialog"
                    aria-label="Explicación del umbral de k-Anonimato (k ≥ 5)"
                  >
                    <div className="k-popover-header">
                      <div className="k-popover-title-row">
                        <Icon name="kAnonymityShield" size={15} className="k-popover-shield" />
                        <strong className="k-popover-title">¿Qué significa k &ge; 5?</strong>
                      </div>
                      <button
                        type="button"
                        className="k-popover-close"
                        onClick={() => setIsKPopoverOpen(false)}
                        aria-label="Cerrar explicación de k-anonimato"
                      >
                        <Icon name="x" size={13} />
                      </button>
                    </div>

                    <p className="k-popover-text">
                      Es el umbral matemático de privacidad: si un equipo registra menos de 5 respuestas
                      activas, el panel de SST se bloquea automáticamente. Protege la confidencialidad
                      individual impidiendo la deducción directa de respuestas en muestras pequeñas.
                    </p>

                    <div className="k-popover-footer">
                      <button
                        type="button"
                        className="k-popover-action-link"
                        onClick={() => {
                          setIsKPopoverOpen(false);
                          scrollToSection('los-tres-actos');
                        }}
                      >
                        Ver simulación en el Acto II &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </span>{' '}
              cuando la muestra es pequeña. Revisa el alcance de esta demo antes de registrar datos reales.
            </div>
          </div>
        </div>

        {/* =========================================================================
            COLUMNA DERECHA (40%): Ficha de Cierre de Turno y Desconexión Laboral
            (Ley 2191, check-in ilustrativo, sin vista individual para supervisión)
            ========================================================================= */}
        <div className="hero-teaser-col" aria-label="Ficha de Cierre de Turno y Desconexión Laboral">
          <div className="disconnection-card">
            {/* Cabecera sobria y unificada de la ficha */}
            <div className="disconnection-card-top">
              <span className="disconnection-law-badge">
                <Icon name="shieldCheck" size={13} />
                Ejemplo ilustrativo · Ley 2191 (Desconexión Laboral)
              </span>
            </div>

            {/* Estado principal de cierre de turno */}
            <div className="disconnection-status-block">
              <h2 className="disconnection-title">Desconexión Laboral Activa</h2>
              <p className="disconnection-desc">
                Ejemplo ilustrativo del cierre de turno. El registro voluntario puede alimentar una tendencia
                agregada cuando el grupo cumple el umbral de protección.
              </p>
            </div>

            {/* Cuadrícula de salvaguardas operacionales tangibles */}
            <div className="disconnection-safeguards-grid">
              <div className="safeguard-item">
                <div className="safeguard-icon-wrap">
                  <Icon name="heartPulse" size={16} />
                </div>
                <div className="safeguard-text">
                  <strong className="safeguard-metric">Voluntario</strong>
                  <span className="safeguard-label">Registro sobre tu turno</span>
                </div>
              </div>

              <div className="safeguard-item">
                <div className="safeguard-icon-wrap">
                  <Icon name="lock" size={16} />
                </div>
                <div className="safeguard-text">
                  <strong className="safeguard-metric">Tendencias agregadas</strong>
                  <span className="safeguard-label">
                    La vista de supervisión no muestra registros individuales
                  </span>
                </div>
              </div>

              <div className="safeguard-item safeguard-item-full">
                <div className="safeguard-icon-wrap">
                  <Icon name="notifications" size={16} />
                </div>
                <div className="safeguard-text">
                  <strong className="safeguard-metric">Participación voluntaria</strong>
                  <span className="safeguard-label">
                    El agente decide si registra su experiencia del turno
                  </span>
                </div>
              </div>
            </div>

            {/* Pie técnico con sello de k-anonimato */}
            <div className="disconnection-card-foot">
              <Icon name="kAnonymityShield" size={14} className="disconnection-foot-icon" />
              <span>SST solo visualiza promedios colectivos si el equipo supera k &ge; 5.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
