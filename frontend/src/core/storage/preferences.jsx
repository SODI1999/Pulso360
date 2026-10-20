import { localData, sessionData } from './browserStorage';

// Solo durante reautenticación en esta pestaña. Nunca se escribe contenido sensible al almacenamiento persistente.
const expiredFormDrafts = new Map();

export const preferences = {
  rememberExpiredForm: (ownerId, key, values) => {
    if (!ownerId) return;
    const cacheKey = `${ownerId}:${key}`;
    clearTimeout(expiredFormDrafts.get(cacheKey)?.timer);
    const timer = setTimeout(() => expiredFormDrafts.delete(cacheKey), 30*60*1000);
    timer.unref?.();
    expiredFormDrafts.set(cacheKey, { values, expiresAt:Date.now()+30*60*1000, timer });
  },
  takeExpiredForm: (ownerId, key) => {
    const entry = expiredFormDrafts.get(`${ownerId}:${key}`);
    clearTimeout(entry?.timer);
    expiredFormDrafts.delete(`${ownerId}:${key}`);
    return entry?.expiresAt > Date.now() ? entry.values : null;
  },
  clearExpiredForms: () => {
    for (const entry of expiredFormDrafts.values()) clearTimeout(entry.timer);
    expiredFormDrafts.clear();
  },
  retainExpiredFormsFor: (ownerId) => {
    for (const [key,entry] of expiredFormDrafts) {
      if (!key.startsWith(`${ownerId}:`)) { clearTimeout(entry.timer); expiredFormDrafts.delete(key); }
    }
  },
  readCheckinDraft: (key) => JSON.parse(localData.getItem(key) || '{}'),
  saveCheckinDraft: (key, draft) => localData.setItem(key, JSON.stringify(draft)),
  removeCheckinDraft: (key) => localData.removeItem(key),
  isDisconnectDismissed: (journey) =>
    sessionData.getItem(`pulso360_dismiss_disconnect_${journey}`) === 'true',
  dismissDisconnect: (journey) => sessionData.setItem(`pulso360_dismiss_disconnect_${journey}`, 'true'),
  readPauseSound: (fallback = true) => {
    try {
      const value = localData.getItem('pulso360_pause_ambient');
      return value == null ? fallback : value === 'true';
    } catch {
      return fallback;
    }
  },
  savePauseSound: (enabled) => localData.setItem('pulso360_pause_ambient', String(enabled)),
  readReminder: (key) => localData.getItem(key) === '1',
  saveReminder: (key, enabled) => localData.setItem(key, enabled ? '1' : '0'),
  readSidebarCollapsed: (fallback = false) => {
    try {
      const value = localData.getItem('pulso_sidebar_collapsed');
      return value == null ? fallback : value === 'true';
    } catch {
      return fallback;
    }
  },
  saveSidebarCollapsed: (collapsed) => localData.setItem('pulso_sidebar_collapsed', String(collapsed)),
  readReducedMotion: (fallback = false) => {
    try {
      const value = localData.getItem('pulso_reduced_motion');
      return value == null ? fallback : value === 'true';
    } catch {
      return fallback;
    }
  },
  saveReducedMotion: (enabled) => {
    localData.setItem('pulso_reduced_motion', String(enabled));
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-reduced-motion', String(enabled));
      if (enabled) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
    }
  }
};

// Inicializar preferencia ergonómica de descanso visual al arrancar la aplicación
if (typeof document !== 'undefined') {
  try {
    const isReduced = preferences.readReducedMotion(false);
    document.documentElement.setAttribute('data-reduced-motion', String(isReduced));
    if (isReduced) {
      document.documentElement.classList.add('reduced-motion');
    }
  } catch {
    // Entorno sin acceso al DOM
  }
}
