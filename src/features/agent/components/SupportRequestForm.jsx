// src/features/agent/components/SupportRequestForm.jsx
// Formulario para registro voluntario de solicitudes de orientación psicosocial con SST (RF-10)

import { Icon } from '../../../core/components/Icon';

export function SupportRequestForm({
    isAnonymous,
    onSetSupportMode,
    reason,
    onChangeReason,
    details,
    onChangeDetails,
    urgency,
    onChangeUrgency,
    contactPreference,
    onChangeContactPreference,
    timeWindow,
    onChangeTimeWindow,
    onSubmit,
    feedback
}) {
    return (
        <div className="card" style={{ border: '1.5px solid var(--c-calma-border)' }}>
            <div className="card-header">
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
                        Canal Privado con SST
                    </span>
                    <div className="card-title" style={{ fontSize: '16px', color: 'var(--c-calma-text)' }}>
                        Nueva solicitud de orientación y acompañamiento psicosocial
                    </div>
                    <div className="card-subtitle">
                        Elige la modalidad que te haga sentir en mayor seguridad y describe libremente cómo te podemos orientar.
                    </div>
                </div>
            </div>

            <form id="supportForm" onSubmit={onSubmit} style={{ marginTop: '16px' }}>
                {/* Selector de Modalidad (Anónima vs Confidencial con clarificación explícita) */}
                <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '700', color: 'var(--c-texto)' }}>
                        Modalidad de acompañamiento
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '6px' }}>
                        <label
                            className={`support-mode-capsule ${isAnonymous ? 'active' : ''}`}
                            htmlFor="modeAnonimo"
                        >
                            <input
                                type="radio"
                                id="modeAnonimo"
                                name="supportMode"
                                className="support-mode-radio"
                                value="anonimo"
                                checked={isAnonymous}
                                onChange={() => onSetSupportMode('anonimo')}
                            />
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <strong style={{ fontSize: '13.5px', color: 'var(--c-texto)' }}>Modalidad Anónima</strong>
                                    <span className="badge badge-ok" style={{ fontSize: '10px' }}>Reserva Total</span>
                                </div>
                                <p style={{ fontSize: '12px', color: 'var(--c-texto-suave)', margin: '4px 0 0', lineHeight: '1.45' }}>
                                    SST <strong>no recibe tu nombre ni tu documento de identidad</strong>. Tu caso se atiende mediante radicado seguro y consultas las respuestas y orientaciones dentro de la app con el código generado.
                                </p>
                            </div>
                        </label>

                        <label
                            className={`support-mode-capsule ${!isAnonymous ? 'active' : ''}`}
                            htmlFor="modeConfidencial"
                        >
                            <input
                                type="radio"
                                id="modeConfidencial"
                                name="supportMode"
                                className="support-mode-radio"
                                value="confidencial"
                                checked={!isAnonymous}
                                onChange={() => onSetSupportMode('confidencial')}
                            />
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <strong style={{ fontSize: '13.5px', color: 'var(--c-texto)' }}>Modalidad Confidencial Identificada</strong>
                                    <span className="badge badge-info" style={{ fontSize: '10px' }}>Reserva Profesional</span>
                                </div>
                                <p style={{ fontSize: '12px', color: 'var(--c-texto-suave)', margin: '4px 0 0', lineHeight: '1.45' }}>
                                    Tus datos quedan bajo estricta reserva médica/psicosocial de SST. <strong>Tu supervisor, directivo o equipo no intervienen ni son notificados</strong>. El profesional SST te contacta directamente por el canal que escojas.
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Motivo Principal */}
                <div className="form-group">
                    <label className="form-label" htmlFor="supportReason">Motivo principal de orientación</label>
                    <select
                        id="supportReason"
                        className="form-select"
                        value={reason}
                        onChange={(e) => onChangeReason(e.target.value)}
                    >
                        <option value="Sobrecarga percibida">Sobrecarga percibida o fatiga por volumen</option>
                        <option value="Exigencia emocional">Exigencia emocional o interacciones difíciles</option>
                        <option value="Conflicto o dificultad laboral">Conflicto o dificultad en el entorno laboral</option>
                        <option value="Orientación general">Orientación preventiva de bienestar y salud psicosocial</option>
                    </select>
                </div>

                {/* Descripción empática */}
                <div className="form-group">
                    <label className="form-label" htmlFor="supportDetails">Descripción o contexto que desees compartir (Opcional pero orientador)</label>
                    <textarea
                        id="supportDetails"
                        className="form-textarea"
                        rows={4}
                        maxLength={1000}
                        placeholder="Comparte los detalles que consideres necesarios para que el equipo de SST comprenda tu situación y prepare la mejor orientación..."
                        value={details}
                        onChange={(e) => onChangeDetails(e.target.value)}
                    />
                    <div style={{ fontSize: '11.5px', color: 'var(--c-texto-mutado)', marginTop: '4px' }}>
                        Máximo 1000 caracteres. Recuerda que no se transmitirá ningún texto de tus bitácoras personales no autorizadas.
                    </div>
                </div>

                {/* Campos de Contacto y Urgencia */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="supportUrgency">Nivel de urgencia percibido</label>
                        <select
                            id="supportUrgency"
                            className="form-select"
                            value={urgency}
                            onChange={(e) => onChangeUrgency(e.target.value)}
                        >
                            <option value="baja">Baja - Consulta de rutina</option>
                            <option value="media">Media - Deseo atención pronto</option>
                            <option value="alta">Alta - Requiere atención prioritaria</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="contactPreference">Preferencia de respuesta</label>
                        <select
                            id="contactPreference"
                            className="form-select"
                            value={isAnonymous ? 'app' : contactPreference}
                            onChange={(e) => onChangeContactPreference(e.target.value)}
                            disabled={isAnonymous}
                        >
                            <option value="app">Dentro de la aplicación (Seguro y reservado)</option>
                            <option value="correo">Correo institucional (Solo modo confidencial)</option>
                            <option value="llamada">Llamada telefónica (Solo modo confidencial)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="timeWindow">Franja de disponibilidad horaria</label>
                        <select
                            id="timeWindow"
                            className="form-select"
                            value={isAnonymous ? 'Cualquiera' : timeWindow}
                            onChange={(e) => onChangeTimeWindow(e.target.value)}
                            disabled={isAnonymous}
                        >
                            <option value="Mañana">Mañana (Inicio de turno)</option>
                            <option value="Tarde">Tarde (Mitad de turno)</option>
                            <option value="Cualquiera">Cualquier momento hábil de SST</option>
                        </select>
                    </div>
                </div>

                {isAnonymous && (
                    <div
                        role="note"
                        style={{
                            fontSize: '12px',
                            color: 'var(--c-texto-suave)',
                            marginTop: '8px',
                            marginBottom: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Icon name="info" size={14} style={{ color: 'var(--c-calma-accent)', flexShrink: 0 }} />
                        <span>
                            En modalidad anónima la respuesta se consulta directamente en este panel con tu código de radicado; no se requieren datos de contacto ni horarios.
                        </span>
                    </div>
                )}

                {/* Indicación Empática de Tiempo Estimado de Respuesta */}
                <div
                    style={{
                        padding: '12px 16px',
                        backgroundColor: 'var(--c-calma-surface-subtle)',
                        border: '1px solid var(--c-calma-border)',
                        borderRadius: 'var(--radius-md)',
                        margin: '16px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}
                >
                    <Icon name="clock" size={18} style={{ color: 'var(--c-calma-accent)', flexShrink: 0 }} />
                    <div style={{ fontSize: '12.5px', color: 'var(--c-calma-text)', lineHeight: '1.45' }}>
                        <strong>Tiempo estimado de respuesta:</strong> Durante la jornada habitual de SST (o de forma prioritaria si marcas alta urgencia).
                    </div>
                </div>

                {/* Nota Pedagógica del Comité de Convivencia Laboral (CCL - Ley 1010 de 2006) */}
                <div
                    style={{
                        padding: '12px 16px',
                        backgroundColor: 'var(--c-fondo)',
                        border: '1px dashed var(--c-borde)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px'
                    }}
                >
                    <Icon name="info" size={18} style={{ color: 'var(--c-texto-suave)', flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '12px', color: 'var(--c-texto-suave)', lineHeight: '1.5' }}>
                        <strong>Orientación sobre canales institucionales (Ley 1010 de 2006):</strong> Si la situación que estás viviendo corresponde a presunto acoso laboral o discrepancias interpersonales graves entre compañeros o con superiores, la instancia legal y bipartita formal en la empresa es el <strong>Comité de Convivencia Laboral (CCL)</strong>. Este formulario con SST es un canal de apoyo psicosocial, acompañamiento emocional y cuidado de la salud.
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" type="submit" style={{ minHeight: '42px', padding: '10px 20px', fontSize: '14px' }}>
                        <Icon name="send" size={16} />
                        <span>Enviar solicitud de acompañamiento</span>
                    </button>
                </div>

                {feedback && (
                    <div className="alert-banner ok" style={{ marginTop: '16px' }}>
                        <Icon name="checkCircle" size={18} />
                        <span>{feedback}</span>
                    </div>
                )}
            </form>
        </div>
    );
}

