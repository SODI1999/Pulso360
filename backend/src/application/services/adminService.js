import * as adminRepository from '../../infrastructure/repositories/adminRepository.js';
import { AppError } from '../errors/AppError.js';
import bcrypt from 'bcryptjs';
import { createTeamAtomic } from '../../infrastructure/repositories/organizationManagementRepository.js';
import crypto from 'node:crypto';
import { transaction } from '../../infrastructure/db.js';
import { createUserAtomic, updateUserAtomic } from '../../infrastructure/repositories/userManagementRepository.js';

/**
 * @fileoverview Lógica de negocio para la gestión administrativa y organizativa
 * @module adminService
 */

import * as auditorRepository from '../../infrastructure/repositories/auditorRepository.js';

export const getUsers = async () => {
  return await adminRepository.findAllUsers();
};

const roles = ['AGENTE','SUPERVISOR','SST','AUDITOR','ADMIN'];
const statuses = ['Activo','Inactivo','Suspendido'];
function validateUser(data) {
  if (data.rolCodigo !== undefined && !roles.includes(data.rolCodigo)) throw new AppError('Rol inválido', 'INVALID_ROLE', 400);
  if (data.status !== undefined && !statuses.includes(data.status)) throw new AppError('Estado inválido', 'INVALID_STATUS', 400);
}
export const createUser = async (data, adminUserId) => {
  validateUser(data);
  const { rolCodigo, correo, nombres, apellidos, contrasena, equipoId, status = 'Activo', shiftStartHour = 8 } = data;
  if (!rolCodigo || typeof nombres !== 'string' || !nombres.trim() || typeof correo !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
    throw new AppError('Datos incompletos o correo inválido', 'MISSING_DATA', 400);
  if (typeof contrasena !== 'string' || contrasena.length < 8 || contrasena.length > 72)
    throw new AppError('La contraseña inicial debe tener entre 8 y 72 caracteres', 'INVALID_PASSWORD', 400);
  if (!Number.isInteger(shiftStartHour) || shiftStartHour < 0 || shiftStartHour > 23)
    throw new AppError('Hora de turno inválida', 'INVALID_SHIFT', 400);
  if (await adminRepository.findByEmail(correo)) throw new AppError('El correo ya está en uso', 'EMAIL_IN_USE', 409);
  return createUserAtomic({ id: crypto.randomUUID(), rolCodigo, correo: correo.trim().toLowerCase(), nombres: nombres.trim(),
    apellidos: apellidos?.trim() || '.', contrasenaHash: await bcrypt.hash(contrasena, 10), equipoId, status, shiftStartHour }, adminUserId);
};
export const updateUser = async (userId, data, adminUserId) => {
  validateUser(data);
  if (!['rolCodigo','status','equipoId'].some(key => Object.hasOwn(data,key))) throw new AppError('No hay cambios', 'MISSING_DATA', 400);
  if (userId === adminUserId && ((data.rolCodigo && data.rolCodigo !== 'ADMIN') || (data.status && data.status !== 'Activo')))
    throw new AppError('No puedes retirar tu propio acceso administrativo', 'SELF_ACCESS_CHANGE', 403);
  return updateUserAtomic(userId, data, adminUserId);
};
export const setUserStatus = (userId, status, adminUserId) => updateUser(userId, { status }, adminUserId);

export const getOrganization = async () => {
  return await adminRepository.findAllCampaignsWithTeams();
};

export const createCampaign = async ({ codigo, nombre, descripcion, activa = true }, adminUserId) => {
  if (typeof activa !== 'boolean') throw new AppError('Estado inválido','INVALID_STATUS',400);
  return transaction(async client => {
  if (!codigo || !nombre) {
    throw new AppError("Datos incompletos para la campaña", "MISSING_DATA", 400);
  }
  const crypto = await import('crypto');
  const id = crypto.randomUUID();
  const campaign = await adminRepository.createCampaign({ id, codigo, nombre, descripcion, activa },client);

  await auditorRepository.createLog({
    usuarioId: adminUserId || null,
    rol: 'ADMIN',
    action: 'CREACION_CAMPANA',
    resource: 'campanas',
    resourceId: id,
    details: `Campaña ${nombre} creada`
  },client);

  return campaign;
  });
};

export const updateCampaign = async (campId, { nombre, activa }, adminUserId) => {
  if (activa !== undefined && typeof activa !== 'boolean') throw new AppError('Estado inválido','INVALID_STATUS',400);
  return transaction(async client => {
  if (nombre === undefined && activa === undefined) {
    throw new AppError("Datos incompletos para actualizar la campaña", "MISSING_DATA", 400);
  }
  const updated = await adminRepository.updateCampaign(campId, { nombre, activa: activa !== undefined ? Boolean(activa) : undefined },client);
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
  },client);

  return updated;
  });
};

export const createTeam = async (data, adminUserId) => {
  if (!data.campanaId || !data.codigo || !data.nombre || !data.supervisorId) throw new AppError('Datos incompletos para el equipo', 'MISSING_DATA', 400);
  if (data.activo !== undefined && typeof data.activo !== 'boolean') throw new AppError('Estado inválido', 'INVALID_STATUS', 400);
  if (data.nMiembros !== undefined && (!Number.isInteger(data.nMiembros) || data.nMiembros < 0)) throw new AppError('Integrantes inválidos', 'INVALID_MEMBERS', 400);
  return createTeamAtomic(data, adminUserId);
};

