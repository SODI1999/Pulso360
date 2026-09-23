export function GroundingClosureScene({ isCompleted, onToggleAnchor, handleKeyDown }) {
  return (
    <g className="svg-step-conexion">
      <g
        className={`svg-hotspot ${isCompleted('c1') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('c1')}
        onKeyDown={(e) => handleKeyDown(e, 'c1')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 1: Sello de presencia y retorno sereno"
      >
        <circle
          cx="270"
          cy="145"
          r="105"
          fill="none"
          stroke={isCompleted('c1') ? '#0f766e' : '#e2e8f0'}
          strokeWidth="1.8"
          strokeDasharray="5 5"
        />
        <circle
          cx="270"
          cy="145"
          r="75"
          fill={isCompleted('c1') ? '#f0fdfa' : '#f8fafc'}
          stroke={isCompleted('c1') ? '#0f766e' : 'var(--c-borde)'}
          strokeWidth="2.5"
        />
        <circle
          cx="270"
          cy="145"
          r="38"
          fill={isCompleted('c1') ? '#ccfbf1' : '#ffffff'}
          stroke={isCompleted('c1') ? '#0f766e' : 'var(--c-borde)'}
          strokeWidth="2"
        />

        {/* Ancla marina de estabilidad */}
        <line x1="270" y1="90" x2="270" y2="185" stroke="#0f766e" strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="270" cy="90" r="10" fill="none" stroke="#0f766e" strokeWidth="3.5" />
        <line x1="250" y1="115" x2="290" y2="115" stroke="#0f766e" strokeWidth="4" strokeLinecap="round" />
        <path
          d="M 235 165 C 235 200, 305 200, 305 165"
          fill="none"
          stroke="#0f766e"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        <circle
          cx="270"
          cy="35"
          r="16"
          fill={isCompleted('c1') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('c1') ? '#0f766e' : 'var(--c-borde)'}
          strokeWidth="2"
          filter={isCompleted('c1') ? 'url(#focal-glow)' : 'none'}
        />
        <text
          x="270"
          y="39.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('c1') ? '#ffffff' : 'var(--c-texto)'}
        >
          1
        </text>

        <text
          x="270"
          y="275"
          textAnchor="middle"
          fontSize="13"
          fontWeight="700"
          fill={isCompleted('c1') ? '#0f766e' : 'var(--c-texto)'}
        >
          «Mi puesto es un espacio seguro. Yo conduzco mi ritmo.»
        </text>
      </g>
    </g>
  );
}
