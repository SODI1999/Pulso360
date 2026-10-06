import { Icon } from '../../../core/components/Icon';
import { TrendLineChart } from '../../../core/components/TrendLineChart';

export function WellbeingHistory({ trendData, averageEnergy }) {
  return (
    <section className="wellbeing-section" aria-labelledby="trend-heading">
      <div className="wellbeing-section-header">
        <div className="wellbeing-section-title-wrap">
          <h2 id="trend-heading" className="wellbeing-section-title">
            <Icon name="monitoring" size={18} aria-hidden="true" />
            <span>Tendencia de energía y batería de turno</span>
          </h2>
          <p className="wellbeing-section-desc">
            Evolución de vitalidad autorreportada en tus turnos recientes.
          </p>
        </div>
      </div>

      <div className="wellbeing-trend-canvas-wrap">
        <TrendLineChart
          labels={trendData.labels}
          values={trendData.values}
          strokeColor="#0f766e"
          height={190}
        />
        <div className="wellbeing-trend-footer">
          <span>Escala: 1 (Sin batería) a 5 (Plena y enfocado)</span>
          <span>
            Promedio de energía disponible en los últimos {trendData.labels.length} turnos: <strong>{averageEnergy == null ? 'Sin dato' : `${averageEnergy} / 5`}</strong>
          </span>
        </div>
      </div>
    </section>
  );
}
