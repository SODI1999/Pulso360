// src/features/agent/components/BpoResetModal.jsx
// Modo Pausa inmersivo: secuencia guiada full-screen bajo el principio
// "una cosa por pantalla" (Calm Technology). El agente toma una sola
// decisión al entrar; el sistema guía el resto: respiración 4-2-6
// (la exhalación prolongada favorece la respuesta de calma), descanso
// ocular 20s y estiramientos temporizados con auto-avance.
// No persiste datos: la pausa es privada y no se registra en ninguna parte.

import { useState, useEffect, useRef } from 'react';
import { Icon } from '../../../core/components/Icon';
import { createAmbientSound } from './ambientSound';

// Respiración: ciclo completo de 12s (inhala 4 · sostén 2 · exhala 6).
// Las pistas enseñan el gesto correcto; el orbe lo marca con precisión.
const BREATH_SECONDS = 12;
const BREATH_CYCLES = 5;
const BREATH_PHASES = [
  { label: 'Inhala', hint: 'El aire entra por la nariz y llena el abdomen.' },
  { label: 'Sostén', hint: 'Mantén el aire sin esfuerzo, hombros sueltos.' },
  { label: 'Exhala', hint: 'Suelta por la boca, más lento que al inhalar.' }
];

const EYE_REST_SECONDS = 20;
const STRETCH_SECONDS = 12;
const STRETCHES = [
  { title: 'Descarga cervical', desc: 'Inclina la cabeza suave hacia un hombro y cambia de lado sin forzar.' },
  { title: 'Alivio de muñecas', desc: 'Brazo extendido: flexiona los dedos hacia atrás con la otra mano.' },
  { title: 'Apertura dorsal', desc: 'Manos entrelazadas detrás de la espalda; eleva el pecho al inhalar.' }
];

const STRETCH_TOTAL = STRETCH_SECONDS * STRETCHES.length;
const BREATH_TOTAL = BREATH_SECONDS * BREATH_CYCLES;
const PAUSE_TOTAL = BREATH_TOTAL + EYE_REST_SECONDS + STRETCH_TOTAL;

const PHASE_DURATIONS = {
  breathing: BREATH_TOTAL,
  eyes: EYE_REST_SECONDS,
  stretch: STRETCH_TOTAL
};
const TIMED_PHASES = Object.keys(PHASE_DURATIONS);
const NEXT_PHASE = { breathing: 'eyes', eyes: 'stretch', stretch: 'done' };

// Preferencias de audio del agente (no son datos personales: solo un interruptor).
// localStorage guarda la elección para no tener que silenciar en cada pausa.
const SOUND_PREF_KEY = 'pulso360_pause_ambient';

const readBoolPref = (key, fallback) => {
  try {
    const stored = localStorage.getItem(key);
    return stored == null ? fallback : stored === 'true';
  } catch {
    return fallback;
  }
};

