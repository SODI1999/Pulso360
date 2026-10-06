import jwt from 'jsonwebtoken';
import { AppError } from '../application/errors/AppError.js';
import { userRepository } from '../infrastructure/repositories/userRepository.js';

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
    const rawSecret = process.env.JWT_SECRET || 'secret';
    if (process.env.NODE_ENV !== 'test' && (rawSecret === 'secret' || rawSecret.trim().length < 5)) {
      return next(new AppError('Configuración insegura: no se permite llave trivial en entorno real', 'AUTH_INSECURE_CONFIG', 500));
    }
    const decoded = jwt.verify(token, rawSecret);
    
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
