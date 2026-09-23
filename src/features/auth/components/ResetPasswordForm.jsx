import { Icon } from '../../../core/components/Icon';

export function ResetPasswordForm({
  handleResetSubmit,
  tokenState,
  dispatchedData,
  recoveryEmail,
  email,
  showNewPassword,
  newPassword,
  setNewPassword,
  resetLoading,
  setShowNewPassword,
  strengthClass,
  strengthLabel,
  strengthScore,
  showConfirmPassword,
  confirmPassword,
  setConfirmPassword,
  setShowConfirmPassword,
  hasLength,
  hasCases,
  hasNumbers,
  passwordsMatch,
  isResetValid,
  resetFeedback
}) {
  return (
    <form className="login-form-root" onSubmit={handleResetSubmit} noValidate>
      {/* Campo de username para gestores de contraseñas (1Password, Bitwarden, Google Password Manager) */}
      <input
        type="text"
        name="username"
        id="resetUsernameInput"
        value={tokenState.email || dispatchedData?.targetEmail || recoveryEmail || email || ''}
        autoComplete="username"
        readOnly
        tabIndex={-1}
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0
        }}
      />

      <div className="form-field-group">
        <label htmlFor="newPasswordInput" className="field-label">
          Nueva contraseña institucional
        </label>
        <div className="field-input-wrapper">
          <span className="field-icon" aria-hidden="true">
            <Icon name="lock" size={16} />
          </span>
          <input
            type={showNewPassword ? 'text' : 'password'}
            id="newPasswordInput"
            className="field-input has-left-icon has-right-action"
            placeholder="Ingresa tu nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            disabled={resetLoading}
            required
          />
          <button
            type="button"
            className="field-toggle-btn"
            onClick={() => setShowNewPassword(!showNewPassword)}
            aria-label={showNewPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            title={showNewPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
          >
            <Icon name={showNewPassword ? 'eyeOff' : 'eye'} size={16} />
          </button>
        </div>
      </div>

      {/* Medidor de robustez */}
      {newPassword && (
        <div className="strength-meter-container" aria-live="polite">
          <div className="strength-meter-header">
            <span>Nivel de fortaleza:</span>
            <strong className={`strength-label ${strengthClass}`}>{strengthLabel}</strong>
          </div>
          <div className="strength-bars-row">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`strength-bar-seg ${strengthScore >= step ? `active ${strengthClass}` : ''}`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="form-field-group">
        <label htmlFor="confirmNewPasswordInput" className="field-label">
          Confirmar nueva contraseña
        </label>
        <div className="field-input-wrapper">
          <span className="field-icon" aria-hidden="true">
            <Icon name="lock" size={16} />
          </span>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmNewPasswordInput"
            className="field-input has-left-icon has-right-action"
            placeholder="Repite tu nueva contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            disabled={resetLoading}
            required
          />
          <button
            type="button"
            className="field-toggle-btn"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={
              showConfirmPassword ? 'Ocultar confirmación de contraseña' : 'Ver confirmación de contraseña'
            }
            title={
              showConfirmPassword ? 'Ocultar confirmación de contraseña' : 'Ver confirmación de contraseña'
            }
          >
            <Icon name={showConfirmPassword ? 'eyeOff' : 'eye'} size={16} />
          </button>
        </div>
      </div>

      {/* Requisitos obligatorios de robustez */}
      <div className="policy-requirements-box">
        <span className="policy-box-title">Requisitos de seguridad:</span>
        <ul className="policy-checklist">
          <li className={hasLength ? 'fulfilled' : ''}>
            <Icon name={hasLength ? 'checkCircle' : 'circle'} size={13} />
            <span>Mínimo 8 caracteres</span>
          </li>
          <li className={hasCases ? 'fulfilled' : ''}>
            <Icon name={hasCases ? 'checkCircle' : 'circle'} size={13} />
            <span>Mayúsculas y minúsculas</span>
          </li>
          <li className={hasNumbers ? 'fulfilled' : ''}>
            <Icon name={hasNumbers ? 'checkCircle' : 'circle'} size={13} />
            <span>Al menos un número (0 - 9)</span>
          </li>
          <li className={passwordsMatch ? 'fulfilled' : ''}>
            <Icon name={passwordsMatch ? 'checkCircle' : 'circle'} size={13} />
            <span>Ambas contraseñas son idénticas</span>
          </li>
        </ul>
      </div>

      <button type="submit" className="submit-action-btn" disabled={!isResetValid}>
        <span className="submit-btn-label">
          {resetLoading ? 'Actualizando contraseña...' : 'Actualizar contraseña'}
        </span>
        {resetLoading && <div className="action-spinner" aria-hidden="true"></div>}
      </button>

      {resetFeedback.message && (
        <div className={`form-feedback-pill ${resetFeedback.type}`} role="alert">
          <Icon name={resetFeedback.type === 'success' ? 'checkCircle' : 'alertTriangle'} size={15} />
          <span>{resetFeedback.message}</span>
        </div>
      )}
    </form>
  );
}
