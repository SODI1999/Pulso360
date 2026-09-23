//core/storage/pulsoStore.jsx
//Almacén central de datos en localStorage y simulación de auditoría
import { env } from '../config/env';
import { initialSeed } from './seed';
import { migrateStoredData } from './migrations';
import { localData } from './browserStorage';

const STORAGE_KEY = env.storageKey;

// 1. Semilla inicial de datos de prueba con la misma estructura para PostgreSQL

// Función para clonar profundamente el objeto y evitar mutaciones no deseadas
const cloneSeed = () => JSON.parse(JSON.stringify(initialSeed));
export const pulsoStore = {
  // Obtiene los datos de localStorage o los inicializa con la semilla
  get: () => {
    const raw = localData.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = cloneSeed();
      localData.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      const seed = cloneSeed();
      localData.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }

    const migration = migrateStoredData(data);
    if (migration.changed) pulsoStore.save(migration.data);

    return data;
  },
  // Guarda los datos actualizados
  save: (data) => {
    localData.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  // Reinicia los datos al estado de fábrica de la semilla
  reset: () => {
    localData.setItem(STORAGE_KEY, JSON.stringify(cloneSeed()));
  },
  // Registra un evento en la cadena inmutable de auditoría
  audit: ({
    actor = 'sistema',
    action,
    target = '-',
    status = 'EXITO',
    ip = '192.168.1.50',
    userAgent = 'Demo browser'
  }) => {
    const data = pulsoStore.get();
    const previous = data.auditLogs[0];
    const id = `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const prevHash = previous?.hash || 'GENESIS';
    const hash = `${id}-${prevHash}`;
    data.auditLogs.unshift({
      id,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor,
      action,
      target,
      ip,
      userAgent,
      status,
      prevHash,
      hash
    });
    pulsoStore.save(data);
    return id;
  }
};
