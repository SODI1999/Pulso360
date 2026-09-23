// src/features/supervisor/components/TeamKpiGrid.jsx
// Banda ejecutiva de métricas e indicadores colectivos del equipo de trabajo (RF-07 / RF-11)

import { Icon } from '../../../core/components/Icon';

export function TeamKpiGrid({
  energyIndex = 76.2,
  energyDelta = '+2.1% frente a semana previa',
  overloadIndex = 68.5,
  participationRate = '87.5%'
}) {
  return (
    <div className="supervisor-metrics-strip" role="region" aria-label="Indicadores clave del equipo">
      {/* Métrica 1: Energía Agregada */}
      <div className="supervisor-metric-cell">
        <span className="supervisor-metric-label">Índice de Energía Agregado</span>
        <div className="supervisor-kpi-highlight">
          {energyIndex}
          <span className="supervisor-kpi-unit">/ 100</span>
        </div>
        <div className="kpi-delta ok">
          <Icon name="trendingUp" size={15} />
          <span>{energyDelta}</span>
        </div>
      </div>

      {/* Métrica 2: Percepción de Sobrecarga */}
      <div className="supervisor-metric-cell">
        <span className="supervisor-metric-label">Percepción de Sobrecarga</span>
        <div className="supervisor-kpi-highlight warn">
          {overloadIndex}
          <span className="supervisor-kpi-unit">/ 100</span>
        </div>
        <div className="kpi-delta warn">
          <Icon name="alertTriangle" size={15} />
          <span>Tendencia por encima del umbral</span>
        </div>
      </div>

      {/* Métrica 3: Participación Voluntaria */}
      <div className="supervisor-metric-cell">
        <span className="supervisor-metric-label">Participación voluntaria</span>
        <div className="supervisor-kpi-highlight">{participationRate}</div>
        <div className="kpi-delta ok">
          <Icon name="checkCircle" size={15} />
          <span>Muestra protegida por k-anonimato (RF-07)</span>
        </div>
      </div>
    </div>
  );
}
