// src/core/components/TrendLineChart.jsx
// Renderizado de gráficos de tendencias en Canvas 2D nativo (Cero dependencias externas pesadas)

import { useEffect, useRef } from 'react';

export function TrendLineChart({
  labels = [],
  values = [],
  dataPoints,
  strokeColor = '#006a61',
  color,
  height = 180,
  className = ''
}) {
  const canvasRef = useRef(null);
  const chartValues = dataPoints && dataPoints.length > 0 ? dataPoints : values;
  const activeColor = color || strokeColor;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;
    const width = parent?.clientWidth || 400;

    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    if (!chartValues.length) return;

    const padding = 30;
    const chartWidth = Math.max(1, width - padding * 2);
    const chartHeight = Math.max(1, height - padding * 2);

    const maxValue = Math.max(...chartValues, 5);
    const minValue = 0;

    // 1. Línea base del eje X
    ctx.strokeStyle = '#e0e3e5';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // 2. Calcular coordenadas (x, y) para cada punto de datos
    const points = chartValues.map((value, index) => {
      const denominator = chartValues.length > 1 ? chartValues.length - 1 : 1;
      const x = padding + (index / denominator) * chartWidth;
      const y = height - padding - ((value - minValue) / (maxValue - minValue)) * chartHeight;
      return { x, y, value };
    });

    // 3. Dibujar la línea de tendencia
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();

    // 4. Dibujar puntos circulares y etiquetas numéricas
    points.forEach((point, index) => {
      // Punto exterior
      ctx.fillStyle = activeColor;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Etiqueta del eje X
      ctx.fillStyle = '#45464d';
      ctx.font = '11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      if (labels[index]) {
        ctx.fillText(labels[index], point.x, height - 10);
      }

      // Valor numérico flotante sobre el punto
      ctx.fillText(String(point.value), point.x, point.y - 8);
    });
  }, [labels, chartValues, activeColor, height]);

  return (
    <div
      style={{ width: '100%', position: 'relative' }}
      className={className}
      role="figure"
      aria-label="Gráfico de tendencia mostrando la evolución de los indicadores"
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: `${height}px` }} aria-hidden="true" />
      <table className="sr-only">
        <caption>Datos del gráfico de tendencia</caption>
        <thead>
          <tr>
            <th scope="col">Fecha</th>
            <th scope="col">Valor</th>
          </tr>
        </thead>
        <tbody>
          {chartValues.map((val, idx) => (
            <tr key={idx}>
              <td>{labels[idx] || `Punto ${idx + 1}`}</td>
              <td>{val}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
