import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../core/components/Icon';

export function CrisisSupportModal({
    isOpen,
    priorityStep,
    onSetPriorityStep,
    crisisMode,
    onChangeCrisisMode,
    hasC5Consent,
    onConfirmPriority,
    onContinue,
    onClose
}) {
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay active"
            role="dialog"
            aria-modal="true"
            aria-labelledby="crisis-modal-title"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="modal-box" style={{ maxWidth: '540px' }}>
                {!priorityStep ? (
                    <div>
                        <div className="modal-header">
                            <div>
                                <span
                                    style={{
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        color: 'var(--c-calma-accent)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        display: 'block',
                                        marginBottom: '4px'
                                    }}
                                >
                                    Cuidado Psicosocial Voluntario
                                </span>
                                <h2 id="crisis-modal-title" className="modal-title">
                                    Estás a tiempo de pedir ayuda y apoyo
                                </h2>
                                <p className="modal-subtitle">
                                    Lo que registraste sugiere que podrías estar experimentando una sobrecarga intensa o un momento difícil. Pulso360 no es un servicio de salud y nada se compartirá sin tu decisión explícita.
                                </p>
                            </div>
                            <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar ventana de apoyo">
                                <Icon name="close" size={18} />
                            </button>
                        </div>

                        {/* Aviso explícito de privacidad para desactivar el pánico */}
                        <div
                            style={{
                                padding: '14px 16px',
                                backgroundColor: 'var(--c-calma-surface-subtle)',
                                border: '1px solid var(--c-calma-border)',
                                borderRadius: 'var(--radius-md)',
                                margin: '14px 0',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px'
                            }}
                        >
                            <Icon name="shieldCheck" size={22} style={{ color: 'var(--c-calma-accent)', flexShrink: 0, marginTop: '2px' }} />
                            <div style={{ fontSize: '12.5px', color: 'var(--c-calma-text)', lineHeight: '1.5' }}>
                                <strong>Tranquilo/a:</strong> Esta sugerencia fue generada por coincidencias léxicas dentro de tu propio navegador. Ningún supervisor, directivo ni compañero ha recibido alerta alguna. Tú decides en total privacidad si deseas cerrar esta ventana o solicitar apoyo.
                            </div>
                        </div>

                        {/* Enlaces rápidos a Línea 106 y canal prioritario SST */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '16px 0' }}>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--c-texto-suave)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Accesos rápidos de contención inmediata
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <a
                                    href="tel:106"
                                    className="btn-clinical-support"
                                    style={{ flex: 1, minWidth: '200px', justifyContent: 'center' }}
                                    aria-label="Llamar directamente a la Línea 106 de salud mental"
                                >
                                    <Icon name="phone" size={16} />
                                    <span>Llamar a Línea 106 (Gratis 24/7)</span>
                                </a>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => onSetPriorityStep(true)}
                                    style={{ flex: 1, minWidth: '200px', justifyContent: 'center' }}
                                >
                                    <Icon name="shield" size={16} />
                                    <span>Solicitar contacto SST</span>
                                </button>
                            </div>
                        </div>

                        <div className="modal-footer" style={{ gap: '8px', flexWrap: 'wrap', marginTop: '20px', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Link to="/apoyo-crisis" className="btn btn-secondary" onClick={onClose} style={{ fontSize: '13px' }}>
                                <Icon name="self_improvement" size={16} />
                                <span>Ver primeros auxilios psicológicos y rutas</span>
                            </Link>
                            <button type="button" className="btn btn-ghost" onClick={onContinue}>
                                Cerrar y continuar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="modal-header">
                            <div>
                                <span
                                    style={{
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        color: 'var(--c-primario)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        display: 'block',
                                        marginBottom: '4px'
                                    }}
                                >
                                    Canal Reservado con SST
                                </span>
                                <h2 id="crisis-modal-title" className="modal-title">
                                    Contacto prioritario con SST
                                </h2>
                                <p className="modal-subtitle">
                                    Elige la modalidad para la atención de tu caso. Ningún texto de tu bitácora será enviado ni compartido con supervisión.
                                </p>
                            </div>
                            <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar ventana de apoyo">
                                <Icon name="close" size={18} />
                            </button>
                        </div>

                        {!hasC5Consent ? (
                            <div className="alert-banner warn" style={{ margin: '16px 0' }}>
                                <Icon name="info" size={18} />
                                <div>
                                    <strong>Finalidad C5 requerida:</strong> Debes activar la finalidad <em>C5 (Acompañamiento)</em> en tus preferencias para solicitar contacto con SST.
                                    <div style={{ marginTop: '10px' }}>
                                        <Link to="/consentimiento" className="btn btn-primary" style={{ fontSize: '12.5px' }}>
                                            Gestionar consentimiento
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ marginTop: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                    <label className={`support-mode-capsule ${crisisMode === 'anonimo' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="crisisMode"
                                            value="anonimo"
                                            className="support-mode-radio"
                                            checked={crisisMode === 'anonimo'}
                                            onChange={() => onChangeCrisisMode('anonimo')}
                                        />
                                        <div>
                                            <strong style={{ fontSize: '13px', color: 'var(--c-texto)' }}>Modalidad Anónima</strong>
                                            <div style={{ fontSize: '11.5px', color: 'var(--c-texto-suave)', marginTop: '2px' }}>
                                                Tu identidad queda protegida. SST no recibirá tu nombre ni tu correo. Consultas la respuesta dentro de la app con el radicado del caso.
                                            </div>
                                        </div>
                                    </label>

                                    <label className={`support-mode-capsule ${crisisMode === 'confidencial' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="crisisMode"
                                            value="confidencial"
                                            className="support-mode-radio"
                                            checked={crisisMode === 'confidencial'}
                                            onChange={() => onChangeCrisisMode('confidencial')}
                                        />
                                        <div>
                                            <strong style={{ fontSize: '13px', color: 'var(--c-texto)' }}>Modalidad Confidencial Identificada</strong>
                                            <div style={{ fontSize: '11.5px', color: 'var(--c-texto-suave)', marginTop: '2px' }}>
                                                Tus datos de contacto serán visibles de forma reservada y exclusiva para el profesional SST. Tu líder o supervisor no recibe notificación alguna.
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => onSetPriorityStep(false)}>
                                Atrás
                            </button>
                            {hasC5Consent && (
                                <button type="button" className="btn btn-primary" onClick={onConfirmPriority}>
                                    Confirmar solicitud prioritaria
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

