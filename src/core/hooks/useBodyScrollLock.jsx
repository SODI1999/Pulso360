import { useEffect } from 'react';

let activeLocks = 0;
let previousOverflow = '';

// El bloqueo es global: si dos diálogos coinciden, el último en cerrar restaura el scroll.
export function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked || typeof document === 'undefined') return undefined;

    const body = document.body;
    if (activeLocks === 0) {
      previousOverflow = body.style.overflow;
      body.style.overflow = 'hidden';
    }
    activeLocks += 1;

    return () => {
      activeLocks -= 1;
      if (activeLocks === 0) {
        body.style.overflow = previousOverflow;
      }
    };
  }, [isLocked]);
}
