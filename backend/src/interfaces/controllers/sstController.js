import { sstService } from '../../application/services/sstService.js';
import { analyticsService } from '../../application/services/analyticsService.js';
import AppError from '../../application/errors/AppError.js';

export const sstController = {
  /**
   * Controlador HTTP para obtener métricas agregadas.
   * Extrae los parámetros de la consulta y los canaliza hacia el servicio analítico.
   * La lógica de negocio y las evaluaciones rigurosas de k-anonimato no se escriben aquí,
   * sino en el servicio de negocio garantizando la "Clean Layered Architecture".
   */
  async getMetrics(req, res, next) {
    try {
      const campanaId = req.query.campana_id || req.query.campanaId;
      const equipoId = req.query.equipo_id || req.query.equipoId;
      const { desde, hasta } = req.query;

      const result = await analyticsService.getAggregatedMetrics({ 
        campanaId: campanaId || undefined, 
        equipoId: equipoId || undefined, 
        desde, 
        hasta 
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Endpoint para listar alertas.
   */
  async getAlerts(req, res, next) {
    try {
      const filters = { estado: req.query.estado };
      const data = await sstService.getAlerts(filters);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Endpoint para consultar planes de intervención.
   */
  async getInterventions(req, res, next) {
    try {
      const filters = { status: req.query.status };
      const data = await sstService.getInterventions(filters);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Endpoint para persistir una nueva intervención a nivel colectivo.
   * El userId del operador de SST es confiable y seguro porque se extrae del token validado por el middleware.
   */
  async createIntervention(req, res, next) {
    try {
      // req.user.id es inyectado de forma segura por authMiddleware al verificar el token JWT.
      const sstUserId = req.user.id;
      const data = await sstService.createIntervention(sstUserId, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Endpoint que despliega las solicitudes de auxilio psicológico al área de bienestar.
   */
  async getSupportRequests(req, res, next) {
    try {
      const data = await sstService.getSupportRequests();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Endpoint que recibe la radiación de una petición de ayuda emocional por parte del operador (Agente).
   */
  async createSupportRequest(req, res, next) {
    try {
      // req.user.id se recupera del token del empleado autenticado
      const agentId = req.user.id;
      const data = await sstService.createSupportRequest(agentId, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
};
