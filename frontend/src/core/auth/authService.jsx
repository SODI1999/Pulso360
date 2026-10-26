import { localData, sessionData } from '../storage/browserStorage';
// src/core/auth/authService.jsx
// Servicio de autenticación, control de sesiones y permisos por rol (RBAC)

import { apiClient, getAuthToken, setAuthToken, removeAuthToken } from '../api/apiClient';
import { normalizeConsent } from './consentContract';
import { preferences } from '../storage/preferences';
import { getRandomAvatarForRole } from './avatarPool';
import { roleMenus } from './roleNavigation';
export { roleLabels, roleMenus, roleHomePaths } from './roleNavigation';

const normalizeUser = (u, previous = {}) => {
  const resolvedId = u.id || previous.id;
  const savedAvatar = resolvedId ? localData.getItem(`pulso360_avatar_${resolvedId}`) : null;
  const resolvedRole = u.rol_codigo?.toLowerCase() || previous.role || 'agente';
  const userAvatar =
    u.avatar ||
    previous.avatar ||
    savedAvatar ||
    getRandomAvatarForRole(resolvedRole);
  if (resolvedId && !savedAvatar && userAvatar) {
    localData.setItem(`pulso360_avatar_${resolvedId}`, userAvatar);
  }
  return {
    ...previous,
    id: resolvedId,
    name: `${u.nombres || ''} ${u.apellidos || ''}`.trim() || previous.name || 'Usuario',
    email: u.correo || previous.email,
    role: resolvedRole,
    rol_codigo: u.rol_codigo || previous.rol_codigo,
    status: u.estado || previous.status,
    team: u.equipo_nombre || previous.team || null,
    teamId: u.equipo_id || previous.teamId || null,
    campaign: u.campana_nombre || previous.campaign || null,
    campaignId: u.campana_id || previous.campaignId || null,
    shiftStartHour: u.shift_start_hour ?? previous.shiftStartHour ?? 8,
    scopes: u.scopes || previous.scopes || [],
    supervisors: u.supervisors || previous.supervisors || [],
    lastActivity: previous.lastActivity || Date.now(),
    assignments: u.assignments || previous.assignments || [],
    navigationCounts: u.navigation_counts || previous.navigationCounts || {},
    avatar: userAvatar
  };
};

const SESSION_KEY = 'pulso360_current_session';
const GUARD_KEY = 'pulso360_login_guard';
let refreshSequence = 0;

