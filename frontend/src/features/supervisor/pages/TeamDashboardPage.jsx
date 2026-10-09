import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { env } from '../../../core/config/env';
import { Icon } from '../../../core/components/Icon';
import { TrendLineChart } from '../../../core/components/TrendLineChart';
import { TeamKpiGrid } from '../components/TeamKpiGrid';
import { TeamFactorsTable } from '../components/TeamFactorsTable';
import { PrivacyBlockedCard } from '../../../core/components/PrivacyBlockedCard';
import { useSupervisorMetrics, toScore100 } from '../hooks/useSupervisorMetrics';
import { getSupervisorData } from '../services/supervisorQueries';
import { bogotaCalendarDate } from '../../../core/time/calendarDate';

import '../../../styles/supervisor.css';
import '../../../styles/umbral.css';

export function TeamDashboardPage() {
  const user = authService.getCurrentUser();
  const [scopeFilter, setScopeFilter] = useState(() => user?.scopes?.[0]?.id || (env.useMockStorage ? 'all' : ''));
  const [periodStart, setPeriodStart] = useState(() => bogotaCalendarDate().slice(0, 7) + '-01');
  const [periodEnd, setPeriodEnd] = useState(() => bogotaCalendarDate());
  const periodFilter = `${periodStart}|${periodEnd}`;

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
    campanaId: user?.scopes?.find(s => s.id===scopeFilter)?.campana_id || user?.campaignId,
    equipoId: env.useMockStorage ? user?.teamId : scopeFilter,
    scopeFilter,
    periodFilter
  });

  const minThreshold = getSupervisorData().settings?.umbralMinimo || kThreshold || 5;
  const isBlocked = isProtected || (cohortCount < minThreshold);

  // Registro de auditoría cada vez que se filtran métricas agregadas (RF-07)
  useEffect(() => {
    if (!user) return;
    if (env.useMockStorage) {
      pulsoStore.audit({
        actor: `${user.name} (${user.role})`,
        action: 'CONSULTA_AGREGADA',
        target: `ámbito=${scopeFilter}; período=${periodFilter}`
      });
    }
  }, [scopeFilter, periodFilter, user]);

  // Factores derivados de las métricas agregadas del equipo
  const teamFactors = useMemo(() => {
    if (!metrics) return undefined;
    const factors = [
      {
        name: 'Apoyo Social entre Pares',
        score: `${toScore100(metrics.apoyo ?? metrics.apoyo_avg)} / 100`,
        status: toScore100(metrics.apoyo ?? metrics.apoyo_avg) >= 70 ? 'Favorable' : 'En observación',
        statusType: toScore100(metrics.apoyo ?? metrics.apoyo_avg) >= 70 ? 'ok' : 'warn',
        recommendation: 'Mantener dinámicas de inicio de turno'
      },
      {
        name: 'Recuperación agregada',
        score: `${toScore100(metrics.recuperacion ?? metrics.recuperacion_avg)} / 100`,
        status: toScore100(metrics.recuperacion ?? metrics.recuperacion_avg) >= 70 ? 'Favorable' : 'Atención',
        statusType: toScore100(metrics.recuperacion ?? metrics.recuperacion_avg) >= 70 ? 'ok' : 'warn',
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
    return factors.map((f,index) => {
      const value = index===0 ? (metrics.apoyo ?? metrics.apoyo_avg) : index===1 ? (metrics.recuperacion ?? metrics.recuperacion_avg) : kpis.overloadIndex;
      return value == null ? {...f,score:'No disponible o protegido',status:'No disponible',statusType:'neutral',recommendation:'No se publica esta dimensión.'} : f;
    });
  }, [metrics, kpis.overloadIndex]);

  return (
    <div className="supervisor-page">
      {/* Cabecera del Panel */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Panel de Supervisión · {user?.campaign || 'Ámbito asignado'}</h1>
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
              {env.useMockStorage ? <><option value="all">Equipo de demostración</option><option value="small">Subgrupo de muestra protegido</option></>
                : (user?.scopes || []).map(s => <option key={s.id} value={s.id}>{s.campana_nombre} · {s.nombre}</option>)}
            </select>
          </div>

          <div className="supervisor-filter-item">
            <label className="form-label" htmlFor="periodFilter">
              Desde
            </label>
            <input type="date" max={periodEnd || undefined}
              className="form-select"
              id="periodFilter"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
            />
            <label className="form-label" htmlFor="periodEnd">Hasta</label>
            <input className="form-select" id="periodEnd" type="date" min={periodStart || undefined}
              value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Mensaje de error si la sincronización falla */}
      {error && (
        <div className="alert-banner warn" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
          <Icon name="alertTriangle" size={18} />
          <span>{error.message || 'No se pudieron consultar las métricas.'}</span>
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
      ) : error ? <p role="alert">La consulta no está disponible. Reintenta cambiando el periodo.</p> : isBlocked ? (
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
                  <h2 className="supervisor-analytics-title">{env.useMockStorage ? "Tendencia Agregada del Equipo (Semanas 1 a 4)" : "Serie histórica del equipo"}</h2>
                  <p className="supervisor-analytics-subtitle">{env.useMockStorage ? "Evolución del índice de bienestar colectivo" : "Esta consulta ofrece promedios del periodo; no ofrece una serie histórica."}</p>
                </div>
                <span className="badge badge-info">N = {cohortCount} Agentes</span>
              </div>
              <div className="supervisor-chart-container">
                {env.useMockStorage && <TrendLineChart
                  labels={['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']}
                  values={kpis.trendValues}
                  strokeColor="#2563eb"
                  height={220}
                />}
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
                  Consulta los planes de intervención y sus responsables antes de coordinar cambios operativos.
                </p>
              </div>
              <Link
                to="/supervisor/acciones"
                className="btn btn-secondary supervisor-rec-action"
              >
                <Icon name="ClipboardList" size={16} />
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
