export function SightScene({ isCompleted, onToggleAnchor, handleKeyDown }) {
  return (
    <g className="svg-step-vista">
      {/* Plano de mesa de trabajo */}
      <path
        d="M 40 280 L 100 95 L 440 95 L 500 280 Z"
        fill="#f8fafc"
        stroke="var(--c-borde-suave)"
        strokeWidth="1.5"
      />
      <line x1="30" y1="280" x2="510" y2="280" stroke="var(--c-borde)" strokeWidth="2.5" />

      {/* v5: Punto de luz o sombra en la superficie */}
      <g
        className={`svg-hotspot ${isCompleted('v5') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('v5')}
        onKeyDown={(e) => handleKeyDown(e, 'v5')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 5: Haz de luz o sombra sobre la mesa"
      >
        <polygon
          points="100,95 180,95 220,250 110,260"
          fill={isCompleted('v5') ? 'rgba(15, 118, 110, 0.18)' : 'url(#desk-light-grad)'}
          stroke={isCompleted('v5') ? '#0f766e' : 'rgba(234, 179, 8, 0.35)'}
          strokeWidth={isCompleted('v5') ? '1.5' : '1'}
          strokeDasharray={isCompleted('v5') ? 'none' : '4 4'}
        />
        <circle
          cx="150"
          cy="180"
          r="16"
          fill={isCompleted('v5') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('v5') ? '#0f766e' : 'var(--c-borde)'}
          strokeWidth="2"
          filter={isCompleted('v5') ? 'url(#focal-glow)' : 'none'}
        />
        <text
          x="150"
          y="184.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('v5') ? '#ffffff' : 'var(--c-texto)'}
        >
          5
        </text>
        <text
          x="150"
          y="210"
          textAnchor="middle"
          fontSize="10"
          fontWeight="600"
          fill={isCompleted('v5') ? '#0f766e' : 'var(--c-texto-suave)'}
        >
          Luz / Sombra
        </text>
      </g>

      {/* v1: Monitor de trabajo BPO */}
      <g
        className={`svg-hotspot ${isCompleted('v1') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('v1')}
        onKeyDown={(e) => handleKeyDown(e, 'v1')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 1: Borde del monitor o pantalla"
      >
        {/* Peana y columna del monitor */}
        <ellipse cx="270" cy="150" rx="35" ry="10" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
        <rect x="264" y="110" width="12" height="38" rx="2" fill="#94a3b8" />

        {/* Marco exterior del monitor */}
        <rect
          x="175"
          y="20"
          width="190"
          height="110"
          rx="5"
          fill="#0f172a"
          stroke={isCompleted('v1') ? '#0f766e' : '#334155'}
          strokeWidth={isCompleted('v1') ? '3' : '2'}
          filter={isCompleted('v1') ? 'url(#focal-glow)' : 'none'}
        />
        {/* Pantalla iluminada */}
        <rect
          x="183"
          y="28"
          width="174"
          height="94"
          rx="3"
          fill={isCompleted('v1') ? '#f0fdfa' : 'url(#monitor-screen-grad)'}
        />
        {/* Aplicativo de contact center simulado */}
        <rect
          x="195"
          y="38"
          width="80"
          height="7"
          rx="1.5"
          fill={isCompleted('v1') ? '#99f6e4' : '#cbd5e1'}
        />
        <line x1="195" y1="55" x2="340" y2="55" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
        <line x1="195" y1="68" x2="320" y2="68" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
        <line x1="195" y1="81" x2="290" y2="81" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />

        {/* Badge interactivo 1 */}
        <circle
          cx="270"
          cy="20"
          r="16"
          fill={isCompleted('v1') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('v1') ? '#0f766e' : 'var(--c-borde)'}
          strokeWidth="2"
          filter={isCompleted('v1') ? 'url(#focal-glow)' : 'none'}
        />
        <text
          x="270"
          y="24.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('v1') ? '#ffffff' : 'var(--c-texto)'}
        >
          1
        </text>
        <text
          x="270"
          y="-3"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('v1') ? '#0f766e' : 'var(--c-texto)'}
        >
          Borde del Monitor
        </text>
      </g>

      {/* v2: Diadema profesional de Contact Center */}
      <g
        className={`svg-hotspot ${isCompleted('v2') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('v2')}
        onKeyDown={(e) => handleKeyDown(e, 'v2')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 2: Diadema telefónica y cable"
      >
        {/* Soporte y diadema curva */}
        <path
          d="M 80 185 C 65 130, 125 125, 125 165"
          fill="none"
          stroke={isCompleted('v2') ? '#0f766e' : '#1e293b'}
          strokeWidth={isCompleted('v2') ? '4' : '2.5'}
          strokeLinecap="round"
        />
        {/* Almohadilla auditiva */}
        <rect x="70" y="175" width="18" height="28" rx="6" fill={isCompleted('v2') ? '#0f766e' : '#334155'} />
        {/* Micrófono flexible */}
        <path
          d="M 80 195 Q 85 220 110 220"
          fill="none"
          stroke={isCompleted('v2') ? '#0f766e' : '#475569'}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="112" cy="220" r="4" fill={isCompleted('v2') ? '#0f766e' : '#0f172a'} />
        {/* Cable espiralado hacia la superficie */}
        <path
          d="M 80 205 Q 60 225 75 255 T 120 260"
          fill="none"
          stroke={isCompleted('v2') ? '#0f766e' : '#94a3b8'}
          strokeWidth={isCompleted('v2') ? '3' : '1.8'}
          strokeDasharray={isCompleted('v2') ? 'none' : '3 3'}
        />

        {/* Badge interactivo 2 */}
        <circle
          cx="80"
          cy="130"
          r="16"
          fill={isCompleted('v2') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('v2') ? '#0f766e' : 'var(--c-borde)'}
          strokeWidth="2"
          filter={isCompleted('v2') ? 'url(#focal-glow)' : 'none'}
        />
        <text
          x="80"
          y="134.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('v2') ? '#ffffff' : 'var(--c-texto)'}
        >
          2
        </text>
        <text
          x="80"
          y="108"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('v2') ? '#0f766e' : 'var(--c-texto)'}
        >
          Diadema / Cable
        </text>
      </g>

      {/* v3: Teclado y barra espaciadora */}
      <g
        className={`svg-hotspot ${isCompleted('v3') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('v3')}
        onKeyDown={(e) => handleKeyDown(e, 'v3')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 3: Teclado y tecla específica"
      >
        <rect
          x="190"
          y="180"
          width="160"
          height="60"
          rx="4"
          fill={isCompleted('v3') ? '#f0fdfa' : '#ffffff'}
          stroke={isCompleted('v3') ? '#0f766e' : 'var(--c-borde)'}
          strokeWidth={isCompleted('v3') ? '2.5' : '1.5'}
        />
        {/* Fila de teclas */}
        <rect
          x="200"
          y="188"
          width="140"
          height="9"
          rx="1.5"
          fill={isCompleted('v3') ? '#ccfbf1' : '#f1f5f9'}
        />
        <rect
          x="200"
          y="201"
          width="140"
          height="9"
          rx="1.5"
          fill={isCompleted('v3') ? '#ccfbf1' : '#f1f5f9'}
        />
        {/* Barra espaciadora prominente */}
        <rect
          x="235"
          y="215"
          width="70"
          height="14"
          rx="2"
          fill={isCompleted('v3') ? '#0f766e' : '#cbd5e1'}
        />

        {/* Badge interactivo 3 */}
        <circle
          cx="270"
          cy="265"
          r="16"
          fill={isCompleted('v3') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('v3') ? '#0f766e' : 'var(--c-borde)'}
          strokeWidth="2"
          filter={isCompleted('v3') ? 'url(#focal-glow)' : 'none'}
        />
        <text
          x="270"
          y="269.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('v3') ? '#ffffff' : 'var(--c-texto)'}
        >
          3
        </text>
        <text
          x="270"
          y="295"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('v3') ? '#0f766e' : 'var(--c-texto)'}
        >
          Tecla del teclado
        </text>
      </g>

      {/* v4: Termo de agua / Vaso ergonómico */}
      <g
        className={`svg-hotspot ${isCompleted('v4') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('v4')}
        onKeyDown={(e) => handleKeyDown(e, 'v4')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 4: Termo o vaso de hidratación"
      >
        {/* Cuerpo del termo */}
        <rect
          x="410"
          y="160"
          width="34"
          height="65"
          rx="6"
          fill={isCompleted('v4') ? '#f0fdfa' : '#ffffff'}
          stroke={isCompleted('v4') ? '#0f766e' : '#64748b'}
          strokeWidth={isCompleted('v4') ? '2.5' : '1.5'}
        />
        {/* Gradiente de agua */}
        <rect
          x="414"
          y="185"
          width="26"
          height="36"
          rx="3"
          fill="url(#water-grad)"
          opacity={isCompleted('v4') ? '0.9' : '0.4'}
        />
        {/* Tapa del termo */}
        <rect
          x="413"
          y="152"
          width="28"
          height="10"
          rx="3"
          fill="#475569"
          stroke={isCompleted('v4') ? '#0f766e' : '#334155'}
          strokeWidth="1"
        />

        {/* Badge interactivo 4 */}
        <circle
          cx="465"
          cy="160"
          r="16"
          fill={isCompleted('v4') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('v4') ? '#0f766e' : 'var(--c-borde)'}
          strokeWidth="2"
          filter={isCompleted('v4') ? 'url(#focal-glow)' : 'none'}
        />
        <text
          x="465"
          y="164.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('v4') ? '#ffffff' : 'var(--c-texto)'}
        >
          4
        </text>
        <text
          x="465"
          y="190"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('v4') ? '#0f766e' : 'var(--c-texto)'}
        >
          Termo / Vaso
        </text>
      </g>
    </g>
  );
}
