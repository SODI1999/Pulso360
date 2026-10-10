/**
 * @fileoverview Validación y obtención segura de la clave secreta JWT.
 * Capa: P10 · infrastructure
 * @module infrastructure/jwtConfig
 */

import { AppError } from '../application/errors/AppError.js';

const publicExamples = new Set(['secret', 'pulso360_super_secret_jwt_key_2026_academica']);

/**
 * Obtiene y valida la clave secreta utilizada para firmar y verificar tokens JWT.
 * Exige una longitud mínima de 32 caracteres y rechaza valores genéricos o inseguros.
 *
 * @returns {string} Secreto JWT validado desde variables de entorno.
 * @throws {AppError} 500 (AUTH_INSECURE_CONFIG) si la clave es insegura, nula o demasiado corta.
 */
export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 32 || publicExamples.has(secret.trim()) ||
      /^(change.?me|replace.?me|your[_ -]|example|sample)/i.test(secret.trim())) {
    throw new AppError('Configuración de autenticación no disponible.', 'AUTH_INSECURE_CONFIG', 500);
  }
  return secret;
}
