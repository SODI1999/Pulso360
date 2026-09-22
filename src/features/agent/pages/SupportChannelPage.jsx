// src/features/agent/pages/SupportChannelPage.jsx
// Canal voluntario de solicitudes de orientación psicosocial y acompañamiento con SST (RF-10)

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { authService, roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import { SupportRequestForm } from '../components/SupportRequestForm';
import '../../../styles/agent.css';

export function SupportChannelPage() {
    const currentUser = authService.getCurrentUser();
    const data = pulsoStore.get();
    const consent = data.consents?.[currentUser?.id];

    // Estados del formulario
    const [supportMode, setSupportMode] = useState('anonimo');
    const [reason, setReason] = useState('Sobrecarga percibida');
    const [details, setDetails] = useState('');
    const [urgency, setUrgency] = useState('media');
    const [contactPreference, setContactPreference] = useState('app');
    const [timeWindow, setTimeWindow] = useState('Cualquiera');
    const [feedback, setFeedback] = useState('');

    // Solicitudes del usuario
    const [requestsVersion, setRequestsVersion] = useState(0);

    const userRequests = useMemo(() => {
        void requestsVersion;
        const storeData = pulsoStore.get();
        return (storeData.supportRequests || []).filter(r => r.ownerUserId === currentUser?.id);
    }, [currentUser?.id, requestsVersion]);

    const isAnonymous = supportMode === 'anonimo';

    // Manejo de envío
    const handleSubmit = (e) => {
        e.preventDefault();
        const storeData = pulsoStore.get();
        storeData.supportRequests = storeData.supportRequests || [];

        const now = new Date();
        const year = now.getFullYear();
        const prefix = isAnonymous ? 'ANON' : 'CONF';
        const existingCount = storeData.supportRequests.filter(r => String(r.code || '').startsWith(`${prefix}-${year}-`)).length;
        const code = `${prefix}-${year}-${String(existingCount + 1).padStart(4, '0')}`;

        const responseWindowLabel = urgency === 'alta' ? 'Prioritario' : 'Jornada habitual SST';

        storeData.supportRequests.unshift({
            id: `req-${Date.now()}`,
            code,
            mode: supportMode,
            ownerUserId: currentUser.id,
            identityUserId: !isAnonymous ? currentUser.id : null,
            date: new Date().toISOString().slice(0, 10),
            reason,
            description: details.trim(),
            urgency,
            contactPreference: isAnonymous ? 'app' : contactPreference,
            timeWindow: isAnonymous ? 'No aplica' : timeWindow,
            status: 'Recibida',
            assignedTo: 'usr-3',
            sla: responseWindowLabel
        });

        pulsoStore.save(storeData);
        pulsoStore.audit({
            actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
            action: 'SOLICITUD_ACOMPANAMIENTO',
            target: `Caso ${code}`
        });

        setDetails('');
        setFeedback(`Solicitud enviada exitosamente. Tu radicado de seguimiento es ${code}.`);
        setRequestsVersion(prev => prev + 1);
    };

    // 1. Caso: Bloqueo pedagógico por falta de consentimiento C5 (Ruta pública de apoyo permanece habilitada)
    if (!consent?.c5) {
        return (
            <div className="agent-page agent-page--support">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Solicitar acompañamiento</h1>
                        <p className="page-subtitle">
                            Tu solicitud se canaliza al equipo de SST; esta vista no la presenta a tu líder ni a tu supervisor.
                        </p>
                    </div>
                </div>

                <div className="card center-card" style={{ border: '1.5px solid var(--c-alerta-border)' }}>
                    <div className="center-icon-badge" style={{ backgroundColor: 'var(--c-alerta-bg)', color: 'var(--c-alerta)', border: '1px solid var(--c-alerta-border)' }}>
                        <Icon name="shield" size={32} />
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: 'var(--c-texto)' }}>
                        Canal de acompañamiento con SST no habilitado
                    </h2>
                    <p style={{ color: 'var(--c-texto-suave)', marginBottom: '20px', maxWidth: '480px', margin: '0 auto 20px', lineHeight: '1.5' }}>
                        La finalidad C5 está inactiva en tus preferencias de consentimiento informado. Puedes activarla en cualquier momento para solicitar orientación personalizada con SST. Las líneas públicas de apoyo siguen plenamente disponibles.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/consentimiento" className="btn btn-primary">
                            <Icon name="shieldCheck" size={16} />
                            <span>Activar C5 en mis preferencias</span>
                        </Link>
                        <Link to="/apoyo-crisis" className="btn btn-secondary">
                            <Icon name="support" size={16} />
                            <span>Ver ruta pública de apoyo y PAP</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="agent-page agent-page--support">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Solicitar acompañamiento</h1>
                    <p className="page-subtitle">
                        Tu solicitud se canaliza al equipo de SST; esta vista no la presenta a tu líder ni a tu supervisor.
                    </p>
                </div>
                <Link to="/apoyo-crisis" className="btn btn-calma-urgent">
                    <Icon name="support" size={18} />
                    <span>Necesito ayuda ahora (Primeros Auxilios)</span>
                </Link>
            </div>

            <div id="supportArea" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Formulario de Nueva Solicitud Rediseñado Empáticamente */}
                <SupportRequestForm
                    isAnonymous={isAnonymous}
                    onSetSupportMode={setSupportMode}
                    reason={reason}
                    onChangeReason={setReason}
                    details={details}
                    onChangeDetails={setDetails}
                    urgency={urgency}
                    onChangeUrgency={setUrgency}
                    contactPreference={contactPreference}
                    onChangeContactPreference={setContactPreference}
                    timeWindow={timeWindow}
                    onChangeTimeWindow={setTimeWindow}
                    onSubmit={handleSubmit}
                    feedback={feedback}
                />

                {/* Historial de Solicitudes Propias con Redacción Humanizadora */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Mis solicitudes de acompañamiento</div>
                            <div className="card-subtitle">Seguimiento de radicados y respuestas de los profesionales de SST.</div>
                        </div>
                    </div>

                    <div id="requestsList" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                        {userRequests.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '36px 20px', background: 'var(--c-fondo)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--c-borde)' }}>
                                <Icon name="support" size={32} style={{ color: 'var(--c-primario)', margin: '0 auto 8px' }} />
                                <strong style={{ display: 'block', fontSize: '14.5px', color: 'var(--c-texto)', marginBottom: '4px' }}>
                                    No tienes solicitudes registradas en este momento
                                </strong>
                                <p style={{ fontSize: '12.5px', color: 'var(--c-texto-suave)', margin: 0, maxWidth: '400px', marginInline: 'auto' }}>
                                    Cuando envíes una consulta o solicitud a SST, aquí podrás hacer seguimiento seguro a su radicado y respuesta.
                                </p>
                            </div>
                        ) : (
                            userRequests.map(req => (
                                <div
                                    key={req.id}
                                    style={{
                                        padding: '16px 18px',
                                        background: 'var(--c-calma-bg)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--c-calma-border)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                        <strong style={{ fontSize: '14.5px', color: 'var(--c-calma-text)' }}>{req.code}</strong>
                                        <span className={`badge ${req.mode === 'anonimo' ? 'badge-ok' : 'badge-info'}`}>
                                            {req.mode === 'anonimo' ? 'Modalidad Anónima' : 'Modalidad Confidencial'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '12.5px', color: 'var(--c-texto-suave)', margin: '2px 0' }}>
                                        <div><strong style={{ color: 'var(--c-texto)' }}>Motivo:</strong> {req.reason}</div>
                                        <div><strong style={{ color: 'var(--c-texto)' }}>Estado:</strong> <span className="badge badge-neutral" style={{ marginLeft: '4px' }}>{req.status}</span></div>
                                        <div><strong style={{ color: 'var(--c-texto)' }}>Atención estimada:</strong> {req.sla}</div>
                                    </div>
                                    {req.mode === 'anonimo' ? (
                                        <div style={{ fontSize: '12px', color: 'var(--c-calma-text-muted)' }}>
                                            Tu identidad está protegida. La orientación de SST se publica de forma interna en este caso.
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '12px', color: 'var(--c-calma-text-muted)' }}>
                                            Contacto asignado directamente a profesional de SST según la modalidad seleccionada y los controles del despliegue.
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
