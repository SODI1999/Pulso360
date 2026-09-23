// src/features/reports/components/ReportPreviewCard.jsx
// Tarjeta modular de previsualización en vivo de reportes consolidados (RF-12)

export function ReportPreviewCard({
  scopeLabel = '',
  period = '',
  minThreshold = 5,
  sections = { energia: true, carga: true, recuperacion: true, participacion: true },
  requesterName = '',
  nlpVersion = 'v1.0-lex'
}) {
  return (
    <div className="reports-preview-card">
      <div className="reports-preview-header">
        <div>
          <div
            style={{
              fontSize: '13px',
              color: 'var(--c-primario)',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}
          >
            Previsualización en tiempo real
          </div>
          <h3 style={{ fontSize: '18px', margin: '2px 0 0', color: 'var(--c-texto)' }}>
            Pulso360 · Reporte consolidado
          </h3>
          <div style={{ fontSize: '13px', color: 'var(--c-texto-suave)', marginTop: '2px' }}>
            {scopeLabel} · {period}
          </div>
        </div>
        <span className="badge badge-ok">Umbral vigente N &ge; {minThreshold}</span>
      </div>

      {/* Grid de Indicadores Previsualizados */}
      <div className="reports-kpis-container">
        {sections.energia && (
          <div className="reports-kpi-item">
            <div className="reports-kpi-label">Energía agregada</div>
            <div className="reports-kpi-value">76</div>
          </div>
        )}
        {sections.carga && (
          <div className="reports-kpi-item">
            <div className="reports-kpi-label">Carga emocional agregada</div>
            <div className="reports-kpi-value">68</div>
          </div>
        )}
        {sections.recuperacion && (
          <div className="reports-kpi-item">
            <div className="reports-kpi-label">Recuperación agregada</div>
            <div className="reports-kpi-value">58</div>
          </div>
        )}
        {sections.participacion && (
          <div className="reports-kpi-item">
            <div className="reports-kpi-label">Participación promedio</div>
            <div className="reports-kpi-value">92%</div>
          </div>
        )}
      </div>

      <div className="reports-meta-footer">
        Documento institucional confidencial · Indicadores agregados · Solicitado por:{' '}
        <strong>{requesterName}</strong> · Modelo de análisis: {nlpVersion}. No contiene bitácoras privadas,
        check-ins individuales ni solicitudes de acompañamiento.
      </div>
    </div>
  );
}
