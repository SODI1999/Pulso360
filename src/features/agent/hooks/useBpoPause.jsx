import { useState, useEffect, useRef } from 'react';
import { preferences } from '../../../core/storage/preferences';
import { createAmbientSound } from '../services/ambientSound';
import { BREATH_SECONDS, PHASE_DURATIONS, TIMED_PHASES, NEXT_PHASE } from '../data/bpoPauseData';
export function useBpoPause(isOpen, onClose) {
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
  const [soundOn, setSoundOn] = useState(() => preferences.readPauseSound(true));
  const [pauseStarted, setPauseStarted] = useState(false);
  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

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
      const focusables = Array.from(overlayRef.current.querySelectorAll('button')).filter(
        (el) => !el.disabled
      );
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
      preferences.savePauseSound(soundOn);
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
  const startPause = () => {
    if (soundOn) ambientRef.current?.start();
    setPauseStarted(true);
    goToPhase('breathing');
  };

  return {
    phase,
    secondsLeft,
    overlayRef,
    setSoundOn,
    soundOn,
    exitButtonRef,
    entryButtonRef,
    startPause,
    arcRef,
    orbRef,
    barRef
  };
}
