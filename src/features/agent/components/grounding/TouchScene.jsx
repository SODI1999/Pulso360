export function TouchScene({ isCompleted, onToggleAnchor, handleKeyDown }) {
  return (
    <g className="svg-step-tacto">
      {/* Piso y referencias */}
      <line
        x1="70"
        y1="280"
        x2="470"
        y2="280"
        stroke="var(--c-borde)"
        strokeWidth="2"
        strokeDasharray="5 5"
      />
      <line x1="310" y1="165" x2="480" y2="165" stroke="var(--c-borde)" strokeWidth="3" />
      <line x1="350" y1="165" x2="350" y2="280" stroke="var(--c-borde-suave)" strokeWidth="2" />

      {/* Silla ergonómica de oficina con apoyo */}
      <path
        d="M 160 275 L 210 275 M 185 275 L 185 195"
        stroke="#94a3b8"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <rect x="145" y="185" width="85" height="15" rx="5" fill="#334155" />

      {/* t3: Respaldo lumbar ergonómico */}
      <g
        className={`svg-hotspot ${isCompleted('t3') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('t3')}
        onKeyDown={(e) => handleKeyDown(e, 't3')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 3: Soporte lumbar contra el respaldo"
      >
        <path
          d="M 145 185 C 130 150, 130 95, 148 65"
          fill="none"
          stroke={isCompleted('t3') ? '#0f766e' : '#475569'}
          strokeWidth={isCompleted('t3') ? '7' : '4.5'}
          strokeLinecap="round"
        />
        {/* Halo lumbar */}
        <circle
          cx="95"
          cy="140"
          r="16"
          fill={isCompleted('t3') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('t3') ? '#0f766e' : 'var(--c-borde)'}
          strokeWidth="2"
          filter={isCompleted('t3') ? 'url(#focal-glow)' : 'none'}
        />
        <text
          x="95"
          y="144.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('t3') ? '#ffffff' : 'var(--c-texto)'}
        >
          3
        </text>
        <text
          x="95"
          y="170"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('t3') ? '#0f766e' : 'var(--c-texto)'}
        >
          Soporte Lumbar
        </text>
      </g>

      {/* Silueta corporal en postura de descarga */}
      {/* Cabeza */}
      <circle cx="205" cy="40" r="19" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />

      {/* t4: Mandíbula y Hombros relajados */}
      <g
        className={`svg-hotspot ${isCompleted('t4') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('t4')}
        onKeyDown={(e) => handleKeyDown(e, 't4')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 4: Mandíbula suelta y hombros descendidos"
      >
        <path
          d="M 175 75 Q 205 70 230 75"
          fill="none"
          stroke={isCompleted('t4') ? '#0f766e' : '#1e293b'}
          strokeWidth={isCompleted('t4') ? '5' : '3'}
          strokeLinecap="round"
        />
        {/* Flechas suaves de descenso */}
        <path
          d="M 175 83 L 175 95 M 170 90 L 175 95 L 180 90"
          stroke={isCompleted('t4') ? '#0f766e' : '#94a3b8'}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 230 83 L 230 95 M 225 90 L 230 95 L 235 90"
          stroke={isCompleted('t4') ? '#0f766e' : '#94a3b8'}
          strokeWidth="2"
          strokeLinecap="round"
        />

        <circle
          cx="280"
          cy="50"
          r="16"
          fill={isCompleted('t4') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('t4') ? '#0f766e' : 'var(--c-borde)'}
          strokeWidth="2"
          filter={isCompleted('t4') ? 'url(#focal-glow)' : 'none'}
        />
        <text
          x="280"
          y="54.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('t4') ? '#ffffff' : 'var(--c-texto)'}
        >
          4
        </text>
        <text
          x="280"
          y="78"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('t4') ? '#0f766e' : 'var(--c-texto)'}
        >
          Hombros / Mandíbula
        </text>
      </g>

      {/* Tronco y muslos */}
      <path d="M 198 72 L 180 182" stroke="#334155" strokeWidth="20" strokeLinecap="round" />
      <path d="M 180 182 L 255 182" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />

      {/* Brazos hacia la mesa */}
      <path
        d="M 200 85 L 245 135 L 330 160"
        fill="none"
        stroke="#475569"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* t2: Palmas de las manos firmes en mesa */}
      <g
        className={`svg-hotspot ${isCompleted('t2') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('t2')}
        onKeyDown={(e) => handleKeyDown(e, 't2')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 2: Palmas firmes sobre el escritorio"
      >
        <ellipse cx="335" cy="160" rx="14" ry="7" fill={isCompleted('t2') ? '#0f766e' : '#64748b'} />
        <circle
          cx="335"
          cy="160"
          r="20"
          fill="none"
          stroke={isCompleted('t2') ? '#0f766e' : 'var(--c-borde)'}
          strokeWidth="2"
          strokeDasharray={isCompleted('t2') ? 'none' : '3 3'}
        />

        <circle
          cx="385"
          cy="135"
          r="16"
          fill={isCompleted('t2') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('t2') ? '#0f766e' : 'var(--c-borde)'}
          strokeWidth="2"
          filter={isCompleted('t2') ? 'url(#focal-glow)' : 'none'}
        />
        <text
          x="385"
          y="139.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('t2') ? '#ffffff' : 'var(--c-texto)'}
        >
          2
        </text>
        <text
          x="385"
          y="115"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('t2') ? '#0f766e' : 'var(--c-texto)'}
        >
          Palmas en mesa
        </text>
      </g>

      {/* Pantorrillas a 90° */}
      <path d="M 255 182 L 255 270" stroke="#1e293b" strokeWidth="15" strokeLinecap="round" />

      {/* t1: Pies apoyados firmes en el suelo */}
      <g
        className={`svg-hotspot ${isCompleted('t1') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('t1')}
        onKeyDown={(e) => handleKeyDown(e, 't1')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 1: Pies planos en el suelo"
      >
        <path
          d="M 245 270 L 290 270 C 295 270, 296 278, 290 280 L 243 280 Z"
          fill={isCompleted('t1') ? '#0f766e' : '#0f172a'}
        />
        <line
          x1="230"
          y1="282"
          x2="305"
          y2="282"
          stroke={isCompleted('t1') ? '#0f766e' : '#64748b'}
          strokeWidth="3.5"
        />

        <circle
          cx="335"
          cy="265"
          r="16"
          fill={isCompleted('t1') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('t1') ? '#0f766e' : 'var(--c-borde)'}
          strokeWidth="2"
          filter={isCompleted('t1') ? 'url(#focal-glow)' : 'none'}
        />
        <text
          x="335"
          y="269.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('t1') ? '#ffffff' : 'var(--c-texto)'}
        >
          1
        </text>
        <text
          x="335"
          y="295"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('t1') ? '#0f766e' : 'var(--c-texto)'}
        >
          Pies en el piso
        </text>
      </g>
    </g>
  );
}
