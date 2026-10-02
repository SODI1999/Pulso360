import { supervisorService } from '../../application/services/supervisorService.js';

export const supervisorController = {
  async getActions(req, res, next) {
    try {
      const supervisorId = req.user.id;
      const result = await supervisorService.getAssignedActions(supervisorId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async saveFollowup(req, res, next) {
    try {
      const supervisorId = req.user.id;
      const { id: intervencionId } = req.params;
      const payload = req.body;
      
      const result = await supervisorService.recordFollowup(supervisorId, {
        intervencionId,
        ...payload
      });
      
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
};
