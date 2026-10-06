// src/features/reports/components/ReportHistoryTable.jsx
// Tabla abierta con el historial de exportaciones realizadas y hash criptográfico demo (RF-12, Sin Carditis)

export function ReportHistoryTable({ reportHistory = [], loading, error }) {
  if (loading) return <p role="status">Cargando historial de reportes…</p>;
  if (error) return <p className="alert-banner danger" role="alert">No se pudo cargar el historial: {error}</p>;
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
    </section>
  );
}
