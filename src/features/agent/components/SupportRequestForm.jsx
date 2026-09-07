// src/features/agent/components/SupportRequestForm.jsx
// Formulario para registro voluntario de solicitudes de orientación psicosocial con SST

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
        <div className="card">
            <div className="card-header">
                <div>
                    <div className="card-title">Nueva solicitud de orientación psicosocial</div>
                    <div className="card-subtitle">Selecciona la modalidad de tu preferencia y describe el motivo de contacto.</div>
                </div>
            </div>

            <form id="supportForm" onSubmit={onSubmit} style={{ marginTop: '16px' }}>
                {/* Selector de Modalidad (Anónima vs Confidencial) */}
                <div className="form-group">
                    <label className="form-label">Modalidad de acompañamiento</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginTop: '6px' }}>
                        <label
                            className="card"
                            style={{
                                display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '14px',
                                cursor: 'pointer', border: isAnonymous ? '1.5px solid var(--c-primario)' : '1px solid var(--c-borde-suave)',
                                background: isAnonymous ? 'var(--c-primario-suave)' : 'var(--c-superficie)'
                            }}
                        >
                            <input
                                type="radio"
                                name="supportMode"
                                value="anonimo"
                                checked={isAnonymous}
                                onChange={() => onSetSupportMode('anonimo')}
                                style={{ marginTop: '3px' }}
                            />
                            <div>
                                <strong style={{ fontSize: '13.5px', color: 'var(--c-texto)' }}>Anónima</strong>
                                <p style={{ fontSize: '12px', color: 'var(--c-texto-suave)', margin: '4px 0 0' }}>
                                    SST no recibe tu nombre ni correo. Consultas la respuesta dentro de la app con el radicado del caso.
                                </p>
                            </div>
                        </label>

                        <label
                            className="card"
                            style={{
                                display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '14px',
                                cursor: 'pointer', border: !isAnonymous ? '1.5px solid var(--c-primario)' : '1px solid var(--c-borde-suave)',
                                background: !isAnonymous ? 'var(--c-primario-suave)' : 'var(--c-superficie)'
                            }}
                        >
                            <input
                                type="radio"
                                name="supportMode"
                                value="confidencial"
                                checked={!isAnonymous}
                                onChange={() => onSetSupportMode('confidencial')}
                                style={{ marginTop: '3px' }}
                            />
                            <div>
                                <strong style={{ fontSize: '13.5px', color: 'var(--c-texto)' }}>Confidencial identificada</strong>
                                <p style={{ fontSize: '12px', color: 'var(--c-texto-suave)', margin: '4px 0 0' }}>
                                    Tu identidad se comparte exclusivamente con el profesional SST asignado para contacto directo.
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Motivo */}
                <div className="form-group">
                    <label className="form-label" htmlFor="supportReason">Motivo principal</label>
                    <select
                        id="supportReason"
                        className="form-select"
                        value={reason}
                        onChange={(e) => onChangeReason(e.target.value)}
                    >
                        <option value="Sobrecarga percibida">Sobrecarga percibida</option>
                        <option value="Exigencia emocional">Exigencia emocional</option>
                        <option value="Conflicto o dificultad laboral">Conflicto o dificultad laboral</option>
                        <option value="Orientación general">Orientación general</option>
                    </select>
                </div>

                {/* Descripción */}
                <div className="form-group">
                    <label className="form-label" htmlFor="supportDetails">Descripción de la situación</label>
                    <textarea
                        id="supportDetails"
                        className="form-textarea"
                        rows={4}
                        maxLength={1000}
                        placeholder="Detalla qué situación estás experimentando para brindarte la mejor orientación..."
                        value={details}
                        onChange={(e) => onChangeDetails(e.target.value)}
                    />
                </div>

                {/* Campos de Contacto y Urgencia */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="supportUrgency">Urgencia percibida</label>
                        <select
                            id="supportUrgency"
                            className="form-select"
                            value={urgency}
                            onChange={(e) => onChangeUrgency(e.target.value)}
                        >
                            <option value="baja">Baja</option>
                            <option value="media">Media</option>
                            <option value="alta">Alta</option>
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
                            <option value="app">Dentro de la app</option>
                            <option value="correo">Correo institucional</option>
                            <option value="llamada">Llamada</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="timeWindow">Franja horaria preferida</label>
                        <select
                            id="timeWindow"
                            className="form-select"
                            value={isAnonymous ? 'Cualquiera' : timeWindow}
                            onChange={(e) => onChangeTimeWindow(e.target.value)}
                            disabled={isAnonymous}
                        >
                            <option value="Mañana">Mañana</option>
                            <option value="Tarde">Tarde</option>
                            <option value="Cualquiera">Cualquiera</option>
                        </select>
                    </div>
                </div>

                <button className="btn btn-primary" type="submit" style={{ marginTop: '12px' }}>
                    <Icon name="arrowRight" size={16} />
                    <span>Enviar solicitud de acompañamiento</span>
                </button>

                {feedback && (
                    <div className="form-feedback success" style={{ marginTop: '12px' }}>
                        {feedback}
                    </div>
                )}
            </form>
        </div>
    );
}
