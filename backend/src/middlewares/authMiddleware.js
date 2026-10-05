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
    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV !== 'test') {
      return next(new AppError('Configuración de servidor incompleta', 'SERVER_CONFIG_ERROR', 500));
    }
    const decoded = jwt.verify(token, secret || 'secret');
    
    const user = await userRepository.findProfileById(decoded.id);
    if (!user || user.estado !== 'Activo') {
      return next(new AppError('Usuario no encontrado o inactivo', 'AUTH_USER_INACTIVE', 401));
    }
    
    req.user = { ...decoded, ...user, role: user.rol_codigo, rol_codigo: user.rol_codigo };
    next();
  } catch (err) {
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
