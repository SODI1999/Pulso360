import crypto from 'crypto';
import { reportsRepository } from '../../infrastructure/repositories/reportsRepository.js';

export const reportsService = {
  async getReports(userId) {
    const reports = await reportsRepository.findAll(userId);
    return reports;
  },

  async createReport(userId, data) {
    const { tipoReporte, campanaId, equipoId, fechaCorte, parametrosFiltro, rutaArchivo } = data;
    const id = 'rep-' + Date.now();
    
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
