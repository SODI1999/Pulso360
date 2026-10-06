import { AppError } from '../application/errors/AppError.js';

/**
 * Middleware generador para validación y sanitización de formularios y cuerpos HTTP (req.body).
 * Implementa el patrón Fail-Fast para interceptar peticiones incompletas o inválidas antes
 * de que alcancen los controladores o servicios de aplicación.
 *
 * @param {Record<string, { required?: boolean, type?: string, minLength?: number, validate?: (val: any, body: any) => string | null, message?: string, code?: string }>} schema
 * @param {string} [defaultErrorCode='VALIDATION_FAILED'] Código de error canónico SDD por defecto
 * @returns {import('express').RequestHandler}
 */
export const validateBody = (schema, defaultErrorCode = 'VALIDATION_FAILED') => {
  return (req, res, next) => {
    const body = req.body || {};

    for (const [field, rule] of Object.entries(schema)) {
      const val = body[field];
      const isMissing = val === undefined || val === null || (typeof val === 'string' && val.trim() === '');

      if (rule.required && isMissing) {
        return next(
          new AppError(
            rule.message || `El campo '${field}' es obligatorio.`,
            rule.code || defaultErrorCode,
            400
          )
        );
      }

      if (!isMissing) {
        if (rule.type && typeof val !== rule.type) {
          return next(
            new AppError(
              rule.message || `El campo '${field}' debe ser de tipo ${rule.type}.`,
              rule.code || defaultErrorCode,
              400
            )
          );
        }

        if (rule.minLength && typeof val === 'string' && val.trim().length < rule.minLength) {
          return next(
            new AppError(
              rule.message || `El campo '${field}' debe tener al menos ${rule.minLength} caracteres.`,
              rule.code || defaultErrorCode,
              400
            )
          );
        }

        if (typeof rule.validate === 'function') {
          const customError = rule.validate(val, body);
          if (customError) {
            return next(
              new AppError(
                customError,
                rule.code || defaultErrorCode,
                400
              )
            );
          }
        }
      }
    }

    next();
  };
};

export default validateBody;
