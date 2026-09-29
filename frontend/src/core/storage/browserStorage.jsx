// Mantener una copia temporal si el navegador bloquea lecturas o escrituras.
let temporary = false;
const listeners = new Set();
export const storageStatus = {
  getSnapshot: () => temporary,
  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};
function reportTemporaryStorage() {
  if (temporary) return;
  temporary = true;
  queueMicrotask(() => listeners.forEach((listener) => listener()));
}
function browserStorage(storageName) {
  const memory = new Map();
  let writeFailed = false;
  return {
    getItem(key) {
      if (writeFailed && memory.has(key)) return memory.get(key);
      try {
        const value = window[storageName].getItem(key);
        memory.set(key, value);
        return value;
      } catch {
        writeFailed = true;
        reportTemporaryStorage();
        return memory.get(key) ?? null;
      }
    },
    setItem(key, value) {
      memory.set(key, String(value));
      if (writeFailed) return;
      try {
        window[storageName].setItem(key, String(value));
      } catch {
        writeFailed = true;
        reportTemporaryStorage();
      }
    },
    removeItem(key) {
      memory.set(key, null);
      if (writeFailed) return;
      try {
        window[storageName].removeItem(key);
      } catch {
        writeFailed = true;
        reportTemporaryStorage();
      }
    }
  };
}
export const localData = browserStorage('localStorage');
export const sessionData = browserStorage('sessionStorage');
