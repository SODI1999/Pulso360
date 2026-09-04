// src/features/auth/components/LoginForm.jsx
// Formulario de autenticación con validación reactiva, feedback visual e iconos SVG centralizados

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../core/components/Icon';

export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  loading,
  feedback,
  lockedRemainingMs
}) {
  const [showPassword, setShowPassword] = useState(false);

  // Formato mm:ss para el tiempo restante de bloqueo por fuerza bruta
  const formatLockTime = (ms) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const isButtonDisabled = !email.trim() || !password.trim() || loading || lockedRemainingMs > 0;

  return (
    <form className="login-form" onSubmit={onSubmit} noValidate>
      {/* Campo Correo Institucional */}
      <div className="form-group">
        <label htmlFor="usernameInput" className="form-label">Correo institucional</label>
        <div className="input-wrapper">
          <span className="input-icon" aria-hidden="true">
            <Icon name="mail" />
          </span>
          <input
            type="email"
            id="usernameInput"
            name="username"
            className="form-input has-icon"
            placeholder="agente@demo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
      </div>

      {/* Campo Contraseña con Toggle Ojo SVG */}
      <div className="form-group">
        <div className="form-label-row">
          <label htmlFor="passwordInput" className="form-label">Contraseña</label>
          <Link to="/recuperar-clave" className="forgot-link">¿Olvidaste tu contraseña?</Link>
        </div>
        <div className="input-wrapper">
          <span className="input-icon" aria-hidden="true">
            <Icon name="lock" />
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            id="passwordInput"
            name="password"
            className="form-input has-icon password-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="toggle-password-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <Icon name={showPassword ? 'eyeOff' : 'eye'} />
          </button>
        </div>
      </div>

      {/* Botón de Envío con Spinner e Icono SVG */}
      <button
        type="submit"
        className={`submit-btn ${loading ? 'loading' : ''}`}
        disabled={isButtonDisabled}
      >
        <span className="submit-text">
          {loading ? 'Validando...' : 'Ingresar a Pulso360'}
        </span>
        <span className="submit-icon" aria-hidden="true">
          <Icon name="arrowRight" />
        </span>
        {loading && <div className="spinner" aria-hidden="true"></div>}
      </button>

      {/* Retroalimentación de Error / Éxito / Bloqueo */}
      {feedback.message && (
        <div className={`form-feedback ${feedback.type}`} role="alert" aria-live="polite">
          {feedback.message}
        </div>
      )}
      {lockedRemainingMs > 0 && !feedback.message && (
        <div className="form-feedback error" role="alert">
          Demasiados intentos. Podrás volver a intentar en {formatLockTime(lockedRemainingMs)}.
        </div>
      )}
    </form>
  );
}
