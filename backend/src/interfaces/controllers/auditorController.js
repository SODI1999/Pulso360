import * as auditorService from '../../application/services/auditorService.js';

export const getLogs = async (req, res, next) => {
  try {
    const { limit, offset, rol, action, startDate, endDate } = req.query;
    
    const filters = {
      limit,
      offset,
      rol,
      action,
      startDate,
      endDate
    };

    const result = await auditorService.getLogs(filters);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const exportLogs = async (req, res, next) => {
  try {
    const { rol, action, startDate, endDate } = req.body;
    
    const filters = {
      rol,
      action,
      startDate,
      endDate
    };

    const exportedData = await auditorService.exportLogs(filters);

    return res.status(200).json({
      success: true,
      data: exportedData
    });
  } catch (error) {
    next(error);
  }
};
