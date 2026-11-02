import { useState, useEffect, useRef } from 'react';
import { preferences } from '../../../core/storage/preferences';
import { useModalA11y } from '../../../core/hooks/useModalA11y';
import { createAmbientSound } from '../services/ambientSound';
import { BREATH_SECONDS, PHASE_DURATIONS, TIMED_PHASES, NEXT_PHASE } from '../data/bpoPauseData';

/**
 * Custom hook governing the multi-phase active pause state machine for BPO agents.
 * Coordinates breathing cycles, eye rest timers, somatic stretch intervals, ambient sound synthesis,
 * focus containment, and body scroll lock.
 *
 * @param {boolean} isOpen - Indicates whether the pause modal is active.
 * @param {() => void} onClose - Callback invoked when closing or completing the pause.
 * @returns {Object} Reactive state and handlers:
 * @returns {string} returns.phase - Current active phase ('entry' | 'breathing' | 'eyes' | 'stretch' | 'done').
 * @returns {number} returns.secondsLeft - Remaining seconds in the current timed phase.
 * @returns {import('react').RefObject<HTMLElement>} returns.overlayRef - Overlay container reference for focus trapping.
 * @returns {import('react').Dispatch<import('react').SetStateAction<boolean>>} returns.setSoundOn - Toggle sound state.
 * @returns {boolean} returns.soundOn - Current sound ambient preference.
 * @returns {import('react').RefObject<HTMLElement>} returns.exitButtonRef - Reference to exit button for autofocus.
 * @returns {import('react').RefObject<HTMLElement>} returns.entryButtonRef - Reference to entry button for autofocus.
 * @returns {() => void} returns.startPause - Initiates the active pause progression.
 */
export function useBpoPause(isOpen, onClose) {
  const [phase, setPhase] = useState('entry');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const overlayRef = useRef(null);
  const ambientRef = useRef(null);
  const audioBreathPhaseRef = useRef(null);
  const exitButtonRef = useRef(null);
  const entryButtonRef = useRef(null);
  const cycleRef = useRef(0);
  const [soundOn, setSoundOn] = useState(() => preferences.readPauseSound(true));
  const [pauseStarted, setPauseStarted] = useState(false);
  useModalA11y({ isOpen, onClose, modalRef: overlayRef, initialFocusRef: entryButtonRef });

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
    startPause
  };
}
