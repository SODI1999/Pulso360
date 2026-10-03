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
    throw new AppError("Datos incompletos para crear usuario", 400, "MISSING_DATA");
  }

  const existing = await adminRepository.findByEmail(correo);
  if (existing) {
    throw new AppError("El correo ya está en uso", 400, "EMAIL_IN_USE");
  }

  const crypto = await import('crypto');
  const userId = crypto.randomUUID();

  const pwToHash = contrasena || "Pulso360#2026";
  const contrasenaHash = await bcrypt.hash(pwToHash, 10);

  // Valor por defecto para shiftStartHour, asumiendo 08:00
  const shiftStartHour = '08:00'; 

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
      tipoAsignacion: 'PRIMARIA',
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
    throw new AppError("Estado de usuario no válido", 400, "INVALID_STATUS");
  }

  const updated = await adminRepository.updateUserStatus(userId, status);
  if (!updated) {
    throw new AppError("Usuario no encontrado", 404, "USER_NOT_FOUND");
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
    throw new AppError("Datos incompletos para la campaña", 400, "MISSING_DATA");
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
  if (nombre === undefined || activa === undefined) {
    throw new AppError("Datos incompletos para actualizar la campaña", 400, "MISSING_DATA");
  }
  const updated = await adminRepository.updateCampaign(campId, { nombre, activa: Boolean(activa) });
  if (!updated) {
    throw new AppError("Campaña no encontrada", 404, "CAMPAIGN_NOT_FOUND");
  }

  await auditorRepository.createLog({
    usuarioId: adminUserId || null,
    rol: 'ADMIN',
    action: 'ACTUALIZACION_CAMPANA',
    resource: 'campanas',
    resourceId: campId,
    details: `Campaña actualizada: ${nombre}, activa: ${Boolean(activa)}`
  });

  return updated;
};

export const createTeam = async ({ campanaId, codigo, nombre, supervisorNombre, nMiembros }, adminUserId) => {
  if (!campanaId || !codigo || !nombre) {
    throw new AppError("Datos incompletos para el equipo", 400, "MISSING_DATA");
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
  if (nombre === undefined || activo === undefined) {
    throw new AppError("Datos incompletos para actualizar el equipo", 400, "MISSING_DATA");
  }
  const updated = await adminRepository.updateTeam(teamId, { nombre, activo: Boolean(activo), supervisorNombre, nMiembros });
  if (!updated) {
    throw new AppError("Equipo no encontrado", 404, "TEAM_NOT_FOUND");
  }

  await auditorRepository.createLog({
    usuarioId: adminUserId || null,
    rol: 'ADMIN',
    action: 'ACTUALIZACION_EQUIPO',
    resource: 'equipos',
    resourceId: teamId,
    details: `Equipo actualizado: ${nombre}, activo: ${Boolean(activo)}`
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
    throw new AppError("Datos incompletos para el parámetro", 400, "MISSING_DATA");
  }
  const updated = await adminRepository.updateSystemParam(clave, valorJson);
  if (!updated) {
    throw new AppError("Parámetro no encontrado", 404, "PARAM_NOT_FOUND");
  }
  return updated;
};

export const createPolicy = async (data, adminUserId) => {
  const { version, titulo, textoPolitica, textoAviso } = data;
  if (!version || !titulo || !textoPolitica || !textoAviso) {
    throw new AppError("Datos incompletos para la política", 400, "MISSING_DATA");
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
  if (!['Pendiente', 'Respondida', 'Rechazada'].includes(status)) {
    throw new AppError("Estado no válido", 400, "INVALID_STATUS");
  }
  const updated = await adminRepository.updateHabeasDataStatus(id, status, note);
  if (!updated) {
    throw new AppError("Solicitud no encontrada", 404, "REQUEST_NOT_FOUND");
  }
  return updated;
};
