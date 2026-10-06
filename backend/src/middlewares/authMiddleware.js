import jwt from 'jsonwebtoken';
import { AppError } from '../application/errors/AppError.js';
import { userRepository } from '../infrastructure/repositories/userRepository.js';
import { getJwtSecret } from '../infrastructure/jwtConfig.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(new AppError('Token ausente', 'AUTH_TOKEN_MISSING', 401));
  }

  if (!authHeader.startsWith('Bearer ')) {
    return next(new AppError('Formato de autorización inválido', 'AUTH_TOKEN_INVALID', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
    
    const user = await userRepository.findProfileById(decoded.id);
    if (!user || user.estado !== 'Activo') {
      return next(new AppError('Usuario no encontrado o inactivo', 'AUTH_USER_INACTIVE', 401));
    }
    if (Number(decoded.auth_version || 0) !== Number(user.auth_version || 0)) {
      return next(new AppError('La sesión fue revocada', 'AUTH_SESSION_REVOKED', 401));
    }
    
    req.user = { ...decoded, ...user, rol:user.rol_codigo,role: user.rol_codigo, rol_codigo: user.rol_codigo };
    next();
  } catch (err) {
    if (!['JsonWebTokenError','TokenExpiredError','NotBeforeError'].includes(err.name)) return next(err);
    return next(new AppError('Token inválido o expirado', 'AUTH_TOKEN_INVALID', 401));
  }
};

// Re-exportar requireRole para compatibilidad hacia atrás con rutas existentes
export { requireRole } from './rbacMiddleware.js';

