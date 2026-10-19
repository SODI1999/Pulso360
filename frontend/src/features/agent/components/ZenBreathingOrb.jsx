import { useState, useEffect } from 'react';
import { Icon } from '../../../core/components/Icon';

/**
 * ZenBreathingOrb: Componente de respiración somática in-situ.
 * Ritmo fisiológico 4-2-6 para desescalada de taquicardia y sobrecarga.
 * Cero tareas, cero clics forzados, solo acompañamiento visual y rítmico.
 */
export function ZenBreathingOrb() {
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSeconds((prev) => (prev + 1) % 12);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Ciclo de 12 segundos: 4s Inhala · 2s Sostén · 6s Exhala
  let phase = 'inhale';
  let phaseText = 'Inhala despacio por la nariz...';
  let counter = 4 - seconds;

  if (seconds >= 4 && seconds < 6) {
    phase = 'hold';
    phaseText = 'Sostén el aire con calma...';
    counter = 6 - seconds;
  } else if (seconds >= 6) {
    phase = 'exhale';
    phaseText = 'Exhala suavemente por la boca...';
    counter = 12 - seconds;
  }

  return (
    <div className="zen-orb-container" role="region" aria-label="Ejercicio de respiración guiada">
      <div className="zen-orb-wrapper">
        {/* Anillos concéntricos de pulso suave */}
        <div className={`zen-orb-pulse-ring zen-orb-pulse-ring--${phase}`} aria-hidden="true" />
        <div className={`zen-orb-core zen-orb-core--${phase}`}>
          <span className="zen-orb-counter" aria-hidden="true">{counter}s</span>
          <span className="zen-orb-phase-tag">{phase === 'inhale' ? 'Inhala' : phase === 'hold' ? 'Sostén' : 'Exhala'}</span>
        </div>
      </div>

      <div className="zen-orb-guide">
        <p className="zen-orb-instructions" role="status" aria-live="polite">
          {phaseText}
        </p>
        <span className="zen-orb-subguide">
          Ritmo 4 · 2 · 6 para desacelerar las pulsaciones tras una interacción intensa.
        </span>
      </div>

      <div className="zen-orb-actions">
        <button
          type="button"
          className="btn-zen-toggle"
          onClick={() => setIsPlaying((prev) => !prev)}
          aria-label={isPlaying ? 'Pausar ritmo de respiración' : 'Reanudar ritmo de respiración'}
        >
          <Icon name={isPlaying ? 'Pause' : 'Play'} size={15} />
          <span>{isPlaying ? 'Pausar compás' : 'Reanudar'}</span>
        </button>
      </div>
    </div>
  );
}
