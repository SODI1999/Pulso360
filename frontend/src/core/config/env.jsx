// src/core/config/env.jsx
// Configuración centralizada de variables de entorno de Pulso360 (Vite / React)

export const env = {
  appTitle: import.meta.env.VITE_APP_TITLE || 'Pulso360 - Prevención de Burnout BPO',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  storageKey: import.meta.env.VITE_STORAGE_KEY || 'pulso360_data_v2',
  useMockStorage: false,
  policyVersion: import.meta.env.VITE_DEFAULT_POLICY_VERSION || 'v2.4',
  policyEffectiveDate: import.meta.env.VITE_DEFAULT_POLICY_DATE || '15/08/2026',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD
};
