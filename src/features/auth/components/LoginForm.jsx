// src/features/auth/components/LoginForm.jsx
// Formulario de acceso institucional con orden ergonómico estricto y transición in-situ

import { useState, useEffect } from 'react';
import { Icon } from '../../../core/components/Icon';

export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  onSsoLogin,
  onForgotPassword,
  loading,
  feedback,
  lockedRemainingMs
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [emailError, setEmailError] = useState('');

  // 1. Verificar si existe correo recordado al montar el componente
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('pulso360_remembered_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberDevice(true);
      }
    } catch {
      // Manejo seguro en entornos donde localStorage no esté disponible
    }
  }, [setEmail]);

  // 2. Gestionar persistencia en localStorage tras inicio de sesión exitoso (NUNCA contraseñas)
  useEffect(() => {
    if (feedback?.type === 'success') {
      try {
        if (rememberDevice && email.trim()) {
          localStorage.setItem('pulso360_remembered_email', email.trim());
        } else {
          localStorage.removeItem('pulso360_remembered_email');
        }
      } catch {
        // Manejo seguro de fallos en localStorage
      }
    }
  }, [feedback?.type, rememberDevice, email]);

  // Formato mm:ss para el tiempo restante de bloqueo por fuerza bruta
  const formatCountdown = (ms) => {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const isButtonDisabled = !email.trim() || !password.trim() || loading || lockedRemainingMs > 0;

  // Validación de formato de email institucional y alias válidos del sistema
  const isValidEmailFormat = (raw) => {
    const val = String(raw || '').trim().toLowerCase();
    if (!val) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(val)) return true;

    const validAliases = [
      'agente@demo',
      'agente',
      'supervisor@demo',
      'supervisor',
      'sst@demo',
      'sst',
      'auditor@demo',
      'auditor',
      'admin@demo',
      'admin'
    ];
    return validAliases.includes(val);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!isValidEmailFormat(email)) {
      setEmailError('Ingresa un correo institucional válido (ej. usuario@pulso360.co)');
      return;
    }
    setEmailError('');
    if (onSubmit) {
      onSubmit(e);
    }
  };

  const handleSsoClick = (provider) => {
    if (loading || lockedRemainingMs > 0) return;
    if (onSsoLogin) {
      onSsoLogin(provider);
    }
  };

  return (
    <form className="login-form-root" onSubmit={handleFormSubmit} noValidate>
      {/* 1. Botones SSO Corporativo BPO */}
      <div className="sso-providers-group">
        <button
          type="button"
          className="sso-provider-btn"
          onClick={() => handleSsoClick('microsoft')}
          disabled={loading || lockedRemainingMs > 0}
        >
          <svg className="sso-btn-icon" width="18" height="18" viewBox="0 0 21 21" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
            <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
          </svg>
          <span>Probar acceso con Microsoft 365</span>
        </button>

        <button
          type="button"
          className="sso-provider-btn"
          onClick={() => handleSsoClick('google')}
          disabled={loading || lockedRemainingMs > 0}
        >
          <svg className="sso-btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span>Probar acceso con Google Workspace</span>
        </button>
      </div>

      {/* 2. Separador visual elegante */}
      <div className="sso-divider" role="separator" aria-label="o ingresar con credenciales">
        <span className="sso-divider-line"></span>
        <span className="sso-divider-text">o con credenciales corporativas</span>
        <span className="sso-divider-line"></span>
      </div>
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
            className={`field-input has-left-icon ${emailError ? 'input-error' : ''}`}
            placeholder="colaborador@operacion.pulso360.co"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
            autoComplete="username"
            disabled={loading || lockedRemainingMs > 0}
            aria-invalid={emailError ? 'true' : 'false'}
            aria-describedby={emailError ? 'loginEmailError' : undefined}
            required
          />
        </div>
        {emailError && (
          <div id="loginEmailError" className="form-field-inline-error" role="alert">
            <Icon name="alertTriangle" size={13} />
            <span>{emailError}</span>
          </div>
        )}
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
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
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
          {loading ? 'Validando credenciales...' : 'Iniciar sesión'}
        </span>
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
