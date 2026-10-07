import { localData, sessionData } from '../storage/browserStorage';
// src/core/auth/authService.jsx
// Servicio de autenticación, control de sesiones y permisos por rol (RBAC)

import { pulsoStore } from '../storage/pulsoStore';
import { env } from '../config/env';
import { apiClient, getAuthToken, setAuthToken, removeAuthToken } from '../api/apiClient';

import { normalizeConsent } from './consentContract';
import { preferences } from '../storage/preferences';

const normalizeUser = (u, previous = {}) => ({
  ...previous, id: u.id, name: `${u.nombres || ''} ${u.apellidos || ''}`.trim(),
  email: u.correo, role: u.rol_codigo?.toLowerCase(), rol_codigo: u.rol_codigo, status: u.estado,
  team: u.equipo_nombre || null, teamId: u.equipo_id || null, campaign: u.campana_nombre || null,
  campaignId: u.campana_id || null, shiftStartHour: u.shift_start_hour ?? 8,
  scopes: u.scopes || [], supervisors: u.supervisors || [], lastActivity: previous.lastActivity || Date.now(),
  assignments:u.assignments || [], navigationCounts:u.navigation_counts || {}
});

const SESSION_KEY = 'pulso360_current_session';
const GUARD_KEY = 'pulso360_login_guard';
let refreshSequence = 0;

import { roleLabels, roleMenus } from './roleNavigation';
export { roleLabels, roleMenus, roleHomePaths } from './roleNavigation';

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
  logoutCallbacks.forEach(cb => {
    try { cb(); } catch { /* ignore callback error */ }
  });
  globalThis.window?.dispatchEvent?.(new Event('pulso360-logout'));
}

