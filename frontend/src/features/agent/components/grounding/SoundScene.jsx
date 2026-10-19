export function SoundScene({ isCompleted, onToggleAnchor, handleKeyDown }) {
  return (
    <g className="svg-step-oido">
      {/* 1. Centro auditivo sereno con auras acústicas concéntricas */}
      <circle cx="270" cy="155" r="32" fill="#f8fafc" stroke="var(--c-borde-suave, #e2e8f0)" strokeWidth="1.5" />
      {/* Icono suave de oído y percepción serena */}
      <path
        d="M 264 138 C 282 138, 288 150, 282 162 C 276 170, 264 170, 264 177"
        fill="none"
        stroke="#0f766e"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="265" cy="181" r="2.5" fill="#0f766e" />

      {/* ============================================================== */}
      {/* o1: Ventilación continua de la sala                            */}
      {/* ============================================================== */}
      <g
        className={`svg-organic-hotspot ${isCompleted('o1') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('o1')}
        onKeyDown={(e) => handleKeyDown(e, 'o1')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 1: Ventilación y flujo de aire"
      >
        {/* Ondas suaves de brisa ambiental */}
        <path
          d="M 90 52 C 170 32, 270 56, 450 48"
          fill="none"
          stroke={isCompleted('o1') ? '#0f766e' : '#94a3b8'}
          strokeWidth={isCompleted('o1') ? '3.5' : '2'}
          strokeLinecap="round"
          className="crisis-pulse-breath"
        />
        <path
          d="M 120 70 C 190 52, 270 74, 420 68"
          fill="none"
          stroke={isCompleted('o1') ? '#0f766e' : '#cbd5e1'}
          strokeWidth={isCompleted('o1') ? '2.5' : '1.5'}
          strokeLinecap="round"
        />

        <circle
          cx="270"
          cy="25"
          r="16"
          fill={isCompleted('o1') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('o1') ? '#0f766e' : 'var(--c-borde, #cbd5e1)'}
          strokeWidth="2"
          filter={isCompleted('o1') ? 'url(#soft-calm-glow)' : 'none'}
        />
        <text
          x="270"
          y="29.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('o1') ? '#ffffff' : 'var(--c-texto, #0f172a)'}
        >
          1
        </text>
        <text
          x="270"
          y="2"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('o1') ? '#0f766e' : 'var(--c-texto, #0f172a)'}
        >
          Ventilación continua
        </text>
      </g>

      {/* ============================================================== */}
      {/* o2: Tu propia exhalación rítmica                              */}
      {/* ============================================================== */}
      <g
        className={`svg-organic-hotspot ${isCompleted('o2') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('o2')}
        onKeyDown={(e) => handleKeyDown(e, 'o2')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 2: Tu propia respiración"
      >
        {/* Ondas concéntricas de pulso exhalatorio */}
        <circle
          cx="270"
          cy="155"
          r="62"
          fill="none"
          stroke={isCompleted('o2') ? '#0f766e' : '#99f6e4'}
          strokeWidth={isCompleted('o2') ? '3' : '1.8'}
          strokeDasharray={isCompleted('o2') ? 'none' : '4 4'}
          className="crisis-pulse-breath"
        />
        <circle
          cx="270"
          cy="155"
          r="92"
          fill="none"
          stroke={isCompleted('o2') ? '#0f766e' : '#e2e8f0'}
          strokeWidth={isCompleted('o2') ? '2.5' : '1.2'}
          strokeDasharray="4 4"
        />

        <circle
          cx="390"
          cy="155"
          r="16"
          fill={isCompleted('o2') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('o2') ? '#0f766e' : 'var(--c-borde, #cbd5e1)'}
          strokeWidth="2"
          filter={isCompleted('o2') ? 'url(#soft-calm-glow)' : 'none'}
        />
        <text
          x="390"
          y="159.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('o2') ? '#ffffff' : 'var(--c-texto, #0f172a)'}
        >
          2
        </text>
        <text
          x="390"
          y="185"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('o2') ? '#0f766e' : 'var(--c-texto, #0f172a)'}
        >
          Tu propia exhalación
        </text>
      </g>

      {/* ============================================================== */}
      {/* o3: Murmullo de la sala / tecleo distante                     */}
      {/* ============================================================== */}
      <g
        className={`svg-organic-hotspot ${isCompleted('o3') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('o3')}
        onKeyDown={(e) => handleKeyDown(e, 'o3')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 3: Sonido distante en la sala"
      >
        {/* Barras de ecualizador sutil y distante */}
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
          y2="228"
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
          stroke={isCompleted('o3') ? '#0f766e' : 'var(--c-borde, #cbd5e1)'}
          strokeWidth="2"
          filter={isCompleted('o3') ? 'url(#soft-calm-glow)' : 'none'}
        />
        <text
          x="155"
          y="269.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('o3') ? '#ffffff' : 'var(--c-texto, #0f172a)'}
        >
          3
        </text>
        <text
          x="155"
          y="294"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('o3') ? '#0f766e' : 'var(--c-texto, #0f172a)'}
        >
          Tecleo / Sala distante
        </text>
      </g>
    </g>
  );
}
