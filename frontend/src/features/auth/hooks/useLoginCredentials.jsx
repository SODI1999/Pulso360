import { roleHomePaths } from '../../../core/auth/roleNavigation';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { authService } from '../../../core/auth/authService';
export function useLoginCredentials(navigate) {
  const location = useLocation();
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [lockedRemainingMs, setLockedRemainingMs] = useState(0);

  useEffect(() => {
    authService.clearSession();
    if (location.state?.userId) setFeedback({ type:'error',
      message:'Tu sesión terminó. Ingresa con la misma cuenta para recuperar el borrador en esta pestaña; si era un modal, vuelve a abrirlo. Se conserva en memoria durante 30 minutos.' });
    const lockMs = authService.getRemainingLockMs();
    if (lockMs > 0) {
      setLockedRemainingMs(lockMs);
    }
  }, [location.state?.userId]);

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

  const fillCredentials = (email) => {
    setEmail(email);
    setPassword('Pulso360#2026');
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

        const previousPath = location.state?.userId === user.id ? location.state?.from?.pathname : null;
        navigate(previousPath || roleHomePaths[user.role] || '/agente/panel');
      }, 300);
    } catch {
      setLoading(false);
      setFeedback({ type: 'error', message: 'Error al conectar con el servicio de autenticación.' });
    }
  };

  // Desconectado temporalmente según requerimiento: los botones se mantienen en la interfaz sin acción asociada
  const handleSsoLogin = () => {};

  return {
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
    handleSsoLogin
  };
}
