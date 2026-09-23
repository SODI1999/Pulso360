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
  return (
    <div className="card org-campaign-card">
      <div className="org-campaign-header">
        <div className="org-campaign-title-group">
          <h2 className="card-title" style={{ marginBottom: 0 }}>
            {c.name}
          </h2>
          <span className={`badge ${isCampActive ? 'badge-ok' : 'badge-danger'}`}>
            {isCampActive ? 'Activa' : 'Inactiva'}
          </span>
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
            <span>Editar</span>
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

      {/* Equipos de la Campaña */}
      <div className="org-teams-list">
        {!c.teams || c.teams.length === 0 ? (
          <p style={{ margin: 'var(--space-3) 0', fontSize: '13px', color: 'var(--c-texto-suave)' }}>
            No hay equipos registrados en esta campaña.
          </p>
        ) : (
          c.teams.map((t) => {
            const isTeamActive = t.active !== false;
            const isPublicable = (t.n || 0) >= minThreshold;

            return (
              <div key={t.id} className="org-team-item">
                <div className="org-team-info">
                  <div className="org-team-name">{t.name}</div>
                  <div className="org-team-meta">
                    Supervisor: <strong>{t.supervisor || 'Sin asignar'}</strong> · Integrantes: {t.n}
                  </div>
                </div>

                <div className="org-team-actions">
                  <span className={`badge ${isPublicable ? 'badge-ok' : 'badge-warn'}`}>
                    {isPublicable ? `N=${t.n} (Publicable)` : `N=${t.n} (Bajo umbral confidencial)`}
                  </span>
                  <span className={`badge ${isTeamActive ? 'badge-ok' : 'badge-danger'}`}>
                    {isTeamActive ? 'Activo' : 'Inactivo'}
                  </span>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setAssignModalState({ isOpen: true, campaign: c, team: t })}
                  >
                    Asignar supervisor
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setTeamModalState({ isOpen: true, campaign: c, team: t })}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleToggleTeam(c.id, t.id)}
                  >
                    {isTeamActive ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
