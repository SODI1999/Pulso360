// src/features/agent/pages/CrisisSupportPage.jsx
// Ruta de contención, primeros auxilios psicológicos (PAP) y canalización legal diferenciada (RF-10)
// Diseñado bajo pulso360-ui-craft: Blueprint 0 (Flujo Editorial Continuo) y Blueprint 1 (Compañero de Turno)

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import { BpoResetModal } from '../components/BpoResetModal';
import { GroundingVisualMap } from '../components/GroundingVisualMap';
import '../../../styles/crisis.css';

const GROUNDING_STEPS = [
    {
        number: 5,
        sense: 'Vista',
        verb: 'Observa 5 anclas visibles',
        title: '5 puntos físicos para fijar tu mirada en el puesto',
        guide: 'Elige cada elemento con la mirada en tu estación de trabajo y márcalo al ubicarlo. No analices ni juzgues: solo confirma su presencia física real.',
        badge: 'Observa',
        anchors: [
            { id: 'v1', label: 'Borde exterior de tu monitor o pantalla', cue: 'Nota el contraste del marco contra la iluminación de la sala' },
            { id: 'v2', label: 'Cable o estructura de tu diadema telefónica', cue: 'Observa su forma y curvatura sobre tu mesa de trabajo' },
            { id: 'v3', label: 'Una tecla específica de tu teclado (ej. barra espaciadora)', cue: 'Fija la mirada en el relieve y la letra con nitidez' },
            { id: 'v4', label: 'Termo, vaso de agua o tu libreta de notas', cue: 'Observa su color, reflejo y posición al alcance de tu mano' },
            { id: 'v5', label: 'Un punto de luz o sombra sobre la superficie de la mesa', cue: 'Registra el límite entre la luz y la sombra sin forzar la vista' }
        ]
    },
    {
        number: 4,
        sense: 'Tacto',
        verb: 'Siente 4 apoyos corporales',
        title: '4 anclas de descarga física inmediata',
        guide: 'Desvía la atención de la llamada hacia las sensaciones físicas de tu postura. Tu cuerpo es el ancla más rápida con el momento presente.',
        badge: 'Siente',
        anchors: [
            { id: 't1', label: 'Apoya ambos pies firmes y planos sobre el suelo', cue: 'Siente el contacto total de la suela de tus zapatos contra el piso' },
            { id: 't2', label: 'Presiona suavemente las palmas sobre el borde del escritorio', cue: 'Nota la firmeza y temperatura fría o neutra de la mesa' },
            { id: 't3', label: 'Siente el respaldo de la silla en tu zona lumbar', cue: 'Permite que la silla sostenga tu espalda; no necesitas retener tensión' },
            { id: 't4', label: 'Suelta la mandíbula y desciende los hombros', cue: 'Separa los dientes suavemente y exhala el peso acumulado' }
        ]
    },
    {
        number: 3,
        sense: 'Oído',
        verb: 'Escucha 3 sonidos neutros',
        title: '3 anclas sonoras del entorno operativo',
        guide: 'Filtra las voces o los ecos mentales de la llamada anterior. Enfócate en sonidos constantes que están ocurriendo ahora mismo.',
        badge: 'Escucha',
        anchors: [
            { id: 'o1', label: 'Zumbido continuo del aire acondicionado o ventilación', cue: 'Un sonido monótono y constante que te ayuda a aislar el ruido mental' },
            { id: 'o2', label: 'El flujo de tu propia exhalación pausada', cue: 'Escucha el sonido del aire saliendo sin prisa por la nariz o boca' },
            { id: 'o3', label: 'Murmullo amortiguado o tecleo distante en la sala', cue: 'Sonidos neutros que confirman que la operación continúa sin ti en este instante' }
        ]
    },
    {
        number: 2,
        sense: 'Olfato / Aire',
        verb: 'Inhala 2 registros de aire limpio',
        title: '2 registros de aire y aroma en tu estación',
        guide: 'Inhala despacio hacia la base de tus pulmones. Lleva aire fresco y nota las sutilezas de tu entorno inmediato.',
        badge: 'Inhala',
        anchors: [
            { id: 'ol1', label: 'Inhala lento sintiendo la temperatura del aire al entrar', cue: 'Percibe el aire más fresco en tus fosas nasales' },
            { id: 'ol2', label: 'Aroma de tu bebida (café, té, agua) o tejido de tu ropa', cue: 'Un estímulo cotidiano y familiar que te devuelve a la calma' }
        ]
    },
    {
        number: 1,
        sense: 'Conexión / Presencia',
        verb: '1 afirmación de retorno',
        title: '1 ancla cognitiva de cierre y seguridad',
        guide: 'Sella el ejercicio reconociendo que el episodio de tensión concluyó y que tú conduces tu ritmo de trabajo.',
        badge: 'Conecta',
        anchors: [
            { id: 'c1', label: '«Esta interacción ya concluyó. Mi puesto es un espacio seguro. Yo conduzco mi ritmo.»', cue: 'Afirmación operativa: el enojo o la prisa de quien llamó no define mi valor personal' }
        ]
    }
];

