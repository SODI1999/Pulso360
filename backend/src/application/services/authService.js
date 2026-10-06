import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../../infrastructure/repositories/userRepository.js';
import { AppError } from '../errors/AppError.js';
import { getJwtSecret } from '../../infrastructure/jwtConfig.js';

export const authService = {
  async login({ correo, contrasena }) {
    if (!correo || !contrasena) {
      throw new AppError('Correo y contraseña son obligatorios', 'AUTH_MISSING_FIELDS', 400);
    }

    const user = await userRepository.findByEmail(correo);
    if (!user) {
      throw new AppError('Credenciales inválidas', 'AUTH_INVALID_CREDENTIALS', 401);
    }

    if (user.estado !== 'Activo') {
      throw new AppError('El usuario no está activo', 'AUTH_USER_INACTIVE', 403);
    }

    if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > new Date()) {
      throw new AppError('Cuenta bloqueada temporalmente', 'AUTH_ACCOUNT_LOCKED', 403);
    }

    const isMatch = await bcrypt.compare(contrasena, user.contrasena_hash);
    if (!isMatch) {
      const nextAttempts = (user.intentos_fallidos || 0) + 1;
      const maxReached = nextAttempts >= 5;
      await userRepository.registerFailedAttempt(user.id, maxReached);
      
      throw new AppError('Credenciales inválidas', 'AUTH_INVALID_CREDENTIALS', 401);
    }

    if (user.intentos_fallidos > 0) {
      await userRepository.resetFailedAttempts(user.id);
    }

    const payload = {
      id: user.id,
      rol_codigo: user.rol_codigo,
      rol: user.rol_codigo,
      auth_version: user.auth_version
    };

    const token = jwt.sign(payload, getJwtSecret(), {
      algorithm: 'HS256',
      expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    });

    const userResponse = {
      ...await this.getProfile(user.id),
      id: user.id,
      correo: user.correo,
      nombres: user.nombres,
      apellidos: user.apellidos,
      rol: user.rol_codigo,
      rol_codigo: user.rol_codigo,
      estado: user.estado
    };

    return { usuario: userResponse, token };
  },

  async getProfile(userId) {
    const profile = await userRepository.findProfileById(userId);
    if (!profile) {
      throw new AppError('Perfil no encontrado', 'PROFILE_NOT_FOUND', 404);
    }
    const [scopes, supervisors, assignments, navigationCounts] = await Promise.all([
      userRepository.findAvailableScopes(userId, profile.rol_codigo),
      userRepository.findSupervisors(profile.rol_codigo),
      userRepository.findActiveAssignments(userId),
      userRepository.findNavigationCounts(userId, profile.rol_codigo)
    ]);
    return { ...profile, scopes, supervisors, assignments, navigation_counts:navigationCounts };
  }
};
