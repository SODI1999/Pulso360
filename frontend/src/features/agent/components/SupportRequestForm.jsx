// src/features/agent/components/SupportRequestForm.jsx
// Formulario ergonómico y guiado para registro de orientación psicosocial con SST (RF-10)

import PropTypes from 'prop-types';
import { Icon } from '../../../core/components/Icon';

const REASON_OPTIONS = [
  {
    value: 'Sobrecarga percibida',
    title: 'Sobrecarga en llamadas',
    desc: 'Fatiga por volumen continuo o colas densas en turno',
    icon: 'activity'
  },
  {
    value: 'Exigencia emocional',
    title: 'Desgaste emocional',
    desc: 'Interacciones difíciles o tensión tras llamadas complejas',
    icon: 'heart'
  },
  {
    value: 'Conflicto o dificultad laboral',
    title: 'Tensión en el entorno',
    desc: 'Dificultades de relacionamiento o convivencia en el equipo',
    icon: 'alertTriangle'
  },
  {
    value: 'Orientación general',
    title: 'Bienestar y prevención',
    desc: 'Consulta preventiva de salud ocupacional y hábitos ergonómicos',
    icon: 'shieldCheck'
  }
];

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
    <section className="support-form-card" aria-labelledby="support-form-title">
      <header className="support-form-header">
        <h2 id="support-form-title" className="support-form-title">
          Nueva solicitud de orientación y acompañamiento con SST
        </h2>
        <p className="support-form-subtitle">
          Canal preventivo para coordinar apoyo psicosocial y ergonomía con el equipo de Seguridad y Salud en el Trabajo. Toda solicitud genera un radicado institucional formal.
        </p>
      </header>

      <form id="supportForm" onSubmit={onSubmit} className="support-form-body">
        {/* Selector de Modalidad */}
        <fieldset className="support-mode-fieldset">
          <legend className="support-mode-legend">1. Selecciona la modalidad de radicación</legend>
          <div className="support-mode-selector-grid" role="radiogroup" aria-label="Modalidad de radicación">
            <label
              className={`support-mode-card ${isAnonymous ? 'is-selected' : ''}`}
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
                aria-label="Modalidad anónima: tu nombre no se comparte con SST"
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
                Tu nombre no se muestra al equipo de SST. El seguimiento se realiza exclusivamente a través del código de radicado desde tu cuenta.
              </p>
            </label>

            <label
              className={`support-mode-card ${!isAnonymous ? 'is-selected' : ''}`}
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
                aria-label="Modalidad confidencial identificada: SST conoce tu nombre"
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
                SST recibe tu nombre para coordinar la orientación presencial o virtual según tu turno. El acceso está restringido estrictamente a ti y a SST.
              </p>
            </label>
          </div>
        </fieldset>

        {/* Motivo Principal con Tarjetas Seleccionables */}
        <div className="support-form-group">
          <label className="support-label" id="reasonGroupLabel">
            2. Motivo principal de orientación
          </label>
          <div className="support-reason-cards-grid" role="radiogroup" aria-labelledby="reasonGroupLabel">
            {REASON_OPTIONS.map((opt) => {
              const isSelected = reason === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  role="radio"
                  aria-checked={isSelected}
                  className={`support-reason-card ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => onChangeReason(opt.value)}
                >
                  <div className="support-reason-icon" aria-hidden="true">
                    <Icon name={opt.icon} size={16} />
                  </div>
                  <div className="support-reason-text">
                    <strong className="support-reason-title">{opt.title}</strong>
                    <span className="support-reason-desc">{opt.desc}</span>
                  </div>
                  {isSelected && (
                    <span className="support-reason-check" aria-hidden="true">
                      <Icon name="check" size={12} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Descripción y contexto */}
        <div className="support-form-group">
          <label className="support-label" htmlFor="supportDetails">
            3. Contexto o detalles de la situación <span className="support-label-hint">(Opcional)</span>
          </label>
          <textarea
            id="supportDetails"
            className="support-textarea"
            rows={4}
            maxLength={1000}
            placeholder="Describe brevemente la situación o motivo para que el especialista de SST prepare el espacio de orientación adecuado…"
            value={details}
            onChange={(e) => onChangeDetails(e.target.value)}
            aria-describedby="detailsHint"
          />
          <div className="support-textarea-meta">
            <span id="detailsHint" className="support-field-hint">
              Máximo 1000 caracteres. El contenido de tus bitácoras personales no se comparte con esta solicitud.
            </span>
            <span className="support-char-count">{details.length}/1000</span>
          </div>
        </div>

        {/* Fila Dinámica de Urgencia y Preferencias */}
        <div className="support-preferences-grid">
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
              <option value="baja">Baja · Consulta ordinaria de turno</option>
              <option value="media">Media · Atención pronta sugerida</option>
              <option value="alta">Alta · Atención prioritaria requerida</option>
            </select>
          </div>

          {!isAnonymous && (
            <>
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
                  <option value="llamada">Llamada telefónica o presencial</option>
                </select>
              </div>

              <div className="support-form-group">
                <label className="support-label" htmlFor="timeWindow">
                  Franja de disponibilidad
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
            </>
          )}
        </div>

        {isAnonymous && (
          <div className="support-anon-callout" role="note">
            <Icon name="info" size={15} />
            <span>
              Al radicar en modo anónimo, no se requieren datos personales ni horarios; la comunicación se realiza exclusivamente mediante mensajes en este radicado.
            </span>
          </div>
        )}

        {/* Aviso Institucional Bipartito CCL */}
        <div className="support-legal-callout">
          <Icon name="info" size={16} className="support-legal-icon" />
          <div className="support-legal-text">
            <strong>Alcance y tiempos de atención:</strong> Tu solicitud será gestionada por el área de SST durante la jornada hábil (SLA estimado: 24 horas hábiles; prioritario si indicas alta urgencia). Para situaciones relacionadas con presunto acoso laboral o conductas contempladas en la <strong>Ley 1010 de 2006</strong>, el canal legal y confidencial es el <strong>Comité de Convivencia Laboral (CCL)</strong>.
          </div>
        </div>

        <footer className="support-form-actions">
          <button className="btn-support-submit" type="submit">
            <Icon name="send" size={15} />
            <span>Radicar solicitud ante SST</span>
          </button>
        </footer>

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

SupportRequestForm.propTypes = {
  isAnonymous: PropTypes.bool.isRequired,
  onSetSupportMode: PropTypes.func.isRequired,
  reason: PropTypes.string.isRequired,
  onChangeReason: PropTypes.func.isRequired,
  details: PropTypes.string.isRequired,
  onChangeDetails: PropTypes.func.isRequired,
  urgency: PropTypes.string.isRequired,
  onChangeUrgency: PropTypes.func.isRequired,
  contactPreference: PropTypes.string.isRequired,
  onChangeContactPreference: PropTypes.func.isRequired,
  timeWindow: PropTypes.string.isRequired,
  onChangeTimeWindow: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  feedback: PropTypes.string
};
