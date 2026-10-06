import crypto from 'node:crypto';
import { transaction } from '../db.js';
import { AppError } from '../../application/errors/AppError.js';
import { createLog } from './auditorRepository.js';

export function createTeamAtomic(data, actorId) {
  return transaction(async client => {
    const campaign = await client.query('SELECT id FROM campanas WHERE id=$1 FOR SHARE', [data.campanaId]);
    if (!campaign.rowCount) throw new AppError('Campaña inválida', 'INVALID_CAMPAIGN', 400);
    const supervisor = await client.query("SELECT id, CONCAT(nombres,' ',apellidos) AS name FROM usuarios WHERE id=$1 AND rol_codigo='SUPERVISOR' AND estado='Activo' FOR SHARE", [data.supervisorId]);
    if (!supervisor.rowCount) throw new AppError('Supervisor activo requerido', 'INVALID_SUPERVISOR_USER', 400);
    const id = crypto.randomUUID();
    const { rows } = await client.query(`INSERT INTO equipos (id,campana_id,codigo,nombre,supervisor_nombre,n_miembros,activo)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`, [id,data.campanaId,data.codigo,data.nombre,supervisor.rows[0].name,data.nMiembros ?? 0,data.activo ?? true]);
    await client.query(`INSERT INTO asignaciones_usuario_equipo (id,usuario_id,equipo_id,tipo_asignacion,fecha_inicio,activa)
      VALUES ($1,$2,$3,'SUPERVISOR',CURRENT_DATE,TRUE)`, [crypto.randomUUID(),data.supervisorId,id]);
    await createLog({ usuarioId:actorId,rol:'ADMIN',action:'CREACION_EQUIPO',resource:'equipos',resourceId:id,
      details:{ supervisorId:data.supervisorId,active:rows[0].activo } },client);
    return { ...rows[0], supervisor_id: data.supervisorId };
  });
}
