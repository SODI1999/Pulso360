export function SoundScene({ isCompleted, onToggleAnchor, handleKeyDown }) {
  return (
    <g className="svg-step-oido">
      {/* Centro auditivo */}
      <circle cx="270" cy="155" r="32" fill="#f8fafc" stroke="var(--c-borde)" strokeWidth="2" />
      <path
        d="M 264 138 C 282 138, 288 150, 282 162 C 276 170, 264 170, 264 177"
        fill="none"
        stroke="#0f766e"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="265" cy="181" r="2.5" fill="#0f766e" />

      {/* o1: Ventilación continua de la sala */}
      <g
        className={`svg-hotspot ${isCompleted('o1') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('o1')}
        onKeyDown={(e) => handleKeyDown(e, 'o1')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 1: Ventilación y flujo de aire"
      >
        <path
          d="M 100 50 Q 185 35, 270 50 T 440 50"
          fill="none"
          stroke={isCompleted('o1') ? '#0f766e' : '#94a3b8'}
          strokeWidth={isCompleted('o1') ? '3.5' : '2'}
        />
        <path
          d="M 120 70 Q 195 55, 270 70 T 420 70"
          fill="none"
          stroke={isCompleted('o1') ? '#0f766e' : '#cbd5e1'}
          strokeWidth={isCompleted('o1') ? '3' : '1.5'}
        />

        <circle
          cx="270"
          cy="25"
          r="16"
          fill={isCompleted('o1') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('o1') ? '#0f766e' : 'var(--c-borde)'}
          strokeWidth="2"
          filter={isCompleted('o1') ? 'url(#focal-glow)' : 'none'}
        />
        <text
          x="270"
          y="29.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('o1') ? '#ffffff' : 'var(--c-texto)'}
        >
          1
        </text>
        <text
          x="270"
          y="-3"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('o1') ? '#0f766e' : 'var(--c-texto)'}
        >
          Ventilación continua
        </text>
      </g>

      {/* o2: Tu propia exhalación rítmica */}
      <g
        className={`svg-hotspot ${isCompleted('o2') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('o2')}
        onKeyDown={(e) => handleKeyDown(e, 'o2')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 2: Tu propia respiración"
      >
        <circle
          cx="270"
          cy="155"
          r="60"
          fill="none"
          stroke={isCompleted('o2') ? '#0f766e' : '#cbd5e1'}
          strokeWidth={isCompleted('o2') ? '3' : '1.8'}
          strokeDasharray={isCompleted('o2') ? 'none' : '4 4'}
        />
        <circle
          cx="270"
          cy="155"
          r="88"
          fill="none"
          stroke={isCompleted('o2') ? '#0f766e' : '#e2e8f0'}
          strokeWidth={isCompleted('o2') ? '2.5' : '1.2'}
          strokeDasharray="3 3"
        />

        <circle
          cx="390"
          cy="155"
          r="16"
          fill={isCompleted('o2') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('o2') ? '#0f766e' : 'var(--c-borde)'}
          strokeWidth="2"
          filter={isCompleted('o2') ? 'url(#focal-glow)' : 'none'}
        />
        <text
          x="390"
          y="159.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('o2') ? '#ffffff' : 'var(--c-texto)'}
        >
          2
        </text>
        <text
          x="390"
          y="185"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('o2') ? '#0f766e' : 'var(--c-texto)'}
        >
          Tu propia exhalación
        </text>
      </g>

      {/* o3: Murmullo de la sala / tecleo distante */}
      <g
        className={`svg-hotspot ${isCompleted('o3') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('o3')}
        onKeyDown={(e) => handleKeyDown(e, 'o3')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 3: Sonido distante en la sala"
      >
        <line
          x1="110"
          y1="245"
          x2="110"
          y2="225"
          stroke={isCompleted('o3') ? '#0f766e' : '#94a3b8'}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <line
          x1="120"
          y1="245"
          x2="120"
          y2="215"
          stroke={isCompleted('o3') ? '#0f766e' : '#94a3b8'}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <line
          x1="130"
          y1="245"
          x2="130"
          y2="230"
          stroke={isCompleted('o3') ? '#0f766e' : '#94a3b8'}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <line
          x1="140"
          y1="245"
          x2="140"
          y2="220"
          stroke={isCompleted('o3') ? '#0f766e' : '#94a3b8'}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        <circle
          cx="155"
          cy="265"
          r="16"
          fill={isCompleted('o3') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('o3') ? '#0f766e' : 'var(--c-borde)'}
          strokeWidth="2"
          filter={isCompleted('o3') ? 'url(#focal-glow)' : 'none'}
        />
        <text
          x="155"
          y="269.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('o3') ? '#ffffff' : 'var(--c-texto)'}
        >
          3
        </text>
        <text
          x="155"
          y="295"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('o3') ? '#0f766e' : 'var(--c-texto)'}
        >
          Tecleo / Sala distante
        </text>
      </g>
    </g>
  );
}
