// src/features/reports/components/ReportPreviewCard.jsx
// Tarjeta modular de previsualización en vivo de reportes consolidados (RF-12)

import { Icon } from '../../../core/components/Icon';

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
            {hasData ? 'Snapshot del reporte generado' : 'Estructura proyectada del reporte'}
          </div>
          <h3 className="reports-preview-title">
            Pulso360 · Reporte consolidado
          </h3>
          <div className="reports-preview-meta">
            {scopeLabel || 'Ámbito seleccionado'} · {period || 'Periodo activo'}
          </div>
        </div>
        <span className="badge badge-ok">Umbral vigente N &ge; {minThreshold}</span>
      </div>

      {/* Grid de Indicadores Previsualizados */}
      {!hasData ? (
        <div className="reports-pending-preview">
          <div className="reports-pending-notice">
            <Icon name="summarize" size={20} />
            <div>
              <p className="reports-pending-title">Estructura preparada para consolidación</p>
              <p className="reports-pending-desc">
                Presiona <strong>Generar y exportar reporte</strong> para calcular los indicadores agregados del corte seleccionado.
              </p>
            </div>
          </div>
          <div className="reports-kpis-container reports-kpis-placeholder">
            {sections.energia && (
              <div className="reports-kpi-item is-placeholder">
                <div className="reports-kpi-label">Energía agregada</div>
                <div className="reports-kpi-value">— / 5</div>
              </div>
            )}
            {sections.carga && (
              <div className="reports-kpi-item is-placeholder">
                <div className="reports-kpi-label">Carga emocional agregada</div>
                <div className="reports-kpi-value">— / 5</div>
              </div>
            )}
            {sections.recuperacion && (
              <div className="reports-kpi-item is-placeholder">
                <div className="reports-kpi-label">Recuperación agregada</div>
                <div className="reports-kpi-value">— / 5</div>
              </div>
            )}
            {sections.participacion && (
              <div className="reports-kpi-item is-placeholder">
                <div className="reports-kpi-label">Participación promedio</div>
                <div className="reports-kpi-value">— %</div>
              </div>
            )}
          </div>
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
