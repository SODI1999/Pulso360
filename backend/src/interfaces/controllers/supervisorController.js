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
      const { id } = req.params;
      const { progress, note, notes, actionType } = req.body;
      const cleanNote = note || notes || '';
      
      const result = await supervisorService.recordFollowup(supervisorId, {
        intervencionId: id,
        progress,
        note: cleanNote,
        actionType
      });
      
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
};
