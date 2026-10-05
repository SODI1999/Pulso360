import crypto from 'node:crypto';
import { reportsRepository } from '../../infrastructure/repositories/reportsRepository.js';
import { analyticsRepository } from '../../infrastructure/repositories/analyticsRepository.js';
import { AppError } from '../errors/AppError.js';

function canonicalStringify(obj) {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalStringify).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  const entries = keys.map((key) => JSON.stringify(key) + ':' + canonicalStringify(obj[key]));
  return '{' + entries.join(',') + '}';
}

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
    const fechaCorteNormalized = typeof fechaCorte === 'string' ? fechaCorte.split('T')[0] : new Date().toISOString().split('T')[0];
    const parametrosFiltro = data.parametrosFiltro || data.parametros_filtro || {};
    const format = (data.format || 'json').toLowerCase();

    const id = `rep-${crypto.randomUUID()}`;

    // Validar el umbral estricto de k-anonimato antes de generar el reporte
    const count = await analyticsRepository.countDistinctParticipants({ campanaId, equipoId });
    if (count < 5) {
      throw new AppError('Muestra insuficiente para generar reporte agregado (k-anonimato no alcanzado)', 'INSUFFICIENT_COHORT_SIZE', 403);
    }
    
    // Obtener métricas reales
    const metrics = await analyticsRepository.getAggregatedAverages({
      campanaId: campanaId,
      equipoId: equipoId
    });
    
    parametrosFiltro.snapshot_metrics = metrics;
    // Generar contenido
    const contentObj = { tipoReporte, autorId: userId, fechaCorte: fechaCorteNormalized, parametrosFiltro, metrics };
    const content = canonicalStringify(contentObj);
    
    // Calcular hash del contenido real
    const hashIntegridad = crypto.createHash('sha256').update(content).digest('hex');
    const rutaArchivo = `/downloads/${tipoReporte}-${Date.now()}.${format}`;

    const newReport = await reportsRepository.create({
      id,
      tipoReporte,
      autorId: userId,
      campanaId,
      equipoId,
      fechaCorte: fechaCorteNormalized,
      hashIntegridad,
      parametrosFiltro,
      rutaArchivo
    });

    return {
      id: newReport.id,
      tipoReporte: newReport.tipo_reporte,
      autorId: newReport.autor_id,
      campanaId: newReport.campana_id,
      equipoId: newReport.equipo_id,
      fechaCorte: newReport.fecha_corte,
      hashIntegridad: newReport.hash_integridad,
      parametrosFiltro: newReport.parametros_filtro,
      rutaArchivo: newReport.ruta_archivo,
      createdAt: newReport.created_at
    };
  },

  async getReportDownload(reportId, user) {
    const report = await reportsRepository.findById(reportId);
    if (!report) {
      throw new AppError('Reporte no encontrado', 'REPORT_NOT_FOUND', 404);
    }

    // Autorización estricta: Solo ADMIN, LIDER_SST o el autor original / alguien con el scope adecuado
    if (user.rol_codigo !== 'ADMIN' && user.rol_codigo !== 'LIDER_SST' && report.autor_id !== user.id) {
      // Validar si el equipo coincide si es supervisor
      if (user.rol_codigo === 'SUPERVISOR' && report.equipo_id !== user.equipo_id) {
        throw new AppError('No tienes permisos para descargar este reporte', 'FORBIDDEN', 403);
      }
    }
    
    const fechaCorteNormalized = report.fecha_corte instanceof Date
      ? report.fecha_corte.toISOString().split('T')[0]
      : String(report.fecha_corte).split('T')[0];

    // Re-generamos el contenido o usamos el snapshot
    const metrics = report.parametros_filtro?.snapshot_metrics || await analyticsRepository.getAggregatedAverages({
      campanaId: report.campana_id,
      equipoId: report.equipo_id
    });

    const contentObj = { 
      tipoReporte: report.tipo_reporte, 
      autorId: report.autor_id, 
      fechaCorte: fechaCorteNormalized, 
      parametrosFiltro: report.parametros_filtro, 
      metrics 
    };
    const contentJson = canonicalStringify(contentObj);
    
    // Validar hash para detectar manipulación
    const currentHash = crypto.createHash('sha256').update(contentJson).digest('hex');
    if (currentHash !== report.hash_integridad) {
      throw new AppError('Fallo de integridad: los datos del reporte difieren del registro original o fueron manipulados', 'REPORT_INTEGRITY_MISMATCH', 409);
    }

    // Retornar formato CSV si la ruta tiene .csv o si lo solicita explícitamente
    const isCsv = Boolean(report.ruta_archivo && report.ruta_archivo.toLowerCase().endsWith('.csv'));
    if (isCsv) {
      const header = 'Dimension,Promedio\n';
      const m = metrics || {};
      const rows = [
        `Energia,${m.energia_avg ?? 'Supresión por k-anonimato'}`,
        `Carga Emocional,${m.carga_emocional_avg ?? 'Supresión por k-anonimato'}`,
        `Recuperacion,${m.recuperacion_avg ?? 'Supresión por k-anonimato'}`,
        `Apoyo,${m.apoyo_avg ?? 'Supresión por k-anonimato'}`,
        `Distanciamiento,${m.distanciamiento_avg ?? 'Supresión por k-anonimato'}`,
        `Ineficacia,${m.ineficacia_avg ?? 'Supresión por k-anonimato'}`
      ].join('\n');
      const csvContent = header + rows;

      return {
        content: csvContent,
        mimeType: 'text/csv',
        filename: `reporte_${report.id}.csv`
      };
    }
    
    return {
      content: contentJson,
      mimeType: 'application/json',
      filename: `reporte_${report.id}.json`
    };
  }
};
