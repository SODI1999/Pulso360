import crypto from 'node:crypto';
import { reportsRepository } from '../../infrastructure/repositories/reportsRepository.js';

export const reportsService = {
  async getReports(userId) {
    const reports = await reportsRepository.findAll(userId);
    return reports;
  },

  async createReport(userId, data) {
    const tipoReporte = data.tipoReporte || data.tipo_reporte || data.title || 'general';
    const campanaId = data.campanaId || data.campana_id || data.scope || null;
    const equipoId = data.equipoId || data.equipo_id || null;
    const fechaCorte = data.fechaCorte || data.fecha_corte || new Date().toISOString();
    const parametrosFiltro = data.parametrosFiltro || data.parametros_filtro || {};
    const rutaArchivo = data.rutaArchivo || data.ruta_archivo || `/downloads/${tipoReporte}-${Date.now()}.csv`;
    const format = data.format || 'csv';

    const id = `rep-${crypto.randomUUID()}`;
    
    // Calcula hash de integridad SHA-256 o canónico
    const payload = JSON.stringify({ tipoReporte, autorId: userId, fechaCorte, parametrosFiltro });
    const hashIntegridad = crypto.createHash('sha256').update(payload).digest('hex');

    const newReport = await reportsRepository.create({
      id,
      tipoReporte,
      autorId: userId,
      campanaId,
      equipoId,
      fechaCorte,
      hashIntegridad,
      parametrosFiltro,
      rutaArchivo
    });

    return newReport;
  }
};
