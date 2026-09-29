export function ConsentHistory({ history, formatDateTime }) {
  return (
    <section className="consent-audit-section" aria-labelledby="history-heading">
      <div className="consent-audit-header">
        <div>
          <h2 id="history-heading" className="consent-section-heading">
            Historial de cambios
          </h2>
          <p className="consent-section-caption">
            Registro temporal inmutable de cada actualización efectuada por el titular en su estación.
          </p>
        </div>
        <span className="consent-audit-counter">
          {history.length} {history.length === 1 ? 'evento registrado' : 'eventos registrados'}
        </span>
      </div>

      <div
        className="consent-table-container"
        tabIndex={0}
        role="region"
        aria-label="Historial de consentimientos registrados"
      >
        <table className="consent-audit-table">
          <thead>
            <tr>
              <th scope="col">Versión</th>
              <th scope="col">Fecha y hora</th>
              <th scope="col">C1 Check-in</th>
              <th scope="col">C2 Bitácora</th>
              <th scope="col">C3 NLP</th>
              <th scope="col">C4 Agregados</th>
              <th scope="col">C5 Acompañamiento</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan="7" className="consent-table-empty-cell">
                  Aún no hay registros de consentimiento guardados. Al confirmar tus preferencias, se creará
                  el primer registro fechado aquí.
                </td>
              </tr>
            ) : (
              history.map((item, idx) => (
                <tr key={item.updatedAt || idx}>
                  <td className="consent-col-version">{item.policyVersion}</td>
                  <td className="consent-col-date">
                    <time dateTime={item.updatedAt}>{formatDateTime(item.updatedAt)}</time>
                  </td>
                  <td>
                    <span className={`consent-state-tag ${item.c1 ? 'is-active' : 'is-paused'}`}>
                      {item.c1 ? 'Autorizado' : 'Pausado'}
                    </span>
                  </td>
                  <td>
                    <span className={`consent-state-tag ${item.c2 ? 'is-active' : 'is-paused'}`}>
                      {item.c2 ? 'Autorizado' : 'Pausado'}
                    </span>
                  </td>
                  <td>
                    <span className={`consent-state-tag ${item.c3 ? 'is-active' : 'is-paused'}`}>
                      {item.c3 ? 'Autorizado' : 'Pausado'}
                    </span>
                  </td>
                  <td>
                    <span className={`consent-state-tag ${item.c4 ? 'is-active' : 'is-paused'}`}>
                      {item.c4 ? 'Autorizado' : 'Pausado'}
                    </span>
                  </td>
                  <td>
                    <span className={`consent-state-tag ${item.c5 ? 'is-active' : 'is-paused'}`}>
                      {item.c5 ? 'Autorizado' : 'Pausado'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
