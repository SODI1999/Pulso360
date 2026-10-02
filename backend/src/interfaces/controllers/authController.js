import { authService } from '../../application/services/authService.js';

export const authController = {
  async login(req, res, next) {
    try {
      const { correo, contrasena } = req.body;
      const result = await authService.login({ correo, contrasena });
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req, res, next) {
    try {
      const profile = await authService.getProfile(req.user.id);
      res.status(200).json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }
};
