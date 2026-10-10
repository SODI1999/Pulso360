/**
 * @fileoverview Configuración del planificador en segundo plano de alertas semanales SST.
 * Capa: P10 · infrastructure
 * @module infrastructure/alertJobConfig
 */

/**
 * Determina si el planificador periódico de alertas semanales está habilitado por entorno.
 *
 * @returns {boolean} True si ALERT_JOB_ENABLED está explícitamente en 'true'.
 */
export function alertJobEnabled() {
  return process.env.ALERT_JOB_ENABLED === 'true';
}
