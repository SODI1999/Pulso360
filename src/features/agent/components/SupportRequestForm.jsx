// src/features/agent/components/SupportRequestForm.jsx
// Formulario para registro voluntario de solicitudes de orientación psicosocial con SST (RF-10)
// Diseñado con pulso360-ui-craft: Blueprint 0 (Flujo Editorial Continuo) y filtros anti-slop

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
        <section className="support-form-section" aria-labelledby="support-form-heading">
            <div className="support-section-header">
                <h2 id="support-form-heading" className="support-section-title">
                    Nueva solicitud de orientación y acompañamiento psicosocial
                </h2>
                <p className="support-section-subtitle">
                    Selecciona la modalidad de acompañamiento y describe el motivo para coordinar la orientación con el equipo de Seguridad y Salud en el Trabajo.
                </p>
            </div>

            <form id="supportForm" onSubmit={onSubmit}>
                {/* Selector de Modalidad (Ergonómico, accesible y sobrio) */}
                <fieldset className="support-mode-fieldset">
                    <legend className="support-mode-legend">
                        Modalidad de acompañamiento
                    </legend>
                    <div className="support-mode-selector-grid">
                        <label
                            className={`support-mode-option ${isAnonymous ? 'is-selected' : ''}`}
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
                                aria-label="Modalidad Anónima (sin asociar tu identidad)"
                            />
                            <div className="support-mode-text-wrap">
                                <div className="support-mode-heading-row">
                                    <span className="support-mode-name">Modalidad Anónima</span>
                                    <span className="support-mode-chip">Sin asociar tu identidad</span>
                                </div>
                                <p className="support-mode-desc">
                                    SST no recibe tu nombre ni tu documento de identidad. Tu solicitud se gestiona mediante radicado seguro y consultas las respuestas en esta plataforma con el código generado.
                                </p>
                            </div>
                        </label>

                        <label
                            className={`support-mode-option ${!isAnonymous ? 'is-selected' : ''}`}
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
                                aria-label="Modalidad Confidencial Identificada (con reserva profesional de SST)"
                            />
                            <div className="support-mode-text-wrap">
                                <div className="support-mode-heading-row">
                                    <span className="support-mode-name">Modalidad Confidencial Identificada</span>
                                    <span className="support-mode-chip">Reserva profesional SST</span>
                                </div>
                                <p className="support-mode-desc">
                                    Tu identidad se asocia a la solicitud para que un profesional de SST pueda orientarte de manera personalizada por el canal escogido. Tu supervisor no recibe este caso individual.
                                </p>
                            </div>
                        </label>
                    </div>
                </fieldset>

                {/* Motivo Principal */}
                <div className="support-form-group">
                    <label className="support-label" htmlFor="supportReason">
                        Motivo principal de orientación
                    </label>
                    <select
                        id="supportReason"
                        className="support-select"
                        value={reason}
                        onChange={(e) => onChangeReason(e.target.value)}
                    >
                        <option value="Sobrecarga percibida">Sobrecarga percibida o fatiga por volumen de llamadas</option>
                        <option value="Exigencia emocional">Exigencia emocional o interacciones complejas en turno</option>
                        <option value="Conflicto o dificultad laboral">Dificultad o tensión en el entorno laboral</option>
                        <option value="Orientación general">Orientación preventiva de salud psicosocial y bienestar</option>
                    </select>
                </div>

                {/* Descripción y contexto */}
                <div className="support-form-group">
                    <label className="support-label" htmlFor="supportDetails">
                        Contexto o detalles de la situación
                        <span className="support-label-hint">(Opcional)</span>
                    </label>
                    <textarea
                        id="supportDetails"
                        className="support-textarea"
                        rows={4}
                        maxLength={1000}
                        placeholder="Comparte los detalles que consideres necesarios para que el equipo de SST comprenda la situación y prepare la mejor orientación..."
                        value={details}
                        onChange={(e) => onChangeDetails(e.target.value)}
                        aria-describedby="detailsHint"
                    />
                    <div id="detailsHint" className="support-field-hint">
                        Máximo 1000 caracteres. El texto de tus bitácoras personales no se comparte con esta solicitud salvo autorización explícita.
                    </div>
                </div>

                {/* Fila de Campos de Contacto y Urgencia */}
                <div className="support-fields-row">
                    <div className="support-form-group">
                        <label className="support-label" htmlFor="supportUrgency">
                            Nivel de urgencia percibido
                        </label>
                        <select
                            id="supportUrgency"
                            className="support-select"
                            value={urgency}
                            onChange={(e) => onChangeUrgency(e.target.value)}
                        >
                            <option value="baja">Baja (Consulta ordinaria de turno)</option>
                            <option value="media">Media (Atención pronta sugerida)</option>
                            <option value="alta">Alta (Atención prioritaria requerida)</option>
                        </select>
                    </div>

                    <div className="support-form-group">
                        <label className="support-label" htmlFor="contactPreference">
                            Canal de respuesta preferido
                        </label>
                        <select
                            id="contactPreference"
                            className="support-select"
                            value={isAnonymous ? 'app' : contactPreference}
                            onChange={(e) => onChangeContactPreference(e.target.value)}
                            disabled={isAnonymous}
                        >
                            <option value="app">Dentro de la aplicación (Radicado)</option>
                            <option value="correo">Correo institucional (Solo modo confidencial)</option>
                            <option value="llamada">Llamada telefónica (Solo modo confidencial)</option>
                        </select>
                    </div>

                    <div className="support-form-group">
                        <label className="support-label" htmlFor="timeWindow">
                            Franja horaria de disponibilidad
                        </label>
                        <select
                            id="timeWindow"
                            className="support-select"
                            value={isAnonymous ? 'Cualquiera' : timeWindow}
                            onChange={(e) => onChangeTimeWindow(e.target.value)}
                            disabled={isAnonymous}
                        >
                            <option value="Mañana">Inicio de turno (Mañana)</option>
                            <option value="Tarde">Mitad o final de turno (Tarde)</option>
                            <option value="Cualquiera">Jornada hábil habitual de SST</option>
                        </select>
                    </div>
                </div>

                {/* Nota para modalidad anónima */}
                {isAnonymous && (
                    <div className="support-editorial-notice" role="note">
                        <Icon name="info" size={16} className="support-notice-icon" />
                        <div className="support-notice-text">
                            En <strong>modalidad anónima</strong> la respuesta se consulta de forma autónoma con tu código de radicado desde este panel; no se requieren datos de contacto ni horarios personales.
                        </div>
                    </div>
                )}

                {/* Indicación de tiempo estimado de respuesta */}
                <div className="support-editorial-notice">
                    <Icon name="clock" size={16} className="support-notice-icon" />
                    <div className="support-notice-text">
                        <strong>Tiempo estimado de gestión:</strong> Durante la jornada hábil habitual del equipo de SST (o de forma prioritaria si marcas alta urgencia).
                    </div>
                </div>

                {/* Nota institucional sobre Comité de Convivencia Laboral (CCL - Ley 1010 de 2006) */}
                <div className="support-editorial-notice">
                    <Icon name="shield" size={16} className="support-notice-icon" />
                    <div className="support-notice-text">
                        <strong>Canal institucional complementario (Ley 1010 de 2006):</strong> Si la situación corresponde a presunto acoso laboral o discrepancias interpersonales graves, la instancia legal y bipartita es el <strong>Comité de Convivencia Laboral (CCL)</strong>. Este formulario con SST es un canal de apoyo psicosocial, acompañamiento y cuidado preventivo de la salud.
                    </div>
                </div>

                <div className="support-form-actions">
                    <button className="btn-support-submit" type="submit">
                        <Icon name="send" size={16} />
                        <span>Registrar solicitud de acompañamiento</span>
                    </button>
                </div>

                {feedback && (
                    <div className="support-feedback-alert" role="status" aria-live="polite">
                        <Icon name="checkCircle" size={18} />
                        <span>{feedback}</span>
                    </div>
                )}
            </form>
        </section>
    );
}
