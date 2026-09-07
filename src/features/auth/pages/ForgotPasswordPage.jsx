// src/features/auth/pages/ForgotPasswordPage.jsx
// Solicitud de restablecimiento de contraseña con Icon centralizado

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';

// Estilos del módulo de autenticación
import '../../../styles/auth.css';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    const data = pulsoStore.get();
    const cleanEmail = email.trim().toLowerCase();
    const foundUser = data.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (foundUser) {
      data.passwordReset = data.passwordReset || { tokens: [] };
      data.passwordReset.tokens = data.passwordReset.tokens.filter((t) => t.userId !== foundUser.id);

      data.passwordReset.tokens.push({
        id: `rst-${Date.now()}`,
        userId: foundUser.id,
        expiresAt: Date.now() + 30 * 60 * 1000,
        used: false
      });

      pulsoStore.save(data);
    }

    pulsoStore.audit({
      actor: 'actor-no-identificado',
      action: 'SOLICITUD_RESET_PASSWORD',
      target: 'Recuperación de acceso'
    });

    setFeedback('Si el correo está registrado, enviaremos un enlace para restablecer tu contraseña. El enlace de demostración tiene vigencia de 30 minutos.');
  };

  return (
    <div className="recovery-wrapper">
      <div className="recovery-card">
        <div className="recovery-icon-badge" aria-hidden="true">
          <Icon name="mail" size={28} />
        </div>

        <h1 className="auth-title">Recuperar acceso</h1>
        <p className="auth-subtitle">Ingresa tu correo institucional registrado para recibir las instrucciones de recuperación.</p>

        <form id="recoveryForm" className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="recoveryEmail" className="form-label">Correo institucional</label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">
                <Icon name="mail" />
              </span>
              <input
                type="email"
                id="recoveryEmail"
                className="form-input has-icon"
                placeholder="usuario@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn">
            <span>Enviar enlace de recuperación</span>
            <span className="submit-icon" aria-hidden="true">
              <Icon name="arrowRight" />
            </span>
          </button>

          {feedback && (
            <div className="form-feedback success" role="status" aria-live="polite">
              {feedback}
            </div>
          )}
        </form>

        <div className="recovery-footer">
          <Link to="/nueva-clave?token=demo-valid" className="forgot-link">Abrir enlace válido de demostración (Token Demo)</Link>
          <Link to="/login" className="forgot-link recovery-back-link">← Volver a iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
}
