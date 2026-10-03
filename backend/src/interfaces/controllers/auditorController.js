import * as auditorService from '../../application/services/auditorService.js';

export const getLogs = async (req, res, next) => {
  try {
    const { limit, offset, rol, action, startDate, endDate, entidadAfectada } = req.query;
    
    const filters = {
      limit,
      offset,
      rol,
      action,
      startDate,
      endDate,
      entidadAfectada
    };

    const result = await auditorService.getLogs(filters);

    return res.status(200).json({
      success: true,
      data: result.logs
    });
  } catch (error) {
    next(error);
  }
};

export const exportLogs = async (req, res, next) => {
  try {
    const { rol, action, startDate, endDate, entidadAfectada } = req.body;
    
    const filters = {
      rol,
      action,
      startDate,
      endDate,
      entidadAfectada
    };

    const exportedData = await auditorService.exportLogs(filters);

    return res.status(200).json({
      success: true,
      data: {
        exportId: `exp-${Date.now()}`,
        timestamp: new Date().toISOString(),
        entidadAfectada: entidadAfectada || 'todas',
        ...exportedData
      }
    });
  } catch (error) {
    next(error);
  }
};
