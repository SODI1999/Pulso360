export function TouchScene({ isCompleted, onToggleAnchor, handleKeyDown }) {
  return (
    <g className="svg-step-tacto">
      {/* 1. Línea base de apoyo de piso serena */}
      <line
        x1="70"
        y1="275"
        x2="470"
        y2="275"
        stroke="var(--c-borde-suave, #e2e8f0)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Superficie de apoyo de escritorio */}
      <line
        x1="300"
        y1="165"
        x2="480"
        y2="165"
        stroke="var(--c-borde-suave, #e2e8f0)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* 2. Silla ergonómica con curvas orgánicas y acogedoras */}
      <path
        d="M 160 270 L 210 270 M 185 270 L 185 195"
        stroke="#94a3b8"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Asiento acolchado suave */}
      <rect x="145" y="185" width="85" height="15" rx="7" fill="#334155" />

      {/* ============================================================== */}
      {/* t3: Respaldo lumbar ergonómico                                 */}
      {/* ============================================================== */}
      <g
        className={`svg-organic-hotspot ${isCompleted('t3') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('t3')}
        onKeyDown={(e) => handleKeyDown(e, 't3')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 3: Soporte lumbar contra el respaldo"
      >
        <path
          d="M 148 185 C 132 152, 132 98, 150 68"
          fill="none"
          stroke={isCompleted('t3') ? '#0f766e' : '#64748b'}
          strokeWidth={isCompleted('t3') ? '6.5' : '4.5'}
          strokeLinecap="round"
        />
        {/* Halo lumbar respirable */}
        <ellipse
          cx="120"
          cy="140"
          rx="25"
          ry="30"
          fill="url(#calm-halo-grad)"
          className="crisis-pulse-breath"
        />
        <circle
          cx="95"
          cy="140"
          r="16"
          fill={isCompleted('t3') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('t3') ? '#0f766e' : 'var(--c-borde, #cbd5e1)'}
          strokeWidth="2"
          filter={isCompleted('t3') ? 'url(#soft-calm-glow)' : 'none'}
        />
        <text
          x="95"
          y="144.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('t3') ? '#ffffff' : 'var(--c-texto, #0f172a)'}
        >
          3
        </text>
        <text
          x="95"
          y="170"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('t3') ? '#0f766e' : 'var(--c-texto, #0f172a)'}
        >
          Soporte Lumbar
        </text>
      </g>

      {/* 3. Silueta corporal estilizada y serena en postura de descarga */}
      {/* Cabeza */}
      <circle cx="205" cy="40" r="18" fill="#f1f5f9" stroke="#64748b" strokeWidth="2" />

      {/* ============================================================== */}
      {/* t4: Mandíbula y Hombros relajados                             */}
      {/* ============================================================== */}
      <g
        className={`svg-organic-hotspot ${isCompleted('t4') ? 'is-fused' : ''}`}
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
          strokeWidth={isCompleted('t4') ? '4.5' : '3'}
          strokeLinecap="round"
        />
        {/* Flechas suaves y sutiles de descarga de tensión */}
        <path
          d="M 175 83 L 175 94 M 171 90 L 175 94 L 179 90"
          stroke={isCompleted('t4') ? '#0f766e' : '#94a3b8'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M 230 83 L 230 94 M 226 90 L 230 94 L 234 90"
          stroke={isCompleted('t4') ? '#0f766e' : '#94a3b8'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Aura de hombros suaves */}
        <circle
          cx="280"
          cy="50"
          r="16"
          fill={isCompleted('t4') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('t4') ? '#0f766e' : 'var(--c-borde, #cbd5e1)'}
          strokeWidth="2"
          filter={isCompleted('t4') ? 'url(#soft-calm-glow)' : 'none'}
        />
        <text
          x="280"
          y="54.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('t4') ? '#ffffff' : 'var(--c-texto, #0f172a)'}
        >
          4
        </text>
        <text
          x="280"
          y="78"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('t4') ? '#0f766e' : 'var(--c-texto, #0f172a)'}
        >
          Hombros / Mandíbula
        </text>
      </g>

      {/* Tronco y muslos con silueta suave */}
      <path d="M 200 70 L 182 182" stroke="#475569" strokeWidth="16" strokeLinecap="round" />
      <path d="M 182 182 L 255 182" stroke="#334155" strokeWidth="14" strokeLinecap="round" />

      {/* Brazo relajado hacia la mesa */}
      <path
        d="M 202 85 Q 240 130 330 160"
        fill="none"
        stroke="#64748b"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* ============================================================== */}
      {/* t2: Palmas de las manos firmes en mesa                         */}
      {/* ============================================================== */}
      <g
        className={`svg-organic-hotspot ${isCompleted('t2') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('t2')}
        onKeyDown={(e) => handleKeyDown(e, 't2')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 2: Palmas firmes sobre el escritorio"
      >
        <ellipse cx="335" cy="160" rx="14" ry="7" fill={isCompleted('t2') ? '#0f766e' : '#64748b'} />
        {/* Onda expansiva de contacto firme */}
        <circle
          cx="335"
          cy="160"
          r="18"
          fill="none"
          stroke={isCompleted('t2') ? '#0f766e' : 'var(--c-borde, #cbd5e1)'}
          strokeWidth="1.8"
          strokeDasharray={isCompleted('t2') ? 'none' : '3 3'}
        />

        <circle
          cx="385"
          cy="135"
          r="16"
          fill={isCompleted('t2') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('t2') ? '#0f766e' : 'var(--c-borde, #cbd5e1)'}
          strokeWidth="2"
          filter={isCompleted('t2') ? 'url(#soft-calm-glow)' : 'none'}
        />
        <text
          x="385"
          y="139.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('t2') ? '#ffffff' : 'var(--c-texto, #0f172a)'}
        >
          2
        </text>
        <text
          x="385"
          y="114"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('t2') ? '#0f766e' : 'var(--c-texto, #0f172a)'}
        >
          Palmas en mesa
        </text>
      </g>

      {/* Pantorrillas en ángulo ergonómico relajado */}
      <path d="M 255 182 L 255 268" stroke="#334155" strokeWidth="13" strokeLinecap="round" />

      {/* ============================================================== */}
      {/* t1: Pies apoyados firmes en el suelo                           */}
      {/* ============================================================== */}
      <g
        className={`svg-organic-hotspot ${isCompleted('t1') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('t1')}
        onKeyDown={(e) => handleKeyDown(e, 't1')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 1: Pies planos en el suelo"
      >
        {/* Pie apoyado con zapato cómodo */}
        <path
          d="M 245 268 L 292 268 C 298 268, 298 276, 290 277 L 243 277 Z"
          fill={isCompleted('t1') ? '#0f766e' : '#1e293b'}
        />
        <line
          x1="230"
          y1="279"
          x2="305"
          y2="279"
          stroke={isCompleted('t1') ? '#0f766e' : '#64748b'}
          strokeWidth="3"
          strokeLinecap="round"
        />

        <circle
          cx="335"
          cy="265"
          r="16"
          fill={isCompleted('t1') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('t1') ? '#0f766e' : 'var(--c-borde, #cbd5e1)'}
          strokeWidth="2"
          filter={isCompleted('t1') ? 'url(#soft-calm-glow)' : 'none'}
        />
        <text
          x="335"
          y="269.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('t1') ? '#ffffff' : 'var(--c-texto, #0f172a)'}
        >
          1
        </text>
        <text
          x="335"
          y="294"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('t1') ? '#0f766e' : 'var(--c-texto, #0f172a)'}
        >
          Pies en el piso
        </text>
      </g>
    </g>
  );
}
