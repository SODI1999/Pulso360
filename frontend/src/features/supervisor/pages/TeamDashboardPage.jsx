import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import { TrendLineChart } from '../../../core/components/TrendLineChart';
import { TeamKpiGrid } from '../components/TeamKpiGrid';
import { TeamFactorsTable } from '../components/TeamFactorsTable';
import { PrivacyBlockedCard } from '../../../core/components/PrivacyBlockedCard';
import { useSupervisorMetrics, toScore100 } from '../hooks/useSupervisorMetrics';
import { getSupervisorData } from '../services/supervisorQueries';

import '../../../styles/supervisor.css';
import '../../../styles/umbral.css';

export function TeamDashboardPage() {
  const user = authService.getCurrentUser();
  const [scopeFilter, setScopeFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('w34');

  const {
    loading,
    error,
    isProtected,
    cohortCount,
    kThreshold,
    metrics,
    reason,
    kpis
  } = useSupervisorMetrics({
    campanaId: 'camp-1',
    equipoId: 'team-alpha-1',
    scopeFilter,
    periodFilter
  });

  const minThreshold = getSupervisorData().settings?.umbralMinimo || kThreshold || 5;
  const isBlocked = isProtected || (cohortCount < minThreshold);

  // Registro de auditoría cada vez que se filtran métricas agregadas (RF-07)
  useEffect(() => {
    if (!user) return;
    pulsoStore.audit({
      actor: `${user.name} (${user.role})`,
      action: 'CONSULTA_AGREGADA',
      target: `ámbito=${scopeFilter}; período=${periodFilter}`
    });
  }, [scopeFilter, periodFilter, user]);

  // Factores derivados de las métricas agregadas del equipo
  const teamFactors = useMemo(() => {
    if (!metrics) return undefined;
    return [
      {
        name: 'Apoyo Social entre Pares',
        score: `${toScore100(metrics.apoyo ?? metrics.apoyo_avg, 82)} / 100`,
        status: toScore100(metrics.apoyo ?? metrics.apoyo_avg, 82) >= 70 ? 'Favorable' : 'En observación',
        statusType: toScore100(metrics.apoyo ?? metrics.apoyo_avg, 82) >= 70 ? 'ok' : 'warn',
        recommendation: 'Mantener dinámicas de inicio de turno'
      },
      {
        name: 'Recuperación agregada',
        score: `${toScore100(metrics.recuperacion ?? metrics.recuperacion_avg, 78)} / 100`,
        status: toScore100(metrics.recuperacion ?? metrics.recuperacion_avg, 78) >= 70 ? 'Favorable' : 'Atención',
        statusType: toScore100(metrics.recuperacion ?? metrics.recuperacion_avg, 78) >= 70 ? 'ok' : 'warn',
        recommendation: 'Resolución de dudas rápida en chat y micropausas'
      },
      {
        name: 'Carga emocional agregada',
        score: `${kpis.overloadIndex} / 100`,
        status: kpis.overloadIndex > 65 ? 'Atención' : 'Favorable',
        statusType: kpis.overloadIndex > 65 ? 'warn' : 'ok',
        recommendation: kpis.overloadIndex > 65 ? 'Reforzar descansos cognitivos' : 'Seguimiento preventivo regular'
      }
    ];
  }, [metrics, kpis.overloadIndex]);

  return (
    <div className="supervisor-page">
      {/* Cabecera del Panel */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Panel de Supervisión · Campaña Soporte Alpha</h1>
          <p className="page-subtitle">
            Visualización agregada protegida por umbral de privacidad (N ≥ {minThreshold}). Esta vista no
            incluye datos individuales.
          </p>
        </div>

        {/* Filtros Contextuales (Límite 2 dimensiones simultáneas - RF-07) */}
        <div className="supervisor-filter-bar">
          <div className="supervisor-filter-item">
            <label className="form-label" htmlFor="shiftFilter">
              Ámbito de equipo
            </label>
            <select
              className="form-select"
              id="shiftFilter"
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
            >
              <option value="all">Equipo Alpha 1 (N={!isBlocked && cohortCount > 0 ? cohortCount : 14})</option>
              <option value="small">Subgrupo protegido (N=3)</option>
            </select>
          </div>

          <div className="supervisor-filter-item">
            <label className="form-label" htmlFor="periodFilter">
              Período temporal
            </label>
            <select
              className="form-select"
              id="periodFilter"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
            >
              <option value="w34">Semana 34 · Ago 2026</option>
              <option value="m08">Agosto 2026</option>
            </select>
          </div>

          <div className="supervisor-filter-item disabled">
            <label className="form-label" htmlFor="thirdFilter">
              Tercer filtro
            </label>
            <select
              className="form-select"
              id="thirdFilter"
              disabled
              title="RF-07 limita a dos dimensiones simultáneas para evitar reidentificación por intersección"
            >
              <option>Bloqueado (RF-07)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mensaje de error si la sincronización falla */}
      {error && (
        <div className="alert-banner warn" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
          <Icon name="alertTriangle" size={18} />
          <span>No fue posible sincronizar las métricas en tiempo real. Mostrando último consolidado disponible.</span>
        </div>
      )}

      {/* Vista Condicional: Carga vs Bloqueo de Privacidad vs Dashboard Desbloqueado */}
      {loading ? (
        <div
          className="supervisor-loading"
          style={{
            padding: 'var(--space-8)',
            textAlign: 'center',
            color: 'var(--c-texto-suave)'
          }}
          role="status"
          aria-live="polite"
        >
          <Icon name="refresh" size={24} className="icon-spin" />
          <p style={{ marginTop: 'var(--space-2)' }}>Consultando métricas agregadas del equipo...</p>
        </div>
      ) : isBlocked ? (
        <PrivacyBlockedCard sampleCount={cohortCount} minThreshold={minThreshold} customMessage={reason} />
      ) : (
        <div id="teamDashboard">
          {/* 1. KPIs Agregados Reales */}
          <TeamKpiGrid
            energyIndex={kpis.energyIndex}
            energyDelta={kpis.energyDelta}
            overloadIndex={kpis.overloadIndex}
            participationRate={kpis.participationRate}
          />

          {/* 2. Tablero Integrado de Análisis Operativo */}
          <section className="supervisor-analytics-board" aria-label="Análisis operativo y directriz de SST">
            <div className="supervisor-analytics-main">
              <div className="supervisor-analytics-header">
                <div>
                  <h2 className="supervisor-analytics-title">Tendencia Agregada del Equipo (Semanas 1 a 4)</h2>
                  <p className="supervisor-analytics-subtitle">Evolución del índice de bienestar colectivo</p>
                </div>
                <span className="badge badge-info">N = {cohortCount} Agentes</span>
              </div>
              <div className="supervisor-chart-container">
                <TrendLineChart
                  labels={['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']}
                  values={kpis.trendValues}
                  strokeColor="#2563eb"
                  height={220}
                />
              </div>
            </div>

            <aside className="supervisor-analytics-aside">
              <div className="supervisor-aside-header">
                <h3 className="supervisor-aside-title">Recomendación Preventiva</h3>
                <span className="badge badge-info">SST</span>
              </div>
              <div className="supervisor-aside-body">
                <h4 className="supervisor-aside-topic">Pausas &amp; Recuperación</h4>
                <p className="supervisor-aside-text">
                  SST recomienda coordinar pausas de 5 min escalonadas para el turno de la tarde ante reportes
                  de alta carga de llamadas en colas críticas.
                </p>
              </div>
              <Link
                to="/supervisor/acciones"
                className="btn btn-secondary supervisor-rec-action"
              >
                <Icon name="task_alt" size={16} />
                <span>Ver intervención asignada</span>
              </Link>
            </aside>
          </section>

          {/* 3. Tabla Consolidada de Factores del Equipo */}
          <TeamFactorsTable factors={teamFactors} />
        </div>
      )}
    </div>
  );
}
