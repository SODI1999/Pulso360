/**
 * Data inventory summary card displaying counts and date ranges of user personal records.
 * Covers check-ins, journals, support requests, and active informed consent status.
 *
 * @param {Object} props - Component properties.
 * @param {Object} props.summary - Summary metrics object (checkins, journals, support, consent).
 * @param {(items: Array<any>, field: string) => string} props.calculateDateRange - Helper formatting date ranges.
 * @param {(dateStr: string) => string} props.formatDate - Helper formatting ISO dates to readable locale format.
 * @returns {import('react').JSX.Element} Personal data inventory card.
 */
export function PrivacySummary({ summary, calculateDateRange, formatDate }) {
  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div className="card-header">
        <div>
          <div className="card-title">Inventario de información propia registrada</div>
          <div className="card-subtitle">
            Los conteos y rangos corresponden exclusivamente a los registros asociados con tu cuenta.
          </div>
        </div>
      </div>

      <div className="kpi-grid" id="inventory">
        <div className="kpi-card">
          <div className="kpi-label">Check-ins</div>
          <div className="kpi-value">{summary.checkins.length}</div>
          <div style={{ fontSize: '11px', color: 'var(--c-texto-suave)', marginTop: '4px' }}>
            {calculateDateRange(summary.checkins, 'date')}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Bitácoras</div>
          <div className="kpi-value">{summary.journals.length}</div>
          <div style={{ fontSize: '11px', color: 'var(--c-texto-suave)', marginTop: '4px' }}>
            {calculateDateRange(summary.journals, 'date')}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Solicitudes de apoyo</div>
          <div className="kpi-value">{summary.support.length}</div>
          <div style={{ fontSize: '11px', color: 'var(--c-texto-suave)', marginTop: '4px' }}>
            {calculateDateRange(summary.support, 'date')}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Consentimiento</div>
          <div className="kpi-value" style={{ fontSize: '16px' }}>
            {summary.consent?.policyAccepted ? 'Vigente' : 'Pendiente'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--c-texto-suave)', marginTop: '4px' }}>
            {summary.consent?.updatedAt
              ? `Actualizado ${formatDate(summary.consent.updatedAt)}`
              : 'Sin aceptación vigente'}
          </div>
        </div>
      </div>
    </div>
  );
}
