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
        <div className="card agent-form-card">
            <div className="card-header">
                <div>
                    <span className="agent-kicker">
                        Canal de acompañamiento con SST
                    </span>
                    <div className="card-title">
                        Nueva solicitud de orientación y acompañamiento psicosocial
                    </div>
                    <div className="card-subtitle">
                        Elige la modalidad que te haga sentir en mayor seguridad y describe libremente cómo te podemos orientar.
                    </div>
                </div>
            </div>

            <form id="supportForm" onSubmit={onSubmit}>
                {/* Selector de Modalidad (Anónima vs Confidencial con clarificación explícita) */}
                <div className="form-group">
                    <label className="form-label form-label--strong">
                        Modalidad de acompañamiento
                    </label>
                    <div className="support-mode-grid">
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
                                <div className="support-mode-head">
                                    <strong>Modalidad Anónima</strong>
                                    <span className="badge badge-ok">Sin identificación en el caso</span>
                                </div>
                                <p className="support-mode-desc">
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
                                <div className="support-mode-head">
                                    <strong>Modalidad Confidencial Identificada</strong>
                                    <span className="badge badge-info">Reserva Profesional</span>
                                </div>
                                <p className="support-mode-desc">
                                    Tu identidad se asocia a la solicitud para que SST pueda orientarte por el canal que escojas. La vista operativa no incorpora este caso individual.
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
                    <div className="field-hint">
                        Máximo 1000 caracteres. Recuerda que no se transmitirá ningún texto de tus bitácoras personales no autorizadas.
                    </div>
                </div>

                {/* Campos de Contacto y Urgencia */}
                <div className="form-row-grid">
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
                            <option value="app">Dentro de la aplicación</option>
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
                    <div className="agent-note-row" role="note">
                        <Icon name="info" size={14} className="agent-notice-icon" />
                        <span>
                            En modalidad anónima la respuesta se consulta directamente en este panel con tu código de radicado; no se requieren datos de contacto ni horarios.
                        </span>
                    </div>
                )}

                {/* Indicación Empática de Tiempo Estimado de Respuesta */}
                <div className="agent-notice agent-notice--center">
                    <Icon name="clock" size={18} className="agent-notice-icon" />
                    <div className="agent-notice-text">
                        <strong>Tiempo estimado de respuesta:</strong> Durante la jornada habitual de SST (o de forma prioritaria si marcas alta urgencia).
                    </div>
                </div>

                {/* Nota Pedagógica del Comité de Convivencia Laboral (CCL - Ley 1010 de 2006) */}
                <div className="agent-notice agent-notice--dashed">
                    <Icon name="info" size={18} className="agent-notice-icon" />
                    <div className="agent-notice-text">
                        <strong>Orientación sobre canales institucionales (Ley 1010 de 2006):</strong> Si la situación que estás viviendo corresponde a presunto acoso laboral o discrepancias interpersonales graves entre compañeros o con superiores, la instancia legal y bipartita formal en la empresa es el <strong>Comité de Convivencia Laboral (CCL)</strong>. Este formulario con SST es un canal de apoyo psicosocial, acompañamiento emocional y cuidado de la salud.
                    </div>
                </div>

                <div className="form-actions">
                    <button className="btn btn-primary" type="submit">
                        <Icon name="send" size={16} />
                        <span>Enviar solicitud de acompañamiento</span>
                    </button>
                </div>

                {feedback && (
                    <div className="alert-banner ok">
                        <Icon name="checkCircle" size={18} />
                        <span>{feedback}</span>
                    </div>
                )}
            </form>
        </div>
    );
}
