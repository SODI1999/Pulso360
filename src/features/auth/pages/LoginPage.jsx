// src/features/auth/pages/LoginPage.jsx
// Experiencia unificada de autenticacion Split-Screen (Login, Recuperacion y Nueva Clave in-situ)

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { authService, validatePasswordStrength } from '../../../core/auth/authService';
import { LoginForm } from '../components/LoginForm';
import { DemoAccountsCard } from '../components/DemoAccountsCard';
import { Icon } from '../../../core/components/Icon';
import { AUTH_SAFEGUARDS, AUTH_METADATA } from '../data/authData';

// Estilos modulares de autenticacion
import '../../../styles/auth.css';

export function LoginPage({ initialMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState('login');

  // Determinar el modo segun prop o ruta URL
  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
      return;
    }
    if (location.pathname === '/recuperar-clave') {
      setMode('forgot');
      return;
    }
    if (location.pathname === '/nueva-clave') {
      setMode('reset');
      return;
    }
    setMode('login');
  }, [location.pathname, initialMode]);

  // ==========================================
  // ESTADOS MODO LOGIN
  // ==========================================
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [lockedRemainingMs, setLockedRemainingMs] = useState(0);

  // Limpieza preventiva de sesion previa al entrar y verificar bloqueo
  useEffect(() => {
    sessionStorage.removeItem('pulso360_current_session');
    const lockMs = authService.getRemainingLockMs();
    if (lockMs > 0) {
      setLockedRemainingMs(lockMs);
    }
  }, []);

  // Temporizador de decremento de bloqueo
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

  const handleSelectDemo = (roleData) => {
    setEmail(roleData.email);
    setPassword(roleData.password || 'Pulso360#2026');
    setFeedback({ type: '', message: '' });
  };

  const handleLoginSubmit = async (e) => {
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

      setFeedback({ type: 'success', message: 'Autenticacion correcta. Redirigiendo...' });

      setTimeout(() => {
        const user = result.user;
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
      setFeedback({ type: 'error', message: 'Error al conectar con el servicio de autenticacion.' });
    }
  };

  // ==========================================
  // ESTADOS MODO RECUPERACION (FORGOT)
  // ==========================================
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryFeedback, setRecoveryFeedback] = useState({ type: '', message: '' });
  const [dispatchedData, setDispatchedData] = useState(null);

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    if (!recoveryEmail.trim() || recoveryLoading) return;

    setRecoveryLoading(true);
    setRecoveryFeedback({ type: '', message: '' });

    try {
      const res = await authService.requestPasswordReset(recoveryEmail);
      setRecoveryLoading(false);

      if (res.success) {
        setDispatchedData(res);
      } else {
        setRecoveryFeedback({ type: 'error', message: res.message });
      }
    } catch (err) {
      console.error('Recovery request error:', err);
      setRecoveryLoading(false);
      setRecoveryFeedback({ type: 'error', message: 'Error inesperado al solicitar recuperacion.' });
    }
  };

  // ==========================================
  // ESTADOS MODO RESET PASSWORD (NUEVA CLAVE)
  // ==========================================
  // Blindaje estricto: Si no hay token en searchParams ni despacho reciente, se valida vacio (denegado)
  const tokenParam = searchParams.get('token') || dispatchedData?.devToken || '';
  const [tokenState, setTokenState] = useState({ loading: true, valid: false, email: '', message: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetFeedback, setResetFeedback] = useState({ type: '', message: '' });

  // Validar token al cargar o cambiar a modo reset
  useEffect(() => {
    if (mode !== 'reset') return;
    let isMounted = true;
    authService.validateResetToken(tokenParam).then((res) => {
      if (!isMounted) return;
      if (res.valid) {
        setTokenState({ loading: false, valid: true, email: res.email || '', message: '' });
      } else {
        setTokenState({ loading: false, valid: false, email: '', message: res.message });
      }
    });
    return () => {
      isMounted = false;
    };
  }, [mode, tokenParam]);

  // Reglas de robustez corporativa unificadas (8 caracteres robustos)
  const hasLength = newPassword.length >= 8;
  const hasCases = /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword);
  const hasNumbers = /[0-9]/.test(newPassword);
  const passwordsMatch = Boolean(newPassword && confirmPassword && newPassword === confirmPassword);
  const passwordPolicy = validatePasswordStrength(newPassword);

  const checkPasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return Math.min(score, 4);
  };

  const strengthScore = checkPasswordStrength(newPassword);
  const strengthLabels = ['Debil', 'Aceptable', 'Buena', 'Fuerte'];
  const strengthClass = ['weak', 'weak', 'medium', 'strong'][Math.max(0, strengthScore - 1)] || 'weak';
  const strengthLabel = newPassword ? strengthLabels[Math.max(0, strengthScore - 1)] : '—';

  const isResetValid = tokenState.valid && passwordPolicy.valid && passwordsMatch && !resetLoading;

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!isResetValid) return;

    setResetLoading(true);
    setResetFeedback({ type: '', message: '' });

    try {
      const result = await authService.resetPassword(tokenParam, newPassword);
      setResetLoading(false);

      if (result.success) {
        setResetFeedback({
          type: 'success',
          message: 'Contrasena actualizada con exito. Redirigiendo al inicio de sesion...'
        });
        setTimeout(() => {
          setMode('login');
          setPassword(newPassword);
          setResetFeedback({ type: '', message: '' });
          setDispatchedData(null);
          navigate('/login');
        }, 1200);
      } else {
        setResetFeedback({ type: 'error', message: result.message });
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setResetLoading(false);
      setResetFeedback({ type: 'error', message: 'Ocurrio un error inesperado al guardar la contrasena.' });
    }
  };

  const handleSsoLogin = async (provider) => {
    if (loading || lockedRemainingMs > 0) return;
    setLoading(true);
    setFeedback({
      type: 'success',
      message: `Conectando con ${provider === 'microsoft' ? 'Microsoft 365' : 'Google Workspace'}...`
    });

    try {
      // Simulación de SSO corporativo federado con cuenta activa
      setTimeout(async () => {
        const result = await authService.login('agente@pulso360.co', 'Pulso360#2026');
        setLoading(false);
        if (result.success) {
          navigate('/agente/panel');
        } else {
          setFeedback({ type: 'error', message: result.message });
        }
      }, 500);
    } catch {
      setLoading(false);
      setFeedback({ type: 'error', message: 'Error de comunicación con el proveedor de identidad.' });
    }
  };

  return (
    <div className="login-editorial-wrapper">
      {/* =========================================================================
          PANEL IZQUIERDO: Respaldo Institucional BPO y Salvaguardas SGSI
          ========================================================================= */}
      <aside className="login-manifesto-panel" aria-label="Garantías Institucionales de Pulso360">
        <div className="manifesto-top-bar">
          <div className="manifesto-brand-lockup">
            <img src="/assets/marca/logo.png" alt="Pulso360" className="manifesto-brand-symbol" />
            <span className="manifesto-brand-title">Pulso360</span>
          </div>
          <Link to="/" className="manifesto-back-link" title="Volver al portal público">
            <Icon name="arrowLeft" size={14} />
            <span>Volver al portal</span>
          </Link>
        </div>

        <div className="manifesto-body">
          <header className="manifesto-editorial-header">
            <h1 className="manifesto-title">
              Tu espacio de desahogo.<br className="manifesto-break" /> Cero vigilancia punitiva.
            </h1>
            <p className="manifesto-lead">{AUTH_METADATA.subtitle}</p>
          </header>

          {/* Salvaguardas Éticas y de Seguridad SGSI */}
          <div className="manifesto-safeguards-container">
            <span className="safeguards-section-heading">Salvaguardas de Privacidad y SG-SST</span>
            <ul className="manifesto-safeguards-clean">
              {AUTH_SAFEGUARDS.map((safe) => (
                <li key={safe.title} className="safeguard-card-clean">
                  <span className="safeguard-bullet-icon" aria-hidden="true">
                    <Icon name={safe.icon} size={16} />
                  </span>
                  <div className="safeguard-detail">
                    <strong className="safeguard-name">{safe.title}</strong>
                    <p className="safeguard-summary">{safe.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <footer className="manifesto-corporate-footer">
          <span>{AUTH_METADATA.footerNote}</span>
        </footer>
      </aside>

      {/* =========================================================================
          PANEL DERECHO: Formulario Unificado in-situ (Login | Forgot | Reset)
          ========================================================================= */}
      <main className="login-form-panel">
        <div className="auth-form-card">
          
          {/* MODO 1: INICIAR SESION */}
          {mode === 'login' && (
            <>
              <header className="auth-card-top">
                <h2 className="auth-screen-title">Iniciar Sesión</h2>
                <p className="auth-screen-desc">
                  Acceso institucional seguro a tu espacio Pulso360.
                </p>
              </header>

              {/* Formulario de Login con SSO integrado */}
              <LoginForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                onSubmit={handleLoginSubmit}
                onSsoLogin={handleSsoLogin}
                onForgotPassword={() => {
                  setFeedback({ type: '', message: '' });
                  navigate('/recuperar-clave');
                }}
                loading={loading}
                feedback={feedback}
                lockedRemainingMs={lockedRemainingMs}
              />

              {/* Barra Horizontal Discreta de Perfiles Demo al pie del formulario */}
              <DemoAccountsCard
                activeEmail={email}
                onSelectDemo={handleSelectDemo}
              />

              <footer className="auth-corporate-legal">
                <p>
                  Protección de datos conforme a Ley 1581 de 2012 · Sesión cifrada TLS y auditada.
                </p>
              </footer>
            </>
          )}

          {/* MODO 2: RECUPERAR ACCESO IN-SITU */}
          {mode === 'forgot' && (
            <>
              <header className="auth-card-top">
                <div className="auth-subnav-row">
                  <button
                    type="button"
                    className="auth-back-to-login"
                    onClick={() => {
                      setDispatchedData(null);
                      navigate('/login');
                    }}
                  >
                    <Icon name="arrowLeft" size={13} />
                    <span>Volver a iniciar sesión</span>
                  </button>
                </div>

                <h2 className="auth-screen-title">
                  {dispatchedData ? 'Revisa tu correo' : 'Recuperar acceso'}
                </h2>
                <p className="auth-screen-desc">
                  {dispatchedData
                    ? `Enviamos un enlace de recuperación a ${dispatchedData.targetEmail?.replace(/@demo$/, '@pulso360.co') || recoveryEmail}. Revisa tu bandeja de entrada y sigue las instrucciones.`
                    : 'Ingresa tu correo institucional registrado para recibir el enlace de recuperación.'}
                </p>
              </header>

              {!dispatchedData ? (
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
                    El enlace será válido durante 30 minutos y solo podrá usarse una vez.
                  </p>

                  <button
                    type="submit"
                    className="submit-action-btn"
                    disabled={!recoveryEmail.trim() || recoveryLoading}
                  >
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
              ) : (
                /* Estado Despachado in-situ */
                <div className="recovery-dispatched-card">
                  <div className="dispatched-pill-status">
                    <Icon name="checkCircle" size={15} />
                    <span>Correo enviado correctamente</span>
                  </div>

                  {dispatchedData.devLink && (
                    <div className="sandbox-eval-callout">
                      <div className="sandbox-eval-header">
                        <Icon name="fileText" size={14} />
                        <strong>Simulación de Servicio SMTP (Sandbox)</strong>
                      </div>
                      <p className="sandbox-eval-text">
                        En producción, este enlace se envía al correo corporativo. Para evaluación, puedes abrirlo directamente:
                      </p>
                      <div className="sandbox-token-badge">
                        <code>Token: {dispatchedData.devToken}</code>
                        <span>Caduca en {dispatchedData.expiresInMinutes || 30} min</span>
                      </div>
                      <button
                        type="button"
                        className="btn-proceed-reset"
                        onClick={() => navigate(`/nueva-clave?token=${dispatchedData.devToken || ''}`)}
                      >
                        <span>Continuar restablecimiento (Modo Demo)</span>
                      </button>
                    </div>
                  )}

                  <div className="dispatched-footer-actions">
                    <button
                      type="button"
                      className="btn-retry-other"
                      onClick={() => {
                        setDispatchedData(null);
                        setRecoveryEmail('');
                      }}
                    >
                      Usar otro correo
                    </button>
                  </div>
                </div>
              )}

              <footer className="auth-corporate-legal">
                <p>Protección de datos conforme a Ley 1581 de 2012 · Sesión cifrada TLS y auditada.</p>
              </footer>
            </>
          )}

          {/* MODO 3: NUEVA CONTRASEÑA IN-SITU */}
          {mode === 'reset' && (
            <>
              <header className="auth-card-top">
                <div className="auth-subnav-row">
                  <button
                    type="button"
                    className="auth-back-to-login"
                    onClick={() => {
                      setDispatchedData(null);
                      navigate('/login');
                    }}
                  >
                    <Icon name="arrowLeft" size={13} />
                    <span>Volver a iniciar sesión</span>
                  </button>
                </div>

                <h2 className="auth-screen-title">Crear nueva contraseña</h2>
                <p className="auth-screen-desc">
                  Estás creando una nueva contraseña para {tokenState.email || 'tu cuenta'}. Asegúrate de cumplir los requisitos de seguridad.
                </p>
              </header>

              {tokenState.loading && (
                <div className="token-eval-box">
                  <div className="action-spinner" style={{ display: 'block', margin: '16px auto' }}></div>
                  <p>Verificando validez del enlace seguro...</p>
                </div>
              )}

              {!tokenState.loading && !tokenState.valid && (
                <div className="token-invalid-card">
                  <div className="invalid-tag">
                    <Icon name="alertTriangle" size={16} />
                    <span>Enlace Inválido o Expirado</span>
                  </div>
                  <p className="invalid-message">{tokenState.message}</p>
                  <button
                    type="button"
                    className="submit-action-btn"
                    onClick={() => navigate('/recuperar-clave')}
                  >
                    Solicitar un nuevo enlace
                  </button>
                </div>
              )}

              {!tokenState.loading && tokenState.valid && (
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
                        aria-label={showConfirmPassword ? 'Ocultar confirmación de contraseña' : 'Ver confirmación de contraseña'}
                        title={showConfirmPassword ? 'Ocultar confirmación de contraseña' : 'Ver confirmación de contraseña'}
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

                  <button
                    type="submit"
                    className="submit-action-btn"
                    disabled={!isResetValid}
                  >
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
              )}

              <footer className="auth-corporate-legal">
                <p>Protección de datos conforme a Ley 1581 de 2012 · Sesión cifrada TLS y auditada.</p>
              </footer>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
