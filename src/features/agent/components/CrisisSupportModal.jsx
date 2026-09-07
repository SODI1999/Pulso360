// src/features/agent/components/CrisisSupportModal.jsx
// Modal de detección centinela de crisis y canalización voluntaria a SST

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
    if (!isOpen) return null;

    return (
        <div className="modal-overlay active" role="dialog" aria-modal="true">
            <div className="modal-box" style={{ maxWidth: '520px' }}>
                {!priorityStep ? (
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: 'var(--c-texto)' }}>
                            Estás a tiempo de pedir ayuda
                        </h2>
                        <p style={{ fontSize: '13.5px', color: 'var(--c-texto-suave)', lineHeight: '1.5', marginBottom: '20px' }}>
                            Lo que escribiste sugiere que podrías estar pasando por un momento muy difícil o de alta carga emocional. Pulso360 no es un servicio de salud y no reemplaza la orientación profesional. Nada se enviará a terceros sin tu decisión explícita.
                        </p>
                        <div className="modal-footer" style={{ gap: '8px', flexWrap: 'wrap' }}>
                            <Link to="/apoyo-crisis" className="btn btn-primary" onClick={onClose}>
                                Ver líneas de atención oficiales
                            </Link>
                            <button type="button" className="btn btn-secondary" onClick={() => onSetPriorityStep(true)}>
                                Solicitar contacto prioritario SST
                            </button>
                            <button type="button" className="btn btn-ghost" onClick={onContinue}>
                                Cerrar y continuar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: 'var(--c-texto)' }}>
                            Contacto prioritario con SST
                        </h2>

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
                            <div>
                                <p style={{ fontSize: '13.5px', color: 'var(--c-texto-suave)', marginBottom: '14px' }}>
                                    Elige la modalidad para la atención de tu caso. Ningún texto de tu bitácora será enviado.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                    <label style={{ display: 'flex', gap: '10px', padding: '10px', border: '1px solid var(--c-borde-suave)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="crisisMode"
                                            value="anonimo"
                                            checked={crisisMode === 'anonimo'}
                                            onChange={() => onChangeCrisisMode('anonimo')}
                                        />
                                        <div>
                                            <strong style={{ fontSize: '13px' }}>Modalidad Anónima</strong>
                                            <div style={{ fontSize: '11.5px', color: 'var(--c-texto-suave)' }}>
                                                Tu identidad queda protegida. SST no recibirá tu nombre ni tu correo.
                                            </div>
                                        </div>
                                    </label>

                                    <label style={{ display: 'flex', gap: '10px', padding: '10px', border: '1px solid var(--c-borde-suave)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="crisisMode"
                                            value="confidencial"
                                            checked={crisisMode === 'confidencial'}
                                            onChange={() => onChangeCrisisMode('confidencial')}
                                        />
                                        <div>
                                            <strong style={{ fontSize: '13px' }}>Modalidad Confidencial Identificada</strong>
                                            <div style={{ fontSize: '11.5px', color: 'var(--c-texto-suave)' }}>
                                                Tus datos de contacto serán visibles de forma reservada y exclusiva para el profesional SST.
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => onSetPriorityStep(false)}>
                                Volver
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
