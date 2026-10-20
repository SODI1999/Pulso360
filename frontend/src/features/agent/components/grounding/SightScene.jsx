/**
 * Visual SVG scene for Grounding Step 5: Sight (Vista).
 * Renders 5 interactive workstation anchors: monitor edge, headset cable, spacebar, water bottle, and light/shadow.
 *
 * @param {Object} props - Component properties.
 * @param {(id: string) => boolean} props.isCompleted - Checks if a specific anchor ID is currently completed.
 * @param {(id: string) => void} props.onToggleAnchor - Toggles completion state for an anchor.
 * @param {(e: import('react').KeyboardEvent, id: string) => void} props.handleKeyDown - Accessible keyboard activator (Enter/Space).
 * @returns {import('react').JSX.Element} SVG group representing the visual workstation scene.
 */
export function SightScene({ isCompleted, onToggleAnchor, handleKeyDown }) {
  return (
    <g className="svg-step-vista">
      {/* 1. Superficie suave y serena de la mesa de trabajo */}
      <path
        d="M 50 270 Q 50 250 85 105 Q 90 95 110 95 L 430 95 Q 450 95 455 105 Q 490 250 490 270 Q 490 275 470 275 L 70 275 Q 50 275 50 270 Z"
        fill="url(#ambient-desk-grad)"
        stroke="var(--c-borde-suave, #e2e8f0)"
        strokeWidth="1.5"
      />
      {/* Halo ambiental sutil de descanso visual */}
      <ellipse cx="270" cy="185" rx="160" ry="50" fill="url(#calm-halo-grad)" opacity="0.5" className="crisis-pulse-breath" />

      {/* ============================================================== */}
      {/* v5: Punto de luz o sombra en la superficie                     */}
      {/* ============================================================== */}
      <g
        className={`svg-organic-hotspot ${isCompleted('v5') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('v5')}
        onKeyDown={(e) => handleKeyDown(e, 'v5')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 5: Haz de luz o sombra sobre la mesa"
      >
        {/* Aura cálida respirable */}
        <ellipse
          cx="150"
          cy="180"
          rx="42"
          ry="50"
          fill="url(#calm-warm-sun)"
          className="crisis-pulse-breath"
        />
        <circle
          cx="150"
          cy="180"
          r="16"
          fill={isCompleted('v5') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('v5') ? '#0f766e' : 'var(--c-borde, #cbd5e1)'}
          strokeWidth="2"
          filter={isCompleted('v5') ? 'url(#soft-calm-glow)' : 'none'}
        />
        <text
          x="150"
          y="184.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('v5') ? '#ffffff' : 'var(--c-texto, #0f172a)'}
        >
          5
        </text>
        <text
          x="150"
          y="212"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="600"
          fill={isCompleted('v5') ? '#0f766e' : 'var(--c-texto-suave, #64748b)'}
        >
          Luz / Sombra
        </text>
      </g>

      {/* ============================================================== */}
      {/* v1: Monitor de trabajo BPO                                     */}
      {/* ============================================================== */}
      <g
        className={`svg-organic-hotspot ${isCompleted('v1') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('v1')}
        onKeyDown={(e) => handleKeyDown(e, 'v1')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 1: Borde del monitor o pantalla"
      >
        {/* Peana y columna del monitor */}
        <ellipse cx="270" cy="152" rx="34" ry="9" fill="#94a3b8" opacity="0.75" />
        <rect x="265" y="115" width="10" height="38" rx="3" fill="#64748b" />

        {/* Marco exterior del monitor con esquinas redondeadas modernas */}
        <rect
          x="175"
          y="24"
          width="190"
          height="106"
          rx="10"
          fill="#1e293b"
          stroke={isCompleted('v1') ? '#0f766e' : '#334155'}
          strokeWidth={isCompleted('v1') ? '2.5' : '1.5'}
          filter={isCompleted('v1') ? 'url(#soft-calm-glow)' : 'none'}
        />
        {/* Pantalla iluminada con gradiente sereno */}
        <rect
          x="183"
          y="32"
          width="174"
          height="90"
          rx="6"
          fill={isCompleted('v1') ? '#f0fdfa' : 'url(#monitor-screen-grad)'}
        />
        {/* Interfaz serena simulada */}
        <rect
          x="195"
          y="42"
          width="75"
          height="7"
          rx="2"
          fill={isCompleted('v1') ? '#99f6e4' : '#cbd5e1'}
        />
        <line x1="195" y1="58" x2="340" y2="58" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
        <line x1="195" y1="70" x2="310" y2="70" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
        <line x1="195" y1="82" x2="270" y2="82" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />

        {/* Badge interactivo 1 */}
        <circle
          cx="270"
          cy="24"
          r="16"
          fill={isCompleted('v1') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('v1') ? '#0f766e' : 'var(--c-borde, #cbd5e1)'}
          strokeWidth="2"
          filter={isCompleted('v1') ? 'url(#soft-calm-glow)' : 'none'}
        />
        <text
          x="270"
          y="28.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('v1') ? '#ffffff' : 'var(--c-texto, #0f172a)'}
        >
          1
        </text>
        <text
          x="270"
          y="2"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('v1') ? '#0f766e' : 'var(--c-texto, #0f172a)'}
        >
          Borde del Monitor
        </text>
      </g>

      {/* ============================================================== */}
      {/* v2: Diadema profesional de Contact Center                      */}
      {/* ============================================================== */}
      <g
        className={`svg-organic-hotspot ${isCompleted('v2') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('v2')}
        onKeyDown={(e) => handleKeyDown(e, 'v2')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 2: Diadema telefónica y cable"
      >
        {/* Diadema curva orgánica */}
        <path
          d="M 75 190 C 60 120, 130 115, 130 160"
          fill="none"
          stroke={isCompleted('v2') ? '#0f766e' : '#334155'}
          strokeWidth={isCompleted('v2') ? '3.5' : '2.5'}
          strokeLinecap="round"
        />
        {/* Almohadilla auditiva acolchada */}
        <rect
          x="66"
          y="176"
          width="18"
          height="28"
          rx="7"
          fill={isCompleted('v2') ? '#0f766e' : '#475569'}
        />
        {/* Micrófono flexible suave */}
        <path
          d="M 75 196 Q 82 222 108 222"
          fill="none"
          stroke={isCompleted('v2') ? '#0f766e' : '#64748b'}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="110" cy="222" r="3.5" fill={isCompleted('v2') ? '#0f766e' : '#1e293b'} />
        {/* Cable fluido */}
        <path
          d="M 75 204 Q 60 228 78 252 T 125 260"
          fill="none"
          stroke={isCompleted('v2') ? '#0f766e' : '#94a3b8'}
          strokeWidth={isCompleted('v2') ? '2.5' : '1.8'}
          strokeDasharray={isCompleted('v2') ? 'none' : '4 4'}
          strokeLinecap="round"
        />

        {/* Badge interactivo 2 */}
        <circle
          cx="80"
          cy="130"
          r="16"
          fill={isCompleted('v2') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('v2') ? '#0f766e' : 'var(--c-borde, #cbd5e1)'}
          strokeWidth="2"
          filter={isCompleted('v2') ? 'url(#soft-calm-glow)' : 'none'}
        />
        <text
          x="80"
          y="134.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('v2') ? '#ffffff' : 'var(--c-texto, #0f172a)'}
        >
          2
        </text>
        <text
          x="80"
          y="108"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('v2') ? '#0f766e' : 'var(--c-texto, #0f172a)'}
        >
          Diadema / Cable
        </text>
      </g>

      {/* ============================================================== */}
      {/* v3: Teclado y barra espaciadora                                */}
      {/* ============================================================== */}
      <g
        className={`svg-organic-hotspot ${isCompleted('v3') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('v3')}
        onKeyDown={(e) => handleKeyDown(e, 'v3')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 3: Teclado y tecla específica"
      >
        <rect
          x="185"
          y="180"
          width="170"
          height="58"
          rx="8"
          fill={isCompleted('v3') ? '#f0fdfa' : '#ffffff'}
          stroke={isCompleted('v3') ? '#0f766e' : 'var(--c-borde-suave, #e2e8f0)'}
          strokeWidth={isCompleted('v3') ? '2.5' : '1.5'}
        />
        {/* Fila de teclas suaves */}
        <rect
          x="196"
          y="188"
          width="148"
          height="8"
          rx="2"
          fill={isCompleted('v3') ? '#ccfbf1' : '#f1f5f9'}
        />
        <rect
          x="196"
          y="200"
          width="148"
          height="8"
          rx="2"
          fill={isCompleted('v3') ? '#ccfbf1' : '#f1f5f9'}
        />
        {/* Barra espaciadora suave */}
        <rect
          x="235"
          y="214"
          width="70"
          height="14"
          rx="4"
          fill={isCompleted('v3') ? '#0f766e' : '#cbd5e1'}
        />

        {/* Badge interactivo 3 */}
        <circle
          cx="270"
          cy="265"
          r="16"
          fill={isCompleted('v3') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('v3') ? '#0f766e' : 'var(--c-borde, #cbd5e1)'}
          strokeWidth="2"
          filter={isCompleted('v3') ? 'url(#soft-calm-glow)' : 'none'}
        />
        <text
          x="270"
          y="269.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('v3') ? '#ffffff' : 'var(--c-texto, #0f172a)'}
        >
          3
        </text>
        <text
          x="270"
          y="294"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('v3') ? '#0f766e' : 'var(--c-texto, #0f172a)'}
        >
          Tecla del teclado
        </text>
      </g>

      {/* ============================================================== */}
      {/* v4: Termo de agua / Vaso ergonómico                            */}
      {/* ============================================================== */}
      <g
        className={`svg-organic-hotspot ${isCompleted('v4') ? 'is-fused' : ''}`}
        onClick={() => onToggleAnchor && onToggleAnchor('v4')}
        onKeyDown={(e) => handleKeyDown(e, 'v4')}
        role="button"
        tabIndex={0}
        aria-label="Ancla 4: Termo o vaso de hidratación"
      >
        {/* Botella de vidrio con hombros redondeados */}
        <rect
          x="410"
          y="158"
          width="32"
          height="66"
          rx="8"
          fill={isCompleted('v4') ? '#f0fdfa' : '#ffffff'}
          stroke={isCompleted('v4') ? '#0f766e' : '#64748b'}
          strokeWidth={isCompleted('v4') ? '2.5' : '1.5'}
        />
        {/* Nivel de agua con gradiente sereno */}
        <rect
          x="414"
          y="182"
          width="24"
          height="38"
          rx="5"
          fill="url(#water-grad)"
          opacity={isCompleted('v4') ? '0.9' : '0.45'}
        />
        {/* Tapa ergonómica */}
        <rect
          x="413"
          y="150"
          width="26"
          height="9"
          rx="3"
          fill="#475569"
        />

        {/* Badge interactivo 4 */}
        <circle
          cx="465"
          cy="160"
          r="16"
          fill={isCompleted('v4') ? '#0f766e' : '#ffffff'}
          stroke={isCompleted('v4') ? '#0f766e' : 'var(--c-borde, #cbd5e1)'}
          strokeWidth="2"
          filter={isCompleted('v4') ? 'url(#soft-calm-glow)' : 'none'}
        />
        <text
          x="465"
          y="164.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={isCompleted('v4') ? '#ffffff' : 'var(--c-texto, #0f172a)'}
        >
          4
        </text>
        <text
          x="465"
          y="188"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={isCompleted('v4') ? '#0f766e' : 'var(--c-texto, #0f172a)'}
        >
          Termo / Vaso
        </text>
      </g>
    </g>
  );
}
