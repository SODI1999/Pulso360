// src/features/reports/components/ReportHistoryTable.jsx
// Tabla abierta con el historial de exportaciones realizadas y hash criptográfico demo (RF-12, Sin Carditis)

import { Icon } from '../../../core/components/Icon';

export function ReportHistoryTable({ reportHistory = [], loading, error, onRetry }) {
  return (
    <section className="reports-history-section" aria-labelledby="historyTableTitle">
      <div className="reports-history-header">
        <div>
          <h2 id="historyTableTitle" className="reports-history-title">
            Historial de exportaciones realizadas
          </h2>
          <p className="reports-history-subtitle">
            Reportes persistidos, con periodo, ámbito y hash de su snapshot.
          </p>
        </div>
        <span className="badge badge-neutral">{reportHistory.length} registros</span>
      </div>

      {loading && (
        <div
          className="supervisor-loading"
          style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--c-texto-suave)' }}
          role="status"
          aria-live="polite"
        >
          <Icon name="refresh" size={20} className="icon-spin" />
          <p style={{ marginTop: 'var(--space-2)' }}>Cargando historial de reportes…</p>
        </div>
      )}

      {error && (
        <div
          className="alert-banner danger"
          role="alert"
          style={{
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <span>No se pudo cargar el historial: {error}</span>
          {onRetry && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
              Reintentar
            </button>
          )}
        </div>
      )}

      {!loading && !error && (
        <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Fecha y Hora</th>
              <th scope="col">Solicitante</th>
              <th scope="col">Alcance / Corte</th>
              <th scope="col">Formato</th>
              <th scope="col">Hash de Verificación</th>
            </tr>
          </thead>
          <tbody>
            {reportHistory.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--c-texto-suave)' }}
                >
                  Aún no hay reportes registrados para tus ámbitos autorizados.
                </td>
              </tr>
            ) : (
              reportHistory.map((rep) => {
                const rawDate = rep.createdAt || rep.created_at || rep.date || new Date().toISOString();
                let dateFormatted = '';
                try {
                  dateFormatted = new Intl.DateTimeFormat('es-CO', {
                    dateStyle: 'short',
                    timeStyle: 'short'
                  }).format(new Date(rawDate));
                } catch {
                  dateFormatted = String(rawDate);
                }

                return (
                  <tr key={rep.id}>
                    <td>{dateFormatted}</td>
                    <td>
                      <strong>{rep.user}</strong>
                    </td>
                    <td>{rep.scope}</td>
                    <td>
                      <span className="badge badge-neutral">{rep.format}</span>
                    </td>
                    <td>
                      <code className="audit-code-cell">{rep.hash}</code>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      )}
    </section>
  );
}
