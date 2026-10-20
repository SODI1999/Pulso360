import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * High-performance HTML5 Canvas interactive chart for agent weekly vitality trends.
 * Features smooth cubic Bezier splines, soft gradient fills, hover tooltips, and responsive DPI scaling.
 *
 * @param {Object} props - Component properties.
 * @param {Array<Object>} [props.shifts=[]] - Shift records to render.
 * @param {string|null} [props.selectedShiftId] - Currently selected shift identifier.
 * @param {(id: string) => void} [props.onSelectShift] - Shift click callback.
 * @param {number} [props.height=220] - Canvas height in pixels.
 * @param {string} [props.className=''] - Optional wrapper CSS class name.
 * @returns {import('react').JSX.Element} Interactive canvas trend chart.
 */
export function WellbeingTrendChart({
  shifts = [],
  selectedShiftId,
  onSelectShift,
  height = 220,
  className = ''
}) {
  const canvasRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Orden cronológico para el gráfico (más antiguo a la izquierda, más reciente a la derecha)
  const orderedShifts = [...shifts].reverse();

  // Función para obtener coordenadas x, y
  const getCoordinates = useCallback(
    (width, chartHeight, padding) => {
      const chartWidth = Math.max(1, width - padding.left - padding.right);
      const innerHeight = Math.max(1, chartHeight - padding.top - padding.bottom);
      const count = orderedShifts.length;
      const step = count > 1 ? chartWidth / (count - 1) : 0;

      return orderedShifts.map((shift, idx) => {
        const val = shift.energia != null && Number.isFinite(shift.energia) ? shift.energia : null;
        const x = count === 1 ? padding.left + chartWidth / 2 : padding.left + idx * step;
        // Escala fija de 1 a 5 con margen para que no toque los bordes
        const y = val != null ? padding.top + innerHeight - ((val - 1) / 4) * innerHeight : null;
        return { x, y, val, shift };
      });
    },
    [orderedShifts]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const width = parent?.clientWidth || 580;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (orderedShifts.length === 0) return;

    const padding = { top: 28, right: 32, bottom: 44, left: 52 };
    const innerHeight = height - padding.top - padding.bottom;

    // 1. Líneas Guía Horizontales de Referencia (Niveles 1 a 5)
    const scaleLevels = [
      { val: 5, label: '5 · Plena' },
      { val: 4, label: '4' },
      { val: 3, label: '3 · Media' },
      { val: 2, label: '2' },
      { val: 1, label: '1 · Baja' }
    ];

    ctx.font = '10.5px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    scaleLevels.forEach((lvl) => {
      const y = padding.top + innerHeight - ((lvl.val - 1) / 4) * innerHeight;

      // Línea horizontal punteada
      ctx.strokeStyle = lvl.val === 3 ? '#cbd5e1' : '#f1f5f9';
      ctx.lineWidth = 1;
      ctx.setLineDash(lvl.val === 3 ? [4, 4] : [2, 4]);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Etiqueta del eje Y
      ctx.fillText(lvl.label, padding.left - 10, y);
    });

    ctx.setLineDash([]); // Restaurar línea continua

    // 2. Calcular Puntos de Datos
    const points = getCoordinates(width, height, padding);
    const validPoints = points.filter((p) => p.y != null);

    if (validPoints.length >= 2) {
      // 3. Área con Degradado Suave bajo la Curva
      const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
      gradient.addColorStop(0, 'rgba(15, 118, 110, 0.22)');
      gradient.addColorStop(0.7, 'rgba(15, 118, 110, 0.05)');
      gradient.addColorStop(1, 'rgba(15, 118, 110, 0.00)');

      ctx.beginPath();
      ctx.moveTo(validPoints[0].x, height - padding.bottom);
      ctx.lineTo(validPoints[0].x, validPoints[0].y);

      for (let i = 0; i < validPoints.length - 1; i++) {
        const p0 = validPoints[i];
        const p1 = validPoints[i + 1];
        const cpX = (p0.x + p1.x) / 2;
        ctx.bezierCurveTo(cpX, p0.y, cpX, p1.y, p1.x, p1.y);
      }

      ctx.lineTo(validPoints[validPoints.length - 1].x, height - padding.bottom);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // 4. Trazo Principal Curvo (Bezier Spline)
      ctx.beginPath();
      ctx.moveTo(validPoints[0].x, validPoints[0].y);

      for (let i = 0; i < validPoints.length - 1; i++) {
        const p0 = validPoints[i];
        const p1 = validPoints[i + 1];
        const cpX = (p0.x + p1.x) / 2;
        ctx.bezierCurveTo(cpX, p0.y, cpX, p1.y, p1.x, p1.y);
      }

      ctx.strokeStyle = '#0f766e';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // 5. Dibujar Puntos, Halo Activo y Etiquetas del Eje X
    points.forEach((pt, idx) => {
      const isSelected = pt.shift?.id === selectedShiftId;
      const isHovered = hoveredIndex === idx;

      // Línea vertical guía en hover o selección
      if (isSelected || isHovered) {
        ctx.strokeStyle = isSelected ? 'rgba(15, 118, 110, 0.45)' : 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(pt.x, padding.top);
        ctx.lineTo(pt.x, height - padding.bottom);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Etiqueta del Eje X (Fecha)
      const parts = (pt.shift?.journeyKey || pt.shift?.date || '').split('-');
      const dateLabel = parts.length === 3 ? `${parts[2]}/${parts[1]}` : 'Turno';

      ctx.font = isSelected ? '700 11.5px system-ui, sans-serif' : '500 11px system-ui, sans-serif';
      ctx.fillStyle = isSelected ? '#0f766e' : '#64748b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(dateLabel, pt.x, height - padding.bottom + 8);

      if (pt.y == null) return;

      // Anillo exterior si está seleccionado
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 9, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 118, 110, 0.18)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 6.5, 0, Math.PI * 2);
        ctx.strokeStyle = '#0f766e';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Punto central
      const toneColor = pt.val <= 2 ? '#dc2626' : pt.val === 3 ? '#d97706' : '#0f766e';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isSelected || isHovered ? 4.5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = toneColor;
      ctx.stroke();

      // Indicador de valor flotante
      ctx.font = '700 11px system-ui, sans-serif';
      ctx.fillStyle = isSelected ? '#0f766e' : '#334155';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(String(pt.val), pt.x, pt.y - (isSelected ? 9 : 6));
    });

    // 6. Tooltip flotante interactivo en Hover
    if (hoveredIndex != null && points[hoveredIndex]) {
      const pt = points[hoveredIndex];
      const shift = pt.shift;
      const tooltipText = `${shift.date} · Vitalidad: ${pt.val ?? 'Sin dato'}/5`;
      ctx.font = '600 11px system-ui, sans-serif';
      const textWidth = ctx.measureText(tooltipText).width;
      const tooltipW = textWidth + 16;
      const tooltipH = 24;

      let ttX = pt.x - tooltipW / 2;
      ttX = Math.max(padding.left, Math.min(width - padding.right - tooltipW, ttX));
      const ttY = Math.max(4, pt.y - 36);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.roundRect(ttX, ttY, tooltipW, tooltipH, 4);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tooltipText, ttX + tooltipW / 2, ttY + tooltipH / 2);
    }
  }, [orderedShifts, selectedShiftId, hoveredIndex, height, getCoordinates]);

  // Manejo de eventos de ratón
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const width = rect.width;
    const padding = { top: 28, right: 32, bottom: 44, left: 52 };
    const points = getCoordinates(width, height, padding);

    let closestIdx = null;
    let minDist = 30;

    points.forEach((pt, idx) => {
      const dist = Math.abs(pt.x - mouseX);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });

    setHoveredIndex(closestIdx);
    canvas.style.cursor = closestIdx != null ? 'pointer' : 'default';
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const handleClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !onSelectShift) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const width = rect.width;
    const padding = { top: 28, right: 32, bottom: 44, left: 52 };
    const points = getCoordinates(width, height, padding);

    let closestIdx = null;
    let minDist = 32;

    points.forEach((pt, idx) => {
      const dist = Math.abs(pt.x - mouseX);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });

    if (closestIdx != null && points[closestIdx]?.shift) {
      onSelectShift(points[closestIdx].shift.id);
    }
  };

  return (
    <div
      style={{ width: '100%', position: 'relative' }}
      className={`wellbeing-chart-interactive-wrap ${className}`}
      role="region"
      aria-label="Gráfico interactivo de tendencia de vitalidad"
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{ display: 'block', width: '100%' }}
        aria-hidden="true"
      />
    </div>
  );
}
