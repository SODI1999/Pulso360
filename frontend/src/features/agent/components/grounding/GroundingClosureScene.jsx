/**
 * Visual SVG scene for Grounding Step 1: Presence & Closure (Conexión / Presencia).
 * Renders the final cognitive anchoring seal affirming workstation safety and operational pacing.
 *
 * @param {Object} props - Component properties.
 * @param {(id: string) => boolean} props.isCompleted - Checks if anchor 'c1' is completed.
 * @param {(id: string) => void} props.onToggleAnchor - Toggles completion state for anchor 'c1'.
 * @param {(e: import('react').KeyboardEvent, id: string) => void} props.handleKeyDown - Accessible keyboard activator (Enter/Space).
 * @returns {import('react').JSX.Element} SVG group representing closure affirmation seal.
 */
export function GroundingClosureScene({ isCompleted, onToggleAnchor, handleKeyDown }) {
  return (
    <g className="svg-step-conexion">
      <g
        className={`svg-organic-hotspot ${isCompleted('c1') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('c1')}
        onKeyDown={(e) => handleKeyDown(e, 'c1')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 1: Sello de presencia y retorno sereno"
      >
        {/* Halo expansivo suave de presencia */}
        <circle
          cx="270"
          cy="145"
          r="108"
          fill="none"
          stroke={isCompleted('c1') ? '#0f766e' : '#e2e8f0'}
          strokeWidth="1.8"
          strokeDasharray="5 5"
          className="crisis-pulse-breath"
        />
        <circle
          cx="270"
          cy="145"
          r="76"
          fill={isCompleted('c1') ? '#f0fdfa' : '#f8fafc'}
          stroke={isCompleted('c1') ? '#0f766e' : 'var(--c-borde-suave, #e2e8f0)'}
          strokeWidth="2.5"
        />
        <circle
          cx="270"
          cy="145"
          r="40"
          fill={isCompleted('c1') ? '#ccfbf1' : '#ffffff'}
          stroke={isCompleted('c1') ? '#0f766e' : 'var(--c-borde, #cbd5e1)'}
          strokeWidth="2"
        />

        {/* Sello de anclaje firme y sereno */}
        <line x1="270" y1="92" x2="270" y2="185" stroke="#0f766e" strokeWidth="4" strokeLinecap="round" />
        <circle cx="270" cy="92" r="9" fill="none" stroke="#0f766e" strokeWidth="3" />
        <line x1="252" y1="116" x2="288" y2="116" stroke="#0f766e" strokeWidth="3.5" strokeLinecap="round" />
        <path
          d="M 236 165 C 236 198, 304 198, 304 165"
          fill="none"
          stroke="#0f766e"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Badge interactivo */}
        <circle
          cx="270"
          cy="34"
          r="16"
          fill={isCompleted('c1') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('c1') ? '#0f766e' : 'var(--c-borde, #cbd5e1)'}
          strokeWidth="2"
          filter={isCompleted('c1') ? 'url(#soft-calm-glow)' : 'none'}
        />
        <text
          x="270"
          y="38.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('c1') ? '#ffffff' : 'var(--c-texto, #0f172a)'}
        >
          1
        </text>

        <text
          x="270"
          y="275"
          textAnchor="middle"
          fontSize="13.5"
          fontWeight="700"
          fill={isCompleted('c1') ? '#0f766e' : 'var(--c-texto, #0f172a)'}
        >
          «Puedo detener este ejercicio y buscar apoyo.»
        </text>
      </g>
    </g>
  );
}
