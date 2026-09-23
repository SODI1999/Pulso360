import { initialSeed } from './seed';

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

// Completar la estructura conocida sin borrar campos adicionales ni arrays válidos.
// Una lista vacía guardada es válida: nunca debe repoblarse con datos demo.
function restoreShape(value, fallback) {
  if (Array.isArray(fallback)) {
    return Array.isArray(value) ? value : structuredClone(fallback);
  }
  if (isRecord(fallback)) {
    const result = isRecord(value) ? { ...value } : {};
    for (const [key, defaultValue] of Object.entries(fallback)) {
      result[key] = restoreShape(result[key], defaultValue);
    }
    return result;
  }
  if (fallback === null) return value === undefined ? null : value;
  return typeof value === typeof fallback ? value : fallback;
}

export function normalizeStoredData(value) {
  return restoreShape(value, initialSeed);
}