export const updateTeam = async (teamId, data, adminUserId) => {
  if (data.activo !== undefined && typeof data.activo !== 'boolean') throw new AppError('Estado inválido','INVALID_STATUS',400);
  if (data.nMiembros !== undefined && (!Number.isInteger(data.nMiembros) || data.nMiembros < 0)) throw new AppError('Integrantes inválidos','INVALID_MEMBERS',400);
  return transaction(async client => {
  const { nombre, activo, supervisorNombre, supervisorId, nMiembros } = data;
  if (nombre === undefined && activo === undefined && supervisorNombre === undefined && supervisorId === undefined && nMiembros === undefined) {
    throw new AppError("Datos incompletos para actualizar el equipo", "MISSING_DATA", 400);
  }

  let updated;
  const isSupervisorUpdate = supervisorNombre !== undefined || supervisorId !== undefined;

  if (isSupervisorUpdate) {
    let supervisor;
    if (supervisorId) {
      supervisor = await adminRepository.findUserById(supervisorId);
    } else {
      supervisor = await adminRepository.findUserByFullName(supervisorNombre);
    }

    if (!supervisor || supervisor.rol_codigo !== 'SUPERVISOR' || supervisor.estado !== 'Activo') {
      throw new AppError("Usuario supervisor inválido, no existe o no tiene los permisos necesarios", "INVALID_SUPERVISOR_USER", 400);
    }

    const crypto = await import('crypto');
    const newAssignmentId = crypto.randomUUID();
    const finalSupervisorNombre = supervisor.nombre_completo || supervisorNombre;

    updated = await adminRepository.updateTeamWithSupervisorHandover(
      teamId, 
      { nombre, activo, nMiembros }, 
      supervisor.id, 
      finalSupervisorNombre, 
      newAssignmentId, client
    );

    if (!updated) {
      throw new AppError("Equipo no encontrado", "TEAM_NOT_FOUND", 404);
    }
  } else {
    updated = await adminRepository.updateTeam(teamId, { nombre, activo: activo !== undefined ? Boolean(activo) : undefined, nMiembros },client);
    if (!updated) {
      throw new AppError("Equipo no encontrado", "TEAM_NOT_FOUND", 404);
    }
  }

  await auditorRepository.createLog({
    usuarioId: adminUserId || null,
    rol: 'ADMIN',
    action: 'ACTUALIZACION_EQUIPO',
    resource: 'equipos',
    resourceId: teamId,
    details: `Equipo actualizado: ${nombre || updated.nombre}, activo: ${activo !== undefined ? Boolean(activo) : updated.activo}`
  },client);

  return updated;
  });
};

export const getSystemParams = async () => {
  const params = await adminRepository.findSystemParams();
  const policies = await adminRepository.findPolicies();
  const { listRules } = await import('./rulesService.js');
  return { params, policies, rules: await listRules() };
};

export const updateSystemParam = async () => {
  throw new AppError('Parámetro de solo lectura: esta versión conserva k=5 y edición de dos horas; los restantes controles no ejecutan automatizaciones.', 'PARAM_READONLY', 409);
};

export const createPolicy = async (data, adminUserId) => {
  const { version, titulo, textoPolitica, textoAviso } = data;
  if (!version || !titulo || !textoPolitica || !textoAviso) {
    throw new AppError("Datos incompletos para la política", "MISSING_DATA", 400);
  }
  const crypto = await import('crypto');
  const id = crypto.randomUUID();
  return transaction(async client => {
  const policy = await adminRepository.createPolicy({
    id,
    version,
    titulo,
    textoPolitica,
    textoAviso,
    creadoPorId: adminUserId
  }, client);
  await adminRepository.createPolicyNotification(crypto.randomUUID(), version, client);
  await auditorRepository.createLog({ usuarioId:adminUserId,rol:'ADMIN',action:'PUBLICACION_POLITICA',resource:'politicas_privacidad',resourceId:id,
    details:{ version } },client);
  return policy;
  });
};

export const getHabeasData = async () => {
  return await adminRepository.findHabeasDataRequests();
};

export const updateHabeasData = async (id, status, note, actorId) => {
  return transaction(async client => {
  if (!['En tramite', 'Respondida', 'Rechazada'].includes(status)) {
    throw new AppError("Estado no válido", "INVALID_STATUS", 400);
  }
  const current = await adminRepository.findHabeasForUpdate(id, client);
  if (!current) throw new AppError('Solicitud no encontrada','REQUEST_NOT_FOUND',404);
  if (['Respondida','Rechazada'].includes(current.status)) throw new AppError('La solicitud ya fue resuelta','REQUEST_ALREADY_RESOLVED',409);
  const updated = await adminRepository.updateHabeasDataStatus(id, status, note, client);
  if (!updated) {
    throw new AppError("Solicitud no encontrada", "REQUEST_NOT_FOUND", 404);
  }
  await auditorRepository.createLog({usuarioId:actorId,rol:'ADMIN',action:'RESPUESTA_HABEAS_DATA',resource:'solicitudes_habeas_data',resourceId:id,details:{status}},client);
  return updated;
  });
};
