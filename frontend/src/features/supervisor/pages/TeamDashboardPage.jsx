import { getSupervisorData } from '../services/supervisorQueries';
// src/features/supervisor/pages/TeamDashboardPage.jsx
// Panel de Supervisión Operativa: Indicadores agregados y k-anonimato (RF-07 / RF-11)

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import { TrendLineChart } from '../../../core/components/TrendLineChart';
import { TeamKpiGrid } from '../components/TeamKpiGrid';
import { TeamFactorsTable } from '../components/TeamFactorsTable';
import { PrivacyBlockedCard } from '../../../core/components/PrivacyBlockedCard';

import '../../../styles/supervisor.css';
import '../../../styles/umbral.css';

export function TeamDashboardPage() {
  const user = authService.getCurrentUser();
  const [scopeFilter, setScopeFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('w34');

  const minThreshold = getSupervisorData().settings?.umbralMinimo || 5;
  const isBlocked = scopeFilter === 'small';

  // Registro de auditoría cada vez que se filtran métricas agregadas (RF-07)
  useEffect(() => {
    if (!user) return;
    pulsoStore.audit({
      actor: `${user.name} (${user.role})`,
      action: 'CONSULTA_AGREGADA',
      target: `ámbito=${scopeFilter}; período=${periodFilter}`
    });
  }, [scopeFilter, periodFilter, user]);

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
              <option value="all">Equipo Alpha 1 (N=14)</option>
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

      {/* Vista Condicional: Bloqueo de Privacidad vs Dashboard Desbloqueado */}
      {isBlocked ? (
        <PrivacyBlockedCard sampleCount={3} minThreshold={minThreshold} />
      ) : (
        <div id="teamDashboard">
          {/* 1. KPIs Agregados */}
          <TeamKpiGrid
            energyIndex={76.2}
            energyDelta="+2.1% frente a semana previa"
            overloadIndex={68.5}
            participationRate="87.5%"
          />

          {/* 2. Fila Media: Gráfico de Tendencia + Recomendación de SST */}
          {/* 2. Tablero Integrado de Análisis Operativo (Sin Carditis) */}
          <section className="supervisor-analytics-board" aria-label="Análisis operativo y directriz de SST">
            <div className="supervisor-analytics-main">
              <div className="supervisor-analytics-header">
                <div>
                  <h2 className="supervisor-analytics-title">Tendencia Agregada del Equipo (Semanas 1 a 4)</h2>
                  <p className="supervisor-analytics-subtitle">Evolución del índice de bienestar colectivo</p>
                </div>
                <span className="badge badge-info">N = 14 Agentes</span>
              </div>
              <div className="supervisor-chart-container">
                <TrendLineChart
                  labels={['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']}
                  values={[70, 72, 74, 76]}
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
          <TeamFactorsTable />
        </div>
      )}
    </div>
  );
}
