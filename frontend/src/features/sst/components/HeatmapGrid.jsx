// src/features/sst/components/HeatmapGrid.jsx
// Mapa de calor y distribución agregada de categorías NLP con supresión primaria y secundaria (RF-07)

import { useMemo } from 'react';
import '../../../styles/umbral.css';

export function HeatmapGrid({ categories = [], minThreshold = 5 }) {
  // Aplicar algoritmo estricto de privacidad y supresión secundaria (RF-07)
  const processedCategories = useMemo(() => {
    // 1. Supresión primaria: conteo < umbral mínimo
    const rows = categories.map((cat, index) => ({
      ...cat,
      index,
      suppressed: Number(cat.count || 0) < minThreshold
    }));

    // 2. Supresión secundaria: si hay al menos una categoría oculta, ocultar también la menor de las visibles
    if (rows.some((r) => r.suppressed)) {
      const visible = rows.filter((r) => !r.suppressed);
      if (visible.length > 0) {
        // Encontrar la visible con menor conteo
        const lowestVisible = [...visible].sort((a, b) => Number(a.count || 0) - Number(b.count || 0))[0];
        if (lowestVisible) {
          lowestVisible.suppressed = true;
        }
      }
    }

    // 3. Redondear porcentajes al entero más cercano
    return rows.map((r) => ({
      ...r,
      roundedPercent: r.suppressed ? null : Math.round(Number(r.percent || 0))
    }));
  }, [categories, minThreshold]);

  // Nivel de color de severidad según porcentaje agregado
  const getSeverityClass = (percent) => {
    if (percent <= 15) return 'bajo';
    if (percent <= 25) return 'medio-bajo';
    if (percent <= 35) return 'medio';
    if (percent <= 45) return 'alto';
    return 'critico';
  };

  return (
    <div className="heatmap-grid" role="region" aria-label="Distribución agregada de factores NLP">
      {processedCategories.map((item) => {
        if (item.suppressed) {
          return (
            <div
              key={item.name}
              className="heatmap-cell"
              aria-label={`${item.name}: categoría suprimida por confidencialidad`}
            >
              <div className="heatmap-dim-name">{item.name}</div>
              <div className="heatmap-score-bar">
                <div className="heatmap-score-fill medio" style={{ width: '100%', opacity: 0.25 }} />
              </div>
              <div className="heatmap-footer">
                <span>—</span>
                <span style={{ color: 'var(--c-texto-mutado)' }}>Suprimida por confidencialidad</span>
              </div>
            </div>
          );
        }

        const severityClass = getSeverityClass(item.roundedPercent);

        return (
          <div
            key={item.name}
            className="heatmap-cell"
            aria-label={`${item.name}: ${item.roundedPercent}% agregado`}
          >
            <div className="heatmap-dim-name">{item.name}</div>
            <div className="heatmap-score-bar">
              <div
                className={`heatmap-score-fill ${severityClass}`}
                style={{ width: `${Math.min(100, Math.max(0, item.roundedPercent))}%` }}
              />
            </div>
            <div className="heatmap-footer">
              <span style={{ fontWeight: '700', color: 'var(--c-texto)' }}>{item.roundedPercent}%</span>
              <span>Porcentaje redondeado</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
