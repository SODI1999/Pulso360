// src/core/auth/ProtectedRoute.jsx
// Guardián de seguridad y control de acceso basado en roles (RBAC)

import { Navigate, useLocation } from 'react-router-dom';
import { authService, roleLabels } from './authService';
import { AccessDenied } from './AccessDenied';
import { useEffect, useRef, useState } from 'react';
import { env } from '../config/env';
import { getAuthToken } from '../api/apiClient';

export function ProtectedRoute({ allowedRoles, children, standalone = false }) {
  const location = useLocation();
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const lastOwnerRef = useRef(user?.id);
  if (user?.id) lastOwnerRef.current = user.id;

  // En una SPA, si el usuario ya existe en memoria, no bloqueamos la transición entre pestañas.
  // Solo mostramos 'Validando sesión...' en carga inicial cuando no hay usuario pero sí token JWT.
  const [loading, setLoading] = useState(() => {
    if (env.useMockStorage) return false;
    if (authService.getCurrentUser()) return false;
    return Boolean(getAuthToken());
  });
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    if (env.useMockStorage) {
      setUser(authService.getCurrentUser());
      return;
    }

    const currentUser = authService.getCurrentUser();
    // Si ya hay usuario autenticado en memoria y no es reintento explícito, no bloqueamos la UI
    if (currentUser && retry === 0) {
      setUser(currentUser);
      authService.refreshSession().then((session) => {
        if (active && session) setUser(session);
      }).catch(() => {
        // Fallo transitorio de red en segundo plano no interrumpe la navegación
      });
      return;
    }

    if (getAuthToken()) {
      setLoading(true);
      setError('');
      authService.refreshSession().then((session) => {
        if (active) {
          setUser(session);
          setLoading(false);
        }
      }).catch((err) => {
        if (!active) return;
        setLoading(false);
        if (!authService.getCurrentUser()) {
          setUser(null);
        } else {
          setError(err.response?.data?.error?.message || 'No se pudo validar tu sesión. Intenta de nuevo.');
        }
      });
    } else {
      setLoading(false);
    }

    return () => { active = false; };
  }, [retry]);

  useEffect(() => {
    const refresh = () => setUser(authService.getCurrentUser());
    window.addEventListener('pulso360-session-changed', refresh);
    return () => window.removeEventListener('pulso360-session-changed', refresh);
  }, []);

  if (loading) return <p role="status">Validando sesión…</p>;
  if (error) return <div role="alert"><p>{error}</p><button type="button" onClick={() => setRetry(v => v + 1)}>Reintentar</button></div>;

  // 1. Barrera de Autenticación: ¿Existe una sesión activa?
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location, userId: lastOwnerRef.current }} />;
  }

  // 2. Barrera de Privacidad: Si es agente, ¿firmó la versión vigente de la política?
  if (authService.needsConsent(user) && location.pathname !== '/consentimiento') {
    return <Navigate to="/consentimiento" replace />;
  }

  // 3. Barrera de Autorización (RBAC): ¿Tiene el rol requerido para esta ruta?
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Registro inmutable de intento no autorizado en la auditoría del sistema
    authService.recordSecurityAudit({
      actor: `${user.id} (${roleLabels[user.role] || user.role})`,
      action: 'ACCESO_DENEGADO_RBAC',
      target: location.pathname,
      status: 'DENEGADO'
    });

    return <AccessDenied userRole={user.role} allowedRoles={allowedRoles} standalone={standalone} />;
  }

  // 4. Acceso Concedido: Renderiza la vista solicitada
  return children;
}
