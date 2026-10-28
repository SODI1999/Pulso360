import * as auditorRepository from '../../infrastructure/repositories/auditorRepository.js';
import { AppError } from '../errors/AppError.js';
import crypto from 'node:crypto';
import { canonicalJson } from '../../domain/canonicalJson.js';

function validateFilters(filters, maximum) {
  const limit = Number(filters.limit ?? maximum), offset = Number(filters.offset ?? 0);
  if (!Number.isInteger(limit) || limit < 1 || limit > maximum || !Number.isInteger(offset) || offset < 0) {
    throw new AppError('Límite o desplazamiento inválido.', 'AUDIT_FILTER_INVALID', 400);
  }
  for (const key of ['startDate','endDate']) if (filters[key] && !Number.isFinite(Date.parse(filters[key]))) {
    throw new AppError('Fecha inválida.', 'AUDIT_FILTER_INVALID', 400);
  }
  if (filters.maxId !== undefined && !/^\d+$/.test(String(filters.maxId))) {
    throw new AppError('Referencia de página inválida.', 'AUDIT_FILTER_INVALID', 400);
  }
  if (filters.id !== undefined && !/^\d+$/.test(String(filters.id))) {
    throw new AppError('Identificador de log inválido.', 'AUDIT_FILTER_INVALID', 400);
  }
  return { ...filters, limit, offset };
}

/**
 * Obtiene logs de auditoría de forma paginada y con filtros aplicados.
 */
export const getLogs = async (filters) => {
  const parsedFilters = validateFilters({ ...filters,limit:filters.limit ?? 50 },1000);
  // Mantener el mismo límite superior impide desplazar páginas con nuevas inserciones.
  parsedFilters.maxId ??= await auditorRepository.getLatestId();
  const { limit,offset } = parsedFilters;

  const [logs, total] = await Promise.all([
    auditorRepository.findLogs(parsedFilters),
    auditorRepository.countLogs(parsedFilters)
  ]);

  return {
    logs,
    total,
    limit,
    offset,
    maxId: String(parsedFilters.maxId)
  };
};

/**
 * Retorna todos los registros de auditoría filtrados (sin límite o con límite muy alto) 
 * con metadatos de integridad, aptos para exportación.
 */
export const exportLogs = async (filters, actor) => {
  // Para exportación podemos usar un límite muy alto o ignorarlo (por defecto máximo 10000 para prevenir OOM)
  const parsedFilters = validateFilters({ ...filters,offset:0 },10000);
  parsedFilters.maxId = await auditorRepository.getLatestId();
  
  const logs = await auditorRepository.findLogs(parsedFilters);
  
  const integrity = await auditorRepository.verifyIntegrity();
  await auditorRepository.createLog({ usuarioId:actor.id,rol:actor.rol_codigo,action:'EXPORTACION_AUDITORIA',resource:'auditoria_logs',details:{ records:logs.length,limit:parsedFilters.limit } });
  return {
    logs,
    metadata: {
      exportedAt: new Date().toISOString(),
      totalRecords: logs.length,
      limit: parsedFilters.limit,
      truncated: (await auditorRepository.countLogs(parsedFilters)) > logs.length,
      snapshotHash: crypto.createHash('sha256').update(canonicalJson(logs)).digest('hex'),
      integrity
    }
  };
};
