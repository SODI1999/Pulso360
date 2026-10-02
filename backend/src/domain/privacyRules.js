/**
 * Pulso360 — Reglas Puras de Dominio, Ética y Privacidad (SDD)
 * Implementa los invariantes inmutables definidos en src/domain/README.md.
 */

export const K_ANONYMITY_THRESHOLD = 5;

export const CHECKIN_DIMENSIONS = [
  'energia',
  'carga_emocional',
  'recuperacion',
  'apoyo',
  'distanciamiento',
  'ineficacia'
];

/**
 * Evalúa el invariante matemático de k-anonimato (k >= 5)
 * @param {number} cohortCount - Cantidad de participantes únicos en la cohorte
 * @returns {{ protected: boolean, reason: string|null, cohort_count: number, k_threshold: number }}
 */
export function evaluarKAnonimato(cohortCount) {
  const count = Number(cohortCount) || 0;
  if (count < K_ANONYMITY_THRESHOLD) {
    return {
      protected: true,
      reason: 'Muestra insuficiente para garantizar k-anonimato (k < 5)',
      cohort_count: count,
      k_threshold: K_ANONYMITY_THRESHOLD
    };
  }
  return {
    protected: false,
    reason: null,
    cohort_count: count,
    k_threshold: K_ANONYMITY_THRESHOLD
  };
}

/**
 * Valida que las 6 dimensiones del check-in diario sean enteros estrictos entre 1 y 5.
 * @param {object} dims - Objeto con las 6 dimensiones
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validarDimensionesCheckin(dims = {}) {
  const errors = [];
  for (const dim of CHECKIN_DIMENSIONS) {
    const val = dims[dim];
    if (val === undefined || val === null) {
      errors.push(`La dimensión '${dim}' es obligatoria.`);
      continue;
    }
    if (!Number.isInteger(val) || val < 1 || val > 5) {
      errors.push(`La dimensión '${dim}' debe ser un número entero entre 1 y 5 (recibido: ${val}).`);
    }
  }
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Verifica si un usuario cuenta con un permiso de consentimiento granular específico.
 * @param {object} consent - Registro de consentimiento del usuario
 * @param {'c1_checkin'|'c2_bitacora'|'c3_apoyo'|'c4_analitica'|'c5_contacto'} flag - Finalidad
 * @returns {boolean}
 */
export function tieneConsentimientoActivo(consent, flag) {
  if (!consent || typeof consent !== 'object') return false;
  if (!consent.acepta_politica) return false;
  return Boolean(consent[flag]);
}
