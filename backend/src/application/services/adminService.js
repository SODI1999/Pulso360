import * as adminRepository from '../../infrastructure/repositories/adminRepository.js';
import { AppError } from '../errors/AppError.js';
import bcrypt from 'bcryptjs';

/**
 * @fileoverview Lógica de negocio para la gestión administrativa y organizativa
 * @module adminService
 */

import * as auditorRepository from '../../infrastructure/repositories/auditorRepository.js';

export const getUsers = async () => {
  return await adminRepository.findAllUsers();
};

export const createUser = async ({ rolCodigo, correo, nombres, apellidos, contrasena, equipoId }, adminUserId) => {
  const userNombres = nombres?.trim();
  const userApellidos = apellidos?.trim() || '.';

  if (!correo || !userNombres || !rolCodigo) {
    throw new AppError("Datos incompletos para crear usuario", "MISSING_DATA", 400);
  }

  const existing = await adminRepository.findByEmail(correo);
  if (existing) {
    throw new AppError("El correo ya está en uso", "EMAIL_IN_USE", 400);
  }

  const crypto = await import('crypto');
  const userId = crypto.randomUUID();

  const pwToHash = contrasena || "Pulso360#2026";
  const contrasenaHash = await bcrypt.hash(pwToHash, 10);

  // Valor por defecto para shiftStartHour, asumiendo 08:00
  const shiftStartHour = 8; 

  const newUser = await adminRepository.createUser({
    id: userId,
    rolCodigo,
    correo,
    contrasenaHash,
    nombres: userNombres,
    apellidos: userApellidos,
    shiftStartHour
  });

  if (equipoId) {
    await adminRepository.assignUserToTeam({
      id: crypto.randomUUID(),
      usuarioId: userId,
      equipoId,
      tipoAsignacion: rolCodigo === 'SUPERVISOR' ? 'SUPERVISOR' : 'AGENTE',
      fechaInicio: new Date().toISOString().split('T')[0]
    });
  }

  await auditorRepository.createLog({
    usuarioId: adminUserId || null,
    rol: 'ADMIN',
    action: 'CREACION_USUARIO',
    resource: 'usuarios',
    resourceId: newUser.id,
    details: `Usuario ${newUser.correo_institucional || correo} creado con rol ${newUser.rol_codigo || rolCodigo}`
  });

  return newUser;
};

export const setUserStatus = async (userId, status, adminUserId) => {
  if (!['Activo', 'Inactivo', 'Suspendido'].includes(status)) {
    throw new AppError("Estado de usuario no válido", "INVALID_STATUS", 400);
  }

  const updated = await adminRepository.updateUserStatus(userId, status);
  if (!updated) {
    throw new AppError("Usuario no encontrado", "USER_NOT_FOUND", 404);
  }

  await auditorRepository.createLog({
    usuarioId: adminUserId || null,
    rol: 'ADMIN',
    action: status === 'Suspendido' ? 'SUSPENSION_USUARIO' : 'CAMBIO_ESTADO_USUARIO',
    resource: 'usuarios',
    resourceId: userId,
    details: `Estado cambiado a ${status}`
  });

  return updated;
};

export const getOrganization = async () => {
  return await adminRepository.findAllCampaignsWithTeams();
};

export const createCampaign = async ({ codigo, nombre, descripcion }, adminUserId) => {
  if (!codigo || !nombre) {
    throw new AppError("Datos incompletos para la campaña", "MISSING_DATA", 400);
  }
  const crypto = await import('crypto');
  const id = crypto.randomUUID();
  const campaign = await adminRepository.createCampaign({ id, codigo, nombre, descripcion });

  await auditorRepository.createLog({
    usuarioId: adminUserId || null,
    rol: 'ADMIN',
    action: 'CREACION_CAMPANA',
    resource: 'campanas',
    resourceId: id,
    details: `Campaña ${nombre} creada`
  });

  return campaign;
};

export const updateCampaign = async (campId, { nombre, activa }, adminUserId) => {
  if (nombre === undefined && activa === undefined) {
    throw new AppError("Datos incompletos para actualizar la campaña", "MISSING_DATA", 400);
  }
  const updated = await adminRepository.updateCampaign(campId, { nombre, activa: activa !== undefined ? Boolean(activa) : undefined });
  if (!updated) {
    throw new AppError("Campaña no encontrada", "CAMPAIGN_NOT_FOUND", 404);
  }

  await auditorRepository.createLog({
    usuarioId: adminUserId || null,
    rol: 'ADMIN',
    action: 'ACTUALIZACION_CAMPANA',
    resource: 'campanas',
    resourceId: campId,
    details: `Campaña actualizada: ${nombre || updated.nombre}, activa: ${activa !== undefined ? Boolean(activa) : updated.activa}`
  });

  return updated;
};

