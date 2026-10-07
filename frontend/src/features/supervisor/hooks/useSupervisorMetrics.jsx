// src/features/supervisor/hooks/useSupervisorMetrics.jsx
import { useState, useEffect, useMemo } from 'react';
import { fetchSupervisorMetrics, getCachedSupervisorMetrics } from '../services/supervisorQueries';

/**
 * Convierte un valor de escala (1-5 o 0-100) al formato estándar de 0-100 con 1 decimal.
 * @param {number|string} val
 * @param {number} fallback
 * @returns {number}
 */
export function toScore100(val, fallback = null) {
  if (val == null || isNaN(Number(val))) return fallback;
  const num = Number(val);
  if (num <= 5) {
    return Number((num * 20).toFixed(1));
  }
  return Number(num.toFixed(1));
}

/**
 * Hook para consultar y sincronizar las métricas agregadas del equipo supervisado.
 * Garantiza la aplicación estricta del k-anonimato (RF-07 / RF-11).
 *
 * @param {Object} [params]
 * @param {string} [params.campanaId]
 * @param {string} [params.equipoId]
 * @param {string} [params.scopeFilter]
 * @param {string} [params.periodFilter]
 * @returns {Object} Estado de carga, métricas procesadas y estado de protección
 */
export function useSupervisorMetrics({
  campanaId = null,
  equipoId = null,
  scopeFilter = 'all',
  periodFilter
} = {}) {
  const [data, setData] = useState(() => getCachedSupervisorMetrics(campanaId, equipoId, scopeFilter, periodFilter));
  const [loading, setLoading] = useState(() => !getCachedSupervisorMetrics(campanaId, equipoId, scopeFilter, periodFilter));
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const cached = getCachedSupervisorMetrics(campanaId, equipoId, scopeFilter, periodFilter);
    if (!cached) setLoading(true);
    setError(null);

    fetchSupervisorMetrics(campanaId, equipoId, scopeFilter,periodFilter)
      .then((res) => {
        if (active) {
          if (res?.error) { setError(new Error(res.error)); setData(null); return; }
          setData(res || null);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [campanaId, equipoId, scopeFilter, periodFilter]);

  const kThreshold = data?.k_threshold ?? 5;
  const cohortCount = data?.cohort_count ?? 0;
  const isProtected = Boolean(data?.protected) || (cohortCount < kThreshold);
  const rawMetrics = data?.metrics || null;

  // Cálculo y normalización de KPIs del equipo
  const processedKpis = useMemo(() => {
    if (isProtected || !rawMetrics) {
      return {
        energyIndex: null,
        energyDelta: '–',
        overloadIndex: null,
        participationRate: 'N/D',
        trendValues: []
      };
    }

    const energy = rawMetrics.energia != null
      ? toScore100(rawMetrics.energia)
      : (rawMetrics.energia_avg != null ? toScore100(rawMetrics.energia_avg) : null);

    const overload = rawMetrics.carga_emocional != null
      ? toScore100(rawMetrics.carga_emocional)
      : (rawMetrics.carga_emocional_avg != null
        ? toScore100(rawMetrics.carga_emocional_avg)
        : null);

    const participation = rawMetrics.participacion_pct != null
      ? `${rawMetrics.participacion_pct}%`
      : (rawMetrics.participationRate || 'N/D');

    const trend = Array.isArray(rawMetrics.tendencia) && rawMetrics.tendencia.length > 0
      ? rawMetrics.tendencia
      : [];

    return {
      energyIndex: energy,
      energyDelta: rawMetrics.energyDelta || 'N/D',
      overloadIndex: overload,
      participationRate: participation,
      trendValues: trend
    };
  }, [isProtected, rawMetrics]);

  return {
    data,
    loading,
    error,
    isProtected,
    cohortCount,
    kThreshold,
    metrics: rawMetrics,
    reason: data?.reason || null,
    kpis: processedKpis
  };
}
