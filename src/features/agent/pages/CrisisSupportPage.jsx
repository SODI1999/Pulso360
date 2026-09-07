// src/features/agent/pages/CrisisSupportPage.jsx
// Ruta de apoyo prioritario en crisis y recursos institucionales (RF-10 / Protocolo de Crisis)

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';

export function CrisisSupportPage() {
    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();
    const data = pulsoStore.get();
    const consent = data.consents?.[currentUser?.id];

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [crisisMode, setCrisisMode] = useState('anonimo');
    const [feedback, setFeedback] = useState(null);

    // Registro de auditoría al acceder a la ruta de apoyo prioritario
    useEffect(() => {
        if (!currentUser) return;
        pulsoStore.audit({
            actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
            action: 'RUTA_APOYO_MOSTRADA',
            target: 'Ruta de apoyo prioritario'
        });
    }, [currentUser]);

    const handleConfirmPriority = () => {
        const storeData = pulsoStore.get();
        const currentConsent = storeData.consents?.[currentUser?.id];

        if (!currentConsent?.c5) {
            alert('Se requiere tener activa la finalidad C5 de consentimiento para crear una solicitud a SST.');
            return;
        }

        const isAnonymous = crisisMode === 'anonimo';
        const prefix = isAnonymous ? 'ANON-PRI' : 'CONF-PRI';
        const code = `${prefix}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

        const newRequest = {
            id: `req-${Date.now()}`,
            code,
            mode: crisisMode,
            ownerUserId: currentUser.id,
            identityUserId: isAnonymous ? null : currentUser.id,
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
            actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
            action: 'SOLICITUD_CONTACTO_PRIORITARIO',
            target: `Caso ${code} (${isAnonymous ? 'Modalidad Anónima' : 'Modalidad Confidencial Identificada'})`
        });

        setIsPanelOpen(false);
        setFeedback({
            code,
            isAnonymous
        });
    };

    return (
        <div style={{ maxWidth: '920px', margin: '0 auto' }}>
            <div style={{ marginBottom: '16px' }}>
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

            {/* Banner Principal */}
            <div className="card" style={{ marginBottom: '24px', background: 'var(--c-fondo)', border: '1px solid var(--c-borde)' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '50%', background: 'var(--c-primario-suave)',
                        color: 'var(--c-primario)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                        <Icon name="support" size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--c-texto)', marginBottom: '8px' }}>
                            Estás a tiempo de pedir ayuda y apoyo
                        </h1>
                        <p style={{ fontSize: '13.5px', color: 'var(--c-texto-suave)', lineHeight: '1.6', margin: 0 }}>
                            Pulso360 no es un servicio de atención en salud y no reemplaza la atención de un profesional especializado.
                            Si sientes que tu bienestar, salud o vida están en riesgo, utiliza de inmediato las líneas de emergencia oficiales disponibles en tu región.
                        </p>
                    </div>
                </div>
            </div>

            {/* Canales de Apoyo Configurados */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                    <div>
                        <div className="card-title">Canales de orientación y emergencia de demostración</div>
                        <div className="card-subtitle">Líneas de acceso público y gratuito para soporte psicosocial.</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
                    {/* Línea 106 */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px' }}>
                        <div>
                            <strong style={{ fontSize: '15px', color: 'var(--c-texto)', display: 'block', marginBottom: '6px' }}>
                                Línea 106
                            </strong>
                            <p style={{ fontSize: '12.5px', color: 'var(--c-texto-suave)', lineHeight: '1.5', margin: '0 0 14px' }}>
                                Canal público institucional de orientación en salud emocional. Verifica disponibilidad en tu municipio.
                            </p>
                        </div>
                        <a href="tel:106" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            <Icon name="support" size={16} />
                            <span>Llamar al 106</span>
                        </a>
                    </div>

                    {/* Línea 123 */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px' }}>
                        <div>
                            <strong style={{ fontSize: '15px', color: 'var(--c-texto)', display: 'block', marginBottom: '6px' }}>
                                Línea 123 (Emergencias)
                            </strong>
                            <p style={{ fontSize: '12.5px', color: 'var(--c-texto-suave)', lineHeight: '1.5', margin: '0 0 14px' }}>
                                Número único de emergencias para situaciones con riesgo inminente de salud o seguridad.
                            </p>
                        </div>
                        <a href="tel:123" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                            <Icon name="support" size={16} />
                            <span>Marcar 123</span>
                        </a>
                    </div>

                    {/* EPS / ARL */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px' }}>
                        <div>
                            <strong style={{ fontSize: '15px', color: 'var(--c-texto)', display: 'block', marginBottom: '6px' }}>
                                EPS / ARL Asignada
                            </strong>
                            <p style={{ fontSize: '12.5px', color: 'var(--c-texto-suave)', lineHeight: '1.5', margin: '0 0 14px' }}>
                                Consulta las líneas de atención psicológica telefónica y citas de tu entidad prestadora de salud.
                            </p>
                        </div>
                        <span className="badge badge-info" style={{ alignSelf: 'flex-start', padding: '6px 12px' }}>
                            Canal de afiliación
                        </span>
                    </div>
                </div>
            </div>

            {/* Contacto Prioritario con SST */}
            <div className="card">
                <div className="card-title" style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
                    Contacto prioritario con el equipo de SST
                </div>
                <p style={{ fontSize: '13px', color: 'var(--c-texto-suave)', margin: '0 0 16px', lineHeight: '1.5' }}>
                    Solo se creará una solicitud voluntaria de contacto si tú decides activarla y confirmarla expresamente.
                    Ningún texto de tu bitácora ni respuestas individuales se compartirán con terceros ni supervisores.
                </p>

                {/* Si C5 no está concedido */}
                {!consent?.c5 ? (
                    <div className="alert-banner warn" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <Icon name="info" size={20} />
                        <div>
                            <strong>Finalidad C5 requerida:</strong> Para canalizar una solicitud de orientación o contacto con SST debes activar la finalidad <em>C5 (Acompañamiento)</em> en tus preferencias de consentimiento informado.
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
                                    <label style={{
                                        display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px',
                                        border: crisisMode === 'anonimo' ? '1.5px solid var(--c-primario)' : '1px solid var(--c-borde-suave)',
                                        borderRadius: 'var(--radius-md)', background: crisisMode === 'anonimo' ? 'var(--c-primario-suave)' : 'var(--c-superficie)',
                                        cursor: 'pointer'
                                    }}>
                                        <input
                                            type="radio"
                                            name="crisisRadio"
                                            value="anonimo"
                                            checked={crisisMode === 'anonimo'}
                                            onChange={() => setCrisisMode('anonimo')}
                                            style={{ marginTop: '3px' }}
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

                                    <label style={{
                                        display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px',
                                        border: crisisMode === 'confidencial' ? '1.5px solid var(--c-primario)' : '1px solid var(--c-borde-suave)',
                                        borderRadius: 'var(--radius-md)', background: crisisMode === 'confidencial' ? 'var(--c-primario-suave)' : 'var(--c-superficie)',
                                        cursor: 'pointer'
                                    }}>
                                        <input
                                            type="radio"
                                            name="crisisRadio"
                                            value="confidencial"
                                            checked={crisisMode === 'confidencial'}
                                            onChange={() => setCrisisMode('confidencial')}
                                            style={{ marginTop: '3px' }}
                                        />
                                        <div>
                                            <strong style={{ color: 'var(--c-texto)', fontSize: '13.5px' }}>
                                                Modalidad Confidencial Identificada
                                            </strong>
                                            <div style={{ fontSize: '12px', color: 'var(--c-texto-suave)', marginTop: '3px' }}>
                                                Tu nombre y correo institucional serán visibles exclusivamente para el profesional SST asignado a fin de contactarte directamente para orientación.
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
        </div>
    );
}
