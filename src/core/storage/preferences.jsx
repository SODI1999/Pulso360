import { localData, sessionData } from './browserStorage';

export const preferences = {
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
  saveReminder: (key, enabled) => localData.setItem(key, enabled ? '1' : '0')
};
