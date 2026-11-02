import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
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

/**
 * Ergonomic guided intake form for psychosocial and occupational support requests (SST).
 * Features modality selection (anonymous vs identified), reason selection cards,
 * perceived urgency, contact preferences and feedback that distinguishes save and history failures.
 *
 * @param {Object} props - Component properties.
 * @param {boolean} props.isAnonymous - Flag indicating whether anonymity is requested.
 * @param {(mode: string) => void} props.onSetSupportMode - Support mode setter callback ('anonimo'|'confidencial').
 * @param {string} props.reason - Currently selected occupational reason.
 * @param {(val: string) => void} props.onChangeReason - Reason setter.
 * @param {string} props.details - Context or description text.
 * @param {(val: string) => void} props.onChangeDetails - Details setter.
 * @param {string} props.urgency - Selected urgency level ('baja'|'media'|'alta').
 * @param {(val: string) => void} props.onChangeUrgency - Urgency setter.
 * @param {string} props.contactPreference - Preferred contact method ('app'|'directo'|'llamada').
 * @param {(val: string) => void} props.onChangeContactPreference - Contact preference setter.
 * @param {string} props.timeWindow - Preferred availability slot.
 * @param {(val: string) => void} props.onChangeTimeWindow - Time window setter.
 * @param {(e: import('react').FormEvent) => Promise<void>} props.onSubmit - Coordinates confirmed save and history synchronization.
 * @param {{type: 'success'|'error'|'warning', message: string}|null} [props.feedback] - Explicit result of submission/history synchronization.
 * @param {boolean} props.isSubmitting - Disables another submission while the current one is pending.
 * @param {boolean} props.isRefreshingHistory - Disables duplicate history refreshes.
 * @param {() => Promise<void>} props.onRetryHistory - Refreshes history without resubmitting the request.
 * @returns {import('react').JSX.Element} Support request form section.
 */
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
  feedback,
  isSubmitting,
  isRefreshingHistory,
  onRetryHistory
}) {
  const feedbackRef = useRef(null);
  useEffect(() => {
    if (!feedback) return;
    const focused = document.activeElement;
    if (focused === document.body || focused?.closest('.support-form-actions')) feedbackRef.current?.focus();
  }, [feedback]);

  return (
    <section className="support-form-card" aria-labelledby="support-form-title">
      <header className="support-form-header">
        <h2 id="support-form-title" className="support-form-title">
          Nueva solicitud de orientación y acompañamiento con SST
        </h2>
        <p className="support-form-subtitle">
          Canal preventivo para solicitar orientación sobre sobrecarga de llamadas, fatiga o ergonomía. Recibirás un radicado cuando el servidor confirme el registro.
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
              En esta modalidad, tu nombre no se muestra a SST y el seguimiento se realiza desde tu cuenta mediante el radicado. El sistema conserva ese vínculo; evita incluir datos que te identifiquen si prefieres reservar tu identidad.
            </span>
          </div>
        )}

        {/* Aviso Institucional Bipartito CCL */}
        <div className="support-legal-callout">
          <Icon name="info" size={16} className="support-legal-icon" />
          <div className="support-legal-text">
            <strong>Seguimiento de la solicitud:</strong> El equipo SST revisa los radicados. Este formulario no informa un plazo de respuesta; podrás consultar el estado y cualquier plazo registrado en el seguimiento. La urgencia que indiques no confirma atención inmediata. Para una situación urgente, consulta las opciones de apoyo inmediato de la página.
          </div>
        </div>

        <footer className="support-form-actions">
          <button className="btn-support-submit" type="submit" disabled={isSubmitting || isRefreshingHistory}>
            <Icon name="send" size={15} />
            <span>{isSubmitting ? 'Procesando solicitud…' : 'Radicar solicitud ante SST'}</span>
          </button>
        </footer>

        {feedback && (
          <div ref={feedbackRef} tabIndex={-1} className={`support-feedback-alert support-feedback-alert--${feedback.type}`}
            role={feedback.type === 'error' ? 'alert' : 'status'}>
            <Icon name={feedback.type === 'success' ? 'checkCircle' : 'alertTriangle'} size={18} />
            <span>{feedback.message}</span>
            {feedback.type !== 'success' && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={onRetryHistory} disabled={isRefreshingHistory}>
                {isRefreshingHistory ? 'Actualizando historial…' : 'Actualizar historial'}
              </button>
            )}
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
  feedback: PropTypes.shape({
    type: PropTypes.oneOf(['success', 'error', 'warning']).isRequired,
    message: PropTypes.string.isRequired
  }),
  isSubmitting: PropTypes.bool.isRequired,
  isRefreshingHistory: PropTypes.bool.isRequired,
  onRetryHistory: PropTypes.func.isRequired
};
