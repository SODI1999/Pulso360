import * as adminService from '../../application/services/adminService.js';

/**
 * @fileoverview Controlador HTTP para endpoints de administración
 * @module adminController
 */

export const getUsers = async (req, res, next) => {
  try {
    const data = await adminService.getUsers();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const adminUserId = req.user?.id;
    const data = await adminService.createUser(req.body, adminUserId);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const setUserStatus = async (req, res, next) => {
  try {
    const adminUserId = req.user?.id;
    const { id } = req.params;
    const { status } = req.body;
    const data = await adminService.setUserStatus(id, status, adminUserId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getOrganization = async (req, res, next) => {
  try {
    const data = await adminService.getOrganization();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createCampaign = async (req, res, next) => {
  try {
    const adminUserId = req.user?.id;
    const data = await adminService.createCampaign(req.body, adminUserId);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateCampaign = async (req, res, next) => {
  try {
    const adminUserId = req.user?.id;
    const { id } = req.params;
    const data = await adminService.updateCampaign(id, req.body, adminUserId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createTeam = async (req, res, next) => {
  try {
    const adminUserId = req.user?.id;
    const data = await adminService.createTeam(req.body, adminUserId);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateTeam = async (req, res, next) => {
  try {
    const adminUserId = req.user?.id;
    const { id } = req.params;
    const data = await adminService.updateTeam(id, req.body, adminUserId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getSystemParams = async (req, res, next) => {
  try {
    const data = await adminService.getSystemParams();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateSystemParam = async (req, res, next) => {
  try {
    const { clave } = req.params;
    const { valor } = req.body;
    const data = await adminService.updateSystemParam(clave, valor);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createPolicy = async (req, res, next) => {
  try {
    const adminUserId = req.user.id;
    const data = await adminService.createPolicy(req.body, adminUserId);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getHabeasData = async (req, res, next) => {
  try {
    const data = await adminService.getHabeasData();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateHabeasData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const data = await adminService.updateHabeasData(id, status, note);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
