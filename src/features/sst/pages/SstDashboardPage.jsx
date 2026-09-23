import { useSstDashboard } from '../hooks/useSstDashboard';
// src/features/sst/pages/SstDashboardPage.jsx
// Panel Principal de Vigilancia Epidemiológica y Analítica Agregada para SST (RF-07 / RF-11)

import { Link } from 'react-router-dom';

import { Icon } from '../../../core/components/Icon';
import { HeatmapGrid } from '../components/HeatmapGrid';

import '../../../styles/sst.css';
import '../../../styles/umbral.css';

export function SstDashboardPage() {
  const { minThreshold, pendingAlerts, activeRequests, nlpCategories } = useSstDashboard();

  return (
    <div>
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tendencias agregadas por campaña</h1>
          <p className="page-subtitle">
            Consolidado organizacional de bienestar para gestión preventiva. Pulso360 es complementario y no
            sustituye evaluaciones clínicas individuales.
          </p>
        </div>

        <Link to="/sst/alertas" className="btn btn-primary">
          <Icon name="notifications_active" size={18} />
          <span>Bandeja de Alertas ({pendingAlerts.length} Pendientes)</span>
        </Link>
      </div>

      {/* Banner Preventivo */}
      <div className="alert-banner info" style={{ marginBottom: 'var(--space-4)' }}>
        <Icon name="info" size={20} />
        <div>
          <strong>Vigilancia epidemiológica preventiva:</strong> La información agregada permite a SST
          coordinar acciones de apoyo colectivo sin mostrar la identidad ni las respuestas individuales en
          esta vista.
        </div>
      </div>

      {/* KPIs Generales de SST */}
      <div className="kpi-grid" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="kpi-card">
          <div className="kpi-label">Índice agregado de bienestar</div>
          <div className="kpi-value" style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            64.2{' '}
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--c-texto-mutado)' }}>/ 100</span>
          </div>
          <div className="kpi-delta warn">
            <Icon name="alertTriangle" size={16} />
            <span>Nivel agregado en observación preventiva</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Campañas con datos publicables</div>
          <div className="kpi-value">2 de 5</div>
          <div className="kpi-delta warn">
            <span>Soporte Alpha &amp; Retención Beta (N ≥ {minThreshold})</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Solicitudes de acompañamiento</div>
          <div className="kpi-value" style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            {activeRequests.length}{' '}
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--c-texto-mutado)' }}>
              en gestión
            </span>
          </div>
          <div className="kpi-delta ok">
            <Icon name="checkCircle" size={16} />
            <span>Seguimiento según SLA establecido</span>
          </div>
        </div>
      </div>

      {/* Distribución Agregada de Factores NLP (RF-07) */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Distribución agregada de categorías NLP</h2>
            <p className="card-subtitle">
              Consolidado de todas las campañas activas con supresión primaria y secundaria (RF-07).
            </p>
          </div>
          <span className="privacy-badge">Muestra Total N = 48</span>
        </div>

        <HeatmapGrid categories={nlpCategories} minThreshold={minThreshold} />
      </div>

      {/* Mapa de Calor de Dimensiones Ocupacionales por Campaña */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Dimensiones ocupacionales prioritarias</h2>
            <p className="card-subtitle">
              Monitoreo de factores clave de riesgo psicosocial según la batería de evaluación continua.
            </p>
          </div>
          <span className="badge badge-info">Campaña Soporte Alpha</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Dimensión Evaluada</th>
                <th>Índice Colectivo</th>
                <th>Nivel de Riesgo</th>
                <th>Tendencia</th>
                <th>Recomendación SST</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Recuperación agregada</strong>
                </td>
                <td>58 / 100</td>
                <td>
                  <span className="badge badge-warn">Medio-Bajo</span>
                </td>
                <td>Descenso del 3.2% en 3 semanas</td>
                <td>Coordinación de pausas activas y descansos escalonados</td>
              </tr>
              <tr>
                <td>
                  <strong>Carga emocional agregada</strong>
                </td>
                <td>74 / 100</td>
                <td>
                  <span className="badge badge-danger">Alto</span>
                </td>
                <td>Estable en nivel elevado</td>
                <td>Taller de contención emocional en colas de retención</td>
              </tr>
              <tr>
                <td>
                  <strong>Apoyo social entre pares</strong>
                </td>
                <td>82 / 100</td>
                <td>
                  <span className="badge badge-ok">Favorable</span>
                </td>
                <td>Incremento positivo (+1.8%)</td>
                <td>Mantener dinámicas de inicio de jornada</td>
              </tr>
              <tr>
                <td>
                  <strong>Conflicto y ambigüedad de rol</strong>
                </td>
                <td>48 / 100</td>
                <td>
                  <span className="badge badge-info">Medio</span>
                </td>
                <td>Estable</td>
                <td>Alineación de criterios operativos con supervisores</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
