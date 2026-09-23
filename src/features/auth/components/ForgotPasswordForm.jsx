import { Icon } from '../../../core/components/Icon';

export function ForgotPasswordForm({
  handleRecoverySubmit,
  recoveryEmail,
  setRecoveryEmail,
  recoveryLoading,
  recoveryFeedback
}) {
  return (
    <form className="login-form-root" onSubmit={handleRecoverySubmit} noValidate>
      <div className="form-field-group">
        <label htmlFor="recoveryEmailInput" className="field-label">
          Correo institucional
        </label>
        <div className="field-input-wrapper">
          <span className="field-icon" aria-hidden="true">
            <Icon name="mail" size={16} />
          </span>
          <input
            type="email"
            id="recoveryEmailInput"
            name="recoveryEmail"
            className="field-input has-left-icon"
            placeholder="colaborador@operacion.pulso360.co"
            value={recoveryEmail}
            onChange={(e) => setRecoveryEmail(e.target.value)}
            autoComplete="email"
            disabled={recoveryLoading}
            required
          />
        </div>
      </div>

      <p className="recovery-policy-note">
        El enlace temporal será válido durante 30 minutos y sólo podrá usarse una vez.
      </p>

      <button type="submit" className="submit-action-btn" disabled={!recoveryEmail.trim() || recoveryLoading}>
        <span className="submit-btn-label">
          {recoveryLoading ? 'Validando y enviando...' : 'Enviar enlace'}
        </span>
        {recoveryLoading && <div className="action-spinner" aria-hidden="true"></div>}
      </button>

      {recoveryFeedback.message && (
        <div className={`form-feedback-pill ${recoveryFeedback.type}`} role="alert">
          <Icon name="alertTriangle" size={15} />
          <span>{recoveryFeedback.message}</span>
        </div>
      )}
    </form>
  );
}