// Ayudantes de seguridad contra fuerza bruta
const getGuard = () => {
  try {
    return JSON.parse(localData.getItem(GUARD_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveGuard = (guardData) => localData.setItem(GUARD_KEY, JSON.stringify(guardData));

const logoutCallbacks = new Set();
export function onLogout(callback) {
  logoutCallbacks.add(callback);
  return () => logoutCallbacks.delete(callback);
}

function notifyLogout() {
  logoutCallbacks.forEach((cb) => {
    try {
      cb();
    } catch {
      /* ignore callback error */
    }
  });
  globalThis.window?.dispatchEvent?.(new Event('pulso360-logout'));
}

export const authService = {
  recordSecurityAudit: () => {
    // Auditoría gestionada directamente por el backend
  },

  getBadgeCounts: (user, countsError = false) => {
    if (!user) return { pendingAlerts: 0, pendingSupport: 0, pendingHabeas: 0, unreadCount: 0 };
    const counts = countsError ? {} : user.navigationCounts || {};
    return {
      pendingAlerts: counts.alerts || 0,
      pendingSupport: counts.support || 0,
      pendingHabeas: counts.habeas || 0,
      unreadCount: counts.unread || 0
    };
  },

  touchSession: (user) => {
    preferences.retainExpiredFormsFor(user.id);
    sessionData.setItem(SESSION_KEY, JSON.stringify({ ...user, lastActivity: Date.now() }));
    globalThis.window?.dispatchEvent?.(new Event('pulso360-session-changed'));
  },

  clearSession: () => {
    refreshSequence++;
    sessionData.removeItem(SESSION_KEY);
    notifyLogout();
  },

  getRememberedEmail: () => localData.getItem('pulso360_remembered_email'),
  rememberEmail: (email) => localData.setItem('pulso360_remembered_email', email),
  forgetEmail: () => localData.removeItem('pulso360_remembered_email'),

  // Retorna el usuario conectado actualmente o null
  getCurrentUser: () => {
    const raw = sessionData.getItem(SESSION_KEY);
    if (!raw) return null;
    let stored;
    try {
      stored = JSON.parse(raw);
    } catch {
      authService.clearSession();
      return null;
    }

    if (stored.status === 'Suspendido') {
      authService.clearSession();
      return null;
    }

    return stored;
  },

  // Retorna el tiempo en milisegundos que le queda de bloqueo al login
  getRemainingLockMs: () => {
    return Math.max(0, Number(getGuard().blockedUntil || 0) - Date.now());
  },

  /**
   * @function login
   * @description Autentica al usuario contra el backend REST PostgreSQL.
   */
  login: async (email, password) => {
    sessionData.removeItem(SESSION_KEY);
    removeAuthToken();

    // 1. Verificar si está bloqueado por intentos fallidos
    const lockedTime = authService.getRemainingLockMs();
    if (lockedTime > 0) {
      return {
        success: false,
        locked: true,
        remainingMs: lockedTime,
        message: 'Demasiados intentos. Espera a que termine el bloqueo temporal.'
      };
    }

    const cleanEmail = String(email || '').trim().toLowerCase();
    const emailAliases = {
      'agente@demo': 'agente@pulso360.co',
      'supervisor@demo': 'supervisor@pulso360.co',
      'sst@demo': 'sst@pulso360.co',
      'auditor@demo': 'auditor@pulso360.co',
      'admin@demo': 'admin@pulso360.co',
      agente: 'agente@pulso360.co',
      supervisor: 'supervisor@pulso360.co',
      sst: 'sst@pulso360.co',
      auditor: 'auditor@pulso360.co',
      admin: 'admin@pulso360.co'
    };
    const resolvedEmail = emailAliases[cleanEmail] || cleanEmail;

    try {
      const payload = await apiClient.post('/auth/login', { correo: resolvedEmail, contrasena: password });
      if (payload.success && payload.data) {
        const { usuario, token } = payload.data;
        setAuthToken(token);

        const session = normalizeUser(usuario);

        if (session.role === 'agente') {
          try {
            const res = await apiClient.get('/agent/consent');
            session.consent = normalizeConsent(res.data);
          } catch {
            // Consentimiento pendiente de configuración inicial
          }
        }

        saveGuard({ failed: 0, blockedUntil: 0 });
        sessionData.setItem(SESSION_KEY, JSON.stringify(session));

        return { success: true, user: session };
      }
    } catch (error) {
      const isNetworkError = !error.response;
      const isAuthError = error.response?.status === 400 || error.response?.status === 401;

      if (isAuthError) {
        const guard = getGuard();
        guard.failed = Number(guard.failed || 0) + 1;
        if (guard.failed >= 5) {
          guard.blockedUntil = Date.now() + 15 * 60 * 1000;
          guard.failed = 0;
        }
        saveGuard(guard);

        if (guard.blockedUntil) {
          return {
            success: false,
            locked: true,
            remainingMs: 15 * 60 * 1000,
            message: 'Demasiados intentos. Se aplicó un bloqueo temporal de 15 minutos.'
          };
        }
        return { success: false, message: error.response?.data?.error?.message || 'Credenciales inválidas' };
      }

      return {
        success: false,
        message: isNetworkError
          ? 'Error de conexión con el servidor'
          : error.response?.data?.error?.message || 'No se pudo iniciar sesión.'
      };
    }
    return { success: false, message: 'Respuesta de autenticación inválida.' };
  },

  updateConsent: (consent) => {
    const user = authService.getCurrentUser();
    if (user) authService.touchSession({ ...user, consent });
  },

  updateProfile: (profileUpdates) => {
    const user = authService.getCurrentUser();
    if (!user) return null;
    const updatedUser = { ...user, ...profileUpdates };
    if (profileUpdates.avatar && user.id) {
      localData.setItem(`pulso360_avatar_${user.id}`, profileUpdates.avatar);
    }
    authService.touchSession(updatedUser);
    return updatedUser;
  },

  refreshSession: async () => {
    const user = authService.getCurrentUser();
    if (!user) return null;
    const sequence = ++refreshSequence;
    const token = getAuthToken();
    try {
      const response = await apiClient.get('/auth/me');
      const session = normalizeUser(response.data, user);
      if (session.role === 'agente') {
        const consent = await apiClient.get('/agent/consent');
        session.consent = normalizeConsent(consent.data);
      }
      if (sequence !== refreshSequence || token !== getAuthToken() || authService.getCurrentUser()?.id !== user.id) {
        return authService.getCurrentUser();
      }
      authService.touchSession(session);
      return session;
    } catch {
      return user;
    }
  },

  // Cierre de sesión
  logout: () => {
    refreshSequence++;
    preferences.clearExpiredForms();
    sessionData.removeItem(SESSION_KEY);
    removeAuthToken();
    notifyLogout();
  },

  // Revisa si un agente debe aceptar la póliza de privacidad antes de entrar
  needsConsent: (user) => {
    if (!user || user.role !== 'agente') return false;
    return !user.consent?.active;
  },

  // Filtra los menús del agente según los consentimientos aceptados (C1, C2, C3, C5)
  getMenuItems: (user) => {
    if (!user) return [];
    const baseItems = roleMenus[user.role] || [];
    if (user.role !== 'agente') return baseItems;

    const consent = user.consent || {};
    return baseItems.filter((item) => {
      if (item.href.includes('checkin')) return Boolean(consent.c1);
      if (item.href.includes('bitacora')) return Boolean(consent.c2);
      if (item.href.includes('apoyo')) return Boolean(consent.c3);
      return true;
    });
  },

  // Recuperación mediante API REST
  requestPasswordReset: async (email) => {
    try {
      const response = await apiClient.post('/auth/password-reset/request', { correo: email.trim().toLowerCase() });
      return { success: true, ...response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error?.message || 'No se pudo solicitar la recuperación.' };
    }
  },

  validateResetToken: async (token) => {
    if (!token) {
      return {
        valid: false,
        reason: 'TOKEN_MISSING',
        message: 'No se suministró ningún token de recuperación válido. El enlace es obligatorio para acceder.'
      };
    }
    try {
      const response = await apiClient.post('/auth/password-reset/validate', { token });
      return response.data;
    } catch (error) {
      return { valid: false, message: error.response?.data?.error?.message || 'No se pudo validar el enlace.' };
    }
  },

  resetPassword: async (token, newPassword) => {
    const passwordPolicy = validatePasswordStrength(newPassword);
    if (!passwordPolicy.valid) {
      return { success: false, message: passwordPolicy.message };
    }
    try {
      const response = await apiClient.post('/auth/password-reset/confirm', { token, contrasena: newPassword });
      removeAuthToken();
      authService.clearSession();
      return { success: true, ...response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error?.message || 'No se pudo restablecer la contraseña.' };
    }
  }
};

// Validación unificada de contraseña corporativa (8 caracteres robustos)
export const validatePasswordStrength = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'La contraseña institucional es requerida.' };
  }
  if (password.length < 8 || password.length > 72) {
    return { valid: false, message: 'La contraseña debe tener entre 8 y 72 caracteres.' };
  }
  if (!(/[A-Z]/.test(password) && /[a-z]/.test(password))) {
    return { valid: false, message: 'La contraseña debe contener letras mayúsculas y minúsculas.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'La contraseña debe incluir al menos un número (0 - 9).' };
  }
  return { valid: true };
};
