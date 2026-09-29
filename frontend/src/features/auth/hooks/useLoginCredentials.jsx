import { roleHomePaths } from '../../../core/auth/roleNavigation';
import { useState, useEffect } from 'react';

import { authService } from '../../../core/auth/authService';
export function useLoginCredentials(navigate) {
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [lockedRemainingMs, setLockedRemainingMs] = useState(0);

  useEffect(() => {
    authService.clearSession();
    const lockMs = authService.getRemainingLockMs();
    if (lockMs > 0) {
      setLockedRemainingMs(lockMs);
    }
  }, []);

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

      setFeedback({ type: 'success', message: 'Autenticación exitosa. Redirigiendo...' });

      setTimeout(() => {
        const user = result.user;
        if (user.role === 'agente' && authService.needsConsent(user)) {
          navigate('/consentimiento?origin=login');
          return;
        }

        navigate(roleHomePaths[user.role] || '/agente/panel');
      }, 300);
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      setFeedback({ type: 'error', message: 'Error al conectar con el servicio de autenticación.' });
    }
  };

  const handleSsoLogin = async (provider) => {
    if (loading || lockedRemainingMs > 0) return;
    setLoading(true);
    setFeedback({
      type: 'success',
      message: `Iniciando simulación de acceso con ${provider === 'microsoft' ? 'Microsoft 365' : 'Google Workspace'}...`
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
  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    feedback,
    setFeedback,
    lockedRemainingMs,
    handleSelectDemo,
    handleLoginSubmit,
    handleSsoLogin
  };
}