export const createTeam = async ({ campanaId, codigo, nombre, supervisorNombre, nMiembros }, adminUserId) => {
  if (!campanaId || !codigo || !nombre) {
    throw new AppError("Datos incompletos para el equipo", "MISSING_DATA", 400);
  }
  const crypto = await import('crypto');
  const id = crypto.randomUUID();
  const team = await adminRepository.createTeam({
    id,
    campanaId,
    codigo,
    nombre,
    descripcion: "",
    supervisorNombre,
    nMiembros: nMiembros || 0
  });

  await auditorRepository.createLog({
    usuarioId: adminUserId || null,
    rol: 'ADMIN',
    action: 'CREACION_EQUIPO',
    resource: 'equipos',
    resourceId: id,
    details: `Equipo ${nombre} creado`
  });

  return team;
};

export const updateTeam = async (teamId, data, adminUserId) => {
  const { nombre, activo, supervisorNombre, nMiembros } = data;
  if (nombre === undefined && activo === undefined && supervisorNombre === undefined && nMiembros === undefined) {
    throw new AppError("Datos incompletos para actualizar el equipo", "MISSING_DATA", 400);
  }
  const updated = await adminRepository.updateTeam(teamId, { nombre, activo: activo !== undefined ? Boolean(activo) : undefined, supervisorNombre, nMiembros });
  if (!updated) {
    throw new AppError("Equipo no encontrado", "TEAM_NOT_FOUND", 404);
  }

  if (supervisorNombre) {
    const supervisor = await adminRepository.findUserByFullName(supervisorNombre);
    if (supervisor) {
      const crypto = await import('crypto');
      await adminRepository.assignUserToTeam({
        id: crypto.randomUUID(),
        usuarioId: supervisor.id,
        equipoId: teamId,
        tipoAsignacion: 'SUPERVISOR',
        fechaInicio: new Date().toISOString().split('T')[0]
      });
    }
  }

  await auditorRepository.createLog({
    usuarioId: adminUserId || null,
    rol: 'ADMIN',
    action: 'ACTUALIZACION_EQUIPO',
    resource: 'equipos',
    resourceId: teamId,
    details: `Equipo actualizado: ${nombre || updated.nombre}, activo: ${activo !== undefined ? Boolean(activo) : updated.activo}`
  });

  return updated;
};

export const getSystemParams = async () => {
  const params = await adminRepository.findSystemParams();
  const policies = await adminRepository.findPolicies();
  return { params, policies };
};

export const updateSystemParam = async (clave, valorJson) => {
  if (!clave || valorJson === undefined) {
    throw new AppError("Datos incompletos para el parámetro", "MISSING_DATA", 400);
  }
  
  if (clave === 'umbral_k_anonimato') {
    const umbral = typeof valorJson === 'object' ? valorJson.valor : parseInt(valorJson, 10);
    if (isNaN(umbral) || umbral < 5) {
      throw new AppError("El umbral de k-anonimato no puede ser menor a 5", "INVALID_K_ANONYMITY", 400);
    }
  }

  const updated = await adminRepository.updateSystemParam(clave, valorJson);
  if (!updated) {
    throw new AppError("Parámetro no encontrado", "PARAM_NOT_FOUND", 404);
  }
  return updated;
};

export const createPolicy = async (data, adminUserId) => {
  const { version, titulo, textoPolitica, textoAviso } = data;
  if (!version || !titulo || !textoPolitica || !textoAviso) {
    throw new AppError("Datos incompletos para la política", "MISSING_DATA", 400);
  }
  const crypto = await import('crypto');
  const id = crypto.randomUUID();
  return await adminRepository.createPolicy({
    id,
    version,
    titulo,
    textoPolitica,
    textoAviso,
    creadoPorId: adminUserId
  });
};

export const getHabeasData = async () => {
  return await adminRepository.findHabeasDataRequests();
};

export const updateHabeasData = async (id, status, note) => {
  if (!['En tramite', 'Respondida', 'Rechazada'].includes(status)) {
    throw new AppError("Estado no válido", "INVALID_STATUS", 400);
  }
  const updated = await adminRepository.updateHabeasDataStatus(id, status, note);
  if (!updated) {
    throw new AppError("Solicitud no encontrada", "REQUEST_NOT_FOUND", 404);
  }
  return updated;
};
