import { getSstData, fetchSstAlerts, fetchSstSupportRequests, fetchSstMetrics } from '../services/sstQueries';
import { useEffect, useMemo, useState } from 'react';

import { authService } from '../../../core/auth/authService';
import { env } from '../../../core/config/env';
import { pulsoStore } from '../../../core/storage/pulsoStore';

export function useSstDashboard({ campanaId, equipoId, desde, hasta } = {}) {
  const user = authService.getCurrentUser();
  const storeData = getSstData();
  const defaultMinThreshold = storeData.settings?.umbralMinimo || 5;

  const [version, setVersion] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [metricsResponse, setMetricsResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      fetchSstAlerts(),
      fetchSstSupportRequests(),
      fetchSstMetrics({ campanaId, equipoId, desde, hasta })
    ])
      .then(([al, req, met]) => {
        if (active) {
          setAlerts(al || []);
          setRequests(req || []);
          if (met?.error) { setError(new Error(met.error)); setMetricsResponse(null); return; }
          setMetricsResponse(met || null);
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
  }, [campanaId, equipoId, desde, hasta, version]);

  // Alertas activas pendientes de atención
  const pendingAlerts = useMemo(() => {
    return alerts.filter((a) => a.status !== 'CERRADA' && a.status !== 'DESCARTADA');
  }, [alerts]);

  // Solicitudes de acompañamiento en gestión
  const activeRequests = useMemo(() => {
    return requests.filter((r) => r.status !== 'Cerrada');
  }, [requests]);

  // Distribución agregada de las 8 categorías léxicas de NLP
  const nlpCategories = useMemo(
    () => !env.useMockStorage ? [] : [
      { name: 'Sobrecarga percibida', count: 12, percent: 37 },
      { name: 'Recuperación insuficiente', count: 10, percent: 31 },
      { name: 'Exigencia emocional', count: 9, percent: 28 },
      { name: 'Conflicto de rol', count: 7, percent: 19 },
      { name: 'Bajo apoyo organizacional', count: 4, percent: 11 }, // Cuenta < 5 -> supresión primaria
      { name: 'Distanciamiento laboral', count: 8, percent: 23 },
      { name: 'Frustración por métricas operativas', count: 6, percent: 17 },
      { name: 'Percepción de ineficacia', count: 5, percent: 14 }
    ],
    []
  );

  // Registro de auditoría preventiva (RF-07 / RF-11)
  useEffect(() => {
    if (!user) return;
    if (env.useMockStorage) pulsoStore.audit({
      actor: `${user.name} (${user.role})`,
      action: 'CONSULTA_AGREGADA',
      target: 'SST · Vigilancia epidemiológica y distribución agregada NLP'
    });
  }, [user]);

  const minThreshold = metricsResponse?.k_threshold ?? defaultMinThreshold;
  const isProtected = Boolean(metricsResponse?.protected);
  const cohortSize = metricsResponse?.cohort_count ?? 0;
  const metrics = metricsResponse?.metrics ?? null;

  return {
    minThreshold,
    pendingAlerts,
    activeRequests,
    nlpCategories,
    metrics,
    cohortSize,
    isProtected,
    loading,
    error,
    reason: metricsResponse?.reason ?? null,
    reload: () => setVersion((v) => v + 1)
  };
}
