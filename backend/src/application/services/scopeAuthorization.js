import { scopeRepository } from '../../infrastructure/repositories/scopeRepository.js';
import { AppError } from '../errors/AppError.js';

export async function authorizeScope(user, campanaId, equipoId, client) {
  const role = user.role || user.rol_codigo;
  if (!['ADMIN','SST','SUPERVISOR'].includes(role)) throw new AppError('Rol sin acceso a agregados','FORBIDDEN',403);
  if (equipoId) {
    const team = await scopeRepository.findActiveTeam(equipoId, client);
    if (!team || (campanaId && team.campana_id !== campanaId)) throw new AppError('Equipo y campaña incompatibles','INVALID_SCOPE',400);
    campanaId = team.campana_id;
  }
  if (campanaId) {
    if (!await scopeRepository.campaignExists(campanaId, client)) throw new AppError('Campaña no disponible','INVALID_SCOPE',400);
  }
  if (role === 'SUPERVISOR') {
    if (!campanaId && !equipoId) throw new AppError('Selecciona un ámbito asignado','MISSING_FILTERS',400);
    if (!await scopeRepository.supervisorAssigned(user.id, campanaId, equipoId, client)) throw new AppError('Ámbito no asignado a este supervisor','FORBIDDEN',403);
  }
  return { campanaId:campanaId||null,equipoId:equipoId||null };
}
