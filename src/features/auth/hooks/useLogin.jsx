import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

import { useLoginCredentials } from './useLoginCredentials';
import { usePasswordRecovery } from './usePasswordRecovery';
import { usePasswordReset } from './usePasswordReset';
export function useLogin({ initialMode }) {
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

  const credentials = useLoginCredentials(navigate);
  const recovery = usePasswordRecovery();
  const tokenParam = searchParams.get('token') || recovery.dispatchedData?.devToken || '';
  const reset = usePasswordReset(mode, tokenParam, (password) => {
    setMode('login');
    credentials.setPassword(password);
    recovery.setDispatchedData(null);
    navigate('/login');
  });
  return { navigate, mode, ...credentials, ...recovery, ...reset };
}
