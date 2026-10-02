import { reportsService } from '../../application/services/reportsService.js';

export const reportsController = {
  async getReports(req, res, next) {
    try {
      const userId = req.user.id;
      const reports = await reportsService.getReports(userId);
      res.status(200).json({ success: true, data: reports });
    } catch (error) {
      next(error);
    }
  },

  async createReport(req, res, next) {
    try {
      const userId = req.user.id;
      const report = await reportsService.createReport(userId, req.body);
      res.status(201).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }
};
