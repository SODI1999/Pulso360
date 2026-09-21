// src/features/agent/pages/AgentDashboardPage.jsx
// Panel principal del agente (Pulso Calma) bajo principios de Calm Technology:
// una pantalla = un propósito. Saludo + un único check-in rápido + ritmo del turno.
// La analítica vive en "Mi bienestar" / "Mi análisis"; el menú lateral conserva
// los destinos de bitácora, apoyo y privacidad para mantener la home despejada.

import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import { BpoResetModal } from '../components/BpoResetModal';
import { PerspectiveSimModal } from '../components/PerspectiveSimModal';
import { EnergyFace } from '../components/EnergyFace';
import '../../../styles/agent.css';

// Escala rápida de energía: reutiliza las etiquetas de la dimensión "energia"
// del Check-in Wizard (no se inventa un concepto ni una escala paralela).
const QUICK_ENERGY_SCALE = [
  { value: 1, label: 'Sin batería' },
  { value: 2, label: 'Baja energía' },
  { value: 3, label: 'Justa para el turno' },
  { value: 4, label: 'Buena energía' },
  { value: 5, label: 'Plena y enfocado' }
];

const formatHour = (hourNumber) => {
  const h = ((hourNumber % 24) + 24) % 24;
  return `${String(h).padStart(2, '0')}:00`;
};

