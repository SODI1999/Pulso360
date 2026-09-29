import { useSyncExternalStore } from 'react';
import { storageStatus } from '../storage/browserStorage';

export function StorageNotice() {
  const temporary = useSyncExternalStore(storageStatus.subscribe, storageStatus.getSnapshot, () => false);
  if (!temporary) return null;
  return (
    <div className="alert-banner warn" role="alert">
      El navegador no permite guardar todos los cambios. Puedes continuar en esta pestaña, pero los cambios
      temporales se perderán al recargar o cerrarla.
    </div>
  );
}