const STEP_INTRO_SPEECH = {
    5: 'Paso 5: Vista. Respira despacio y ubica con la mirada cinco puntos en tu puesto de trabajo. Toca cada número cuando lo encuentres.',
    4: 'Paso 4: Tacto. Siente el apoyo físico de tu cuerpo. Libera la tensión en pies, palmas, espalda y hombros.',
    3: 'Paso 3: Oído. Filtra los ecos de la llamada. Enfócate en los sonidos neutros que ocurren ahora en la sala.',
    2: 'Paso 2: Olfato y aire. Inhala suavemente sintiendo la frescura del aire y los aromas cercanos en tu puesto.',
    1: 'Paso 1: Conexión. Reconoce que esta llamada ya concluyó. Tu puesto es un espacio seguro y tú conduces tu ritmo.'
};

const ANCHOR_FEEDBACK_SPEECH = {
    v1: 'Monitor localizado. Respira hondo y busca el siguiente punto.',
    v2: 'Diadema telefónica ubicada.',
    v3: 'Tecla del teclado enfocada.',
    v4: 'Termo o vaso de agua registrado.',
    v5: 'Haz de luz y sombra fijado.',
    t1: 'Pies planos y firmes en el piso.',
    t2: 'Palmas apoyadas sobre el escritorio.',
    t3: 'Zona lumbar sostenida por el respaldo.',
    t4: 'Mandíbula suelta y hombros descendidos.',
    o1: 'Ventilación continua de la sala escuchada.',
    o2: 'Sonido de tu propia respiración reconocido.',
    o3: 'Sonido amortiguado de la sala filtrado.',
    ol1: 'Inhalación de aire fresco recibida.',
    ol2: 'Aroma cotidiano registrado.',
    c1: 'Anclaje completado. Tu puesto es un espacio seguro.'
};

