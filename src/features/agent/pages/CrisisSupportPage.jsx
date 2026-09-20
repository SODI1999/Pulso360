// src/features/agent/pages/CrisisSupportPage.jsx
// Ruta de contención, apoyo prioritario en crisis y canalización legal diferenciada (RF-10 / PAP)

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import { BpoResetModal } from '../components/BpoResetModal';

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

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [crisisMode, setCrisisMode] = useState('anonimo');
    const [feedback, setFeedback] = useState(null);

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

    const handleConfirmPriority = () => {
        const storeData = pulsoStore.get();
        const currentConsent = storeData.consents?.[currentUserId];

        if (!currentConsent?.c5) {
            alert('Se requiere tener activa la finalidad C5 de consentimiento para crear una solicitud a SST.');
            return;
        }

        const now = new Date();
        const year = now.getFullYear();
        const isAnonymous = crisisMode === 'anonimo';
        const prefix = isAnonymous ? 'ANON-PRI' : 'CONF-PRI';
        storeData.supportRequests = storeData.supportRequests || [];
        const existingCount = storeData.supportRequests.filter(r => String(r.code || '').startsWith(`${prefix}-${year}-`)).length;
        const code = `${prefix}-${year}-${String(existingCount + 1).padStart(4, '0')}`;

        const newRequest = {
            id: `req-${Date.now()}`,
            code,
            mode: crisisMode,
            ownerUserId: currentUserId,
            identityUserId: isAnonymous ? null : currentUserId,
            date: new Date().toISOString().slice(0, 10),
            reason: 'Contacto prioritario solicitado por el titular',
            description: '',
            urgency: 'alta',
            contactPreference: isAnonymous ? 'app' : 'directo',
            timeWindow: isAnonymous ? 'No aplica' : 'Prioritario',
            status: 'Recibida',
            assignedTo: 'usr-3',
            sla: 'Prioritario'
        };

        storeData.supportRequests = storeData.supportRequests || [];
        storeData.supportRequests.unshift(newRequest);
        pulsoStore.save(storeData);

        pulsoStore.audit({
            actor: `${currentUserId} (${roleLabels[currentUserRole] || currentUserRole})`,
            action: 'SOLICITUD_CONTACTO_PRIORITARIO',
            target: `Caso ${code} (${isAnonymous ? 'Modalidad Anónima' : 'Modalidad Confidencial Identificada'})`
        });

        setIsPanelOpen(false);
        setFeedback({
            code,
            isAnonymous
        });
    };

    const currentStep = GROUNDING_STEPS[activeGroundingIndex];

    return (
        <div style={{ maxWidth: '920px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                    <Icon name="arrowLeft" size={18} />
                    <span>Volver a la vista anterior</span>
                </button>
            </div>

            {/* Banner Principal de Calma y Contención */}
            <div className="crisis-hero-banner">
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div className="crisis-hero-icon">
                        <Icon name="support" size={28} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <span
                            style={{
                                fontSize: '11px',
                                fontWeight: '700',
                                color: 'var(--c-calma-accent)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                display: 'block',
                                marginBottom: '4px'
                            }}
                        >
                            Espacio de Seguridad y Primeros Auxilios Psicológicos
                        </span>
                        <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--c-calma-text)', marginBottom: '8px', letterSpacing: '-0.01em' }}>
                            Estás a tiempo de hacer una pausa y recibir apoyo
                        </h1>
                        <p style={{ fontSize: '13.5px', color: 'var(--c-calma-text-muted)', lineHeight: '1.6', margin: 0 }}>
                            Pulso360 no es un servicio de atención clínica ni reemplaza a un profesional especializado.
                            Si estás sintiendo una sobrecarga desbordante, angustia aguda o riesgo físico, aquí dispones de técnicas inmediatas de regulación sensorial, líneas telefónicas oficiales de emergencia y la opción de solicitar acompañamiento profesional a SST en total reserva.
                        </p>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 1: Primeros Auxilios Psicológicos (PAP) - Anclaje Sensorial 5-4-3-2-1 */}
            <div className="card" style={{ border: '1.5px solid var(--c-calma-border)' }}>
                <div className="card-header">
                    <div>
                        <div className="card-title" style={{ fontSize: '16px', color: 'var(--c-calma-text)' }}>
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
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Icon name="healing" size={18} />
                        <span>Abrir respiración guiada de emergencia (Box 4x4)</span>
                    </button>
                </div>

                {/* Pasos interactivos */}
                <div style={{ marginTop: '16px' }}>
                    <div
                        style={{
                            display: 'flex',
                            gap: '8px',
                            overflowX: 'auto',
                            paddingBottom: '8px',
                            marginBottom: '16px'
                        }}
                    >
                        {GROUNDING_STEPS.map((step, idx) => (
                            <button
                                key={step.number}
                                type="button"
                                onClick={() => setActiveGroundingIndex(idx)}
                                className="grounding-tab-btn"
                                style={{
                                    border: activeGroundingIndex === idx ? `2px solid ${step.color}` : '1px solid var(--c-calma-border)',
                                    backgroundColor: activeGroundingIndex === idx ? 'var(--c-calma-surface-subtle)' : 'var(--c-superficie)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span
                                        style={{
                                            fontSize: '15px',
                                            fontWeight: '800',
                                            color: step.color
                                        }}
                                    >
                                        {step.number}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: '10px',
                                            fontWeight: '700',
                                            padding: '2px 6px',
                                            borderRadius: 'var(--radius-full)',
                                            backgroundColor: activeGroundingIndex === idx ? step.color : 'var(--c-fondo-subtle)',
                                            color: activeGroundingIndex === idx ? '#ffffff' : 'var(--c-texto-mutado)'
                                        }}
                                    >
                                        {step.badge}
                                    </span>
                                </div>
                                <div style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--c-calma-text)' }}>
                                    {step.sense}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Detalle del paso seleccionado */}
                    <div
                        style={{
                            padding: '18px 20px',
                            backgroundColor: 'var(--c-calma-bg)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--c-calma-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: 'var(--radius-full)',
                                    backgroundColor: currentStep.color,
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '800',
                                    fontSize: '15px'
                                }}
                            >
                                {currentStep.number}
                            </span>
                            <strong style={{ fontSize: '15px', color: 'var(--c-calma-text)' }}>
                                {currentStep.title}
                            </strong>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--c-calma-text-muted)', lineHeight: '1.55', margin: '0' }}>
                            {currentStep.guide}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                disabled={activeGroundingIndex === 0}
                                onClick={() => setActiveGroundingIndex(prev => Math.max(0, prev - 1))}
                            >
                                <Icon name="arrowLeft" size={14} />
                                <span>Paso anterior</span>
                            </button>
                            <span style={{ fontSize: '12px', color: 'var(--c-texto-mutado)', fontWeight: '600' }}>
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
                        <div className="card-title" style={{ fontSize: '16px', color: 'var(--c-texto)' }}>
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
                        className="card"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            padding: '22px',
                            border: '1.5px solid var(--c-calma-border)',
                            backgroundColor: 'var(--c-calma-surface)'
                        }}
                    >
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <strong style={{ fontSize: '18px', color: 'var(--c-calma-accent)' }}>
                                    Línea 106
                                </strong>
                                <span className="badge badge-ok">Canal Prioritario 24/7</span>
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--c-texto)', marginBottom: '6px' }}>
                                Salud mental y escucha distrital
                            </div>
                            <p style={{ fontSize: '12.5px', color: 'var(--c-texto-suave)', lineHeight: '1.5', margin: '0 0 20px' }}>
                                Orientación y primeros auxilios psicológicos atendidos por profesionales en salud mental. Gratuita desde fijos y móviles en toda Colombia. Recomendada para descompresión ante sobrecarga emocional.
                            </p>
                        </div>
                        <a
                            href="tel:106"
                            className="btn btn-calma-urgent"
                            style={{
                                width: '100%',
                                minHeight: '44px',
                                justifyContent: 'center'
                            }}
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
                            className="card"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                padding: '16px',
                                border: '1.5px solid var(--c-borde)',
                                backgroundColor: 'var(--c-superficie)'
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <strong style={{ fontSize: '16px', color: 'var(--c-critico)' }}>
                                        Línea 123
                                    </strong>
                                    <span className="badge badge-danger">Emergencias 24/7</span>
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--c-texto)', marginBottom: '4px' }}>
                                    Número Único de Seguridad y Emergencias
                                </div>
                                <p style={{ fontSize: '11.5px', color: 'var(--c-texto-suave)', lineHeight: '1.4', margin: '0 0 12px' }}>
                                    Para situaciones con riesgo inminente de vida, integridad física o requerimiento inmediato de ambulancia.
                                </p>
                            </div>
                            <a
                                href="tel:123"
                                className="btn btn-secondary btn-sm"
                                style={{
                                    width: '100%',
                                    minHeight: '36px',
                                    fontWeight: '700',
                                    borderColor: 'var(--c-critico)',
                                    color: 'var(--c-critico)',
                                    justifyContent: 'center'
                                }}
                                aria-label="Llamar directamente a la Línea 123 de emergencias"
                            >
                                <Icon name="phone" size={16} />
                                <span>Marcar 123 (Emergencias)</span>
                            </a>
                        </div>

                        {/* Línea 155 y Afiliación EPS / ARL */}
                        <div
                            className="card"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                padding: '16px',
                                border: '1px solid var(--c-borde-suave)'
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <strong style={{ fontSize: '15px', color: 'var(--c-texto)' }}>
                                        Línea 155 / EPS / ARL
                                    </strong>
                                    <span className="badge badge-info">Orientación</span>
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--c-texto)', marginBottom: '4px' }}>
                                    Orientación a mujeres & Canales de salud
                                </div>
                                <p style={{ fontSize: '11.5px', color: 'var(--c-texto-suave)', lineHeight: '1.4', margin: '0 0 12px' }}>
                                    Orientación gratuita 24h a mujeres víctimas de violencia y canal de apoyo psicológico de tu EPS o ARL asignada.
                                </p>
                            </div>
                            <a
                                href="tel:155"
                                className="btn btn-secondary btn-sm"
                                style={{ width: '100%', minHeight: '36px', justifyContent: 'center' }}
                                aria-label="Llamar a la Línea 155 de orientación a mujeres"
                            >
                                <Icon name="phone" size={15} />
                                <span>Marcar Línea 155 (Orientación)</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 3: Canalización Legal Diferenciada (Ley 1010/2006 vs Res. 3461/2025) */}
            <div className="card" style={{ border: '1px solid var(--c-borde)' }}>
                <div className="card-header">
                    <div>
                        <div className="card-title" style={{ fontSize: '16px', color: 'var(--c-texto)' }}>
                            <Icon name="shieldCheck" size={20} />
                            <span>Rutas institucionales y marco normativo colombiano</span>
                        </div>
                        <div className="card-subtitle">
                            Conoce las instancias legítimas y diferenciadas de protección y trámite según la naturaleza de la situación.
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '16px',
                        marginTop: '16px'
                    }}
                >
                    {/* Caja Informativa 1: Acoso Laboral (Ley 1010 de 2006 - CCL) */}
                    <div
                        style={{
                            padding: '16px 18px',
                            backgroundColor: 'var(--c-fondo)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1.5px solid var(--c-borde)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="badge badge-info" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Ley 1010 de 2006
                            </span>
                        </div>
                        <strong style={{ fontSize: '14.5px', color: 'var(--c-texto)' }}>
                            Ruta para Acoso Laboral: Comité de Convivencia Laboral (CCL)
                        </strong>
                        <p style={{ fontSize: '12.5px', color: 'var(--c-texto-suave)', lineHeight: '1.5', margin: 0 }}>
                            El <strong>Comité de Convivencia Laboral (CCL)</strong> es el organismo bipartito (integrado por representantes de los trabajadores y del empleador) competente para recibir y tramitar quejas formales sobre conductas persistentes y demostrables de maltrato, persecución, discriminación, entorpecimiento o inequidad en el trabajo.
                        </p>
                        <ul style={{ fontSize: '12px', color: 'var(--c-texto-mutado)', margin: '4px 0 0', paddingLeft: '18px', lineHeight: '1.45' }}>
                            <li>Procedimiento confidencial y preventivo de concertación.</li>
                            <li>Formulación de compromisos mutuos de mejora del clima laboral.</li>
                            <li>Radicación directa ante la secretaría del CCL de la compañía.</li>
                        </ul>
                    </div>

                    {/* Caja Informativa 2: Presunto Acoso Sexual (Resolución 3461 de 2025 - MinTrabajo) */}
                    <div
                        style={{
                            padding: '16px 18px',
                            backgroundColor: 'var(--c-legal-orange-bg)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1.5px solid var(--c-legal-orange-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                                style={{
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    padding: '3px 8px',
                                    borderRadius: 'var(--radius-full)',
                                    backgroundColor: 'var(--c-legal-orange)',
                                    color: '#ffffff'
                                }}
                            >
                                Resolución 3461 de 2025
                            </span>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--c-legal-orange-text)' }}>
                                Atención Urgente e Independiente
                            </span>
                        </div>
                        <strong style={{ fontSize: '14.5px', color: 'var(--c-legal-orange-text)' }}>
                            Presunto Acoso o Violencia Sexual: NO pasa por el CCL
                        </strong>
                        <p style={{ fontSize: '12.5px', color: 'var(--c-legal-orange-text-dark)', lineHeight: '1.5', margin: 0 }}>
                            Conforme a la <strong>Resolución 3461 de 2025 del Ministerio del Trabajo</strong>, las denuncias o situaciones de presunto acoso o violencia sexual en el trabajo <strong>tienen prohibida la conciliación o mediación con el denunciado</strong>, a fin de evitar cualquier forma de revictimización.
                        </p>
                        <ul style={{ fontSize: '12px', color: 'var(--c-legal-orange-text)', margin: '4px 0 0', paddingLeft: '18px', lineHeight: '1.45' }}>
                            <li><strong>Canalización directa:</strong> Se activa ante la Gerencia de Talento Humano, SST o autoridades externas (Fiscalía, MinTrabajo, Línea 155).</li>
                            <li><strong>Medidas cautelares inmediatas:</strong> Separación física o de funciones sin desmejora salarial ni perjuicio para la persona afectada.</li>
                            <li>Trato con debida diligencia de género y confidencialidad absoluta.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 4: Contacto Prioritario con SST (Con opción Anónima y Confidencial intacta) */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title" style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
                            Contacto prioritario con el equipo de SST
                        </div>
                        <div className="card-subtitle">
                            Solo se creará una solicitud voluntaria de contacto si tú decides activarla y confirmarla expresamente.
                            Ningún texto de tu bitácora ni respuestas individuales se compartirán con terceros ni supervisores.
                        </div>
                    </div>
                </div>

                {/* Si C5 no está concedido */}
                {!consent?.c5 ? (
                    <div className="alert-banner warn" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <Icon name="info" size={20} />
                        <div>
                            <strong>Finalidad C5 requerida:</strong> Para canalizar una solicitud de orientación o contacto con SST debes activar la finalidad <em>C5 (Acompañamiento)</em> en tus preferencias de consentimiento informado. Las líneas telefónicas oficiales y el ejercicio de anclaje siguen plenamente disponibles.
                            <div style={{ marginTop: '12px' }}>
                                <Link to="/consentimiento" className="btn btn-primary" style={{ fontSize: '13px' }}>
                                    Gestionar consentimiento
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        {!isPanelOpen ? (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => {
                                    setIsPanelOpen(true);
                                    setFeedback(null);
                                }}
                            >
                                <Icon name="shield" size={18} />
                                <span>Solicitar contacto prioritario de SST</span>
                            </button>
                        ) : (
                            <div style={{ padding: '20px', border: '1px solid var(--c-borde)', borderRadius: 'var(--radius-lg)', background: 'var(--c-fondo)' }}>
                                <div style={{ fontWeight: '700', fontSize: '14.5px', color: 'var(--c-texto)', marginBottom: '8px' }}>
                                    Paso 2: Elige la modalidad y confirma tu solicitud
                                </div>
                                <p style={{ fontSize: '13px', color: 'var(--c-texto-suave)', marginBottom: '16px' }}>
                                    Selecciona cómo deseas que el equipo de SST gestione tu caso prioritario:
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                                    <label
                                        className={`support-mode-capsule ${crisisMode === 'anonimo' ? 'active' : ''}`}
                                        htmlFor="crisisAnonimo"
                                    >
                                        <input
                                            type="radio"
                                            id="crisisAnonimo"
                                            name="crisisRadio"
                                            className="support-mode-radio"
                                            value="anonimo"
                                            checked={crisisMode === 'anonimo'}
                                            onChange={() => setCrisisMode('anonimo')}
                                        />
                                        <div>
                                            <strong style={{ color: 'var(--c-texto)', fontSize: '13.5px' }}>
                                                Modalidad Anónima (Recomendada si deseas reserva total)
                                            </strong>
                                            <div style={{ fontSize: '12px', color: 'var(--c-texto-suave)', marginTop: '3px' }}>
                                                Tu identidad queda protegida. SST no recibirá tu nombre ni tu correo institucional. Podrás consultar el estado y respuesta dentro de la app con el código generado.
                                            </div>
                                        </div>
                                    </label>

                                    <label
                                        className={`support-mode-capsule ${crisisMode === 'confidencial' ? 'active' : ''}`}
                                        htmlFor="crisisConfidencial"
                                    >
                                        <input
                                            type="radio"
                                            id="crisisConfidencial"
                                            name="crisisRadio"
                                            className="support-mode-radio"
                                            value="confidencial"
                                            checked={crisisMode === 'confidencial'}
                                            onChange={() => setCrisisMode('confidencial')}
                                        />
                                        <div>
                                            <strong style={{ color: 'var(--c-texto)', fontSize: '13.5px' }}>
                                                Modalidad Confidencial Identificada
                                            </strong>
                                            <div style={{ fontSize: '12px', color: 'var(--c-texto-suave)', marginTop: '3px' }}>
                                                Tu nombre y correo institucional serán visibles exclusivamente para el profesional SST asignado a fin de contactarte directamente para orientación. Tu supervisor no interviene.
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                <div className="alert-banner info" style={{ marginBottom: '20px', fontSize: '12.5px' }}>
                                    <Icon name="info" size={18} />
                                    <div><strong>Garantía de confidencialidad:</strong> En ningún caso se envía el texto de tu bitácora ni tus respuestas de check-in.</div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setIsPanelOpen(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleConfirmPriority}
                                    >
                                        <Icon name="check" size={16} />
                                        <span>Confirmar y enviar solicitud prioritaria</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {feedback && (
                            <div className="alert-banner ok" style={{ marginTop: '16px' }}>
                                <Icon name="check" size={20} />
                                <div>
                                    <span className="badge badge-ok" style={{ marginBottom: '4px' }}>Solicitud prioritaria registrada</span>
                                    <br />
                                    <strong>Código de radicado:</strong> <code>{feedback.code}</code> ({feedback.isAnonymous ? 'Modalidad Anónima - Identidad protegida' : 'Modalidad Confidencial Identificada'}).
                                    <br />
                                    <small style={{ color: 'var(--c-texto-suave)' }}>
                                        SST atenderá tu caso con carácter prioritario. No se transmitió texto de tu bitácora.
                                    </small>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de Respiración Guiada de Emergencia (Box Breathing) */}
            <BpoResetModal
                isOpen={isBpoResetOpen}
                onClose={() => setIsBpoResetOpen(false)}
            />
        </div>
    );
}

