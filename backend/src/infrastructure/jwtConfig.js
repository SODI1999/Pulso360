import { AppError } from '../application/errors/AppError.js';

const publicExamples = new Set(['secret', 'pulso360_super_secret_jwt_key_2026_academica']);

// La firma y la verificación deben usar exactamente la misma política, también en pruebas.
export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 32 || publicExamples.has(secret.trim()) ||
      /^(change.?me|replace.?me|your[_ -]|example|sample)/i.test(secret.trim())) {
    throw new AppError('Configuración de autenticación no disponible.', 'AUTH_INSECURE_CONFIG', 500);
  }
  return secret;
}
