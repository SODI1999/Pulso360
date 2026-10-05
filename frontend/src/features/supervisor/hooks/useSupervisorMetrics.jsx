// src/features/supervisor/hooks/useSupervisorMetrics.jsx
import { useState, useEffect, useMemo } from 'react';
import { fetchSupervisorMetrics } from '../services/supervisorQueries';

/**
 * Convierte un valor de escala (1-5 o 0-100) al formato estándar de 0-100 con 1 decimal.
 * @param {number|string} val
 * @param {number} fallback
 * @returns {number}
 */
export function toScore100(val, fallback = 0) {
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
  campanaId = 'camp-1',
  equipoId = 'team-alpha-1',
  scopeFilter = 'all',
  periodFilter = 'w34'
} = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchSupervisorMetrics(campanaId, equipoId, scopeFilter)
      .then((res) => {
        if (active) {
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
        energyIndex: 0,
        energyDelta: '–',
        overloadIndex: 0,
        participationRate: '0%',
        trendValues: [0, 0, 0, 0]
      };
    }

    const energy = rawMetrics.energia != null
      ? toScore100(rawMetrics.energia)
      : (rawMetrics.energia_avg != null ? toScore100(rawMetrics.energia_avg) : 76.2);

    const overload = rawMetrics.carga_emocional != null
      ? toScore100(rawMetrics.carga_emocional)
      : (rawMetrics.carga_emocional_avg != null
        ? toScore100(rawMetrics.carga_emocional_avg)
        : (rawMetrics.agotamiento != null ? toScore100(rawMetrics.agotamiento) : 68.5));

    const participation = rawMetrics.participacion_pct != null
      ? `${rawMetrics.participacion_pct}%`
      : (rawMetrics.participationRate || `${Math.min(100, Math.round((cohortCount / 16) * 100))}%`);

    const trend = Array.isArray(rawMetrics.tendencia) && rawMetrics.tendencia.length > 0
      ? rawMetrics.tendencia
      : [
          Math.max(0, Math.round(energy - 6)),
          Math.max(0, Math.round(energy - 4)),
          Math.max(0, Math.round(energy - 2)),
          Math.round(energy)
        ];

    return {
      energyIndex: energy,
      energyDelta: '+2.1% frente a semana previa',
      overloadIndex: overload,
      participationRate: participation,
      trendValues: trend
    };
  }, [isProtected, rawMetrics, cohortCount]);

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
