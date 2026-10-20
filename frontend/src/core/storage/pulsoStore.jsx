import { normalizeStoredData } from './normalizeStoredData';
//core/storage/pulsoStore.jsx
//Almacén central de datos en localStorage y simulación de auditoría
import { env } from '../config/env';
import { initialSeed } from './seed';
import { migrateStoredData } from './migrations';
import { localData, sessionData } from './browserStorage';

const STORAGE_KEY = env.storageKey;

// Datos de demostración del frontend local.

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

    const normalized = normalizeStoredData(data);
    const migration = migrateStoredData(normalized);
    if (migration.changed || JSON.stringify(normalized) !== raw) pulsoStore.save(migration.data);

    return migration.data;
  },
  // Guarda los datos actualizados
  save: (data) => {
    localData.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  // Reinicia los datos al estado de fábrica de la semilla
  reset: () => {
    localData.setItem(STORAGE_KEY, JSON.stringify(cloneSeed()));
  },
  // Actualiza los datos de perfil y avatar de un usuario en el almacén y sincroniza la sesión
  updateUserProfile: (userId, updates) => {
    const data = pulsoStore.get();
    const userIndex = (data.users || []).findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      data.users[userIndex] = { ...data.users[userIndex], ...updates };
      pulsoStore.save(data);
    }
    // Sincronizar también la sesión activa en sessionData si coincide el usuario autenticado
    const rawSession = sessionData.getItem('pulso360_current_session');
    if (rawSession) {
      try {
        const session = JSON.parse(rawSession);
        if (session.id === userId) {
          const updatedSession = { ...session, ...updates };
          sessionData.setItem('pulso360_current_session', JSON.stringify(updatedSession));
        }
      } catch {
        // Ignorar error de parsing
      }
    }
    pulsoStore.audit({
      actor: `${userId}`,
      action: 'ACTUALIZACION_PERFIL_USUARIO',
      target: 'Perfil y avatar institucional',
      status: 'EXITO'
    });
    globalThis.window?.dispatchEvent?.(new Event('pulso360-session-changed'));
    return userIndex !== -1 ? data.users[userIndex] : null;
  },
  // Registra un evento en la historial local de auditoría
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
