import * as auditorService from '../../application/services/auditorService.js';
import { verifyIntegrity } from '../../infrastructure/repositories/auditorRepository.js';
export const getIntegrity = async (req,res,next) => {
  try { res.json({ success:true,data:await verifyIntegrity() }); } catch(error) { next(error); }
};

export const getLogs = async (req, res, next) => {
  try {
    const { limit, offset, rol, action, startDate, endDate, entidadAfectada, maxId } = req.query;
    
    const filters = {
      limit,
      offset,
      maxId,
      rol,
      action,
      startDate,
      endDate,
      entidadAfectada
    };

    const result = await auditorService.getLogs(filters);

    return res.status(200).json({
      success: true,
      data: result.logs,
      pagination: { total:result.total,limit:result.limit,offset:result.offset,maxId:result.maxId,hasMore:result.offset+result.logs.length<result.total }
    });
  } catch (error) {
    next(error);
  }
};

export const exportLogs = async (req, res, next) => {
  try {
    const { limit, rol, action, startDate, endDate, entidadAfectada } = req.body;
    
    const filters = {
      limit,
      rol,
      action,
      startDate,
      endDate,
      entidadAfectada
    };

    const exportedData = await auditorService.exportLogs(filters, req.user);

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
