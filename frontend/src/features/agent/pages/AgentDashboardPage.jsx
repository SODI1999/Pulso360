import { useAgentDashboard } from '../hooks/useAgentDashboard';
import { QUICK_ENERGY_SCALE, formatHour } from '../services/agentDashboardHelpers';

// src/features/agent/pages/AgentDashboardPage.jsx
// Panel principal del agente (Pulso Calma) bajo principios de Calm Technology:
// una pantalla = un propósito. Saludo + un único check-in rápido + ritmo del turno.
// La analítica vive en "Mi bienestar"; el menú lateral conserva
// los destinos de bitácora, apoyo y privacidad para mantener la home despejada.

import { Link } from 'react-router-dom';

import { Icon } from '../../../core/components/Icon';
import { PerspectiveSimModal } from '../components/PerspectiveSimModal';
import { EnergyFace } from '../components/EnergyFace';
import '../../../styles/agent.css';

// Escala rápida de energía: reutiliza las etiquetas de la dimensión "energia"
// del Check-in Wizard (no se inventa un concepto ni una escala paralela).

export function AgentDashboardPage() {
  const { loading,loadError,
    currentUser,
    consent,
    greeting,
    shiftStartHour,
    isOutsideShift,
    dismissedDisconnect,
    handleDismissDisconnect,
    todayCheckin,
    handleQuickEnergy,
    shiftSteps,
    breakStep,
    isPerspectiveModalOpen,
    setIsPerspectiveModalOpen
  } = useAgentDashboard();
  if (loading) return <p className="agent-page" role="status">Cargando tus registros…</p>;
  if (loadError) return <p className="agent-page alert-banner danger" role="alert">{loadError}</p>;


  return (
    <div className="agent-page calm-home">
      {/* 1. Cabecera / Hero Banner: Bienvenida y pausa del turno */}
      <header className="calm-hero-banner" aria-label="Bienvenida y pausa del turno">
        <div className="calm-hero-content">
          <h1 className="calm-hero-title">{greeting}, {currentUser?.name || 'Agente'}</h1>
          <p className="calm-hero-desc">
            Haz una pausa breve cuando el turno te dé espacio. Aflojar los hombros y respirar un minuto ayuda a soltar la carga de la línea.
          </p>
          <div className="calm-hero-actions">
            <Link
              to="/apoyo-crisis"
              className="btn btn-hero-pause"
              title="Ir a la pausa de respiración y apoyo en puesto"
              aria-label="Pausa de respiración y apoyo: ir al espacio de contención en puesto"
            >
              <span className="btn-hero-pause-icon" aria-hidden="true">
                <Icon name="respiro" size={16} />
              </span>
              <span className="btn-hero-pause-label">Pausa de respiración</span>
            </Link>
          </div>
        </div>
        <div className="calm-hero-media">
          <img
            src="/assets/fotos/bpo-agent-calm-pause.jpg"
            alt="Operadora de centro de contacto en una pausa de su turno, sosteniendo una taza tibia junto a su estación de trabajo con luz suave"
            className="calm-hero-img"
            loading="eager"
          />
        </div>
      </header>

      {/* 2. Desconexión Laboral Activa (Ley 2191 de 2022) */}
      {isOutsideShift && !dismissedDisconnect && (
        <div className="calm-disconnect" role="status">
          <div className="calm-disconnect-icon" aria-hidden="true">
            <Icon name="clock" size={18} />
          </div>
          <div className="calm-disconnect-text">
            <h4 className="calm-disconnect-title">
              <span>Desconexión Laboral Activa</span>
            </h4>
            <p className="calm-disconnect-desc">
              Tu turno ordinario culminó. Registrar o usar la app es voluntario y no tiene consecuencias.
            </p>
          </div>
          <div className="calm-disconnect-actions">
            <button
              type="button"
              className="btn btn-modal-comprendido btn-sm"
              onClick={handleDismissDisconnect}
            >
              Comprendido
            </button>
            <Link to="/apoyo-crisis" className="btn btn-clinical-support">
              <Icon name="phone" size={15} />
              <span>Líneas de apoyo</span>
            </Link>
          </div>
        </div>
      )}

      {/* 3. Zona principal: check-in protagonista + carril contextual */}
      <div className="calm-grid">
        <section className="calm-card" aria-label="Check-in del turno">
          {!consent.c1 ? (
            <>
              <h2 className="calm-card-title">Check-in no habilitado</h2>
              <p className="calm-card-sub">
                No tienes activa la finalidad C1 (registro diario) en tus preferencias de privacidad.
              </p>
              <Link to="/consentimiento" className="btn btn-primary btn-sm" style={{ marginTop: '18px' }}>
                Gestionar mis preferencias
              </Link>
            </>
          ) : todayCheckin ? (
            <div className="calm-done">
              <span className="calm-done-emoji" aria-hidden="true">
                <EnergyFace value={todayCheckin.energia} />
              </span>
              <p className="calm-done-text">Ya registraste tu turno de hoy.</p>
              <p className="calm-done-hint">
                Tu pausa activa está sugerida para las {breakStep?.time || formatHour(shiftStartHour + 4)}.
                Respira profundo, estira hombros y cuello antes de volver a la línea.
              </p>
              <Link to="/agente/checkin" className="btn btn-secondary btn-sm" style={{ marginTop: '6px' }}>
                Ver o editar mi registro
              </Link>
            </div>
          ) : (
            <>
              <h2 className="calm-card-title">Sintoniza con tu momento</h2>
              <p className="calm-card-sub">
                Un segundo para reconocer cómo te sientes hoy antes de continuar en la línea.
                {isOutsideShift && ' · Registro voluntario fuera de turno'}
              </p>
              <div className="calm-energy-track" role="group" aria-label="Escala de energía del turno">
                {QUICK_ENERGY_SCALE.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`calm-energy-segment calm-energy-${option.value}`}
                    onClick={() => handleQuickEnergy(option.value)}
                    aria-label={`Energía ${option.value} de 5: ${option.label}`}
                  >
                    <span className="calm-energy-emoji-wrap" aria-hidden="true">
                      <EnergyFace value={option.value} />
                    </span>
                    <span className="calm-energy-label">{option.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </section>

        <aside className="calm-rail" aria-label="Ritmo del turno">
          <div className="calm-rail-block">
            <h3 className="calm-rail-title">Tu turno hoy</h3>
            <div className="calm-rail-list">
              {shiftSteps.map((step) => (
                <div key={step.id} className={`calm-rail-node ${step.status}`}>
                  <span className="calm-rail-dot" aria-hidden="true" />
                  <div className="calm-rail-info">
                    <span className="calm-rail-time">{step.time}</span>
                    <span className="calm-rail-label">{step.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* 5. Pie: una sola línea de privacidad */}
      <footer className="calm-foot">
        <span className="calm-foot-note">
          Tus registros individuales quedan fuera de las vistas operativas agregadas.
        </span>
        <button
          type="button"
          className="calm-foot-link"
          onClick={() => setIsPerspectiveModalOpen(true)}
          title="Ver qué datos ve tu supervisor y cómo te protege el k-anonimato"
        >
          <Icon name="shield" size={14} />
          <span>¿Qué ve mi supervisor?</span>
        </button>
      </footer>

      {/* Modales preservados */}
      <PerspectiveSimModal isOpen={isPerspectiveModalOpen} onClose={() => setIsPerspectiveModalOpen(false)} />
    </div>
  );
}