export function CrisisSupportPage() {
    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();
    const currentUserId = currentUser?.id;
    const currentUserRole = currentUser?.role;

    const data = pulsoStore.get();
    const consent = data.consents?.[currentUserId];

    // Estado para modal de respiración guiada de emergencia
    const [isBpoResetOpen, setIsBpoResetOpen] = useState(false);

    // Estado interactivo para Grounding 5-4-3-2-1
    const [activeGroundingIndex, setActiveGroundingIndex] = useState(0);
    const [completedAnchors, setCompletedAnchors] = useState({ 5: [], 4: [], 3: [], 2: [], 1: [] });
    const [groundingMode, setGroundingMode] = useState('tactile'); // 'tactile' | 'assisted'
    const [isAssistedPlaying, setIsAssistedPlaying] = useState(false);
    const [assistedAnchorIndex, setAssistedAnchorIndex] = useState(0);

    // Guía por voz nativa del sistema
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
    const [currentSubtitle, setCurrentSubtitle] = useState(STEP_INTRO_SPEECH[5]);

    const assistedTimerRef = useRef(null);

    // Motor de voz del sistema (Web Speech API)
    const speakText = useCallback((text) => {
        setCurrentSubtitle(text);
        if (!isVoiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

        try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES';
            utterance.rate = 0.85;
            utterance.pitch = 0.95;

            const voices = window.speechSynthesis.getVoices();
            const esVoice = voices.find(v => v.lang && v.lang.startsWith('es'));
            if (esVoice) utterance.voice = esVoice;

            window.speechSynthesis.speak(utterance);
        } catch (err) {
            console.warn('SpeechSynthesis error:', err);
        }
    }, [isVoiceEnabled]);

    // Limpiar síntesis de voz al desmontar
    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Locución automática de guía al cambiar de sentido
    useEffect(() => {
        const stepNum = GROUNDING_STEPS[activeGroundingIndex]?.number;
        if (stepNum && STEP_INTRO_SPEECH[stepNum]) {
            speakText(STEP_INTRO_SPEECH[stepNum]);
        }
    }, [activeGroundingIndex, speakText]);

    // Registro de auditoría al acceder a la ruta de apoyo prioritario
    useEffect(() => {
        if (!currentUserId) return;
        pulsoStore.audit({
            actor: `${currentUserId} (${roleLabels[currentUserRole] || currentUserRole})`,
            action: 'RUTA_APOYO_MOSTRADA',
            target: 'Ruta de apoyo prioritario y primeros auxilios psicológicos'
        });
    }, [currentUserId, currentUserRole]);

    const currentStep = GROUNDING_STEPS[activeGroundingIndex];
    const currentStepNumber = currentStep.number;
    const currentStepAnchors = currentStep.anchors;
    const stepCompletedList = completedAnchors[currentStepNumber] || [];
    const isStepFullyCompleted = stepCompletedList.length === currentStepAnchors.length;

    // Conteo global de anclaje somático (sobre 15)
    const totalAnchorsCompleted = Object.values(completedAnchors).reduce((acc, list) => acc + list.length, 0);
    const isFullGroundingCompleted = totalAnchorsCompleted === 15;

    // Conmutar ancla individual con confirmación de voz
    const toggleAnchor = useCallback((stepNum, anchorId) => {
        setCompletedAnchors(prev => {
            const list = prev[stepNum] || [];
            const exists = list.includes(anchorId);
            const updated = exists ? list.filter(id => id !== anchorId) : [...list, anchorId];
            return { ...prev, [stepNum]: updated };
        });

        const list = completedAnchors[stepNum] || [];
        if (!list.includes(anchorId)) {
            const feedback = ANCHOR_FEEDBACK_SPEECH[anchorId] || 'Punto fijado.';
            speakText(feedback);
        }
    }, [completedAnchors, speakText]);

    // Reiniciar anclaje
    const resetGrounding = useCallback(() => {
        setCompletedAnchors({ 5: [], 4: [], 3: [], 2: [], 1: [] });
        setActiveGroundingIndex(0);
        setIsAssistedPlaying(false);
        setAssistedAnchorIndex(0);
        speakText(STEP_INTRO_SPEECH[5]);
    }, [speakText]);

    // Modo Asistido: avance temporizado automático (cadencia de 6 segundos)
    useEffect(() => {
        if (groundingMode !== 'assisted' || !isAssistedPlaying) {
            if (assistedTimerRef.current) clearInterval(assistedTimerRef.current);
            return;
        }

        assistedTimerRef.current = setInterval(() => {
            // Marcar el ancla actual como completada
            const targetAnchor = currentStepAnchors[assistedAnchorIndex];
            if (targetAnchor) {
                toggleAnchor(currentStepNumber, targetAnchor.id);
            }

            // Avanzar al siguiente ancla o al siguiente paso
            if (assistedAnchorIndex + 1 < currentStepAnchors.length) {
                setAssistedAnchorIndex(prev => prev + 1);
            } else {
                // Paso completado: pasar al siguiente sentido si existe
                if (activeGroundingIndex + 1 < GROUNDING_STEPS.length) {
                    setActiveGroundingIndex(prev => prev + 1);
                    setAssistedAnchorIndex(0);
                } else {
                    // Fin del ejercicio
                    setIsAssistedPlaying(false);
                }
            }
        }, 5500);

        return () => {
            if (assistedTimerRef.current) clearInterval(assistedTimerRef.current);
        };
    }, [groundingMode, isAssistedPlaying, assistedAnchorIndex, currentStepAnchors, currentStepNumber, activeGroundingIndex, toggleAnchor]);

    // Atajos de teclado ergonómicos: teclas 1-5 marcan anclas del paso activo
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignorar si el usuario está en un input o textarea
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

            const keyNum = parseInt(e.key, 10);
            if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= currentStepAnchors.length) {
                e.preventDefault();
                const targetAnchor = currentStepAnchors[keyNum - 1];
                if (targetAnchor) {
                    toggleAnchor(currentStepNumber, targetAnchor.id);
                }
            } else if (e.key === 'ArrowRight' && activeGroundingIndex < GROUNDING_STEPS.length - 1) {
                e.preventDefault();
                setActiveGroundingIndex(prev => prev + 1);
                setAssistedAnchorIndex(0);
            } else if (e.key === 'ArrowLeft' && activeGroundingIndex > 0) {
                e.preventDefault();
                setActiveGroundingIndex(prev => prev - 1);
                setAssistedAnchorIndex(0);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeGroundingIndex, currentStepAnchors, currentStepNumber, toggleAnchor]);

    return (
        <div className="crisis-editorial-page">
            {/* Navegación superior sobria */}
            <div className="crisis-top-nav">
                <button
                    type="button"
                    className="crisis-back-link"
                    onClick={() => navigate('/agente/panel')}
                >
                    <Icon name="arrowLeft" size={16} />
                    <span>Volver al panel</span>
                </button>
            </div>

            {/* Cabecera Editorial de Contención */}
            <header className="crisis-page-header">
                <h1 className="crisis-page-title">
                    Espacio de contención y primeros auxilios psicológicos
                </h1>
                <p className="crisis-page-subtitle">
                    Pulso360 es una plataforma de apoyo preventivo y no sustituye la atención clínica ni psiquiátrica especializada. Si estás experimentando una sobrecarga aguda o angustia en tu turno: utiliza la técnica de anclaje sensorial en tu puesto, llama a una línea oficial gratuita 24/7 o solicita orientación con el equipo de Seguridad y Salud en el Trabajo.
                </p>
            </header>

            {/* SECCIÓN 1: Primeros Auxilios Psicológicos (Grounding Somático en Puesto 5-4-3-2-1) */}
            <section className="crisis-grounding-section" aria-labelledby="grounding-heading">
                <div className="crisis-section-top">
                    <div className="crisis-section-heading-group">
                        <div className="crisis-section-title-row">
                            <h2 id="grounding-heading" className="crisis-section-title">
                                Anclaje somático en estación de trabajo (Grounding 5-4-3-2-1)
                            </h2>
                            <span className="crisis-progress-pill">
                                {totalAnchorsCompleted} de 15 anclas fijadas
                            </span>
                        </div>
                        <p className="crisis-section-desc">
                            Desescalada psicofisiológica rápida para recuperar el control corporal y la atención presente tras llamadas difíciles o escaladas operativas.
                        </p>
                    </div>

                    <div className="crisis-header-tools">
                        {/* Selector de modo: Táctil vs Asistido */}
                        <div className="crisis-mode-switcher" role="group" aria-label="Modalidad del anclaje">
                            <button
                                type="button"
                                className={`crisis-mode-btn ${groundingMode === 'tactile' ? 'is-active' : ''}`}
                                onClick={() => {
                                    setGroundingMode('tactile');
                                    setIsAssistedPlaying(false);
                                }}
                            >
                                <Icon name="touchApp" size={15} />
                                <span>A tu ritmo (táctil)</span>
                            </button>
                            <button
                                type="button"
                                className={`crisis-mode-btn ${groundingMode === 'assisted' ? 'is-active' : ''}`}
                                onClick={() => {
                                    setGroundingMode('assisted');
                                    setIsAssistedPlaying(prev => !prev);
                                }}
                            >
                                <Icon name={isAssistedPlaying ? 'pause' : 'play'} size={14} />
                                <span>{isAssistedPlaying ? 'Pausar cadencia' : 'Cadencia guiada'}</span>
                            </button>
                        </div>

                        {/* Control de voz del sistema */}
                        <button
                            type="button"
                            className={`crisis-mode-btn ${isVoiceEnabled ? 'is-active' : ''}`}
                            onClick={() => {
                                setIsVoiceEnabled(prev => {
                                    const next = !prev;
                                    if (!next && typeof window !== 'undefined' && window.speechSynthesis) {
                                        window.speechSynthesis.cancel();
                                    }
                                    return next;
                                });
                            }}
                            title={isVoiceEnabled ? 'Silenciar voz del sistema' : 'Activar voz del sistema'}
                            aria-label={isVoiceEnabled ? 'Silenciar voz del sistema' : 'Activar voz del sistema'}
                        >
                            <Icon name={isVoiceEnabled ? 'volumeOn' : 'volumeOff'} size={15} />
                            <span>{isVoiceEnabled ? 'Voz activada' : 'Voz silenciada'}</span>
                        </button>

                        {/* Botón de respiración 4x4 */}
                        <button
                            type="button"
                            className="btn-crisis-bpo-reset"
                            onClick={() => setIsBpoResetOpen(true)}
                        >
                            <Icon name="healing" size={16} />
                            <span>Pausa Box Breathing (4×4)</span>
                        </button>
                    </div>
                </div>

                {/* Barra global de fijación somática */}
                <div className="crisis-somatic-progress-track" aria-hidden="true">
                    <div
                        className="crisis-somatic-progress-bar"
                        style={{ width: `${(totalAnchorsCompleted / 15) * 100}%` }}
                    />
                </div>

                {/* Selector horizontal de pasos (5-4-3-2-1) */}
                <div className="crisis-grounding-tabs" role="tablist" aria-label="Pasos de la técnica de anclaje">
                    {GROUNDING_STEPS.map((step, idx) => {
                        const isActive = activeGroundingIndex === idx;
                        const stepDoneCount = (completedAnchors[step.number] || []).length;
                        const isStepDone = stepDoneCount === step.anchors.length;

                        return (
                            <button
                                key={step.number}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => {
                                    setActiveGroundingIndex(idx);
                                    setAssistedAnchorIndex(0);
                                }}
                                className={`crisis-grounding-tab ${isActive ? 'is-active' : ''} ${isStepDone ? 'is-step-completed' : ''}`}
                            >
                                <div className="crisis-tab-num-row">
                                    <span className="crisis-tab-num">{step.number}</span>
                                    {isStepDone && <Icon name="check" size={14} className="crisis-tab-done-icon" />}
                                </div>
                                <div className="crisis-tab-label">
                                    <span className="crisis-tab-badge">{step.badge}</span>
                                    <span className="crisis-tab-sense">{step.sense}</span>
                                    <span className="crisis-tab-progress-micro">
                                        {stepDoneCount}/{step.anchors.length}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* DETALLE INTERACTIVO DEL PASO ACTIVO */}
                <div className="crisis-grounding-display" role="tabpanel">
                    <div className="crisis-step-header-row">
                        <div className="crisis-step-heading">
                            <span className="crisis-step-tag">{currentStep.number}</span>
                            <div>
                                <h3 className="crisis-step-title">{currentStep.title}</h3>
                                <p className="crisis-step-guide">{currentStep.guide}</p>
                            </div>
                        </div>

                        <div className="crisis-step-meta-status">
                            <span className="crisis-step-status-text">
                                {stepCompletedList.length} de {currentStepAnchors.length} anclas fijadas
                            </span>
                            <span className="crisis-step-hint-keyboard">
                                Atajo: presiona teclas 1 a {currentStepAnchors.length}
                            </span>
                        </div>
                    </div>

                    {/* Cadencia visual en modo asistido */}
                    {groundingMode === 'assisted' && (
                        <div className="crisis-assisted-banner">
                            <div className="crisis-assisted-wave" />
                            <p className="crisis-assisted-text">
                                {isAssistedPlaying
                                    ? `Respirando y enfocando el ancla ${assistedAnchorIndex + 1}... Toma aire despacio y nota el elemento.`
                                    : 'Cadencia en pausa. Haz clic en el botón superior para reanudar el avance guiado.'}
                            </p>
                        </div>
                    )}

                    {/* CUERPO INTERACTIVO: LIENZO VISUAL SVG INMERSIVO */}
                    <div className="crisis-interactive-body">
                        <GroundingVisualMap
                            stepNumber={currentStep.number}
                            completedAnchorIds={stepCompletedList}
                            onToggleAnchor={(anchorId) => toggleAnchor(currentStepNumber, anchorId)}
                            currentSubtitle={currentSubtitle}
                            isVoiceEnabled={isVoiceEnabled}
                        />
                    </div>

                    {/* REFUERZO AL COMPLETAR EL PASO O TODO EL EJERCICIO */}
                    {isFullGroundingCompleted ? (
                        <div className="crisis-grounding-completed-banner">
                            <div className="crisis-completed-badge-row">
                                <Icon name="checkCircle" size={20} className="crisis-completed-icon" />
                                <h4 className="crisis-completed-title">Anclaje somático completo (15/15 anclas fijadas)</h4>
                            </div>
                            <p className="crisis-completed-desc">
                                Has conectado tus 5 sentidos con tu estación física de trabajo. Tu ritmo respiratorio y activación simpática han retornado al momento presente. Recuerda que la llamada difícil ya terminó y tú marcas el compás de tu turno.
                            </p>
                            <div className="crisis-completed-actions">
                                <button
                                    type="button"
                                    className="btn btn-primary crisis-action-btn"
                                    onClick={() => navigate('/agente/panel')}
                                >
                                    <span>Volver al panel con calma</span>
                                </button>
                                <button
                                    type="button"
                                    className="btn-crisis-secondary-action"
                                    onClick={() => setIsBpoResetOpen(true)}
                                >
                                    <Icon name="healing" size={15} />
                                    <span>Hacer respiración guiada Box 4×4</span>
                                </button>
                                <button
                                    type="button"
                                    className="btn-crisis-secondary-action"
                                    onClick={resetGrounding}
                                >
                                    <Icon name="sync" size={15} />
                                    <span>Reiniciar anclaje</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Barra de navegación entre sentidos */
                        <div className="crisis-step-nav">
                            <button
                                type="button"
                                className="crisis-nav-btn"
                                disabled={activeGroundingIndex === 0}
                                onClick={() => {
                                    setActiveGroundingIndex(prev => Math.max(0, prev - 1));
                                    setAssistedAnchorIndex(0);
                                }}
                            >
                                <Icon name="arrowLeft" size={14} />
                                <span>Sentido anterior</span>
                            </button>

                            <div className="crisis-step-nav-center">
                                <span className="crisis-step-counter">
                                    Sentido {activeGroundingIndex + 1} de {GROUNDING_STEPS.length} ({currentStep.sense})
                                </span>
                                {stepCompletedList.length > 0 && !isStepFullyCompleted && (
                                    <button
                                        type="button"
                                        className="crisis-link-reset-step"
                                        onClick={() => {
                                            setCompletedAnchors(prev => ({ ...prev, [currentStepNumber]: [] }));
                                        }}
                                    >
                                        Limpiar paso
                                    </button>
                                )}
                            </div>

                            {activeGroundingIndex < GROUNDING_STEPS.length - 1 ? (
                                <button
                                    type="button"
                                    className={`crisis-nav-btn ${isStepFullyCompleted ? 'is-step-ready' : ''}`}
                                    onClick={() => {
                                        setActiveGroundingIndex(prev => Math.min(GROUNDING_STEPS.length - 1, prev + 1));
                                        setAssistedAnchorIndex(0);
                                    }}
                                >
                                    <span>
                                        {isStepFullyCompleted
                                            ? `Continuar a ${GROUNDING_STEPS[activeGroundingIndex + 1].sense}`
                                            : 'Siguiente sentido'}
                                    </span>
                                    <Icon name="arrowRight" size={14} />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className={`crisis-nav-btn ${isStepFullyCompleted ? 'is-step-ready' : ''}`}
                                    onClick={() => {
                                        if (isStepFullyCompleted) {
                                            navigate('/agente/panel');
                                        }
                                    }}
                                >
                                    <span>Finalizar y volver al panel</span>
                                    <Icon name="arrowRight" size={14} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* SECCIÓN 2: Líneas Oficiales y Gratuitas 24/7 */}
            <section className="crisis-lines-section" aria-labelledby="lines-heading">
                <div className="crisis-section-heading-group">
                    <h2 id="lines-heading" className="crisis-section-title">
                        Líneas oficiales y gratuitas de atención telefónica 24/7
                    </h2>
                    <p className="crisis-section-desc">
                        Canales de escucha y atención inmediata atendidos por profesionales en salud mental y emergencias en Colombia.
                    </p>
                </div>

                <div className="crisis-lines-grid">
                    {/* Línea Prioritaria: 106 */}
                    <article className="crisis-line-card-primary">
                        <div className="crisis-line-meta-primary">
                            <strong>Línea 106: Escucha y Salud Mental (Distrital y Nacional)</strong>
                            <p className="crisis-line-desc-primary">
                                Orientación y primeros auxilios psicológicos atendidos por profesionales en salud mental. Gratuita desde teléfonos fijos y móviles en todo el país. Recomendada para descompresión inmediata ante sobrecarga emocional.
                            </p>
                        </div>
                        <a
                            href="tel:106"
                            className="btn-crisis-call btn-crisis-call--primary"
                            aria-label="Llamar directamente a la Línea 106 de salud mental"
                        >
                            <Icon name="phone" size={18} />
                            <span>Llamar a la Línea 106 (Tocar para marcar)</span>
                        </a>
                    </article>

                    {/* Líneas Secundarias: 123 y 155 */}
                    <div className="crisis-secondary-col">
                        <article className="crisis-line-card-secondary">
                            <div>
                                <strong>Línea 123: Emergencias y Seguridad</strong>
                                <p className="crisis-line-desc-secondary">
                                    Para situaciones con riesgo inminente de vida, integridad física o requerimiento urgente de traslado médico.
                                </p>
                            </div>
                            <a
                                href="tel:123"
                                className="btn-crisis-call btn-crisis-call--emergency"
                                aria-label="Llamar a la Línea 123 de emergencias"
                            >
                                <Icon name="phone" size={16} />
                                <span>Marcar 123 (Emergencias)</span>
                            </a>
                        </article>

                        <article className="crisis-line-card-secondary">
                            <div>
                                <strong>Línea 155: Orientación a Mujeres / Red EPS y ARL</strong>
                                <p className="crisis-line-desc-secondary">
                                    Orientación gratuita 24h a mujeres víctimas de violencia y canal de apoyo psicológico de tu EPS o ARL asignada.
                                </p>
                            </div>
                            <a
                                href="tel:155"
                                className="btn-crisis-call btn-crisis-call--secondary"
                                aria-label="Llamar a la Línea 155 de orientación a mujeres"
                            >
                                <Icon name="phone" size={16} />
                                <span>Marcar 155 (Orientación)</span>
                            </a>
                        </article>
                    </div>
                </div>
            </section>

            {/* SECCIÓN 3: Acordeón Sobrio de Rutas Institucionales y Marco Legal */}
            <details className="crisis-legal-details">
                <summary className="crisis-legal-summary">
                    <div className="crisis-legal-summary-left">
                        <Icon name="shieldCheck" size={18} />
                        <span>Rutas institucionales y marco legal (Ley 1010 y Resolución 3461)</span>
                    </div>
                    <span className="crisis-legal-summary-hint">
                        Consulta cuándo acudir al CCL y cuándo el caso no se concilia
                    </span>
                </summary>

                <div className="crisis-legal-content">
                    {/* Caja 1: Acoso Laboral (Ley 1010 de 2006) */}
                    <div className="crisis-legal-box">
                        <strong className="crisis-legal-title">
                            Ruta para Acoso Laboral: Comité de Convivencia Laboral (CCL)
                        </strong>
                        <p className="crisis-legal-desc">
                            El <strong>Comité de Convivencia Laboral (CCL)</strong> es el organismo bipartito formal encargado de tramitar quejas sobre conductas persistentes de maltrato, persecución o discriminación en el trabajo (Ley 1010 de 2006).
                        </p>
                        <ul className="crisis-legal-list">
                            <li>Procedimiento confidencial y preventivo de concertación interna.</li>
                            <li>Formulación de acuerdos y compromisos mutuos de mejora.</li>
                            <li>Radicación directa ante la secretaría del CCL de la compañía.</li>
                        </ul>
                    </div>

                    {/* Caja 2: Acoso o Violencia Sexual (Resolución 3461 de 2025) */}
                    <div className="crisis-legal-box crisis-legal-box--orange">
                        <strong className="crisis-legal-title crisis-legal-title--orange">
                            Presunto Acoso o Violencia Sexual: NO pasa por el CCL
                        </strong>
                        <p className="crisis-legal-desc crisis-legal-desc--orange">
                            Conforme a la <strong>Resolución 3461 de 2025 del Ministerio del Trabajo</strong>, las denuncias por acoso o violencia sexual en el trabajo <strong>tienen prohibida la conciliación</strong> para prevenir cualquier forma de revictimización.
                        </p>
                        <ul className="crisis-legal-list crisis-legal-list--orange">
                            <li>Canalización directa ante Talento Humano, SST o autoridades externas (Fiscalía, MinTrabajo).</li>
                            <li>Medidas de protección inmediatas: separación funcional sin afectación salarial.</li>
                            <li>Debida diligencia y máxima reserva en la gestión del caso.</li>
                        </ul>
                    </div>
                </div>
            </details>

            {/* SECCIÓN 4: Derivación y Acompañamiento con SST */}
            <section className="crisis-sst-section" aria-labelledby="sst-heading">
                <div className="crisis-sst-info">
                    <h3 id="sst-heading" className="crisis-sst-title">
                        ¿Requieres orientación personalizada con el equipo de SST?
                    </h3>
                    <p className="crisis-sst-desc">
                        Puedes registrar una solicitud voluntaria en modalidad anónima o confidencial. Tus respuestas de check-in y bitácoras no se incorporan a la solicitud.
                    </p>
                </div>

                <div className="crisis-sst-actions">
                    {!consent?.c5 ? (
                        <Link to="/consentimiento" className="btn-crisis-call btn-crisis-call--secondary">
                            <Icon name="shieldCheck" size={16} />
                            <span>Gestionar finalidad C5 en consentimiento</span>
                        </Link>
                    ) : (
                        <Link to="/agente/apoyo" className="btn-crisis-call btn-crisis-call--primary">
                            <Icon name="support_agent" size={18} />
                            <span>Ir al canal de acompañamiento con SST</span>
                        </Link>
                    )}
                </div>
            </section>

            {/* Modal de Respiración Guiada de Emergencia (Box Breathing 4x4) */}
            <BpoResetModal
                isOpen={isBpoResetOpen}
                onClose={() => setIsBpoResetOpen(false)}
            />
        </div>
    );
}
