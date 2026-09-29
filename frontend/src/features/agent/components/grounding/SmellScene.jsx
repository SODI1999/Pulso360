export function SmellScene({ isCompleted, onToggleAnchor, handleKeyDown }) {
  return (
    <g className="svg-step-olfato">
      {/* ol1: Inhalación de aire fresco */}
      <g
        className={`svg-hotspot ${isCompleted('ol1') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('ol1')}
        onKeyDown={(e) => handleKeyDown(e, 'ol1')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 1: Inhalación de aire fresco"
      >
        <path
          d="M 160 50 L 160 125 Q 160 155 195 180 M 160 125 Q 160 155 125 180"
          fill="none"
          stroke={isCompleted('ol1') ? '#0f766e' : '#94a3b8'}
          strokeWidth={isCompleted('ol1') ? '4' : '2.5'}
          strokeLinecap="round"
        />
        <path
          d="M 120 180 C 80 195 90 255 130 255 C 155 255 160 210 155 185 Z"
          fill={isCompleted('ol1') ? '#ccfbf1' : '#f1f5f9'}
          stroke={isCompleted('ol1') ? '#0f766e' : '#cbd5e1'}
          strokeWidth="2"
        />
        <path
          d="M 200 180 C 240 195 230 255 190 255 C 165 255 160 210 165 185 Z"
          fill={isCompleted('ol1') ? '#ccfbf1' : '#f1f5f9'}
          stroke={isCompleted('ol1') ? '#0f766e' : '#cbd5e1'}
          strokeWidth="2"
        />

        <line x1="160" y1="30" x2="160" y2="70" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
        <polyline
          points="154,62 160,70 166,62"
          fill="none"
          stroke="#0f766e"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <circle
          cx="160"
          cy="20"
          r="16"
          fill={isCompleted('ol1') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('ol1') ? '#0f766e' : 'var(--c-borde)'}
          strokeWidth="2"
          filter={isCompleted('ol1') ? 'url(#focal-glow)' : 'none'}
        />
        <text
          x="160"
          y="24.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('ol1') ? '#ffffff' : 'var(--c-texto)'}
        >
          1
        </text>
        <text
          x="160"
          y="285"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('ol1') ? '#0f766e' : 'var(--c-texto)'}
        >
          Inhalación de aire fresco
        </text>
      </g>

      {/* ol2: Aroma de bebida (café / té) */}
      <g
        className={`svg-hotspot ${isCompleted('ol2') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('ol2')}
        onKeyDown={(e) => handleKeyDown(e, 'ol2')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 2: Aroma de café o bebida"
      >
        <path
          d="M 350 170 L 356 225 C 356 240, 410 240, 410 225 L 416 170 Z"
          fill={isCompleted('ol2') ? '#f0fdfa' : '#ffffff'}
          stroke={isCompleted('ol2') ? '#0f766e' : '#475569'}
          strokeWidth="2.5"
        />
        <path
          d="M 414 180 C 430 180, 430 215, 412 215"
          fill="none"
          stroke={isCompleted('ol2') ? '#0f766e' : '#475569'}
          strokeWidth="2.5"
        />
        <line x1="335" y1="232" x2="430" y2="232" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />

        <path
          d="M 370 155 Q 365 130 380 105 T 370 75"
          fill="none"
          stroke={isCompleted('ol2') ? '#0f766e' : '#94a3b8'}
          strokeWidth={isCompleted('ol2') ? '3' : '1.8'}
          strokeLinecap="round"
        />
        <path
          d="M 395 155 Q 405 130 395 105 T 400 75"
          fill="none"
          stroke={isCompleted('ol2') ? '#0f766e' : '#94a3b8'}
          strokeWidth={isCompleted('ol2') ? '3' : '1.8'}
          strokeLinecap="round"
        />

        <circle
          cx="385"
          cy="50"
          r="16"
          fill={isCompleted('ol2') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('ol2') ? '#0f766e' : 'var(--c-borde)'}
          strokeWidth="2"
          filter={isCompleted('ol2') ? 'url(#focal-glow)' : 'none'}
        />
        <text
          x="385"
          y="54.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('ol2') ? '#ffffff' : 'var(--c-texto)'}
        >
          2
        </text>
        <text
          x="385"
          y="260"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('ol2') ? '#0f766e' : 'var(--c-texto)'}
        >
          Aroma de café o bebida
        </text>
      </g>
    </g>
  );
}
