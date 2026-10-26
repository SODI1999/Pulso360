// src/features/admin/components/CampaignCard.jsx
// Tarjeta ergonómica de Campaña con sub-tabla estructurada de Equipos (RF-15)

import { Icon } from '../../../core/components/Icon';

export function CampaignCard({
  c,
  isCampActive,
  setTeamModalState,
  setCampaignModalState,
  handleToggleCampaign,
  minThreshold,
  setAssignModalState,
  handleToggleTeam
}) {
  const teams = c.teams || [];
  const totalAgents = teams.reduce((acc, t) => acc + (t.n || 0), 0);

  return (
    <div className="card org-campaign-card">
      {/* Cabecera de Campaña */}
      <div className="org-campaign-header">
        <div className="org-campaign-title-group">
          <div className="org-campaign-title-row">
            <h2 className="card-title" style={{ margin: 0 }}>
              {c.name}
            </h2>
            <span className={`badge ${isCampActive ? 'badge-ok' : 'badge-danger'}`}>
              {isCampActive ? 'Activa' : 'Inactiva'}
            </span>
          </div>
          <p className="org-campaign-meta">
            {teams.length} {teams.length === 1 ? 'equipo' : 'equipos'} · {totalAgents} agentes en dotación total
          </p>
        </div>

        <div className="org-campaign-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setTeamModalState({ isOpen: true, campaign: c, team: null })}
          >
            <Icon name="plus" size={14} />
            <span>Crear equipo</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setCampaignModalState({ isOpen: true, campaign: c })}
          >
            <Icon name="edit" size={14} />
            <span>Editar campaña</span>
          </button>
          <button
            type="button"
            className={`btn ${isCampActive ? 'btn-ghost' : 'btn-secondary'} btn-sm`}
            onClick={() => handleToggleCampaign(c.id)}
          >
            {isCampActive ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      </div>

      {/* Lista Estructurada de Equipos */}
      {teams.length === 0 ? (
        <div className="org-empty-teams">
          <Icon name="info" size={16} />
          <span>No hay equipos registrados en esta campaña. Presiona <strong>Crear equipo</strong> para añadir el primero.</span>
        </div>
      ) : (
        <div className="table-responsive" style={{ marginTop: 'var(--space-3)' }}>
          <table className="data-table org-teams-table">
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Equipo</th>
                <th style={{ width: '26%' }}>Supervisor Asignado</th>
                <th style={{ width: '24%' }}>Quórum K-Anonimato</th>
                <th style={{ width: '22%', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => {
                const isTeamActive = t.active !== false;
                const isPublicable = (t.n || 0) >= minThreshold;

                return (
                  <tr key={t.id} className={!isTeamActive ? 'org-team-row-inactive' : ''}>
                    <td>
                      <div className="org-team-cell-name">
                        <strong>{t.name}</strong>
                        <span className={`badge ${isTeamActive ? 'badge-ok' : 'badge-muted'}`} style={{ fontSize: '11px', padding: '1px 6px' }}>
                          {isTeamActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="org-team-supervisor-text">
                        <Icon name="user" size={13} />
                        <span>{t.supervisor || 'Sin asignar'}</span>
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${isPublicable ? 'badge-ok' : 'badge-warn'}`}
                        title={
                          isPublicable
                            ? `Cumple umbral de k-anonimato (N=${t.n} ≥ ${minThreshold})`
                            : `Bajo umbral confidencial (N=${t.n} < ${minThreshold})`
                        }
                      >
                        <Icon name={isPublicable ? 'checkCircle' : 'shield'} size={12} />
                        <span>{isPublicable ? `N=${t.n} · Publicable` : `N=${t.n} · Protegido`}</span>
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="org-team-actions-compact">
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          onClick={() => setAssignModalState({ isOpen: true, campaign: c, team: t })}
                          title="Asignar o cambiar supervisor de equipo"
                        >
                          <Icon name="user" size={12} />
                          <span>Supervisor</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          onClick={() => setTeamModalState({ isOpen: true, campaign: c, team: t })}
                          title="Editar nombre y dotación del equipo"
                        >
                          <Icon name="edit" size={12} />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() => handleToggleTeam(c.id, t.id)}
                          title={isTeamActive ? 'Desactivar equipo' : 'Activar equipo'}
                        >
                          {isTeamActive ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
