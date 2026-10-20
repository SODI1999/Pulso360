// src/features/agent/services/agentDashboardHelpers.jsx

/**
 * Escala rápida de 5 niveles para autorreporte somático de energía al inicio de turno.
 * Reutiliza las dimensiones estandarizadas de bienestar del wizard.
 *
 * @type {Array<{ value: number, label: string }>}
 */
export const QUICK_ENERGY_SCALE = [
  { value: 1, label: 'Sin batería' },
  { value: 2, label: 'Baja energía' },
  { value: 3, label: 'Justa para el turno' },
  { value: 4, label: 'Buena energía' },
  { value: 5, label: 'Plena y enfocado' }
];

/**
 * Formatea un número de hora militar en formato hh:00 con ciclo continuo de 24 horas.
 *
 * @param {number} hourNumber - Hora en formato numérico (puede exceder 24 o ser negativa).
 * @returns {string} Hora formateada en formato "HH:00".
 */
export const formatHour = (hourNumber) => {
  const h = ((hourNumber % 24) + 24) % 24;
  return `${String(h).padStart(2, '0')}:00`;
};
