import crypto from 'node:crypto';
import { transaction } from '../db.js';
import { AppError } from '../../application/errors/AppError.js';
import { createLog } from './auditorRepository.js';

async function assign(client, user, equipoId) {
  if (equipoId) {
    const team = await client.query('SELECT id FROM equipos WHERE id=$1 AND activo=TRUE FOR SHARE', [equipoId]);
    if (!team.rowCount) throw new AppError('El equipo no está activo o no existe', 'INVALID_TEAM', 400);
    if (!['AGENTE', 'SUPERVISOR'].includes(user.rol_codigo)) throw new AppError('El rol no admite asignación operativa', 'INVALID_ROLE_ASSIGNMENT', 400);
  }
  await client.query('UPDATE asignaciones_usuario_equipo SET activa=FALSE, fecha_fin=CURRENT_DATE WHERE usuario_id=$1 AND activa=TRUE', [user.id]);
  if (equipoId) await client.query(`INSERT INTO asignaciones_usuario_equipo
    (id, usuario_id, equipo_id, tipo_asignacion, fecha_inicio, activa) VALUES ($1,$2,$3,$4,CURRENT_DATE,TRUE)`,
    [crypto.randomUUID(), user.id, equipoId, user.rol_codigo]);
}

async function profile(client, id) {
  const { rows } = await client.query(`SELECT u.id, u.rol_codigo, u.correo_institucional AS correo,
    u.nombres, u.apellidos, u.estado, u.shift_start_hour, a.equipo_id, e.nombre AS equipo_nombre,
    e.campana_id, c.nombre AS campana_nombre FROM usuarios u
    LEFT JOIN asignaciones_usuario_equipo a ON a.usuario_id=u.id AND a.activa=TRUE
    LEFT JOIN equipos e ON e.id=a.equipo_id LEFT JOIN campanas c ON c.id=e.campana_id WHERE u.id=$1`, [id]);
  return rows[0];
}

export async function createUserAtomic(data, actorId) {
  return transaction(async client => {
    const { rows } = await client.query(`INSERT INTO usuarios
      (id, rol_codigo, correo_institucional, contrasena_hash, nombres, apellidos, estado, shift_start_hour)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, rol_codigo`,
      [data.id, data.rolCodigo, data.correo, data.contrasenaHash, data.nombres, data.apellidos, data.status, data.shiftStartHour]);
    await assign(client, rows[0], data.equipoId);
    await createLog({ usuarioId: actorId, rol: 'ADMIN', action: 'CREACION_USUARIO', resource: 'usuarios', resourceId: data.id,
      details: { role: data.rolCodigo, status: data.status, teamId: data.equipoId || null } }, client);
    return profile(client, data.id);
  });
}

export async function updateUserAtomic(id, data, actorId) {
  return transaction(async client => {
    const found = await client.query('SELECT id, rol_codigo, estado FROM usuarios WHERE id=$1 FOR UPDATE', [id]);
    if (!found.rowCount) throw new AppError('Usuario no encontrado', 'USER_NOT_FOUND', 404);
    const current = found.rows[0];
    const role = data.rolCodigo ?? current.rol_codigo;
    const status = data.status ?? current.estado;
    await client.query('UPDATE usuarios SET rol_codigo=$2, estado=$3, updated_at=NOW() WHERE id=$1', [id, role, status]);
    if (Object.hasOwn(data, 'equipoId') || role !== current.rol_codigo) {
      const assignment = await client.query('SELECT equipo_id FROM asignaciones_usuario_equipo WHERE usuario_id=$1 AND activa=TRUE ORDER BY fecha_inicio DESC LIMIT 1', [id]);
      const team = Object.hasOwn(data, 'equipoId') ? data.equipoId : (['AGENTE','SUPERVISOR'].includes(role) ? assignment.rows[0]?.equipo_id : null);
      await assign(client, { id, rol_codigo: role }, team);
    }
    await createLog({ usuarioId: actorId, rol: 'ADMIN', action: 'ACTUALIZACION_USUARIO', resource: 'usuarios', resourceId: id,
      details: { role, status, teamId: data.equipoId } }, client);
    return profile(client, id);
  });
}
