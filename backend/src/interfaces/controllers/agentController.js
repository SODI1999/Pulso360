import { agentService } from '../../application/services/agentService.js';

export const agentController = {
  async getConsent(req, res, next) {
    try {
      const result = await agentService.getConsentStatus(req.user.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async updateConsent(req, res, next) {
    try {
      const ipOrigen = req.ip || req.connection.remoteAddress;
      const flags = (req.body && req.body.flags) ? req.body.flags : req.body;
      const result = await agentService.updateConsent(req.user.id, flags || {}, ipOrigen);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getTodayCheckin(req, res, next) {
    try {
      const result = await agentService.getTodayCheckin(req.user.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async registerCheckin(req, res, next) {
    try {
      const result = await agentService.registerCheckin(req.user.id, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getCheckinHistory(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 30;
      const result = await agentService.getCheckinHistory(req.user.id, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getJournalEntries(req, res, next) {
    try {
      const result = await agentService.getMyJournalEntries(req.user.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async createJournalEntry(req, res, next) {
    try {
      const result = await agentService.createJournalEntry(req.user.id, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async deleteJournalEntry(req, res, next) {
    try {
      const result = await agentService.deleteJournalEntry(req.user.id, req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async updateJournalEntry(req, res, next) {
    try {
      const result = await agentService.updateJournalEntry(req.user.id, req.params.id, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async correctJournal(req, res, next) {
    try {
      const data = await agentService.correctJournal(req.user.id, req.params.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  },

  async createHabeasData(req, res, next) {
    try {
      const result = await agentService.createHabeasDataRequest(req.user.id, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getMySupportRequests(req, res, next) {
    try {
      const result = await agentService.getMySupportRequests(req.user.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getMyHabeasData(req, res, next) {
    try {
      const result = await agentService.getMyHabeasData(req.user.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
};
