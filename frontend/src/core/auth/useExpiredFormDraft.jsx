import { useEffect, useRef } from 'react';
import { authService } from './authService';
import { preferences } from '../storage/preferences';

// El 401 revoca acceso; el borrador queda únicamente en RAM y lo recupera el mismo titular.
// Los consumidores pasan campos de negocio, nunca contraseñas ni tokens.
export function useExpiredFormDraft(key, values, restore, enabled = true) {
  const ownerId = authService.getCurrentUser()?.id;
  const valuesRef = useRef(values);
  const restoreRef = useRef(restore);
  const restoredKeyRef = useRef(null);
  valuesRef.current = values;
  restoreRef.current = restore;

  useEffect(() => {
    if (!ownerId || !enabled) return;
    const cacheKey = `${ownerId}:${key}`;
    if (restoredKeyRef.current !== cacheKey) {
      restoredKeyRef.current = cacheKey;
      const draft = preferences.takeExpiredForm(ownerId, key);
      if (draft) restoreRef.current(draft);
    }
    const retain = () => preferences.rememberExpiredForm(ownerId, key, valuesRef.current);
    window.addEventListener('pulso360-session-expired', retain);
    return () => window.removeEventListener('pulso360-session-expired', retain);
  }, [ownerId, key, enabled]);
}
