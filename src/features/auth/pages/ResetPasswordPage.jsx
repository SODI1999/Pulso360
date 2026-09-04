// src/features/auth/pages/ResetPasswordPage.jsx
// Creación de nueva contraseña con validación de token, medidor de fortaleza e Icon centralizado

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';

// Estilos del módulo de autenticación
import '../../../styles/auth.css';
import '../../../styles/generated-utilities.css';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [strengthLabel, setStrengthLabel] = useState('—');
  const [tokenInfo, setTokenInfo] = useState({ valid: false, userId: null });
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // 1. Validar el token recibido en la URL
  useEffect(() => {
    if (tokenParam === 'demo-valid') {
      setTokenInfo({ valid: true, userId: 'usr-1', isDemo: true });
      return;
    }

    const data = pulsoStore.get();
    const tokenRecord = (data.passwordReset?.tokens || []).find((t) => t.id === tokenParam);
    const isValid = Boolean(tokenRecord && !tokenRecord.used && Number(tokenRecord.expiresAt) > Date.now());

    if (isValid) {
      setTokenInfo({ valid: true, userId: tokenRecord.userId, stored: tokenRecord });
    } else {
      setTokenInfo({ valid: false, userId: null });
      setFeedback({ type: 'error', message: 'Este enlace ya no es válido o ha expirado. Solicita uno nuevo.' });
    }
  }, [tokenParam]);

  // 2. Evaluar fortaleza de la contraseña
  const handlePasswordChange = (newVal, confirmVal) => {
    let score = 0;
    if (newVal.length >= 12) score++;
    if (/[A-Z]/.test(newVal) && /[a-z]/.test(newVal)) score++;
    if (/\d/.test(newVal)) score++;
    if (/[^A-Za-z0-9]/.test(newVal)) score++;

    const labels = ['Débil', 'Aceptable', 'Buena', 'Fuerte'];
    setStrengthLabel(newVal ? labels[Math.max(0, score - 1)] : '—');
  };

  const isFormValid = tokenInfo.valid && password.length >= 12 && password === confirmPassword;

  // 3. Guardar la nueva contraseña
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const data = pulsoStore.get();

    if (tokenInfo.stored) {
      const targetToken = data.passwordReset?.tokens?.find((t) => t.id === tokenParam);
      if (targetToken) {
        targetToken.used = true;
        pulsoStore.save(data);
      }
    }

    pulsoStore.audit({
      actor: `${tokenInfo.userId || 'usr-1'} (recuperación)`,
      action: 'RESTABLECIMIENTO_PASSWORD',
      target: 'Cuenta demo'
    });

    sessionStorage.removeItem('pulso360_current_session');
    setFeedback({ type: 'success', message: 'Contraseña actualizada. Redirigiendo al inicio de sesión...' });

    setTimeout(() => {
      navigate('/login');
    }, 900);
  };

  return (
    <div className="recovery-wrapper">
      <div className="recovery-card">
        <div className="recovery-icon-badge" aria-hidden="true">
          <Icon name="lock" className="u-inline-012" />
        </div>

        <h1 className="auth-title">Crear nueva contraseña</h1>
        <p className="auth-subtitle u-inline-020">Simulación RF-18 · Requiere mínimo 12 caracteres.</p>

        <form id="newPasswordForm" className="login-form" onSubmit={handleSubmit}>
          <div className="form-group u-inline-145">
            <label className="form-label" htmlFor="newPassword">Nueva contraseña</label>
            <input
              id="newPassword"
              type="password"
              className="form-input"
              minLength="12"
              placeholder="Mínimo 12 caracteres..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                handlePasswordChange(e.target.value, confirmPassword);
              }}
              disabled={!tokenInfo.valid}
              required
            />
          </div>

          <div className="form-group u-inline-145">
            <label className="form-label" htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              minLength="12"
              placeholder="Repite la contraseña..."
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                handlePasswordChange(password, e.target.value);
              }}
              disabled={!tokenInfo.valid}
              required
            />
          </div>

          <div id="strengthText" className="u-inline-146">
            Fortaleza: <strong>{strengthLabel}</strong>
          </div>

          <button id="savePasswordBtn" type="submit" className="submit-btn" disabled={!isFormValid}>
            <span>Guardar contraseña</span>
          </button>

          {feedback.message && (
            <div className={`form-feedback ${feedback.type}`} role="status">
              {feedback.message}
            </div>
          )}
        </form>

        <div className="u-inline-147">
          <Link to="/login" className="forgot-link">← Volver al inicio de sesión</Link>
        </div>
      </div>
    </div>
  );
}
