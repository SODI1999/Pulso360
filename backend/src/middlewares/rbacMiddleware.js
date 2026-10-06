import { AppError } from '../application/errors/AppError.js';

/**
 * Middleware para Control de Acceso Basado en Roles (RBAC).
 * Verifica que el usuario autenticado cuente con alguno de los roles autorizados.
 *
 * @param {string[]} allowedRoles - Lista de roles permitidos (p. ej. ['admin', 'sst'])
 * @returns {import('express').RequestHandler}
 */
export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Usuario no autenticado', 'AUTH_TOKEN_MISSING', 401));
    }

    const role = req.user.role || req.user.rol_codigo;
    if (!allowedRoles.includes(role)) {
      return next(new AppError('Rol no autorizado', 'AUTH_FORBIDDEN_ROLE', 403));
    }
    next();
  };
};

export default requireRole;
