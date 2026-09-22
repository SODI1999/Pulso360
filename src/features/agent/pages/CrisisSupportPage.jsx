// src/features/agent/pages/CrisisSupportPage.jsx
// Ruta de contención, apoyo prioritario en crisis y canalización legal diferenciada (RF-10 / PAP)

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import { BpoResetModal } from '../components/BpoResetModal';
import '../../../styles/agent.css';

const GROUNDING_STEPS = [
    {
        number: 5,
        sense: 'Vista',
        title: '5 cosas que puedes ver a tu alrededor',
        guide: 'Mira a tu entorno inmediato y detalla 5 objetos específicos sin juzgarlos: el borde de tu pantalla, un lapicero, una esquina de la pared, la forma de tu teclado o el reflejo de la luz.',
        badge: 'Observa',
        color: 'var(--c-calma-accent)'
    },
    {
        number: 4,
        sense: 'Tacto',
        title: '4 cosas que puedes tocar o sentir físicamente',
        guide: 'Nota 4 sensaciones táctiles reales: la firmeza de la suela de tus zapatos contra el suelo, la tela de tu camisa sobre los hombros, el material liso del escritorio o la temperatura de tus manos.',
        badge: 'Siente',
        color: 'var(--c-info)'
    },
    {
        number: 3,
        sense: 'Oído',
        title: '3 sonidos que puedes escuchar ahora mismo',
        guide: 'Filtra el ruido y distingue 3 sonidos presentes: el flujo de aire o ventilación, el murmullo amortiguado del piso de operaciones o el ritmo pausado de tu propia respiración.',
        badge: 'Escucha',
        color: 'var(--c-alerta)'
    },
    {
        number: 2,
        sense: 'Olfato',
        title: '2 aromas presentes o memorias sensoriales gratas',
        guide: 'Inhala suavemente y percibe 2 aromas reales (el aroma de tu café, té o agua, el aire fresco) o visualiza con nitidez un aroma que te genere serenidad y calma.',
        badge: 'Inhala',
        color: 'var(--c-primario)'
    },
    {
        number: 1,
        sense: 'Gratitud / Conexión',
        title: '1 cosa que agradeces hoy o valoras de ti mismo/a',
        guide: 'Conecta con 1 pensamiento protector o fortaleza personal: el haber hecho una pausa a tiempo, una persona que te inspira tranquilidad o tu capacidad para cuidar de ti en esta jornada.',
        badge: 'Agradece',
        color: 'var(--c-exito)'
    }
];

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

    // Registro de auditoría al acceder a la ruta de apoyo prioritario (con dependencias desestructuradas seguras)
    useEffect(() => {
        if (!currentUserId) return;
        pulsoStore.audit({
            actor: `${currentUserId} (${roleLabels[currentUserRole] || currentUserRole})`,
            action: 'RUTA_APOYO_MOSTRADA',
            target: 'Ruta de apoyo prioritario y primeros auxilios psicológicos'
        });
    }, [currentUserId, currentUserRole]);

    const currentStep = GROUNDING_STEPS[activeGroundingIndex];

    return (
        <div className="crisis-page-col">
            <div className="agent-page agent-page--crisis">
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                >
                    <Icon name="arrowLeft" size={18} />
                    <span>Volver a la vista anterior</span>
                </button>
            </div>

            {/* Banner Principal de Calma y Contención */}
            <div className="crisis-hero-banner">
                <div className="crisis-hero-flex">
                    <div className="crisis-hero-icon">
                        <Icon name="support" size={28} />
                    </div>
                    <div className="crisis-hero-body">
                        <span
                            className="agent-kicker"
                        >
                            Espacio de Seguridad y Primeros Auxilios Psicológicos
                        </span>
                        <h1 className="crisis-hero-title">
                            Estás a tiempo de hacer una pausa y recibir apoyo
                        </h1>
                        <p className="crisis-hero-lead">
                            Pulso360 no es atención clínica. Si estás en sobrecarga o angustia: usa la técnica de regulación, llama a una línea oficial o pide acompañamiento a SST en reserva.
                        </p>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 1: Primeros Auxilios Psicológicos (PAP) - Anclaje Sensorial 5-4-3-2-1 */}
            <div className="card crisis-card--calma">
                <div className="card-header">
                    <div>
                        <div className="card-title crisis-card-title crisis-card-title--calma">
                            <Icon name="self_improvement" size={20} />
                            <span>Técnica de Anclaje Sensorial (Grounding 5-4-3-2-1)</span>
                        </div>
                        <div className="card-subtitle">
                            Ejercicio guiado para desactivar la hiperventilación y reconectar con el momento presente tras llamadas difíciles o crisis.
                        </div>
                    </div>
                    <button
                        type="button"
                        className="btn btn-calma-outline"
                        onClick={() => setIsBpoResetOpen(true)}
                    >
                        <Icon name="healing" size={18} />
                        <span>Abrir respiración guiada de emergencia (Box 4x4)</span>
                    </button>
                </div>

                {/* Pasos interactivos */}
                <div className="grounding-tabs-wrap">
                    <div className="grounding-tabs">
                        {GROUNDING_STEPS.map((step, idx) => (
                            <button
                                key={step.number}
                                type="button"
                                onClick={() => setActiveGroundingIndex(idx)}
                                className={`grounding-tab-btn ${activeGroundingIndex === idx ? 'active' : ''}`} style={{ '--step-color': step.color }}
                            >
                                <div className="grounding-tab-head">
                                    <span
                                        className="grounding-tab-num"
                                    >
                                        {step.number}
                                    </span>
                                    <span
                                        className="grounding-tab-badge"
                                    >
                                        {step.badge}
                                    </span>
                                </div>
                                <div className="grounding-tab-sense">
                                    {step.sense}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Detalle del paso seleccionado */}
                    <div className="grounding-step-detail">
                        <div className="grounding-step-head">
                            <span
                                className="grounding-step-num" style={{ '--step-color': currentStep.color }}
                            >
                                {currentStep.number}
                            </span>
                            <strong className="grounding-step-title">
                                {currentStep.title}
                            </strong>
                        </div>
                        <p className="grounding-step-guide">
                            {currentStep.guide}
                        </p>
                        <div className="grounding-step-meta">
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                disabled={activeGroundingIndex === 0}
                                onClick={() => setActiveGroundingIndex(prev => Math.max(0, prev - 1))}
                            >
                                <Icon name="arrowLeft" size={14} />
                                <span>Paso anterior</span>
                            </button>
                            <span className="grounding-step-source">
                                Paso {activeGroundingIndex + 1} de {GROUNDING_STEPS.length}
                            </span>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                disabled={activeGroundingIndex === GROUNDING_STEPS.length - 1}
                                onClick={() => setActiveGroundingIndex(prev => Math.min(GROUNDING_STEPS.length - 1, prev + 1))}
                            >
                                <span>Siguiente sentido</span>
                                <Icon name="arrowRight" size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: Botones Táctiles de Marcación Rápida y Líneas Oficiales 24/7 */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title crisis-card-title">
                            <Icon name="phone" size={20} />
                            <span>Líneas oficiales y gratuitas de atención telefónica 24/7</span>
                        </div>
                        <div className="card-subtitle">
                            Toca o haz clic para marcar de forma inmediata desde cualquier dispositivo móvil o teléfono corporativo.
                        </div>
                    </div>
                </div>

                <div className="crisis-lines-layout">
                    {/* Tarjeta Destacada: Línea 106 (Salud Mental Distrital y Nacional) */}
                    <div
                        className="card crisis-line-card crisis-line-card--destacada">
                        <div>
                            <div className="crisis-line-head">
                                <strong className="crisis-line-name">
                                    Línea 106
                                </strong>
                                <span className="badge badge-ok">Canal Prioritario 24/7</span>
                            </div>
                            <div className="crisis-line-label">
                                Salud mental y escucha distrital
                            </div>
                            <p className="crisis-line-desc">
                                Orientación y primeros auxilios psicológicos atendidos por profesionales en salud mental. Gratuita desde fijos y móviles en toda Colombia. Recomendada para descompresión ante sobrecarga emocional.
                            </p>
                        </div>
                        <a
                            href="tel:106"
                            className="btn btn-calma-urgent crisis-line-call crisis-line-call--destacada"
                            aria-label="Llamar directamente a la Línea 106 de salud mental"
                        >
                            <Icon name="phone" size={18} />
                            <span>Llamar al 106 (Tocar para marcar)</span>
                        </a>
                    </div>

                    {/* Tarjetas Secundarias Agrupadas */}
                    <div className="crisis-secondary-lines">
                        {/* Botón Táctil: Línea 123 */}
                        <div
                            className="card crisis-line-card crisis-card--borde">
                            <div>
                                <div className="crisis-line-head">
                                    <strong className="crisis-line-name">
                                        Línea 123
                                    </strong>
                                    <span className="badge badge-danger">Emergencias 24/7</span>
                                </div>
                                <div className="crisis-line-label">
                                    Número Único de Seguridad y Emergencias
                                </div>
                                <p className="crisis-line-desc">
                                    Para situaciones con riesgo inminente de vida, integridad física o requerimiento inmediato de ambulancia.
                                </p>
                            </div>
                            <a
                                href="tel:123"
                                className="btn btn-secondary btn-sm crisis-line-call crisis-line-call--critico"
                                aria-label="Llamar directamente a la Línea 123 de emergencias"
                            >
                                <Icon name="phone" size={16} />
                                <span>Marcar 123 (Emergencias)</span>
                            </a>
                        </div>

                        {/* Línea 155 y Afiliación EPS / ARL */}
                        <div
                            className="card crisis-line-card crisis-line-card--suave">
                            <div>
                                <div className="crisis-line-head">
                                    <strong className="crisis-line-name crisis-line-name--sm">
                                        Línea 155 / EPS / ARL
                                    </strong>
                                    <span className="badge badge-info">Orientación</span>
                                </div>
                                <div className="crisis-line-label">
                                    Orientación a mujeres & Canales de salud
                                </div>
                                <p className="crisis-line-desc">
                                    Orientación gratuita 24h a mujeres víctimas de violencia y canal de apoyo psicológico de tu EPS o ARL asignada.
                                </p>
                            </div>
                            <a
                                href="tel:155"
                                className="btn btn-secondary btn-sm crisis-line-call"
                                aria-label="Llamar a la Línea 155 de orientación a mujeres"
                            >
                                <Icon name="phone" size={15} />
                                <span>Marcar Línea 155 (Orientación)</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rutas legales en un bloque plegable: es contenido de consulta puntual,
                no de acción urgente; no debe competir con el anclaje ni con las líneas */}
            <details className="card crisis-card--borde crisis-details">
                <summary className="crisis-details-summary">
                    <span className="crisis-details-title">
                        <Icon name="shieldCheck" size={20} />
                        <span>Rutas institucionales y marco legal</span>
                    </span>
                    <span className="crisis-details-hint">Cuándo acudir al CCL y cuándo el caso no se concilia</span>
                </summary>

                <div className="crisis-legal-grid">
                    {/* Caja Informativa 1: Acoso Laboral (Ley 1010 de 2006 - CCL) */}
                    <div className="crisis-legal-box crisis-legal-box--acoso">
                        <div className="crisis-legal-head">
                            <span className="badge badge-info crisis-legal-badge-capsule">
                                Ley 1010 de 2006
                            </span>
                        </div>
                        <strong className="crisis-legal-title">
                            Ruta para Acoso Laboral: Comité de Convivencia Laboral (CCL)
                        </strong>
                        <p className="crisis-legal-desc">
                            El <strong>Comité de Convivencia Laboral (CCL)</strong> es el organismo bipartito (integrado por representantes de los trabajadores y del empleador) competente para recibir y tramitar quejas formales sobre conductas persistentes y demostrables de maltrato, persecución, discriminación, entorpecimiento o inequidad en el trabajo.
                        </p>
                        <ul className="crisis-legal-list">
                            <li>Procedimiento confidencial y preventivo de concertación.</li>
                            <li>Formulación de compromisos mutuos de mejora del clima laboral.</li>
                            <li>Radicación directa ante la secretaría del CCL de la compañía.</li>
                        </ul>
                    </div>

                    {/* Caja Informativa 2: Presunto Acoso Sexual (Resolución 3461 de 2025 - MinTrabajo) */}
                    <div className="crisis-legal-box crisis-legal-box--naranja">
                        <div className="crisis-legal-head">
                            <span
                                className="crisis-legal-badge-pill"
                            >
                                Resolución 3461 de 2025
                            </span>
                            <span className="crisis-legal-badge-orange">
                                Atención Urgente e Independiente
                            </span>
                        </div>
                        <strong className="crisis-legal-title crisis-legal-title--orange">
                            Presunto Acoso o Violencia Sexual: NO pasa por el CCL
                        </strong>
                        <p className="crisis-legal-desc crisis-legal-desc--orange">
                            Conforme a la <strong>Resolución 3461 de 2025 del Ministerio del Trabajo</strong>, las denuncias o situaciones de presunto acoso o violencia sexual en el trabajo <strong>tienen prohibida la conciliación o mediación con el denunciado</strong>, a fin de evitar cualquier forma de revictimización.
                        </p>
                        <ul className="crisis-legal-list crisis-legal-list--orange">
                            <li><strong>Canalización directa:</strong> Se activa ante la Gerencia de Talento Humano, SST o autoridades externas (Fiscalía, MinTrabajo, Línea 155).</li>
                            <li><strong>Medidas cautelares inmediatas:</strong> Separación física o de funciones sin desmejora salarial ni perjuicio para la persona afectada.</li>
                            <li>Trato con debida diligencia de género y reserva según el canal utilizado.</li>
                        </ul>
                    </div>
                </div>
                </details>

            {/* Contacto con SST: el formulario de solicitud vive en "Acompañamiento"
                para no mantener dos canales que crean el mismo tipo de solicitud
                (auditoría 015, duplicación de acompañamiento). Esta página se reserva
                para contención inmediata: regulación, líneas oficiales y orientación legal. */}
            <div className="card crisis-card--calma">
                <div className="card-header">
                    <div>
                        <div className="card-title crisis-card-title crisis-card-title--tight">
                            ¿Necesitas hablar con alguien del equipo de SST?
                        </div>
                        <div className="card-subtitle">
                            El canal de acompañamiento crea una solicitud voluntaria; no incorpora el texto de tu bitácora ni tus respuestas de check-in.
                        </div>
                    </div>
                </div>

                {!consent?.c5 ? (
                    <div className="alert-banner warn crisis-alert-flex">
                        <Icon name="info" size={20} />
                        <div>
                            <strong>Finalidad C5 requerida:</strong> Para solicitar contacto con SST activa la finalidad <em>C5 (Acompañamiento)</em> en tus preferencias. Las líneas telefónicas y el ejercicio de anclaje siguen disponibles sin ella.
                            <div className="crisis-consent-cta">
                                <Link to="/consentimiento" className="btn btn-primary btn-sm">
                                    Gestionar consentimiento
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Link to="/agente/apoyo" className="btn btn-primary">
                        <Icon name="support_agent" size={18} />
                        <span>Ir a Acompañamiento y crear la solicitud</span>
                    </Link>
                )}
            </div>
            {/*
                Bloque retirado (auditoría 015): panel de "contacto prioritario" embebido.
                Se unificó con el canal de Acompañamiento para que exista una sola forma
                de crear solicitudes a SST.
            */}

            {/* Modal de Respiración Guiada de Emergencia (Box Breathing) */}
            <BpoResetModal
                isOpen={isBpoResetOpen}
                onClose={() => setIsBpoResetOpen(false)}
            />
        </div>
    );
}
