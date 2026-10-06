// src/features/auditor/components/AuditLogTable.jsx
// Tabla modular de eventos auditables con filtros reactivos (RF-13)

export function AuditLogTable({
  logs = [],
  integrityStatus = { checked: false, valid: true, message: 'Cadena inmutable activa' },
  searchTerm = '',
  onSearchChange = () => {},
  statusFilter = 'ALL',
  onStatusFilterChange = () => {}
}) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Eventos del sistema registrados</div>
          <div className="card-subtitle">Cadena encadenada de metadatos de operaciones críticas (RF-13).</div>
        </div>
        <span
          className={`badge ${integrityStatus.checked ? (integrityStatus.valid ? 'badge-ok' : 'badge-danger') : 'badge-info'}`}
        >
          {integrityStatus.message}
        </span>
      </div>

      {/* Barra de Filtros */}
      <div className="audit-filter-bar">
        <input
          type="search"
          className="form-input audit-filter-input"
          placeholder="Buscar por ID, actor, acción, objetivo o IP..."
          aria-label="Buscar en los eventos cargados"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <select
          className="form-select audit-filter-select"
          aria-label="Resultado de los eventos cargados"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          <option value="ALL">Todos los resultados</option>
          <option value="EXITO">Solo Éxito</option>
          <option value="DENEGADO">Solo Denegado</option>
          <option value="NO_REGISTRADO">Resultado no registrado</option>
        </select>
      </div>

      {/* Tabla de Eventos */}
      <p className="form-hint">Los filtros se aplican a los eventos cargados. “No registrado” indica que el evento no contiene un resultado; no se presume éxito.</p>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID Evento</th>
              <th>Fecha y Hora</th>
              <th>Actor Responsable</th>
              <th>Acción Ejecutada</th>
              <th>Objetivo / Entidad</th>
              <th>Dirección IP</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--c-texto-suave)' }}
                >
                  No se encontraron registros de auditoría que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const isDeny = log.status === 'DENEGADO';
                return (
                  <tr key={log.id}>
                    <td>
                      <span className="audit-code-cell">{log.id}</span>
                    </td>
                    <td>{log.date}</td>
                    <td>
                      <strong>{log.actor}</strong>
                    </td>
                    <td>
                      <span className="badge badge-info">{log.action}</span>
                    </td>
                    <td>{log.target}</td>
                    <td>
                      <span className="audit-code-cell">{log.ip}</span>
                    </td>
                    <td>
                      <span className={`badge ${isDeny ? 'badge-danger' : log.status === 'EXITO' ? 'badge-ok' : 'badge-info'}`}>{log.status === 'NO_REGISTRADO' ? 'No registrado' : log.status === 'EXITO' ? 'Éxito' : log.status === 'DENEGADO' ? 'Denegado' : log.status}</span>
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
