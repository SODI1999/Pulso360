// src/features/agent/components/WellbeingHistory.jsx
// Sección de tendencia de vitalidad con gráfico interactivo curvo y síntesis de ciclo.

import { Icon } from '../../../core/components/Icon';
import { WellbeingTrendChart } from './WellbeingTrendChart';
import { getVitalitySummary } from '../services/myWellbeingHelpers';

export function WellbeingHistory({
  recentShifts = [],
  averageEnergy,
  selectedShiftId,
  onSelectShift
}) {
  const summary = getVitalitySummary(averageEnergy, recentShifts);

  return (
    <section className="wellbeing-section" aria-labelledby="trend-heading">
      <div className="wellbeing-section-header">
        <div className="wellbeing-section-title-wrap">
          <h2 id="trend-heading" className="wellbeing-section-title">
            <Icon name="LineChart" size={18} aria-hidden="true" />
            <span>Tendencia de vitalidad en el ciclo reciente</span>
          </h2>
          <p className="wellbeing-section-desc">
            Haz clic en cualquier punto del gráfico para inspeccionar el desglose somático de esa jornada.
          </p>
        </div>
      </div>

      <div className="wellbeing-trend-layout">
        {/* Gráfico Curvo Interactivo con Bezier Spline y Gradiente */}
        <div className="wellbeing-trend-canvas-wrap">
          <WellbeingTrendChart
            shifts={recentShifts}
            selectedShiftId={selectedShiftId}
            onSelectShift={onSelectShift}
            height={200}
          />
        </div>

        {/* Síntesis Ejecutiva del Ciclo */}
        <div className="wellbeing-vitality-card">
          <div className="wellbeing-vitality-header">
            <span className="wellbeing-vitality-kicker">Trayectoria</span>
            <span className={`wellbeing-vitality-tag wellbeing-vitality-tag--${summary.tone}`}>
              {summary.badge}
            </span>
          </div>

          <h3 className="wellbeing-vitality-title">{summary.title}</h3>
          <p className="wellbeing-vitality-desc">{summary.description}</p>

          <div className="wellbeing-vitality-metrics">
            <div className="wellbeing-vitality-metric-item">
              <span className="wellbeing-metric-label">Promedio de energía</span>
              <span className="wellbeing-metric-val">
                {averageEnergy == null ? '–' : averageEnergy}
                <span className="wellbeing-metric-unit">/ 5</span>
              </span>
            </div>
            <div className="wellbeing-vitality-metric-item">
              <span className="wellbeing-metric-label">Jornadas monitoreadas</span>
              <span className="wellbeing-metric-val">
                {recentShifts.length}
                <span className="wellbeing-metric-unit">turnos</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
