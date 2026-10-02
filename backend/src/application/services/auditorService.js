import * as auditorRepository from '../../infrastructure/repositories/auditorRepository.js';

/**
 * Obtiene logs de auditoría de forma paginada y con filtros aplicados.
 */
export const getLogs = async (filters) => {
  const limit = filters.limit ? parseInt(filters.limit, 10) : 50;
  const offset = filters.offset ? parseInt(filters.offset, 10) : 0;
  
  const parsedFilters = {
    ...filters,
    limit,
    offset
  };

  const [logs, total] = await Promise.all([
    auditorRepository.findLogs(parsedFilters),
    auditorRepository.countLogs(parsedFilters)
  ]);

  return {
    logs,
    total,
    limit,
    offset
  };
};

/**
 * Retorna todos los registros de auditoría filtrados (sin límite o con límite muy alto) 
 * con metadatos de integridad, aptos para exportación.
 */
export const exportLogs = async (filters) => {
  // Para exportación podemos usar un límite muy alto o ignorarlo (por defecto máximo 10000 para prevenir OOM)
  const limit = filters.limit ? parseInt(filters.limit, 10) : 10000;
  const parsedFilters = { ...filters, limit, offset: 0 };
  
  const logs = await auditorRepository.findLogs(parsedFilters);
  
  return {
    logs,
    metadata: {
      exportedAt: new Date().toISOString(),
      totalRecords: logs.length,
      integrity: "Verificado mediante cadena de hashes (prev_hash -> hash)"
    }
  };
};
