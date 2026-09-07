// src/features/reports/components/ReportHistoryTable.jsx
// Tabla modular con el historial de exportaciones realizadas y hash criptográfico demo (RF-12)

export function ReportHistoryTable({ reportHistory = [] }) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Historial de exportaciones realizadas</h2>
          <div className="card-subtitle">Registro de reportes generados con trazabilidad de hash demo (RF-12).</div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Solicitante</th>
              <th>Alcance / Corte</th>
              <th>Formato</th>
              <th>Hash de Verificación</th>
            </tr>
          </thead>
          <tbody>
            {reportHistory.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--c-texto-suave)' }}>
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
                      <span className="audit-code-cell">{rep.hash}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
