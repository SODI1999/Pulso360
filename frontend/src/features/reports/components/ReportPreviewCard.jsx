// src/features/reports/components/ReportPreviewCard.jsx
// Tarjeta modular de previsualización en vivo de reportes consolidados (RF-12)

export function ReportPreviewCard({
  scopeLabel = '',
  period = '',
  minThreshold = 5,
  sections = { energia: true, carga: true, recuperacion: true, participacion: true },
  requesterName = '',
  nlpVersion = null,
  metrics = null
}) {
  const hasData = metrics && Object.keys(metrics).length > 0;

  return (
    <div className="reports-preview-card">
      <div className="reports-preview-header">
        <div>
          <div className="reports-preview-eyebrow">
            Snapshot del reporte generado
          </div>
          <h3 className="reports-preview-title">
            Pulso360 · Reporte consolidado
          </h3>
          <div className="reports-preview-meta">
            {scopeLabel} · {period}
          </div>
        </div>
        <span className="badge badge-ok">Umbral vigente N &ge; {minThreshold}</span>
      </div>

      {/* Grid de Indicadores Previsualizados */}
      {!hasData ? (
        <div className="reports-meta-footer" style={{ padding: '2rem 1rem', textAlign: 'center', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Genera el reporte para consultar el snapshot guardado por el servidor.</p>
        </div>
      ) : (
        <div className="reports-kpis-container">
          {sections.energia && (
            <div className="reports-kpi-item">
              <div className="reports-kpi-label">Energía agregada</div>
              <div className="reports-kpi-value">{metrics.energia == null ? 'N/D' : `${metrics.energia} / 5`}</div>
            </div>
          )}
          {sections.carga && (
            <div className="reports-kpi-item">
              <div className="reports-kpi-label">Carga emocional agregada</div>
              <div className="reports-kpi-value">{metrics.carga == null ? 'N/D' : `${metrics.carga} / 5`}</div>
            </div>
          )}
          {sections.recuperacion && (
            <div className="reports-kpi-item">
              <div className="reports-kpi-label">Recuperación agregada</div>
              <div className="reports-kpi-value">{metrics.recuperacion == null ? 'N/D' : `${metrics.recuperacion} / 5`}</div>
            </div>
          )}
          {sections.participacion && (
            <div className="reports-kpi-item">
              <div className="reports-kpi-label">Participación promedio</div>
              <div className="reports-kpi-value">{metrics.participacion == null ? 'N/D' : `${metrics.participacion}%`}</div>
            </div>
          )}
        </div>
      )}

      <div className="reports-meta-footer">
        Documento institucional confidencial · Indicadores agregados · Solicitado por:{' '}
        <strong>{requesterName}</strong> · Versionado léxico: {nlpVersion || 'No incluido en este reporte'}. No contiene bitácoras privadas,
        check-ins individuales ni solicitudes de acompañamiento.
      </div>
    </div>
  );
}
