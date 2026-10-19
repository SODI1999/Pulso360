export function SmellScene({ isCompleted, onToggleAnchor, handleKeyDown }) {
  return (
    <g className="svg-step-olfato">
      {/* ============================================================== */}
      {/* ol1: Inhalación de aire fresco y expansión torácica           */}
      {/* ============================================================== */}
      <g
        className={`svg-organic-hotspot ${isCompleted('ol1') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('ol1')}
        onKeyDown={(e) => handleKeyDown(e, 'ol1')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 1: Inhalación de aire fresco"
      >
        {/* Halo de inhalación pulmonar */}
        <ellipse
          cx="160"
          cy="180"
          rx="55"
          ry="65"
          fill="url(#calm-halo-grad)"
          className="crisis-pulse-breath"
        />

        {/* Tráquea y ramificación suave */}
        <path
          d="M 160 50 L 160 120 Q 160 150 195 175 M 160 120 Q 160 150 125 175"
          fill="none"
          stroke={isCompleted('ol1') ? '#0f766e' : '#94a3b8'}
          strokeWidth={isCompleted('ol1') ? '3.5' : '2.5'}
          strokeLinecap="round"
        />
        {/* Siluetas pulmonares suaves y acogedoras */}
        <path
          d="M 120 178 C 85 192 90 250 130 250 C 154 250 158 208 154 182 Z"
          fill={isCompleted('ol1') ? '#ccfbf1' : '#f8fafc'}
          stroke={isCompleted('ol1') ? '#0f766e' : '#cbd5e1'}
          strokeWidth="1.8"
        />
        <path
          d="M 200 178 C 235 192 230 250 190 250 C 166 250 162 208 166 182 Z"
          fill={isCompleted('ol1') ? '#ccfbf1' : '#f8fafc'}
          stroke={isCompleted('ol1') ? '#0f766e' : '#cbd5e1'}
          strokeWidth="1.8"
        />

        {/* Flecha sutil de inhalación suave */}
        <line x1="160" y1="32" x2="160" y2="68" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round" />
        <polyline
          points="155,60 160,68 165,60"
          fill="none"
          stroke="#0f766e"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <circle
          cx="160"
          cy="20"
          r="16"
          fill={isCompleted('ol1') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('ol1') ? '#0f766e' : 'var(--c-borde, #cbd5e1)'}
          strokeWidth="2"
          filter={isCompleted('ol1') ? 'url(#soft-calm-glow)' : 'none'}
        />
        <text
          x="160"
          y="24.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('ol1') ? '#ffffff' : 'var(--c-texto, #0f172a)'}
        >
          1
        </text>
        <text
          x="160"
          y="285"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('ol1') ? '#0f766e' : 'var(--c-texto, #0f172a)'}
        >
          Inhalación de aire fresco
        </text>
      </g>

      {/* ============================================================== */}
      {/* ol2: Aroma de bebida (café / té reconfortante)                 */}
      {/* ============================================================== */}
      <g
        className={`svg-organic-hotspot ${isCompleted('ol2') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('ol2')}
        onKeyDown={(e) => handleKeyDown(e, 'ol2')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 2: Aroma de café o bebida"
      >
        {/* Taza de cerámica moderna con asa redondeada */}
        <path
          d="M 352 170 L 358 222 C 358 238, 412 238, 412 222 L 418 170 Z"
          fill={isCompleted('ol2') ? '#f0fdfa' : '#ffffff'}
          stroke={isCompleted('ol2') ? '#0f766e' : '#475569'}
          strokeWidth="2.2"
        />
        {/* Asa suave */}
        <path
          d="M 416 180 C 432 180, 432 212, 414 212"
          fill="none"
          stroke={isCompleted('ol2') ? '#0f766e' : '#475569'}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Platillo base */}
        <line x1="338" y1="230" x2="432" y2="230" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />

        {/* Volutas aromáticas suaves en ascenso */}
        <path
          d="M 372 152 Q 366 128 380 105 T 372 75"
          fill="none"
          stroke={isCompleted('ol2') ? '#0f766e' : '#cbd5e1'}
          strokeWidth={isCompleted('ol2') ? '2.8' : '1.8'}
          strokeLinecap="round"
          className="crisis-pulse-breath"
        />
        <path
          d="M 396 152 Q 406 128 394 105 T 400 75"
          fill="none"
          stroke={isCompleted('ol2') ? '#0f766e' : '#cbd5e1'}
          strokeWidth={isCompleted('ol2') ? '2.8' : '1.8'}
          strokeLinecap="round"
          className="crisis-pulse-breath"
        />

        <circle
          cx="385"
          cy="48"
          r="16"
          fill={isCompleted('ol2') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('ol2') ? '#0f766e' : 'var(--c-borde, #cbd5e1)'}
          strokeWidth="2"
          filter={isCompleted('ol2') ? 'url(#soft-calm-glow)' : 'none'}
        />
        <text
          x="385"
          y="52.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('ol2') ? '#ffffff' : 'var(--c-texto, #0f172a)'}
        >
          2
        </text>
        <text
          x="385"
          y="258"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('ol2') ? '#0f766e' : 'var(--c-texto, #0f172a)'}
        >
          Aroma de café o bebida
        </text>
      </g>
    </g>
  );
}
