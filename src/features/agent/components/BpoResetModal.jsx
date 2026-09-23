import { Icon } from '../../../core/components/Icon';
import { useBpoPause } from '../hooks/useBpoPause';
import {
  BREATH_SECONDS,
  BREATH_CYCLES,
  BREATH_PHASES,
  EYE_REST_SECONDS,
  STRETCH_SECONDS,
  STRETCHES,
  BREATH_TOTAL,
  PAUSE_TOTAL,
  PHASE_DURATIONS,
  TIMED_PHASES
} from '../data/bpoPauseData';
export function BpoResetModal({ isOpen, onClose }) {
  const {
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
  } = useBpoPause(isOpen, onClose);
  if (!isOpen) return null;
  const timed = TIMED_PHASES.includes(phase);
  const elapsed = timed ? PHASE_DURATIONS[phase] - secondsLeft : 0;
  const phaseOffset =
    phase === 'eyes' ? BREATH_TOTAL : phase === 'stretch' ? BREATH_TOTAL + EYE_REST_SECONDS : 0;
  const overallElapsed = timed ? phaseOffset + elapsed : 0;

  // Sub-fases derivadas del tiempo transcurrido (sin estado extra)
  const breathPhaseIdx =
    phase === 'breathing' ? (elapsed % BREATH_SECONDS < 4 ? 0 : elapsed % BREATH_SECONDS < 6 ? 1 : 2) : 2;
  const breathCycle =
    phase === 'breathing' ? Math.min(BREATH_CYCLES, Math.floor(elapsed / BREATH_SECONDS) + 1) : 1;
  const stretchIdx =
    phase === 'stretch' ? Math.min(STRETCHES.length - 1, Math.floor(elapsed / STRETCH_SECONDS)) : 0;
  const stretchRemain = phase === 'stretch' ? STRETCH_SECONDS - (elapsed % STRETCH_SECONDS) : STRETCH_SECONDS;

  // Sub-fase de respiración (texto guía): inhala 4s · sostén 2s · exhala 6s
  const SUB_TOTALS = [4, 2, 6];
  const subElapsed =
    phase === 'breathing'
      ? breathPhaseIdx === 0
        ? elapsed % BREATH_SECONDS
        : breathPhaseIdx === 1
          ? (elapsed % BREATH_SECONDS) - 4
          : (elapsed % BREATH_SECONDS) - 6
      : 0;
  const subRemain =
    phase === 'breathing' ? Math.max(1, Math.ceil(SUB_TOTALS[breathPhaseIdx] - subElapsed)) : 0;
  const RING_LENGTH = 2 * Math.PI * 15;
  const ringProgress = timed ? overallElapsed / PAUSE_TOTAL : 0;
  return (
    <div className="pause-overlay" role="dialog" aria-modal="true" aria-label="Pausa guiada" ref={overlayRef}>
      {/* Niebla baja a la deriva: da profundidad de paisaje */}
      <div className="pause-mist" aria-hidden="true" />

      <div className="pause-brand" aria-label="Pulso Calma, espacio de recuperación">
        <span className="pause-brand-name">Pulso Calma</span>
        <span className="pause-brand-divider" aria-hidden="true">
          ·
        </span>
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
            Un espacio breve dentro de tu turno para respirar, descansar la vista y soltar la tensión
            cervical.
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
            onClick={startPause}
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
            Busca un punto lejano de tu entorno (una ventana, el fondo de la sala) y descansa la mirada allí.
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
