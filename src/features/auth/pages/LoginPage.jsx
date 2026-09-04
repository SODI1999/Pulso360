// src/features/auth/pages/LoginPage.jsx
// Página principal de inicio de sesión de Pulso360

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../core/auth/authService';
import { LoginForm } from '../components/LoginForm';
import { DemoAccountsCard } from '../components/DemoAccountsCard';
import { Icon } from '../../../core/components/Icon';

// Estilos del módulo de autenticación
import '../../../styles/auth.css';
import '../../../styles/generated-utilities.css';

export function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [lockedRemainingMs, setLockedRemainingMs] = useState(0);

  // 1. Limpieza preventiva de sesión previa al entrar al Login y verificar bloqueo
  useEffect(() => {
    // Si el usuario regresa a la pantalla de login, invalidamos la sesión anterior
    sessionStorage.removeItem('pulso360_current_session');
    const lockMs = authService.getRemainingLockMs();
    if (lockMs > 0) {
      setLockedRemainingMs(lockMs);
    }
  }, []);

  // 2. Temporizador para decrementar el tiempo de bloqueo segundo a segundo
  useEffect(() => {
    if (lockedRemainingMs <= 0) return;

    const timer = setInterval(() => {
      setLockedRemainingMs((prev) => {
        if (prev <= 1000) {
          clearInterval(timer);
          setFeedback({ type: '', message: '' });
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockedRemainingMs]);

  // 3. Manejar selección desde la tarjeta de cuentas demo
  const handleSelectDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('123456');
    setFeedback({ type: '', message: '' });
  };

  // 4. Procesar el envío de credenciales
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || lockedRemainingMs > 0) return;

    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const result = await authService.login(email, password);
      setLoading(false);

      if (!result.success) {
        if (result.locked) {
          setLockedRemainingMs(result.remainingMs || 15 * 60 * 1000);
          setFeedback({ type: 'error', message: result.message });
          return;
        }
        setFeedback({ type: 'error', message: result.message });
        return;
      }

      setFeedback({ type: 'success', message: 'Autenticación correcta. Redirigiendo...' });

      setTimeout(() => {
        const user = result.user;

        // Si es agente y aún no ha firmado la política v2.4, va a consentimiento
        if (user.role === 'agente' && authService.needsConsent(user)) {
          navigate('/consentimiento?origin=login');
          return;
        }

        const roleRoutes = {
          agente: '/agente/panel',
          supervisor: '/supervisor/panel',
          sst: '/sst/panel',
          auditor: '/auditor/auditoria',
          admin: '/admin/organizacion'
        };

        navigate(roleRoutes[user.role] || '/agente/panel');
      }, 300);
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      setFeedback({ type: 'error', message: 'Ocurrió un error inesperado al validar las credenciales.' });
    }
  };

  return (
    <div className="login-wrapper">
      {/* Panel Izquierdo: Branding y Privacidad por Diseño */}
      <aside className="branding-panel" aria-label="Información de Pulso360">
        <div className="branding-decoration-bg"></div>
        <div className="branding-content">
          <div className="branding-badge" aria-hidden="true">
            <Icon name="shield" className="u-inline-012" />
          </div>
          <h1 className="branding-title">Bienestar preventivo<br />con privacidad por diseño</h1>
          <p className="branding-description">Pulso360 apoya la observación de tendencias colectivas de bienestar. No realiza diagnósticos ni comparte respuestas individuales con líderes.</p>

          <div className="illustration-card">
            <img src="/assets/imágenes/illustration.png" alt="Ilustración de analítica agregada y bienestar" className="illustration-img" />
          </div>

          <ul className="branding-feature-list">
            <li className="branding-feature-item">
              <Icon name="check" className="branding-feature-icon" />
              <span>Tus respuestas individuales no se muestran a tu líder.</span>
            </li>
            <li className="branding-feature-item">
              <Icon name="check" className="branding-feature-icon" />
              <span>Tu bitácora es privada y se representa como cifrada en la maqueta.</span>
            </li>
            <li className="branding-feature-item">
              <Icon name="check" className="branding-feature-icon" />
              <span>Puedes cambiar tus finalidades de consentimiento voluntariamente.</span>
            </li>
          </ul>
        </div>
      </aside>

      {/* Panel Derecho: Formulario y Demos */}
      <main className="auth-panel">
        <div className="auth-container">
          <header className="auth-header">
            <div className="logo-container">
              <img src="/assets/imágenes/logo.png" alt="Pulso360" className="brand-logo" />
            </div>
            <h2 className="auth-title">Iniciar sesión</h2>
            <p className="auth-subtitle">Ingresa con tu correo institucional</p>
          </header>

          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onSubmit={handleSubmit}
            loading={loading}
            feedback={feedback}
            lockedRemainingMs={lockedRemainingMs}
          />

          <DemoAccountsCard onSelectDemo={handleSelectDemo} />

          <footer className="auth-footer">
            <hr className="footer-divider" />
            <p className="footer-legal">Prototipo académico · Ley 1581 de 2012 · Resolución 2764 de 2022</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