export function BpoResetModal({ isOpen, onClose }) {
  const [phase, setPhase] = useState('entry');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const overlayRef = useRef(null);
  const orbRef = useRef(null);
  const arcRef = useRef(null);
  const barRef = useRef(null);
  const ambientRef = useRef(null);
  const audioBreathPhaseRef = useRef(null);
  const exitButtonRef = useRef(null);
  const entryButtonRef = useRef(null);
  const openerRef = useRef(null);
  const cycleRef = useRef(0);
  const [soundOn, setSoundOn] = useState(() => readBoolPref(SOUND_PREF_KEY, true));
  const [pauseStarted, setPauseStarted] = useState(false);

  const reducedMotion = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // Cada apertura reinicia el flujo desde la entrada
  useEffect(() => {
    if (!isOpen) {
      openerRef.current?.focus?.();
      openerRef.current = null;
      return;
    }

    openerRef.current = document.activeElement;
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setPhase('entry');
      setSecondsLeft(0);
      setPauseStarted(false);
      cycleRef.current = 0;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (phase === 'entry') {
      entryButtonRef.current?.focus();
      return;
    }
    exitButtonRef.current?.focus();
  }, [isOpen, phase]);

  // Escape para salir en cualquier momento; bloqueo de scroll del turno detrás
  // y trampa de foco básica (Tab cicla solo entre los controles de la pausa)
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !overlayRef.current) return;
      const focusables = Array.from(overlayRef.current.querySelectorAll('button')).filter((el) => !el.disabled);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  // Transición de fase: cambia la fase y sincroniza su duración en el mismo
  // lote de estado (evita que el avance dispare antes de inicializar el conteo)
  const goToPhase = (next) => {
    setPhase(next);
    setSecondsLeft(PHASE_DURATIONS[next] ?? 0);
  };

  // Ambiente sonoro: se crea una vez y se libera al desmontar. Arranca solo
  // cuando la pausa ya empezó (el clic en "Iniciar pausa" habilita el audio
  // del navegador) y se silencia al instante con el botón Sonido/Silencio.
  useEffect(() => {
    ambientRef.current = createAmbientSound();
    return () => {
      ambientRef.current?.stop();
      ambientRef.current = null;
    };
  }, []);

  useEffect(() => {
    const ambient = ambientRef.current;
    if (!ambient) return;
    if (!isOpen) {
      ambient.stop();
      return;
    }
    if (phase === 'entry' || !pauseStarted) return;
    if (soundOn) ambient.start();
    else ambient.setEnabled(false);
  }, [isOpen, phase, soundOn, pauseStarted]);

  useEffect(() => {
    if (!isOpen || phase !== 'breathing' || !ambientRef.current) {
      audioBreathPhaseRef.current = null;
      ambientRef.current?.setBreathPhase(null);
      return;
    }

    const elapsed = PHASE_DURATIONS.breathing - secondsLeft;
    const cyclePosition = elapsed % BREATH_SECONDS;
    const nextPhase = cyclePosition < 4 ? 0 : cyclePosition < 6 ? 1 : 2;
    ambientRef.current.setBreathPhase(nextPhase);
    audioBreathPhaseRef.current = nextPhase;
  }, [isOpen, phase, secondsLeft]);

  useEffect(() => {
    try {
      localStorage.setItem(SOUND_PREF_KEY, String(soundOn));
    } catch {
      // La preferencia no es crítica: si el almacenamiento está restringido, se ignora
    }
  }, [soundOn]);

  // Temporizador de la fase activa (auto-avance del flujo guiado)
  useEffect(() => {
    if (!isOpen || !TIMED_PHASES.includes(phase)) return undefined;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, phase]);

  // Al agotarse el tiempo de una fase, se pasa a la siguiente
  useEffect(() => {
    if (!isOpen || !TIMED_PHASES.includes(phase) || secondsLeft > 0) return;
    goToPhase(NEXT_PHASE[phase] ?? 'done');
  }, [isOpen, phase, secondsLeft]);

  // Guía de respiración a 60fps: el orbe escala siguiendo exactamente la curva
  // 4-2-6 con easing suave (sin saltos), y el arco + la barra muestran el
  // avance de la sub-fase. Se escribe directo en el DOM para no re-renderizar
  // la pantalla en cada fotograma.
  useEffect(() => {
    if (!isOpen || phase !== 'breathing' || reducedMotion) return undefined;

    const ORB_ARC = 2 * Math.PI * 128;
    const easeInOutSine = (x) => 0.5 - Math.cos(Math.PI * x) / 2;
    const startTime = performance.now();
    let frameId = 0;

    const paintBreath = (now) => {
      const t = (now - startTime) / 1000;
      const cyclePos = t % BREATH_SECONDS;

      let scale;
      let subElapsed;
      let subTotal;
      if (cyclePos < 4) {
        subElapsed = cyclePos;
        subTotal = 4;
        scale = 0.78 + 0.36 * easeInOutSine(cyclePos / 4);
      } else if (cyclePos < 6) {
        subElapsed = cyclePos - 4;
        subTotal = 2;
        scale = 1.14;
      } else {
        subElapsed = cyclePos - 6;
        subTotal = 6;
        scale = 1.14 - 0.36 * easeInOutSine((cyclePos - 6) / 6);
      }

      const progress = subElapsed / subTotal;
      if (orbRef.current) orbRef.current.style.transform = `scale(${scale.toFixed(4)})`;
      if (arcRef.current) {
        arcRef.current.style.strokeDasharray = `${ORB_ARC}`;
        arcRef.current.style.strokeDashoffset = `${(ORB_ARC * (1 - progress)).toFixed(1)}`;
      }
      if (barRef.current) barRef.current.style.width = `${(progress * 100).toFixed(1)}%`;
      const currentBreathPhase = cyclePos < 4 ? 0 : cyclePos < 6 ? 1 : 2;
      if (audioBreathPhaseRef.current !== currentBreathPhase) {
        ambientRef.current?.setBreathPhase(currentBreathPhase);
        audioBreathPhaseRef.current = currentBreathPhase;
      }

      frameId = requestAnimationFrame(paintBreath);
    };

    frameId = requestAnimationFrame(paintBreath);
    return () => cancelAnimationFrame(frameId);
  }, [isOpen, phase, reducedMotion]);

  if (!isOpen) return null;

  const timed = TIMED_PHASES.includes(phase);
  const elapsed = timed ? PHASE_DURATIONS[phase] - secondsLeft : 0;
  const phaseOffset = phase === 'eyes'
    ? BREATH_TOTAL
    : phase === 'stretch'
      ? BREATH_TOTAL + EYE_REST_SECONDS
      : 0;
  const overallElapsed = timed ? phaseOffset + elapsed : 0;

  // Sub-fases derivadas del tiempo transcurrido (sin estado extra)
  const breathPhaseIdx = phase === 'breathing'
    ? (elapsed % BREATH_SECONDS < 4 ? 0 : elapsed % BREATH_SECONDS < 6 ? 1 : 2)
    : 2;
  const breathCycle = phase === 'breathing'
    ? Math.min(BREATH_CYCLES, Math.floor(elapsed / BREATH_SECONDS) + 1)
    : 1;
  const stretchIdx = phase === 'stretch'
    ? Math.min(STRETCHES.length - 1, Math.floor(elapsed / STRETCH_SECONDS))
    : 0;
  const stretchRemain = phase === 'stretch'
    ? STRETCH_SECONDS - (elapsed % STRETCH_SECONDS)
    : STRETCH_SECONDS;

  // Sub-fase de respiración (texto guía): inhala 4s · sostén 2s · exhala 6s
  const SUB_TOTALS = [4, 2, 6];
  const subElapsed = phase === 'breathing'
    ? (breathPhaseIdx === 0
      ? elapsed % BREATH_SECONDS
      : breathPhaseIdx === 1
        ? (elapsed % BREATH_SECONDS) - 4
        : (elapsed % BREATH_SECONDS) - 6)
    : 0;
  const subRemain = phase === 'breathing'
    ? Math.max(1, Math.ceil(SUB_TOTALS[breathPhaseIdx] - subElapsed))
    : 0;

  const RING_LENGTH = 2 * Math.PI * 15;
  const ringProgress = timed ? overallElapsed / PAUSE_TOTAL : 0;

  return (
    <div className="pause-overlay" role="dialog" aria-modal="true" aria-label="Pausa guiada" ref={overlayRef}>
      {/* Niebla baja a la deriva: da profundidad de paisaje */}
      <div className="pause-mist" aria-hidden="true" />

      <div className="pause-brand" aria-label="Pulso Calma, espacio de recuperación">
        <span className="pause-brand-name">Pulso Calma</span>
        <span className="pause-brand-divider" aria-hidden="true">·</span>
        <span>Tu espacio de recuperación</span>
      </div>

      <div className="pause-controls">
        <button
          type="button"
          className="pause-sound"
          onClick={() => setSoundOn((prev) => !prev)}
          aria-pressed={soundOn}
          title={soundOn ? 'Silenciar el ambiente sonoro' : 'Activar el ambiente sonoro'}
        >
          <Icon name={soundOn ? 'volumeOn' : 'volumeOff'} size={16} />
          <span>{soundOn ? 'Sonido' : 'Silencio'}</span>
          {soundOn && (
            <span className="pause-sound-bars" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          )}
        </button>

        <button
          ref={exitButtonRef}
          type="button"
          className="pause-exit"
          onClick={onClose}
          title="Salir de la pausa (Escape)"
        >
          <Icon name="close" size={16} />
          <span>Salir</span>
        </button>
      </div>

      {/* Anillo de progreso de la pausa completa */}
      {timed && (
        <svg className="pause-ring" viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r="15" className="pause-ring-track" />
          <circle
            cx="20"
            cy="20"
            r="15"
            className="pause-ring-fill"
            strokeDasharray={RING_LENGTH}
            strokeDashoffset={RING_LENGTH * (1 - ringProgress)}
          />
        </svg>
      )}

      {/* Fase 0 · Entrada: una sola decisión */}
      {phase === 'entry' && (
        <div className="pause-stage">
          {/* Sin kicker de entrada: la marca "Pulso Calma · Tu espacio de recuperación"
              ya encabeza la ventana; repetirla aquí duplicaba el rótulo (auditoría 015, hallazgo 5) */}
          <h2 className="pause-title">Tómate 2 minutos</h2>
          <p className="pause-sub">
            Un espacio breve dentro de tu turno para respirar, descansar la vista y soltar la tensión cervical.
          </p>

          <div className="pause-entry-list" aria-label="Resumen de la pausa guiada">
            <div className="pause-entry-chip">
              <span className="pause-entry-chip-label">Duración</span>
              <strong>2 min</strong>
            </div>
            <div className="pause-entry-chip">
              <span className="pause-entry-chip-label">Ritmo</span>
              <strong>4-2-6</strong>
            </div>
            <div className="pause-entry-chip">
              <span className="pause-entry-chip-label">Privacidad</span>
              <strong>Sin registro</strong>
            </div>
          </div>

          <button
            type="button"
            className="pause-start-btn"
            ref={entryButtonRef}
            onClick={() => {
              if (soundOn) ambientRef.current?.start();
              setPauseStarted(true);
              goToPhase('breathing');
            }}
          >
            <Icon name="play" size={16} />
            <span>Iniciar pausa</span>
          </button>
        </div>
      )}

      {/* Fase 1 · Respiración guiada: el orbe marca el ritmo 4-2-6 */}
      {phase === 'breathing' && (
        <div className="pause-stage">
          <div className="pause-orb-scene" aria-hidden="true">
            <svg className="pause-orb-arc" viewBox="0 0 300 300">
              <circle cx="150" cy="150" r="128" className="pause-orb-arc-track" />
              <circle ref={arcRef} cx="150" cy="150" r="128" className="pause-orb-arc-fill" />
            </svg>
            <div className="pause-orb-aura" />
            <div ref={orbRef} className={`pause-orb orb-phase-${breathPhaseIdx}`}>
              <span className="pause-orb-sheen" />
            </div>
          </div>

          <div className="pause-guide" aria-live="polite">
            <h2 className="pause-phase-word">
              {BREATH_PHASES[breathPhaseIdx].label}
              <span className="pause-phase-count">{subRemain}s</span>
            </h2>
            <div className="pause-phase-bar" aria-hidden="true">
              <span ref={barRef} className="pause-phase-bar-fill" />
            </div>
            <p className="pause-phase-hint">{BREATH_PHASES[breathPhaseIdx].hint}</p>
          </div>

          <p className="pause-meta">
            Ciclo {breathCycle} de {BREATH_CYCLES}
          </p>
        </div>
      )}

      {/* Fase 2 · Descanso ocular 20-20-20 */}
      {phase === 'eyes' && (
        <div className="pause-stage">
          <p className="pause-kicker">Descanso ocular</p>
          <h2 className="pause-phase-word">Aparta la vista</h2>
          <p className="pause-phase-hint">
            Busca un punto lejano de tu entorno — una ventana, el fondo de la sala — y déjate la mirada allí.
          </p>
          <p className="pause-count">{secondsLeft}s</p>
        </div>
      )}

      {/* Fase 3 · Estiramientos temporizados con auto-avance */}
      {phase === 'stretch' && (
        <div className="pause-stage">
          <p className="pause-kicker">
            Estiramiento {stretchIdx + 1} de {STRETCHES.length}
          </p>
          <h2 className="pause-phase-word">{STRETCHES[stretchIdx].title}</h2>
          <p className="pause-phase-hint">{STRETCHES[stretchIdx].desc}</p>
          <p className="pause-count">{stretchRemain}s</p>
        </div>
      )}

      {/* Fase 4 · Cierre */}
      {phase === 'done' && (
        <div className="pause-stage pause-stage--completion">
          <p className="pause-kicker">Pausa completada</p>
          <h2 className="pause-title">Pausa completada.</h2>
          <p className="pause-sub">
            La respiración volvió a ser más lenta y clara. Puedes volver al turno cuando te sientas listo.
          </p>
          <button type="button" className="pause-start-btn" onClick={onClose}>
            <span>Volver al turno</span>
          </button>
        </div>
      )}
    </div>
  );
}
