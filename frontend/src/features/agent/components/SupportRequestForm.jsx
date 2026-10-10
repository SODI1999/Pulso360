// src/features/agent/components/SupportRequestForm.jsx
// Formulario para registro voluntario de solicitudes de orientación psicosocial con SST (RF-10)
// Formulario dinámico por modalidad, sin apilamiento de avisos y con radios contenidos (4px).

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
          Selecciona la modalidad de acompañamiento y describe el motivo para coordinar la orientación con el
          equipo de Seguridad y Salud en el Trabajo.
        </p>
      </div>

      <form id="supportForm" onSubmit={onSubmit}>
        {/* Selector de Modalidad (Ergonómico, accesible y con selector integrado en la tarjeta) */}
        <fieldset className="support-mode-fieldset">
          <legend className="support-mode-legend">Modalidad de acompañamiento</legend>
          <div className="support-mode-selector-grid">
            <label
              className={`support-mode-option ${isAnonymous ? 'is-selected' : ''}`}
              htmlFor="modeAnonimo"
            >
              <input
                type="radio"
                id="modeAnonimo"
                name="supportMode"
                className="support-mode-radio-input"
                value="anonimo"
                checked={isAnonymous}
                onChange={() => onSetSupportMode('anonimo')}
                aria-label="Modalidad anónima: tu nombre no se muestra a SST"
              />
              <div className="support-mode-head">
                <div className="support-mode-icon-wrap" aria-hidden="true">
                  <Icon name="eyeOff" size={16} />
                </div>
                <strong className="support-mode-name">Modalidad Anónima</strong>
                {isAnonymous && (
                  <span className="support-mode-check-badge" aria-hidden="true">
                    <Icon name="check" size={13} />
                  </span>
                )}
              </div>
              <p className="support-mode-desc">
                Tu nombre y el identificador de tu cuenta no se muestran a SST. El sistema vincula el radicado a tu cuenta para que puedas consultar las respuestas. El texto que compartas puede revelar tu identidad.
              </p>
            </label>

            <label
              className={`support-mode-option ${!isAnonymous ? 'is-selected' : ''}`}
              htmlFor="modeConfidencial"
            >
              <input
                type="radio"
                id="modeConfidencial"
                name="supportMode"
                className="support-mode-radio-input"
                value="confidencial"
                checked={!isAnonymous}
                onChange={() => onSetSupportMode('confidencial')}
                aria-label="Modalidad identificada: SST recibe tu nombre"
              />
              <div className="support-mode-head">
                <div className="support-mode-icon-wrap" aria-hidden="true">
                  <Icon name="shieldCheck" size={16} />
                </div>
                <strong className="support-mode-name">Modalidad Confidencial Identificada</strong>
                {!isAnonymous && (
                  <span className="support-mode-check-badge" aria-hidden="true">
                    <Icon name="check" size={13} />
                  </span>
                )}
              </div>
              <p className="support-mode-desc">
                SST recibe tu nombre para coordinar la orientación por el canal elegido. El acceso a estas solicitudes está limitado al agente titular y a SST.
              </p>
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
            <option value="Sobrecarga percibida">
              Sobrecarga percibida o fatiga por volumen de llamadas
            </option>
            <option value="Exigencia emocional">
              Exigencia emocional o interacciones complejas en turno
            </option>
            <option value="Conflicto o dificultad laboral">Dificultad o tensión en el entorno laboral</option>
            <option value="Orientación general">
              Orientación preventiva de salud psicosocial y bienestar
            </option>
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
            Máximo 1000 caracteres. El texto de tus bitácoras personales no se comparte con esta solicitud
            salvo autorización explícita.
          </div>
        </div>

        {/* Fila Dinámica de Campos de Contacto y Urgencia */}
        {isAnonymous ? (
          <div className="support-fields-row support-fields-row--anon">
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
            <div className="support-anon-inline-hint">
              <Icon name="info" size={15} />
              <span>
                El código generado sirve como número de radicado y seguimiento administrativo de tu solicitud ante el área de SST; no se requieren datos de contacto ni horarios personales.
              </span>
            </div>
          </div>
        ) : (
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
                value={contactPreference}
                onChange={(e) => onChangeContactPreference(e.target.value)}
              >
                <option value="app">Dentro de la aplicación (Radicado)</option>
                <option value="correo">Correo institucional</option>
                <option value="llamada">Llamada telefónica</option>
              </select>
            </div>

            <div className="support-form-group">
              <label className="support-label" htmlFor="timeWindow">
                Franja horaria de disponibilidad
              </label>
              <select
                id="timeWindow"
                className="support-select"
                value={timeWindow}
                onChange={(e) => onChangeTimeWindow(e.target.value)}
              >
                <option value="Mañana">Inicio de turno (Mañana)</option>
                <option value="Tarde">Mitad o final de turno (Tarde)</option>
                <option value="Cualquiera">Jornada hábil habitual de SST</option>
              </select>
            </div>
          </div>
        )}

        {/* Aviso Institucional Único y Sobrio (Erradicación de las 3 cajas apiladas) */}
        <div className="agent-notice agent-notice--flat support-unified-notice">
          <Icon name="info" size={17} className="agent-notice-icon" />
          <div className="agent-notice-text">
            <strong>Tiempos y alcance de gestión:</strong> Tu solicitud será gestionada por el equipo de SST durante la jornada hábil habitual (prioritaria si marcas alta urgencia). Si la situación corresponde a presunto acoso laboral o discrepancias graves, la instancia legal y bipartita es el <strong>Comité de Convivencia Laboral (CCL - Ley 1010 de 2006)</strong>.
          </div>
        </div>

        <div className="support-form-actions">
          <button className="btn-support-submit" type="submit">
            <Icon name="send" size={15} />
            <span>Radicar solicitud</span>
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
