import { SightScene } from './grounding/SightScene';
import { TouchScene } from './grounding/TouchScene';
import { SoundScene } from './grounding/SoundScene';
import { SmellScene } from './grounding/SmellScene';
import { GroundingClosureScene } from './grounding/GroundingClosureScene';
// src/features/agent/components/GroundingVisualMap.jsx
// Lienzo sensorial interactivo en SVG de alta fidelidad para el anclaje somático 5-4-3-2-1
// Diseñado para BPO: ergonomía visual, trazo técnico fino, halos de respiración y subtítulos en vivo

import { Icon } from '../../../core/components/Icon';

export function GroundingVisualMap({
  stepNumber,
  completedAnchorIds = [],
  onToggleAnchor,
  currentSubtitle = '',
  isVoiceEnabled = true
}) {
  const isCompleted = (id) => completedAnchorIds.includes(id);

  const handleKeyDown = (e, anchorId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onToggleAnchor) onToggleAnchor(anchorId);
    }
  };

  return (
    <div
      className="grounding-visual-canvas-wrapper"
      aria-label={`Esquema interactivo del sentido ${stepNumber}`}
    >
      <svg
        viewBox="0 0 540 310"
        className="grounding-visual-svg"
        role="img"
        aria-label={`Guía visual interactiva para el paso ${stepNumber}`}
      >
        <defs>
          {/* Filtros de elevación y auras serenas */}
          <filter id="focal-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#0f766e" floodOpacity="0.4" />
          </filter>
          <radialGradient id="desk-light-grad" cx="20%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#fef08a" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="monitor-screen-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <linearGradient id="water-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#99f6e4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0f766e" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* ============================================================== */}
        {/* PASO 5: VISTA - MAPA ESQUEMÁTICO DEL PUESTO CONTACT CENTER     */}
        {/* ============================================================== */}
        {stepNumber === 5 && (
          <SightScene
            isCompleted={isCompleted}
            onToggleAnchor={onToggleAnchor}
            handleKeyDown={handleKeyDown}
          />
        )}

        {/* ============================================================== */}
        {/* PASO 4: TACTO - MAPA ERGONÓMICO CORPORAL DE DESCARGA FÍSICA    */}
        {/* ============================================================== */}
        {stepNumber === 4 && (
          <TouchScene
            isCompleted={isCompleted}
            onToggleAnchor={onToggleAnchor}
            handleKeyDown={handleKeyDown}
          />
        )}

        {/* ============================================================== */}
        {/* PASO 3: OÍDO - PAISAJE ACÚSTICO Y FRECUENCIAS DE SALA BPO      */}
        {/* ============================================================== */}
        {stepNumber === 3 && (
          <SoundScene
            isCompleted={isCompleted}
            onToggleAnchor={onToggleAnchor}
            handleKeyDown={handleKeyDown}
          />
        )}

        {/* ============================================================== */}
        {/* PASO 2: OLFATO / AIRE - INHALACIÓN Y AROMA FAMILIAR            */}
        {/* ============================================================== */}
        {stepNumber === 2 && (
          <SmellScene
            isCompleted={isCompleted}
            onToggleAnchor={onToggleAnchor}
            handleKeyDown={handleKeyDown}
          />
        )}

        {/* ============================================================== */}
        {/* PASO 1: CONEXIÓN / PRESENTE - EJE Y ANCLAJE OPERATIVO          */}
        {/* ============================================================== */}
        {stepNumber === 1 && (
          <GroundingClosureScene
            isCompleted={isCompleted}
            onToggleAnchor={onToggleAnchor}
            handleKeyDown={handleKeyDown}
          />
        )}
      </svg>

      {/* Barra sutil de subtítulo de apoyo y estado de voz */}
      <div
        className="grounding-live-subtitle-bar"
        role="status"
        aria-live="polite"
        aria-label={
          isVoiceEnabled ? 'Guía por voz y subtítulo en vivo' : 'Voz silenciada. Subtítulo en pantalla'
        }
      >
        <div className="grounding-subtitle-icon-badge" aria-hidden="true">
          <Icon name={isVoiceEnabled ? 'volumeOn' : 'volumeOff'} size={15} />
        </div>
        <p className="grounding-subtitle-text">
          {currentSubtitle ||
            'Toca los puntos numerados en el esquema o presiona las teclas 1 a 5 para anclarte.'}
        </p>
      </div>
    </div>
  );
}