export const authService = {
  touchSession: (user) => {
    preferences.retainExpiredFormsFor(user.id);
    sessionData.setItem(SESSION_KEY, JSON.stringify({ ...user, lastActivity: Date.now() }));
    globalThis.window?.dispatchEvent?.(new Event('pulso360-session-changed'));
  },
  clearSession: () => { refreshSequence++; sessionData.removeItem(SESSION_KEY); notifyLogout(); },
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

    if (!env.useMockStorage) {
      return stored;
    }

    const user = pulsoStore.get().users?.find((item) => item.id === stored?.id);
    if (user) {
      if (user.status === 'Suspendido') {
        authService.clearSession();
        return null;
      }
      const session = { ...stored, ...user, lastActivity: stored.lastActivity };
      if (JSON.stringify(session) !== raw) sessionData.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    }

    return stored;
  },

  // Retorna el tiempo en milisegundos que le queda de bloqueo al login
  getRemainingLockMs: () => {
    return Math.max(0, Number(getGuard().blockedUntil || 0) - Date.now());
  },

  // Login API o demostración según configuración; un fallo API nunca activa mock.
  /**
   * @function login
   * @description Autentica al usuario contra el backend REST. Implementa una
   * arquitectura de resiliencia y degradación tolerante a fallos
   * (Graceful Degradation) para asegurar continuidad de la operación en
   * caso de desconexión del backend.
   */
  login: async (email, password) => {
    // Seguridad: Ante cualquier intento de login, invalidamos cualquier sesión previa residual
    sessionData.removeItem(SESSION_KEY);
    removeAuthToken(); // Limpieza preventiva del token API

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

    // INTENTO 1: LLAMADA A BACKEND (Si está habilitado el modo real)
    if (!env.useMockStorage) {
      try {
        const payload = await apiClient.post('/auth/login', { correo: resolvedEmail, contrasena: password });
        if (payload.success && payload.data) {
          const { usuario, token } = payload.data;
          setAuthToken(token); // Guardar JWT de sesión segura

          const session = normalizeUser(usuario);

          if (session.role === 'agente') {
            const res = await apiClient.get('/agent/consent');
            session.consent = normalizeConsent(res.data);
          }

          saveGuard({ failed: 0, blockedUntil: 0 });
          sessionData.setItem(SESSION_KEY, JSON.stringify(session));


          return { success: true, user: session };
        }
      } catch (error) {
        const isNetworkError = !error.response;
        const isAuthError = error.response?.status === 400 || error.response?.status === 401;

        if (isAuthError) {
          return { success: false, message: error.response?.data?.error?.message || 'Credenciales inválidas' };
        }

        return { success: false, message: isNetworkError ? 'Error de conexión con el servidor' : (error.response?.data?.error?.message || 'No se pudo iniciar sesión.') };
      }
      return { success: false, message: 'Respuesta de autenticación inválida.' };
    }

    // INTENTO 2: FALLBACK A DATOS LOCALES (Si useMockStorage es true, o API caída por red)
    const data = pulsoStore.get();

    let user = (data.users || []).find(
      (u) => u.email.toLowerCase() === cleanEmail || u.email.toLowerCase() === resolvedEmail
    );

    if (!user) {
      const roleMatch = ['agente', 'supervisor', 'sst', 'auditor', 'admin'].find((r) =>
        cleanEmail.startsWith(r)
      );
      if (roleMatch) {
        user = (data.users || []).find((u) => u.role === roleMatch);
      }
    }

    const isCompliantMockPass = password === 'Pulso360#2026' || password === '123456';
    const valid = Boolean(user && (isCompliantMockPass || (user.password && password === user.password)));

    // 3. Si la contraseña no coincide
    if (!valid) {
      const guard = getGuard();
      guard.failed = Number(guard.failed || 0) + 1;

      // Bloqueo de 15 minutos tras 5 intentos fallidos
      if (guard.failed >= 5) {
        guard.blockedUntil = Date.now() + 15 * 60 * 1000;
        guard.failed = 0;
      }
      saveGuard(guard);

      pulsoStore.audit({
        actor: user ? `${user.id} (${roleLabels[user.role] || user.role})` : 'actor-no-identificado',
        action: 'INTENTO_FALLIDO_AUTENTICACION',
        target: 'Inicio de sesión',
        status: 'DENEGADO'
      });

      if (guard.blockedUntil) {
        return {
          success: false,
          locked: true,
          remainingMs: 15 * 60 * 1000,
          message: 'Demasiados intentos. Se aplicó un bloqueo temporal de 15 minutos.'
        };
      }
      return { success: false, message: 'Las credenciales no son válidas. Verifica tu correo y contraseña.' };
    }

    // 4. Si la cuenta está suspendida
    if (user.status === 'Suspendido') {
      pulsoStore.audit({
        actor: `${user.id} (${roleLabels[user.role] || user.role})`,
        action: 'ACCESO_DENEGADO_CUENTA_SUSPENDIDA',
        target: 'Inicio de sesión bloqueado por estado suspendido',
        status: 'DENEGADO'
      });
      return { success: false, message: 'La cuenta se encuentra suspendida. Contacta al administrador.' };
    }

    // 5. Autenticación exitosa (Fallback Local)
    saveGuard({ failed: 0, blockedUntil: 0 });
    const session = { ...user, lastActivity: Date.now() };
    sessionData.setItem(SESSION_KEY, JSON.stringify(session));

    pulsoStore.audit({
      actor: `${user.id} (${roleLabels[user.role] || user.role})`,
      action: 'INICIO_SESION',
      target: 'Portal Web (Local)'
    });

    return { success: true, user: session };
  },

  updateConsent: (consent) => {
    const user = authService.getCurrentUser();
    if (user) authService.touchSession({ ...user, consent });
  },
  refreshSession: async () => {
    const user = authService.getCurrentUser();
    if (!user || env.useMockStorage) return user;
    const sequence = ++refreshSequence;
    const token = getAuthToken();
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
  },
  // Cierre de sesión
  logout: () => {
    refreshSequence++;
    preferences.clearExpiredForms();
    const user = authService.getCurrentUser();
    if (user && env.useMockStorage) {
      pulsoStore.audit({
        actor: `${user.id} (${roleLabels[user.role] || user.role})`,
        action: 'CIERRE_SESION',
        target: 'Portal Web'
      });
    }
    sessionData.removeItem(SESSION_KEY);
    removeAuthToken(); // Destruimos el token JWT de la API
    notifyLogout();
  },

  // Revisa si un agente debe aceptar la póliza de privacidad antes de entrar
  needsConsent: (user) => {
    if (!user || user.role !== 'agente') return false;

    if (!env.useMockStorage) return !user.consent?.active;
    if (user.consent !== undefined) return !user.consent?.active;
    const data = pulsoStore.get();
    const consent = data.consents?.[user.id];
    return !consent?.policyAccepted || consent?.policyVersion !== data.settings.policyVersion;
  },

  // Filtra los menús del agente según los consentimientos aceptados (C1, C2, C3, C5)
  getMenuItems: (user) => {
    if (!user) return [];
    const baseItems = roleMenus[user.role] || [];
    if (user.role !== 'agente') return baseItems;

    const consent = user.consent || (env.useMockStorage ? pulsoStore.get().consents?.[user.id] : {}) || {};
    return baseItems.filter((item) => {
      if (item.href.includes('checkin')) return Boolean(consent.c1);
      if (item.href.includes('bitacora')) return Boolean(consent.c2);
      if (item.href.includes('mi-analisis')) return Boolean(consent.c2 && consent.c3);
      if (item.href.includes('apoyo')) return Boolean(consent.c3);
      return true;
    });
  },

  // =========================================================================
  // Recuperación mediante API; la entrega requiere SMTP configurado en el servidor.
  // =========================================================================

  requestPasswordReset: async (email) => {
    if (!env.useMockStorage) {
      try {
        const response = await apiClient.post('/auth/password-reset/request', { correo: email.trim().toLowerCase() });
        return { success: true, ...response.data };
      } catch (error) { return { success: false, message: error.response?.data?.error?.message || 'No se pudo solicitar la recuperación.' }; }
    }
    await new Promise((r) => setTimeout(r, 450));
    const cleanEmail = String(email || '')
      .trim()
      .toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Ingresa un correo institucional válido.' };
    }

    const data = pulsoStore.get();

    let foundUser = (data.users || []).find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    pulsoStore.audit({
      actor: foundUser ? foundUser.id + ' (' + foundUser.role + ')' : 'actor-no-identificado',
      action: 'SOLICITUD_RESET_PASSWORD',
      target: 'Recuperacion de acceso institucional'
    });

    // Asegurar que no se exponga ningun correo o dominio @demo en la respuesta de despacho
    const safeTargetEmail = (foundUser ? foundUser.email : cleanEmail).replace(/@demo$/, '@pulso360.co');

    if (foundUser) {
      data.passwordReset = data.passwordReset || { tokens: [] };
      data.passwordReset.tokens = (data.passwordReset.tokens || []).filter((t) => t.userId !== foundUser.id);

      const token = 'rst-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
      const expiresAt = Date.now() + 30 * 60 * 1000;

      data.passwordReset.tokens.push({
        id: token,
        userId: foundUser.id,
        expiresAt,
        used: false,
        email: foundUser.email
      });
      pulsoStore.save(data);

      return {
        success: true,
        message: 'Instrucciones de recuperación despachadas a tu correo institucional.',
        targetEmail: safeTargetEmail,
        devToken: token,
        devLink: '/nueva-clave?token=' + token,
        expiresInMinutes: 30
      };
    }

    return {
      success: true,
      message:
        'Si el correo institucional se encuentra registrado en el sistema, recibirás las instrucciones en breve.',
      targetEmail: safeTargetEmail,
      devToken: null,
      devLink: null
    };
  },

  validateResetToken: async (token) => {
    if (!env.useMockStorage) {
      try { const response = await apiClient.post('/auth/password-reset/validate', { token }); return response.data; }
      catch (error) { return { valid: false, message: error.response?.data?.error?.message || 'No se pudo validar el enlace.' }; }
    }
    await new Promise((r) => setTimeout(r, 200));

    if (!token) {
      return {
        valid: false,
        reason: 'TOKEN_MISSING',
        message:
          'No se suministró ningún token de recuperación válido. El enlace es obligatorio para acceder.'
      };
    }

    const data = pulsoStore.get();

    if (token === 'demo-valid') {
      const demoUser = (data.users || []).find((u) => u.id === 'usr-1');
      const demoEmail = (demoUser?.email || 'agente@pulso360.co').replace(/@demo$/, '@pulso360.co');
      return { valid: true, userId: 'usr-1', email: demoEmail, isDemo: true };
    }

    const record = (data.passwordReset?.tokens || []).find((t) => t.id === token);

    if (!record) {
      return {
        valid: false,
        reason: 'TOKEN_NOT_FOUND',
        message: 'Este enlace de recuperación no existe o ya fue revocado.'
      };
    }

    if (record.used) {
      return {
        valid: false,
        reason: 'TOKEN_ALREADY_USED',
        message: 'Este enlace de recuperación ya fue utilizado previamente.'
      };
    }

    if (Number(record.expiresAt) <= Date.now()) {
      return {
        valid: false,
        reason: 'TOKEN_EXPIRED',
        message: 'Este enlace ha expirado por límite de tiempo (30 minutos).'
      };
    }

    const targetUser = (data.users || []).find((u) => u.id === record.userId);
    const resolvedEmail = (record.email || (targetUser ? targetUser.email : '')).replace(
      /@demo$/,
      '@pulso360.co'
    );

    return { valid: true, userId: record.userId, email: resolvedEmail, stored: record };
  },

  resetPassword: async (token, newPassword) => {
    if (!env.useMockStorage) {
      try {
        const response = await apiClient.post('/auth/password-reset/confirm', { token, contrasena: newPassword });
        removeAuthToken(); authService.clearSession();
        return { success: true, ...response.data };
      } catch (error) { return { success: false, message: error.response?.data?.error?.message || 'No se pudo restablecer la contraseña.' }; }
    }
    await new Promise((r) => setTimeout(r, 450));

    const validation = await authService.validateResetToken(token);
    if (!validation.valid) {
      return { success: false, message: validation.message || 'El token de recuperación no es válido.' };
    }

    const passwordPolicy = validatePasswordStrength(newPassword);
    if (!passwordPolicy.valid) {
      return { success: false, message: passwordPolicy.message };
    }

    const data = pulsoStore.get();
    const targetUserId = validation.userId;

    const userIndex = (data.users || []).findIndex((u) => u.id === targetUserId);
    if (userIndex !== -1) {
      data.users[userIndex].password = newPassword;
    }

    if (token !== 'demo-valid' && data.passwordReset?.tokens) {
      const tokenIndex = data.passwordReset.tokens.findIndex((t) => t.id === token);
      if (tokenIndex !== -1) {
        data.passwordReset.tokens[tokenIndex].used = true;
      }
    }

    pulsoStore.save(data);

    pulsoStore.audit({
      actor: targetUserId + ' (recuperacion)',
      action: 'RESTABLECIMIENTO_PASSWORD',
      target: 'Credenciales de acceso institucional'
    });

    sessionData.removeItem(SESSION_KEY);
    return { success: true, message: 'Contraseña institucional actualizada exitosamente.' };
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
