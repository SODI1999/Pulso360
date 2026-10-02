import { RecoveryConfirmation } from '../components/RecoveryConfirmation';
import { ResetPasswordForm } from '../components/ResetPasswordForm';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';
import { LoginManifesto } from '../components/LoginManifesto';
import { useLogin } from '../hooks/useLogin';
// src/features/auth/pages/LoginPage.jsx
// Experiencia unificada de autenticacion Split-Screen (Login, Recuperacion y Nueva Clave in-situ)

import { LoginForm } from '../components/LoginForm';
import { DemoAccountsCard } from '../components/DemoAccountsCard';
import { Icon } from '../../../core/components/Icon';

// Estilos modulares de autenticacion
import '../../../styles/auth.css';

export function LoginPage({ initialMode }) {
  const {
    navigate,
    mode,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    feedback,
    setFeedback,
    lockedRemainingMs,
    fillCredentials,
    handleLoginSubmit,
    recoveryEmail,
    setRecoveryEmail,
    recoveryLoading,
    recoveryFeedback,
    dispatchedData,
    setDispatchedData,
    handleRecoverySubmit,
    tokenState,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    resetLoading,
    resetFeedback,
    hasLength,
    hasCases,
    hasNumbers,
    passwordsMatch,
    strengthScore,
    strengthClass,
    strengthLabel,
    isResetValid,
    handleResetSubmit,
    handleSsoLogin
  } = useLogin({ initialMode: initialMode });

  return (
    <div className="login-editorial-wrapper">
      {/* =========================================================================
          PANEL IZQUIERDO: Respaldo Institucional BPO y Salvaguardas SGSI
          ========================================================================= */}
      <LoginManifesto />

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
                <p className="auth-screen-desc">Acceso institucional a tu espacio Pulso360.</p>
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
              <DemoAccountsCard activeEmail={email} onSelectDemo={(r) => fillCredentials(r.email)} />

              <footer className="auth-corporate-legal">
                <p>Protección de datos conforme a la Ley 1581 de 2012 y estándares SG-SST</p>
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
                <ForgotPasswordForm
                  handleRecoverySubmit={handleRecoverySubmit}
                  recoveryEmail={recoveryEmail}
                  setRecoveryEmail={setRecoveryEmail}
                  recoveryLoading={recoveryLoading}
                  recoveryFeedback={recoveryFeedback}
                />
              ) : (
                /* Estado Despachado in-situ */
                <RecoveryConfirmation
                  dispatchedData={dispatchedData}
                  navigate={navigate}
                  setDispatchedData={setDispatchedData}
                  setRecoveryEmail={setRecoveryEmail}
                />
              )}

              <footer className="auth-corporate-legal">
                <p>Protección de datos conforme a la Ley 1581 de 2012 y estándares SG-SST</p>
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
                  Estás creando una nueva contraseña para {tokenState.email || 'tu cuenta'}. Asegúrate de
                  cumplir los requisitos de seguridad.
                </p>
              </header>

              {tokenState.loading && (
                <div className="token-eval-box">
                  <div className="action-spinner" style={{ display: 'block', margin: '16px auto' }}></div>
                  <p>Verificando la validez del enlace temporal...</p>
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
                <ResetPasswordForm
                  handleResetSubmit={handleResetSubmit}
                  tokenState={tokenState}
                  dispatchedData={dispatchedData}
                  recoveryEmail={recoveryEmail}
                  email={email}
                  showNewPassword={showNewPassword}
                  newPassword={newPassword}
                  setNewPassword={setNewPassword}
                  resetLoading={resetLoading}
                  setShowNewPassword={setShowNewPassword}
                  strengthClass={strengthClass}
                  strengthLabel={strengthLabel}
                  strengthScore={strengthScore}
                  showConfirmPassword={showConfirmPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                  setShowConfirmPassword={setShowConfirmPassword}
                  hasLength={hasLength}
                  hasCases={hasCases}
                  hasNumbers={hasNumbers}
                  passwordsMatch={passwordsMatch}
                  isResetValid={isResetValid}
                  resetFeedback={resetFeedback}
                />
              )}

              <footer className="auth-corporate-legal">
                <p>Protección de datos conforme a la Ley 1581 de 2012 y estándares SG-SST</p>
              </footer>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
