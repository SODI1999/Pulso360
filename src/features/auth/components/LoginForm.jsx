// src/features/auth/components/LoginForm.jsx
// Formulario de acceso institucional con orden ergonómico estricto y transición in-situ

import { useState } from 'react';
import { Icon } from '../../../core/components/Icon';

export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  onForgotPassword,
  loading,
  feedback,
  lockedRemainingMs
}) {
  const [showPassword, setShowPassword] = useState(false);

  // Formato mm:ss para el tiempo restante de bloqueo por fuerza bruta
  const formatCountdown = (ms) => {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const isButtonDisabled = !email.trim() || !password.trim() || loading || lockedRemainingMs > 0;

  return (
    <form className="login-form-root" onSubmit={onSubmit} noValidate>
      {/* 1. Campo Correo Institucional */}
      <div className="form-field-group">
        <label htmlFor="loginEmailInput" className="field-label">
          Correo corporativo
        </label>
        <div className="field-input-wrapper">
          <span className="field-icon" aria-hidden="true">
            <Icon name="mail" size={16} />
          </span>
          <input
            type="email"
            id="loginEmailInput"
            name="username"
            className="field-input has-left-icon"
            placeholder="colaborador@operacion.pulso360.co"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            disabled={loading || lockedRemainingMs > 0}
            required
          />
        </div>
      </div>

      {/* 2. Campo Contraseña */}
      <div className="form-field-group">
        <label htmlFor="loginPasswordInput" className="field-label">
          Contraseña
        </label>
        <div className="field-input-wrapper">
          <span className="field-icon" aria-hidden="true">
            <Icon name="lock" size={16} />
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            id="loginPasswordInput"
            name="password"
            className="field-input has-left-icon has-right-action"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={loading || lockedRemainingMs > 0}
            required
          />
          <button
            type="button"
            className="field-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            tabIndex={0}
          >
            <Icon name={showPassword ? 'eyeOff' : 'eye'} size={16} />
          </button>
        </div>
      </div>

      {/* 3. Fila de Opciones Ergonomicas: Recordar en izq, Olvidaste contraseña en der */}
      <div className="form-secondary-actions">
        <label className="remember-checkbox-container">
          <input
            type="checkbox"
            className="remember-checkbox"
            disabled={loading || lockedRemainingMs > 0}
          />
          <span className="remember-text">Recordar este equipo</span>
        </label>

        <button
          type="button"
          className="forgot-password-trigger"
          onClick={onForgotPassword}
          tabIndex={0}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {/* 4. Boton Principal (Hero Action) */}
      <button
        type="submit"
        className={`submit-action-btn ${loading ? 'loading' : ''}`}
        disabled={isButtonDisabled}
      >
        <span className="submit-btn-label">
          {loading ? 'Validando credenciales...' : 'Iniciar Sesión en Consola'}
        </span>
        {!loading && (
          <span className="submit-btn-icon" aria-hidden="true">
            <Icon name="arrowRight" size={16} />
          </span>
        )}
        {loading && <div className="action-spinner" aria-hidden="true"></div>}
      </button>

      {/* 5. Retroalimentacion de Alertas */}
      {feedback.message && (
        <div className={`form-feedback-pill ${feedback.type}`} role="alert" aria-live="polite">
          <Icon name={feedback.type === 'success' ? 'checkCircle' : 'alertTriangle'} size={15} />
          <span>{feedback.message}</span>
        </div>
      )}

      {lockedRemainingMs > 0 && !feedback.message && (
        <div className="form-feedback-pill error lockout-mode" role="alert">
          <Icon name="lock" size={16} />
          <div>
            <strong>Acceso temporalmente bloqueado</strong>
            <p>
              Reintentos excedidos. Podrás intentar de nuevo en{' '}
              <span className="lockout-timer">{formatCountdown(lockedRemainingMs)}</span>
            </p>
          </div>
        </div>
      )}
    </form>
  );
}