export function AgentDashboardPage() {
  const currentUser = authService.getCurrentUser();
  const storeData = pulsoStore.get();
  const navigate = useNavigate();
  const consent = storeData.consents?.[currentUser?.id] || {};

  // 1. Partes de fecha y hora local en Bogotá
  const { dateParts, currentHourBogota } = useMemo(() => {
    const now = new Date();
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hourCycle: 'h23'
      })
        .formatToParts(now)
        .filter((item) => item.type !== 'literal')
        .map((item) => [item.type, item.value])
    );
    return {
      dateParts: parts,
      currentHourBogota: Number(parts.hour)
    };
  }, []);

  const greeting = useMemo(() => {
    if (currentHourBogota >= 5 && currentHourBogota < 12) return 'Buenos días';
    if (currentHourBogota >= 12 && currentHourBogota < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }, [currentHourBogota]);

  // 2. Jornada laboral en Bogotá (lógica inquebrantable compartida con el wizard)
  const shiftStartHour = Number(currentUser?.shiftStartHour ?? 8);

  const journeyKey = useMemo(() => {
    let key = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;

    if (currentHourBogota < shiftStartHour) {
      const previousDate = new Date(`${key}T12:00:00Z`);
      previousDate.setUTCDate(previousDate.getUTCDate() - 1);
      key = previousDate.toISOString().slice(0, 10);
    }

    return key;
  }, [dateParts, currentHourBogota, shiftStartHour]);

  // 3. Detección de Desconexión Laboral Activa (Ley 2191 de 2022)
  const isOutsideShift = useMemo(() => {
    const hoursSinceStart = (currentHourBogota - shiftStartHour + 24) % 24;
    return hoursSinceStart >= 9 && hoursSinceStart <= 23;
  }, [currentHourBogota, shiftStartHour]);

  // Persistencia del descarte del aviso de desconexión por jornada
  const [dismissedDisconnect, setDismissedDisconnect] = useState(() => {
    try {
      return sessionStorage.getItem(`pulso360_dismiss_disconnect_${journeyKey}`) === 'true';
    } catch {
      return false;
    }
  });

  const handleDismissDisconnect = () => {
    try {
      sessionStorage.setItem(`pulso360_dismiss_disconnect_${journeyKey}`, 'true');
    } catch {
      // Manejo seguro ante restricciones de almacenamiento
    }
    setDismissedDisconnect(true);
  };

  // 4. Estado del check-in de la jornada actual
  const todayCheckin = useMemo(() => {
    return (storeData.checkins || []).find(
      (c) => c.userId === currentUser?.id && c.journeyKey === journeyKey
    );
  }, [storeData.checkins, currentUser?.id, journeyKey]);

  // 5. Check-in rápido: el emoji pre-rellena el borrador del wizard usando el
  // MISMO draftKey que CheckinWizardPage lee al montar. No se duplica la
  // persistencia de registros: el wizard sigue siendo quien guarda en el store.
  const draftKey = `pulso360_checkin_draft_${currentUser?.id}_${journeyKey}`;

  const handleQuickEnergy = (value) => {
    try {
      const savedDraft = JSON.parse(localStorage.getItem(draftKey) || '{}');
      localStorage.setItem(draftKey, JSON.stringify({ ...savedDraft, energia: value }));
    } catch {
      // Si el almacenamiento está restringido, el wizard completo sigue disponible.
    }
    navigate('/agente/checkin');
  };

  // 6. Ritmo del turno (pasos de la jornada según hora de inicio)
  const shiftSteps = useMemo(() => {
    const hoursSinceStart = (currentHourBogota - shiftStartHour + 24) % 24;

    return [
      { id: 'start', time: formatHour(shiftStartHour), title: 'Inicio de turno', status: hoursSinceStart > 1 ? 'done' : 'active' },
      { id: 'block1', time: formatHour(shiftStartHour + 2), title: 'Bloque 1 (Línea)', status: hoursSinceStart > 3 ? 'done' : hoursSinceStart >= 2 ? 'active' : 'upcoming' },
      { id: 'break', time: formatHour(shiftStartHour + 4), title: 'Pausa Activa', status: hoursSinceStart > 5 ? 'done' : hoursSinceStart >= 4 ? 'active' : 'upcoming' },
      { id: 'block2', time: formatHour(shiftStartHour + 6), title: 'Bloque 2 (Línea)', status: hoursSinceStart > 7 ? 'done' : hoursSinceStart >= 6 ? 'active' : 'upcoming' },
      { id: 'close', time: formatHour(shiftStartHour + 8), title: 'Cierre & Desconexión', status: hoursSinceStart >= 8 ? 'done' : 'upcoming' }
    ];
  }, [shiftStartHour, currentHourBogota]);

  // Progreso visual del recorrido (0–100%) y hora sugerida de pausa activa
  const doneStepCount = shiftSteps.filter((step) => step.status === 'done').length;
  const shiftProgress = Math.min(100, Math.max(0, ((doneStepCount - 1) / (shiftSteps.length - 1)) * 100));
  const breakStep = shiftSteps.find((step) => step.id === 'break');

  // Modales preservados
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isPerspectiveModalOpen, setIsPerspectiveModalOpen] = useState(false);

  return (
    <div className="agent-page calm-home">
      {/* 1. Cabecera: saludo y contexto del turno en una línea */}
      <header className="calm-home-head">
        <h1 className="calm-home-title">
          {greeting}, {currentUser?.name || 'Agente'}
        </h1>
        <p className="calm-home-meta">
          {currentUser?.campaign || 'Campaña Soporte Alpha'} · Turno {currentUser?.shift || 'Mañana'} ({formatHour(shiftStartHour)} a {formatHour(shiftStartHour + 8)})
        </p>
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
              <span className="badge badge-ok">Fuera de turno</span>
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
                Tu pausa activa está sugerida para las {breakStep?.time || formatHour(shiftStartHour + 4)}. Respira profundo, estira hombros y cuello antes de volver a la línea.
              </p>
              <Link to="/agente/checkin" className="btn btn-secondary btn-sm" style={{ marginTop: '6px' }}>
                Ver o editar mi registro
              </Link>
            </div>
          ) : (
            <>
              <div className="calm-breathe" aria-hidden="true" />
              <h2 className="calm-card-title">¿Cómo va tu energía en este turno?</h2>
              <p className="calm-card-sub">
                Elige un nivel para iniciar tu check-in del turno.
                {isOutsideShift && ' Estás fuera de tu turno: registrar es voluntario.'}
              </p>
              <div className="calm-mood-row" role="group" aria-label="Escala rápida de energía del turno">
                {QUICK_ENERGY_SCALE.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`calm-mood-btn calm-mood-${option.value}`}
                    onClick={() => handleQuickEnergy(option.value)}
                    aria-label={`Energía ${option.value} de 5: ${option.label}`}
                  >
                    <span className="calm-mood-emoji" aria-hidden="true">
                      <EnergyFace value={option.value} />
                    </span>
                    <span className="calm-mood-label">{option.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </section>

        <aside className="calm-rail" aria-label="Ritmo del turno y pausa guiada">
          <div className="calm-rail-block">
            <h3 className="calm-rail-title">Tu turno hoy</h3>
            <div
              className="calm-rail-list"
              style={{ '--calm-progress': `${shiftProgress}%` }}
            >
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

          <div className="calm-rail-block calm-rail-block--pause">
            <div className="calm-pause-heading">
              <span className="calm-pause-mark" aria-hidden="true">
                <Icon name="self_improvement" size={17} />
              </span>
              <div>
                <h3 className="calm-rail-title">Un respiro para ti</h3>
                <span className="calm-pause-private">Privada · 2 minutos</span>
              </div>
            </div>
            <p className="calm-rail-desc">
              Respiración, descanso visual y estiramientos suaves para soltar la tensión de la línea.
            </p>
            <button
              type="button"
              className="btn btn-decompression-highlight calm-pause-btn"
              onClick={() => setIsResetModalOpen(true)}
              title="Abrir ejercicios de respiración, descanso visual y estiramiento"
            >
              <span>Tomar una pausa</span>
              <Icon name="arrowRight" size={16} />
            </button>
            <p className="calm-pause-note">No se registra como indicador individual.</p>
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
      <BpoResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      />

      <PerspectiveSimModal
        isOpen={isPerspectiveModalOpen}
        onClose={() => setIsPerspectiveModalOpen(false)}
      />
    </div>
  );
}