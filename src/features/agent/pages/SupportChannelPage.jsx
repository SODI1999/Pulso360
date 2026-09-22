// src/features/agent/pages/SupportChannelPage.jsx
// Canal voluntario de solicitudes de orientación psicosocial y acompañamiento con SST (RF-10)
// Diseñado bajo pulso360-ui-craft: Blueprint 0 (Flujo Editorial Continuo) y Blueprint 1 (Compañero de Turno)

import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService, roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import { SupportRequestForm } from '../components/SupportRequestForm';
import '../../../styles/apoyo.css';

export function SupportChannelPage() {
    const navigate = useNavigate();
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
            <div className="support-editorial-page">
                <div className="support-top-nav">
                    <button
                        type="button"
                        className="support-back-link"
                        onClick={() => navigate('/agente/panel')}
                    >
                        <Icon name="arrowLeft" size={16} />
                        <span>Volver al panel</span>
                    </button>
                    <Link to="/apoyo-crisis" className="support-urgent-action">
                        <Icon name="support" size={16} />
                        <span>Apoyo inmediato y PAP</span>
                    </Link>
                </div>

                <header className="support-page-header">
                    <h1 className="support-page-title">Canal de acompañamiento con SST</h1>
                    <p className="support-page-subtitle">
                        Orientación psicosocial y acompañamiento preventivo gestionado por Seguridad y Salud en el Trabajo.
                    </p>
                </header>

                <section className="support-blocked-block" aria-labelledby="blocked-heading">
                    <h2 id="blocked-heading" className="support-blocked-title">
                        Canal de acompañamiento individual no habilitado
                    </h2>
                    <p className="support-blocked-desc">
                        La finalidad C5 está inactiva en tus preferencias de consentimiento informado. Para que el equipo de SST pueda recibir solicitudes de acompañamiento y coordinar orientación personalizada, es necesario habilitar esta autorización bajo la Ley 1581 de 2012. Las líneas públicas de apoyo psicosocial y primeros auxilios continúan plenamente disponibles.
                    </p>
                    <div className="support-blocked-actions">
                        <Link to="/consentimiento" className="btn-support-submit">
                            <Icon name="shieldCheck" size={16} />
                            <span>Gestionar finalidad C5 en consentimiento</span>
                        </Link>
                        <Link to="/apoyo-crisis" className="support-urgent-action">
                            <Icon name="support" size={16} />
                            <span>Ver ruta pública de apoyo y PAP</span>
                        </Link>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="support-editorial-page">
            {/* Navegación superior sobria */}
            <div className="support-top-nav">
                <button
                    type="button"
                    className="support-back-link"
                    onClick={() => navigate('/agente/panel')}
                >
                    <Icon name="arrowLeft" size={16} />
                    <span>Volver al panel</span>
                </button>
                <Link to="/apoyo-crisis" className="support-urgent-action">
                    <Icon name="support" size={16} />
                    <span>Apoyo inmediato y PAP</span>
                </Link>
            </div>

            {/* Cabecera editorial sin cajas flotantes ni gradientes */}
            <header className="support-page-header">
                <h1 className="support-page-title">Canal de acompañamiento con SST</h1>
                <p className="support-page-subtitle">
                    Orientación psicosocial y acompañamiento preventivo canalizado exclusivamente al equipo de Seguridad y Salud en el Trabajo. Esta solicitud no es visible para tu líder de equipo ni tu supervisor.
                </p>
            </header>

            {/* Formulario continuo estructurado */}
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

            {/* Historial editorial de solicitudes */}
            <section className="support-history-section" aria-labelledby="history-heading">
                <div className="support-history-header">
                    <h2 id="history-heading" className="support-history-title">
                        Mis solicitudes de acompañamiento
                    </h2>
                    <p className="support-history-subtitle">
                        Seguimiento de radicados, tiempos estimados y respuestas de los profesionales de SST.
                    </p>
                </div>

                {userRequests.length === 0 ? (
                    <div className="support-empty-state">
                        <Icon name="support" size={32} className="support-empty-icon" />
                        <strong className="support-empty-title">
                            No tienes solicitudes registradas en este momento
                        </strong>
                        <p className="support-empty-desc">
                            Cuando envíes una consulta o solicitud a SST, aquí podrás hacer seguimiento seguro a su radicado y respuesta.
                        </p>
                    </div>
                ) : (
                    <div className="support-requests-flow" role="list">
                        {userRequests.map(req => (
                            <article key={req.id} className="support-request-item" role="listitem">
                                <div className="support-request-header">
                                    <strong className="support-request-code">{req.code}</strong>
                                    <span className={`support-request-badge ${req.mode === 'anonimo' ? 'is-anon' : ''}`}>
                                        {req.mode === 'anonimo' ? 'Modalidad Anónima' : 'Modalidad Confidencial'}
                                    </span>
                                </div>
                                <div className="support-request-meta-grid">
                                    <div>
                                        <span className="support-meta-label">Motivo:</span> {req.reason}
                                    </div>
                                    <div>
                                        <span className="support-meta-label">Estado:</span>
                                        <span className="support-meta-status">{req.status}</span>
                                    </div>
                                    <div>
                                        <span className="support-meta-label">Atención estimada:</span> {req.sla}
                                    </div>
                                </div>
                                {req.mode === 'anonimo' ? (
                                    <p className="support-request-clarification">
                                        Tu identidad está protegida. La orientación de SST se consulta de forma autónoma con este radicado dentro de la plataforma.
                                    </p>
                                ) : (
                                    <p className="support-request-clarification">
                                        Contacto asignado directamente a un profesional de SST bajo reserva, según el canal y la franja horaria preferidos.
                                    </p>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
