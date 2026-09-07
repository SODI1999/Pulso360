// src/features/agent/pages/SupportChannelPage.jsx
// Canal voluntario de solicitudes de orientación psicosocial y acompañamiento con SST (RF-10)

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { authService, roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import { SupportRequestForm } from '../components/SupportRequestForm';

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
        const storeData = pulsoStore.get();
        return (storeData.supportRequests || []).filter(r => r.ownerUserId === currentUser?.id);
    }, [currentUser?.id, requestsVersion]);

    const isAnonymous = supportMode === 'anonimo';

    // Manejo de envío
    const handleSubmit = (e) => {
        e.preventDefault();
        const storeData = pulsoStore.get();

        const prefix = isAnonymous ? 'ANON' : 'CONF';
        const code = `${prefix}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

        storeData.supportRequests = storeData.supportRequests || [];
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
            sla: urgency === 'alta' ? 'Prioritario' : '24 h hábiles'
        });

        pulsoStore.save(storeData);
        pulsoStore.audit({
            actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
            action: 'SOLICITUD_ACOMPANAMIENTO',
            target: `Caso ${code}`
        });

        setDetails('');
        setFeedback(`Solicitud enviada exitosamente. Tu ID de caso es ${code}.`);
        setRequestsVersion(prev => prev + 1);
    };

    // 1. Caso: Bloqueo por falta de consentimiento C5
    if (!consent?.c5) {
        return (
            <div>
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Solicitar acompañamiento</h1>
                        <p className="page-subtitle">
                            Tu solicitud es canalizada exclusivamente al equipo de SST; no es visible para tu líder ni para tu supervisor.
                        </p>
                    </div>
                </div>

                <div className="card center-card">
                    <div className="center-icon-badge" style={{ backgroundColor: 'var(--c-alerta-bg)', color: 'var(--c-alerta)', border: '1px solid var(--c-alerta-border)' }}>
                        <Icon name="shield" size={32} />
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: 'var(--c-texto)' }}>
                        Canal de acompañamiento no habilitado
                    </h2>
                    <p style={{ color: 'var(--c-texto-suave)', marginBottom: '20px', maxWidth: '480px', margin: '0 auto 20px' }}>
                        La finalidad C5 está inactiva en tus preferencias. La ruta pública de apoyo sigue disponible.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <Link to="/consentimiento" className="btn btn-primary">
                            Activar C5 en mis preferencias
                        </Link>
                        <Link to="/apoyo-crisis" className="btn btn-secondary">
                            Ver ruta pública de apoyo
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Solicitar acompañamiento</h1>
                    <p className="page-subtitle">
                        Tu solicitud es canalizada exclusivamente al equipo de SST; no es visible para tu líder ni para tu supervisor.
                    </p>
                </div>
                <Link to="/apoyo-crisis" className="btn btn-secondary">
                    <Icon name="support" size={18} />
                    <span>Necesito ayuda ahora</span>
                </Link>
            </div>

            <div id="supportArea" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Formulario de Nueva Solicitud */}
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

                {/* Historial de Solicitudes Propias */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Mis solicitudes de acompañamiento</div>
                            <div className="card-subtitle">Seguimiento de radicados y respuestas de los profesionales de SST.</div>
                        </div>
                    </div>

                    <div id="requestsList" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                        {userRequests.length === 0 ? (
                            <p style={{ color: 'var(--c-texto-suave)', margin: '16px 0', textAlign: 'center' }}>
                                No tienes solicitudes registradas.
                            </p>
                        ) : (
                            userRequests.map(req => (
                                <div
                                    key={req.id}
                                    style={{ padding: '14px', background: 'var(--c-fondo)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--c-borde-suave)' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <strong style={{ fontSize: '13.5px', color: 'var(--c-texto)' }}>{req.code}</strong>
                                        <span className={`badge ${req.mode === 'anonimo' ? 'badge-neutral' : 'badge-info'}`}>
                                            {req.mode === 'anonimo' ? 'Anónima' : 'Identificada'}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '12.5px', color: 'var(--c-texto-suave)', margin: '4px 0' }}>
                                        {req.reason} · Estado: <strong>{req.status}</strong> · SLA: {req.sla}
                                    </div>
                                    {req.mode === 'anonimo' && (
                                        <div style={{ fontSize: '11px', color: 'var(--c-texto-mutado)' }}>
                                            La respuesta se consulta dentro de la app mediante este ID de caso.
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
