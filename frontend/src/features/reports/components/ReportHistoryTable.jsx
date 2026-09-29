// src/features/reports/components/ReportHistoryTable.jsx
// Tabla abierta con el historial de exportaciones realizadas y hash criptográfico demo (RF-12, Sin Carditis)

export function ReportHistoryTable({ reportHistory = [] }) {
  return (
    <section className="reports-history-section" aria-labelledby="historyTableTitle">
      <div className="reports-history-header">
        <div>
          <h2 id="historyTableTitle" className="reports-history-title">
            Historial de exportaciones realizadas
          </h2>
          <p className="reports-history-subtitle">
            Registro de reportes generados con trazabilidad de hash demo (RF-12).
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
                  Aún no se han generado exportaciones de reportes en esta sesión.
                </td>
              </tr>
            ) : (
              reportHistory.map((rep) => {
                const dateFormatted = new Intl.DateTimeFormat('es-CO', {
                  dateStyle: 'short',
                  timeStyle: 'short'
                }).format(new Date(rep.date));

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
