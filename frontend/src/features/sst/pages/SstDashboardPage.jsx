import { env } from '../../../core/config/env';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSstDashboard } from '../hooks/useSstDashboard';
import { Icon } from '../../../core/components/Icon';
import { HeatmapGrid } from '../components/HeatmapGrid';

import '../../../styles/sst.css';
import '../../../styles/umbral.css';

function toScore100(val, fallback = null) {
  if (val == null || isNaN(Number(val))) return fallback;
  const num = Number(val);
  if (num <= 5) {
    return Number((num * 20).toFixed(1));
  }
  return Number(num.toFixed(1));
}

export function SstDashboardPage() {
  const {
    minThreshold,
    pendingAlerts,
    activeRequests,
    nlpCategories,
    metrics,
    cohortSize,
    isProtected,
    loading,
    error,
    reason
  } = useSstDashboard();

  // Cálculo derivado del índice de bienestar agregado
  const wellbeingScore = useMemo(() => {
    if (isProtected || !metrics) return null;
    if (!env.useMockStorage) return metrics.bienestar_general ?? null;
    if (metrics.bienestar_general != null) {
      return toScore100(metrics.bienestar_general);
    }
    const energia = metrics.energia ?? metrics.energia_avg;
    const recuperacion = metrics.recuperacion ?? metrics.recuperacion_avg;
    const apoyo = metrics.apoyo ?? metrics.apoyo_avg;
    const carga = metrics.carga_emocional ?? metrics.carga_emocional_avg;
    const dist = metrics.distanciamiento ?? metrics.distanciamiento_avg;
    const inef = metrics.ineficacia ?? metrics.ineficacia_avg;

    const positiveScores = [energia, recuperacion, apoyo].filter((v) => v != null).map((v) => toScore100(v));
    const riskScores = [carga, dist, inef].filter((v) => v != null).map((v) => Math.max(0, 100 - toScore100(v)));
    const all = [...positiveScores, ...riskScores];
    if (all.length === 0) return null;
    const avg = all.reduce((a, b) => a + b, 0) / all.length;
    return Number(avg.toFixed(1));
  }, [isProtected, metrics]);

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

      {/* Banner de error si la sincronización falla */}
      {error && (
        <div className="alert-banner warn" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
          <Icon name="alertTriangle" size={18} />
          <span>{error.message || 'No se pudieron cargar las métricas.'}</span>
        </div>
      )}

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
          {loading ? (
            <div className="kpi-value" style={{ fontSize: '18px', color: 'var(--c-texto-suave)' }}>
              Cargando...
            </div>
          ) : isProtected || (cohortSize < minThreshold && cohortSize > 0) ? (
            <div>
              <div className="kpi-value" style={{ fontSize: '18px', color: 'var(--c-alerta-texto)' }}>
                Protegido (k &lt; {minThreshold})
              </div>
              <div className="kpi-delta warn">
                <Icon name="lock" size={16} />
                <span>Muestra insuficiente para k-anonimato</span>
              </div>
            </div>
          ) : cohortSize === 0 ? (
            <div>
              <div className="kpi-value" style={{ fontSize: '18px', color: 'var(--c-texto-mutado)' }}>
                Sin registros
              </div>
              <div className="kpi-delta neutral">
                <span>Sin check-ins en el período</span>
              </div>
            </div>
          ) : (
            <>
              <div className="kpi-value" style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                {wellbeingScore ?? '–'}
                <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--c-texto-mutado)' }}>/ 100</span>
              </div>
              <div className={`kpi-delta ${wellbeingScore >= 70 ? 'ok' : 'warn'}`}>
                <Icon name={wellbeingScore >= 70 ? 'checkCircle' : 'alertTriangle'} size={16} />
                <span>
                  {wellbeingScore == null ? 'Índice no disponible en el contrato actual' : wellbeingScore >= 70
                    ? 'Nivel agregado en rango favorable'
                    : 'Nivel agregado en observación preventiva'}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Campañas con datos publicables</div>
          <div className="kpi-value">{loading ? '...' : 'N/D'}</div>
          <div className="kpi-delta warn">
            <span>El contrato actual no publica un conteo por campaña.</span>
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
              {env.useMockStorage ? 'Ejemplo ilustrativo de distribución por categorías.' : 'Esta distribución no forma parte de los datos agregados disponibles.'}
            </p>
          </div>
          {env.useMockStorage && <span className="privacy-badge">Muestra ilustrativa N = {cohortSize}</span>}
        </div>

        {env.useMockStorage ? <HeatmapGrid categories={nlpCategories} minThreshold={minThreshold} /> : <p>El servidor no publica una distribución agregada de NLP en esta versión.</p>}
      </div>

      {/* Mapa de Calor de Dimensiones Ocupacionales por Campaña */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Dimensiones ocupacionales prioritarias</h2>
            <p className="card-subtitle">
              Dimensiones del check-in agregado. Estas respuestas no equivalen a una batería clínica validada.
            </p>
          </div>
          <span className="badge badge-info">Ámbito organizacional</span>
        </div>

        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--c-texto-suave)' }}>
            <Icon name="refresh" size={24} className="icon-spin" />
            <p style={{ marginTop: 'var(--space-2)' }}>Consultando dimensiones colectivas...</p>
          </div>
        ) : isProtected || cohortSize < minThreshold || minThreshold < 5 ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--c-texto-suave)' }}>
             <Icon name="lock" size={24} style={{ marginBottom: '8px' }} />
             <p><strong>Privacidad Protegida</strong></p>
             <p>{reason || `Los datos de esta cohorte están protegidos. No se cuenta con suficientes datos para cumplir el umbral de k-anonimato (N = ${cohortSize} < ${Math.max(5, minThreshold)}).`}</p>
          </div>
        ) : cohortSize === 0 ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--c-texto-suave)' }}>
            <Icon name="info" size={24} style={{ marginBottom: '8px' }} />
            <p><strong>Sin registros disponibles</strong></p>
            <p>No se registran datos suficientes en la cohorte para desplegar factores ocupacionales agregados.</p>
          </div>
        ) : (
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
                  <td>{toScore100(metrics?.recuperacion ?? metrics?.recuperacion_avg) == null ? 'N/D' : `${toScore100(metrics?.recuperacion ?? metrics?.recuperacion_avg)} / 100`}</td>
                  <td>
                    <span className={`badge badge-${toScore100(metrics?.recuperacion ?? metrics?.recuperacion_avg) < 60 ? 'warn' : 'ok'}`}>
                      {(metrics?.recuperacion ?? metrics?.recuperacion_avg) == null ? 'N/D' : toScore100(metrics?.recuperacion ?? metrics?.recuperacion_avg) < 60 ? 'Medio-Bajo' : 'Favorable'}
                    </span>
                  </td>
                  <td>N/D</td>
                  <td>Coordinación de pausas activas y descansos escalonados</td>
                </tr>
                <tr>
                  <td>
                    <strong>Carga emocional agregada</strong>
                  </td>
                  <td>{toScore100(metrics?.carga_emocional ?? metrics?.carga_emocional_avg) == null ? 'N/D' : `${toScore100(metrics?.carga_emocional ?? metrics?.carga_emocional_avg)} / 100`}</td>
                  <td>
                    <span className={`badge badge-${toScore100(metrics?.carga_emocional ?? metrics?.carga_emocional_avg) > 70 ? 'danger' : 'warn'}`}>
                      {(metrics?.carga_emocional ?? metrics?.carga_emocional_avg) == null ? 'N/D' : toScore100(metrics?.carga_emocional ?? metrics?.carga_emocional_avg) > 70 ? 'Alto' : 'Medio'}
                    </span>
                  </td>
                  <td>{env.useMockStorage ? 'Ejemplo de tendencia: estable en nivel elevado' : 'Sin serie histórica disponible'}</td>
                  <td>Taller de contención emocional en colas de retención</td>
                </tr>
                <tr>
                  <td>
                    <strong>Apoyo social entre pares</strong>
                  </td>
                  <td>{toScore100(metrics?.apoyo ?? metrics?.apoyo_avg) == null ? 'N/D' : `${toScore100(metrics?.apoyo ?? metrics?.apoyo_avg)} / 100`}</td>
                  <td>
                    <span className={`badge badge-${toScore100(metrics?.apoyo ?? metrics?.apoyo_avg) >= 70 ? 'ok' : 'warn'}`}>
                      {(metrics?.apoyo ?? metrics?.apoyo_avg) == null ? 'N/D' : toScore100(metrics?.apoyo ?? metrics?.apoyo_avg) >= 70 ? 'Favorable' : 'En observación'}
                    </span>
                  </td>
                  <td>{env.useMockStorage ? 'Ejemplo de muestra: +1.8%' : 'Sin serie histórica disponible'}</td>
                  <td>Mantener dinámicas de inicio de jornada</td>
                </tr>
                {env.useMockStorage && <>
                <tr>
                  <td>
                    <strong>Conflicto y ambigüedad de rol</strong>
                  </td>
                  <td>{toScore100(metrics?.ineficacia ?? metrics?.distanciamiento, 0)} / 100</td>
                  <td>
                    <span className="badge badge-info">Medio</span>
                  </td>
                  <td>Estable</td>
                  <td>Alineación de criterios operativos con supervisores</td>
                </tr>
                </>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
