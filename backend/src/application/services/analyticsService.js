import { analyticsRepository } from '../../infrastructure/repositories/analyticsRepository.js';
import { evaluarKAnonimato } from '../../domain/privacyRules.js';
import { isCalendarDate } from '../../domain/calendarDate.js';
import { AppError } from '../errors/AppError.js';

export const analyticsService = {
  /**
   * Consulta y retorna métricas de bienestar agrupadas por campaña o equipo.
   * Es el núcleo del módulo analítico de SST, encargado de proteger la confidencialidad.
   * 
   * REGLA DE PRIVACIDAD ESENCIAL (k-anonimato): 
   * Antes de revelar cualquier promedio emocional, primero se consulta cuántas personas DISTINTAS (no solo registros)
   * componen la muestra seleccionada.
   * Si la cantidad es menor a 5 personas, se SUPRIME toda la información de promedios, devolviendo un estado protegido.
   * Esto impide que un supervisor intente deducir la salud de un operador específico reduciendo los filtros.
   *
   * @param {Object} params
   * @param {number} [params.campanaId] Filtro opcional por campaña
   * @param {number} [params.equipoId] Filtro opcional por equipo
   * @param {string} params.desde - Fecha inicial (YYYY-MM-DD)
   * @param {string} params.hasta - Fecha final (YYYY-MM-DD)
   * @returns {Promise<Object>} Promedios calculados o mensaje de restricción de privacidad.
   */
  async getAggregatedMetrics({ campanaId, equipoId, desde, hasta }) {
    if ([desde,hasta].some(value => value !== undefined && !isCalendarDate(value)) || (desde && hasta && desde > hasta)) {
      throw new AppError('Periodo inválido','INVALID_METRICS_PERIOD',400);
    }
    // 1. Contar participantes únicos en la cohorte para verificar el tamaño de la muestra.
    const snapshot = await analyticsRepository.getSnapshot({ campanaId, equipoId, desde, hasta });
    const cohortCount = snapshot.cohort_count;
    
    // 2. Evaluar el umbral matemático usando la regla pura de dominio de la plataforma.
    const privacyCheck = evaluarKAnonimato(cohortCount);

    // 3. Si no hay sufientes trabajadores (k < 5), detenemos el cálculo. Retornamos objeto de supresión.
    if (privacyCheck.protected) {
      return {
        protected: true,
        reason: privacyCheck.reason,
        cohort_count: privacyCheck.cohort_count,
        k_threshold: privacyCheck.k_threshold,
        metrics: null
      };
    }

    // 4. Con k-anonimato garantizado, consultamos a la base de datos por los promedios seguros.
    const averages = snapshot.metrics;
    
    return {
      protected: false,
      cohort_count: privacyCheck.cohort_count,
      k_threshold: privacyCheck.k_threshold,
      metrics: averages
    };
  }
};
