// src/features/agent/components/GroundingVisualMap.jsx
// Lienzo sensorial interactivo en SVG de alta fidelidad para el anclaje somático 5-4-3-2-1
// Diseñado para BPO: ergonomía visual, trazo técnico fino, halos de respiración y subtítulos en vivo

import { Icon } from '../../../core/components/Icon';

export function GroundingVisualMap({
    stepNumber,
    completedAnchorIds = [],
    onToggleAnchor,
    currentSubtitle = '',
    isVoiceEnabled = true
}) {
    const isCompleted = (id) => completedAnchorIds.includes(id);

    const handleKeyDown = (e, anchorId) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (onToggleAnchor) onToggleAnchor(anchorId);
        }
    };

    return (
        <div className="grounding-visual-canvas-wrapper" aria-label={`Esquema interactivo del sentido ${stepNumber}`}>
            <svg
                viewBox="0 0 540 310"
                className="grounding-visual-svg"
                role="img"
                aria-label={`Guía visual interactiva para el paso ${stepNumber}`}
            >
                <defs>
                    {/* Filtros de elevación y auras serenas */}
                    <filter id="focal-glow" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#0f766e" floodOpacity="0.4" />
                    </filter>
                    <radialGradient id="desk-light-grad" cx="20%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#fef08a" stopOpacity="0.35" />
                        <stop offset="60%" stopColor="#fef08a" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="monitor-screen-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f8fafc" />
                        <stop offset="100%" stopColor="#e2e8f0" />
                    </linearGradient>
                    <linearGradient id="water-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#99f6e4" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#0f766e" stopOpacity="0.9" />
                    </linearGradient>
                </defs>

                {/* ============================================================== */}
                {/* PASO 5: VISTA - MAPA ESQUEMÁTICO DEL PUESTO CONTACT CENTER     */}
                {/* ============================================================== */}
                {stepNumber === 5 && (
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
                            <circle cx="150" cy="180" r="16" fill={isCompleted('v5') ? '#0f766e' : '#ffffff'} stroke={isCompleted('v5') ? '#0f766e' : 'var(--c-borde)'} strokeWidth="2" filter={isCompleted('v5') ? 'url(#focal-glow)' : 'none'} />
                            <text x="150" y="184.5" textAnchor="middle" fontSize="11" fontWeight="700" fill={isCompleted('v5') ? '#ffffff' : 'var(--c-texto)'}>5</text>
                            <text x="150" y="210" textAnchor="middle" fontSize="10" fontWeight="600" fill={isCompleted('v5') ? '#0f766e' : 'var(--c-texto-suave)'}>Luz / Sombra</text>
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
                            <rect x="195" y="38" width="80" height="7" rx="1.5" fill={isCompleted('v1') ? '#99f6e4' : '#cbd5e1'} />
                            <line x1="195" y1="55" x2="340" y2="55" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
                            <line x1="195" y1="68" x2="320" y2="68" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
                            <line x1="195" y1="81" x2="290" y2="81" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />

                            {/* Badge interactivo 1 */}
                            <circle cx="270" cy="20" r="16" fill={isCompleted('v1') ? '#0f766e' : '#ffffff'} stroke={isCompleted('v1') ? '#0f766e' : 'var(--c-borde)'} strokeWidth="2" filter={isCompleted('v1') ? 'url(#focal-glow)' : 'none'} />
                            <text x="270" y="24.5" textAnchor="middle" fontSize="11" fontWeight="700" fill={isCompleted('v1') ? '#ffffff' : 'var(--c-texto)'}>1</text>
                            <text x="270" y="-3" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={isCompleted('v1') ? '#0f766e' : 'var(--c-texto)'}>Borde del Monitor</text>
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
                            <path d="M 80 195 Q 85 220 110 220" fill="none" stroke={isCompleted('v2') ? '#0f766e' : '#475569'} strokeWidth="2.5" strokeLinecap="round" />
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
                            <circle cx="80" cy="130" r="16" fill={isCompleted('v2') ? '#0f766e' : '#ffffff'} stroke={isCompleted('v2') ? '#0f766e' : 'var(--c-borde)'} strokeWidth="2" filter={isCompleted('v2') ? 'url(#focal-glow)' : 'none'} />
                            <text x="80" y="134.5" textAnchor="middle" fontSize="11" fontWeight="700" fill={isCompleted('v2') ? '#ffffff' : 'var(--c-texto)'}>2</text>
                            <text x="80" y="108" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={isCompleted('v2') ? '#0f766e' : 'var(--c-texto)'}>Diadema / Cable</text>
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
                            <rect x="200" y="188" width="140" height="9" rx="1.5" fill={isCompleted('v3') ? '#ccfbf1' : '#f1f5f9'} />
                            <rect x="200" y="201" width="140" height="9" rx="1.5" fill={isCompleted('v3') ? '#ccfbf1' : '#f1f5f9'} />
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
                            <circle cx="270" cy="265" r="16" fill={isCompleted('v3') ? '#0f766e' : '#ffffff'} stroke={isCompleted('v3') ? '#0f766e' : 'var(--c-borde)'} strokeWidth="2" filter={isCompleted('v3') ? 'url(#focal-glow)' : 'none'} />
                            <text x="270" y="269.5" textAnchor="middle" fontSize="11" fontWeight="700" fill={isCompleted('v3') ? '#ffffff' : 'var(--c-texto)'}>3</text>
                            <text x="270" y="295" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={isCompleted('v3') ? '#0f766e' : 'var(--c-texto)'}>Tecla del teclado</text>
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
                            <rect x="414" y="185" width="26" height="36" rx="3" fill="url(#water-grad)" opacity={isCompleted('v4') ? '0.9' : '0.4'} />
                            {/* Tapa del termo */}
                            <rect x="413" y="152" width="28" height="10" rx="3" fill="#475569" stroke={isCompleted('v4') ? '#0f766e' : '#334155'} strokeWidth="1" />

                            {/* Badge interactivo 4 */}
                            <circle cx="465" cy="160" r="16" fill={isCompleted('v4') ? '#0f766e' : '#ffffff'} stroke={isCompleted('v4') ? '#0f766e' : 'var(--c-borde)'} strokeWidth="2" filter={isCompleted('v4') ? 'url(#focal-glow)' : 'none'} />
                            <text x="465" y="164.5" textAnchor="middle" fontSize="11" fontWeight="700" fill={isCompleted('v4') ? '#ffffff' : 'var(--c-texto)'}>4</text>
                            <text x="465" y="190" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={isCompleted('v4') ? '#0f766e' : 'var(--c-texto)'}>Termo / Vaso</text>
                        </g>
                    </g>
                )}

                {/* ============================================================== */}
                {/* PASO 4: TACTO - MAPA ERGONÓMICO CORPORAL DE DESCARGA FÍSICA    */}
                {/* ============================================================== */}
                {stepNumber === 4 && (
                    <g className="svg-step-tacto">
                        {/* Piso y referencias */}
                        <line x1="70" y1="280" x2="470" y2="280" stroke="var(--c-borde)" strokeWidth="2" strokeDasharray="5 5" />
                        <line x1="310" y1="165" x2="480" y2="165" stroke="var(--c-borde)" strokeWidth="3" />
                        <line x1="350" y1="165" x2="350" y2="280" stroke="var(--c-borde-suave)" strokeWidth="2" />

                        {/* Silla ergonómica de oficina con apoyo */}
                        <path d="M 160 275 L 210 275 M 185 275 L 185 195" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
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
                            <circle cx="95" cy="140" r="16" fill={isCompleted('t3') ? '#0f766e' : '#ffffff'} stroke={isCompleted('t3') ? '#0f766e' : 'var(--c-borde)'} strokeWidth="2" filter={isCompleted('t3') ? 'url(#focal-glow)' : 'none'} />
                            <text x="95" y="144.5" textAnchor="middle" fontSize="11" fontWeight="700" fill={isCompleted('t3') ? '#ffffff' : 'var(--c-texto)'}>3</text>
                            <text x="95" y="170" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={isCompleted('t3') ? '#0f766e' : 'var(--c-texto)'}>Soporte Lumbar</text>
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
                            <path d="M 175 83 L 175 95 M 170 90 L 175 95 L 180 90" stroke={isCompleted('t4') ? '#0f766e' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" />
                            <path d="M 230 83 L 230 95 M 225 90 L 230 95 L 235 90" stroke={isCompleted('t4') ? '#0f766e' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" />

                            <circle cx="280" cy="50" r="16" fill={isCompleted('t4') ? '#0f766e' : '#ffffff'} stroke={isCompleted('t4') ? '#0f766e' : 'var(--c-borde)'} strokeWidth="2" filter={isCompleted('t4') ? 'url(#focal-glow)' : 'none'} />
                            <text x="280" y="54.5" textAnchor="middle" fontSize="11" fontWeight="700" fill={isCompleted('t4') ? '#ffffff' : 'var(--c-texto)'}>4</text>
                            <text x="280" y="78" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={isCompleted('t4') ? '#0f766e' : 'var(--c-texto)'}>Hombros / Mandíbula</text>
                        </g>

                        {/* Tronco y muslos */}
                        <path d="M 198 72 L 180 182" stroke="#334155" strokeWidth="20" strokeLinecap="round" />
                        <path d="M 180 182 L 255 182" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />

                        {/* Brazos hacia la mesa */}
                        <path d="M 200 85 L 245 135 L 330 160" fill="none" stroke="#475569" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />

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
                            <circle cx="335" cy="160" r="20" fill="none" stroke={isCompleted('t2') ? '#0f766e' : 'var(--c-borde)'} strokeWidth="2" strokeDasharray={isCompleted('t2') ? 'none' : '3 3'} />

                            <circle cx="385" cy="135" r="16" fill={isCompleted('t2') ? '#0f766e' : '#ffffff'} stroke={isCompleted('t2') ? '#0f766e' : 'var(--c-borde)'} strokeWidth="2" filter={isCompleted('t2') ? 'url(#focal-glow)' : 'none'} />
                            <text x="385" y="139.5" textAnchor="middle" fontSize="11" fontWeight="700" fill={isCompleted('t2') ? '#ffffff' : 'var(--c-texto)'}>2</text>
                            <text x="385" y="115" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={isCompleted('t2') ? '#0f766e' : 'var(--c-texto)'}>Palmas en mesa</text>
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
                            <line x1="230" y1="282" x2="305" y2="282" stroke={isCompleted('t1') ? '#0f766e' : '#64748b'} strokeWidth="3.5" />

                            <circle cx="335" cy="265" r="16" fill={isCompleted('t1') ? '#0f766e' : '#ffffff'} stroke={isCompleted('t1') ? '#0f766e' : 'var(--c-borde)'} strokeWidth="2" filter={isCompleted('t1') ? 'url(#focal-glow)' : 'none'} />
                            <text x="335" y="269.5" textAnchor="middle" fontSize="11" fontWeight="700" fill={isCompleted('t1') ? '#ffffff' : 'var(--c-texto)'}>1</text>
                            <text x="335" y="295" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={isCompleted('t1') ? '#0f766e' : 'var(--c-texto)'}>Pies en el piso</text>
                        </g>
                    </g>
                )}

                {/* ============================================================== */}
                {/* PASO 3: OÍDO - PAISAJE ACÚSTICO Y FRECUENCIAS DE SALA BPO      */}
                {/* ============================================================== */}
                {stepNumber === 3 && (
                    <g className="svg-step-oido">
                        {/* Centro auditivo */}
                        <circle cx="270" cy="155" r="32" fill="#f8fafc" stroke="var(--c-borde)" strokeWidth="2" />
                        <path d="M 264 138 C 282 138, 288 150, 282 162 C 276 170, 264 170, 264 177" fill="none" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
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
                            <path d="M 100 50 Q 185 35, 270 50 T 440 50" fill="none" stroke={isCompleted('o1') ? '#0f766e' : '#94a3b8'} strokeWidth={isCompleted('o1') ? '3.5' : '2'} />
                            <path d="M 120 70 Q 195 55, 270 70 T 420 70" fill="none" stroke={isCompleted('o1') ? '#0f766e' : '#cbd5e1'} strokeWidth={isCompleted('o1') ? '3' : '1.5'} />

                            <circle cx="270" cy="25" r="16" fill={isCompleted('o1') ? '#0f766e' : '#ffffff'} stroke={isCompleted('o1') ? '#0f766e' : 'var(--c-borde)'} strokeWidth="2" filter={isCompleted('o1') ? 'url(#focal-glow)' : 'none'} />
                            <text x="270" y="29.5" textAnchor="middle" fontSize="11" fontWeight="700" fill={isCompleted('o1') ? '#ffffff' : 'var(--c-texto)'}>1</text>
                            <text x="270" y="-3" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={isCompleted('o1') ? '#0f766e' : 'var(--c-texto)'}>Ventilación continua</text>
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
                            <circle cx="270" cy="155" r="60" fill="none" stroke={isCompleted('o2') ? '#0f766e' : '#cbd5e1'} strokeWidth={isCompleted('o2') ? '3' : '1.8'} strokeDasharray={isCompleted('o2') ? 'none' : '4 4'} />
                            <circle cx="270" cy="155" r="88" fill="none" stroke={isCompleted('o2') ? '#0f766e' : '#e2e8f0'} strokeWidth={isCompleted('o2') ? '2.5' : '1.2'} strokeDasharray="3 3" />

                            <circle cx="390" cy="155" r="16" fill={isCompleted('o2') ? '#0f766e' : '#ffffff'} stroke={isCompleted('o2') ? '#0f766e' : 'var(--c-borde)'} strokeWidth="2" filter={isCompleted('o2') ? 'url(#focal-glow)' : 'none'} />
                            <text x="390" y="159.5" textAnchor="middle" fontSize="11" fontWeight="700" fill={isCompleted('o2') ? '#ffffff' : 'var(--c-texto)'}>2</text>
                            <text x="390" y="185" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={isCompleted('o2') ? '#0f766e' : 'var(--c-texto)'}>Tu propia exhalación</text>
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
                            <line x1="110" y1="245" x2="110" y2="225" stroke={isCompleted('o3') ? '#0f766e' : '#94a3b8'} strokeWidth="3.5" strokeLinecap="round" />
                            <line x1="120" y1="245" x2="120" y2="215" stroke={isCompleted('o3') ? '#0f766e' : '#94a3b8'} strokeWidth="3.5" strokeLinecap="round" />
                            <line x1="130" y1="245" x2="130" y2="230" stroke={isCompleted('o3') ? '#0f766e' : '#94a3b8'} strokeWidth="3.5" strokeLinecap="round" />
                            <line x1="140" y1="245" x2="140" y2="220" stroke={isCompleted('o3') ? '#0f766e' : '#94a3b8'} strokeWidth="3.5" strokeLinecap="round" />

                            <circle cx="155" cy="265" r="16" fill={isCompleted('o3') ? '#0f766e' : '#ffffff'} stroke={isCompleted('o3') ? '#0f766e' : 'var(--c-borde)'} strokeWidth="2" filter={isCompleted('o3') ? 'url(#focal-glow)' : 'none'} />
                            <text x="155" y="269.5" textAnchor="middle" fontSize="11" fontWeight="700" fill={isCompleted('o3') ? '#ffffff' : 'var(--c-texto)'}>3</text>
                            <text x="155" y="295" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={isCompleted('o3') ? '#0f766e' : 'var(--c-texto)'}>Tecleo / Sala distante</text>
                        </g>
                    </g>
                )}

                {/* ============================================================== */}
                {/* PASO 2: OLFATO / AIRE - INHALACIÓN Y AROMA FAMILIAR            */}
                {/* ============================================================== */}
                {stepNumber === 2 && (
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
                            <polyline points="154,62 160,70 166,62" fill="none" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />

                            <circle cx="160" cy="20" r="16" fill={isCompleted('ol1') ? '#0f766e' : '#ffffff'} stroke={isCompleted('ol1') ? '#0f766e' : 'var(--c-borde)'} strokeWidth="2" filter={isCompleted('ol1') ? 'url(#focal-glow)' : 'none'} />
                            <text x="160" y="24.5" textAnchor="middle" fontSize="11" fontWeight="700" fill={isCompleted('ol1') ? '#ffffff' : 'var(--c-texto)'}>1</text>
                            <text x="160" y="285" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={isCompleted('ol1') ? '#0f766e' : 'var(--c-texto)'}>Inhalación de aire fresco</text>
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
                            <path d="M 350 170 L 356 225 C 356 240, 410 240, 410 225 L 416 170 Z" fill={isCompleted('ol2') ? '#f0fdfa' : '#ffffff'} stroke={isCompleted('ol2') ? '#0f766e' : '#475569'} strokeWidth="2.5" />
                            <path d="M 414 180 C 430 180, 430 215, 412 215" fill="none" stroke={isCompleted('ol2') ? '#0f766e' : '#475569'} strokeWidth="2.5" />
                            <line x1="335" y1="232" x2="430" y2="232" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />

                            <path d="M 370 155 Q 365 130 380 105 T 370 75" fill="none" stroke={isCompleted('ol2') ? '#0f766e' : '#94a3b8'} strokeWidth={isCompleted('ol2') ? '3' : '1.8'} strokeLinecap="round" />
                            <path d="M 395 155 Q 405 130 395 105 T 400 75" fill="none" stroke={isCompleted('ol2') ? '#0f766e' : '#94a3b8'} strokeWidth={isCompleted('ol2') ? '3' : '1.8'} strokeLinecap="round" />

                            <circle cx="385" cy="50" r="16" fill={isCompleted('ol2') ? '#0f766e' : '#ffffff'} stroke={isCompleted('ol2') ? '#0f766e' : 'var(--c-borde)'} strokeWidth="2" filter={isCompleted('ol2') ? 'url(#focal-glow)' : 'none'} />
                            <text x="385" y="54.5" textAnchor="middle" fontSize="11" fontWeight="700" fill={isCompleted('ol2') ? '#ffffff' : 'var(--c-texto)'}>2</text>
                            <text x="385" y="260" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={isCompleted('ol2') ? '#0f766e' : 'var(--c-texto)'}>Aroma de café o bebida</text>
                        </g>
                    </g>
                )}

                {/* ============================================================== */}
                {/* PASO 1: CONEXIÓN / PRESENTE - EJE Y ANCLAJE OPERATIVO          */}
                {/* ============================================================== */}
                {stepNumber === 1 && (
                    <g className="svg-step-conexion">
                        <g
                            className={`svg-hotspot ${isCompleted('c1') ? 'is-fused' : ''}`}
                            onClick={() => onToggleAnchor && onToggleAnchor('c1')}
                            onKeyDown={(e) => handleKeyDown(e, 'c1')}
                            role="button"
                            tabIndex={0}
                            aria-label="Ancla 1: Sello de presencia y retorno sereno"
                        >
                            <circle cx="270" cy="145" r="105" fill="none" stroke={isCompleted('c1') ? '#0f766e' : '#e2e8f0'} strokeWidth="1.8" strokeDasharray="5 5" />
                            <circle cx="270" cy="145" r="75" fill={isCompleted('c1') ? '#f0fdfa' : '#f8fafc'} stroke={isCompleted('c1') ? '#0f766e' : 'var(--c-borde)'} strokeWidth="2.5" />
                            <circle cx="270" cy="145" r="38" fill={isCompleted('c1') ? '#ccfbf1' : '#ffffff'} stroke={isCompleted('c1') ? '#0f766e' : 'var(--c-borde)'} strokeWidth="2" />

                            {/* Ancla marina de estabilidad */}
                            <line x1="270" y1="90" x2="270" y2="185" stroke="#0f766e" strokeWidth="4.5" strokeLinecap="round" />
                            <circle cx="270" cy="90" r="10" fill="none" stroke="#0f766e" strokeWidth="3.5" />
                            <line x1="250" y1="115" x2="290" y2="115" stroke="#0f766e" strokeWidth="4" strokeLinecap="round" />
                            <path d="M 235 165 C 235 200, 305 200, 305 165" fill="none" stroke="#0f766e" strokeWidth="4.5" strokeLinecap="round" />

                            <circle cx="270" cy="35" r="16" fill={isCompleted('c1') ? '#0f766e' : '#ffffff'} stroke={isCompleted('c1') ? '#0f766e' : 'var(--c-borde)'} strokeWidth="2" filter={isCompleted('c1') ? 'url(#focal-glow)' : 'none'} />
                            <text x="270" y="39.5" textAnchor="middle" fontSize="11" fontWeight="700" fill={isCompleted('c1') ? '#ffffff' : 'var(--c-texto)'}>1</text>

                            <text x="270" y="275" textAnchor="middle" fontSize="13" fontWeight="700" fill={isCompleted('c1') ? '#0f766e' : 'var(--c-texto)'}>
                                «Mi puesto es un espacio seguro. Yo conduzco mi ritmo.»
                            </text>
                        </g>
                    </g>
                )}
            </svg>

            {/* Barra sutil de subtítulo de apoyo y estado de voz */}
            <div
                className="grounding-live-subtitle-bar"
                role="status"
                aria-live="polite"
                aria-label={isVoiceEnabled ? 'Guía por voz y subtítulo en vivo' : 'Voz silenciada. Subtítulo en pantalla'}
            >
                <div className="grounding-subtitle-icon-badge" aria-hidden="true">
                    <Icon name={isVoiceEnabled ? 'volumeOn' : 'volumeOff'} size={15} />
                </div>
                <p className="grounding-subtitle-text">
                    {currentSubtitle || 'Toca los puntos numerados en el esquema o presiona las teclas 1 a 5 para anclarte.'}
                </p>
            </div>
        </div>
    );
}
