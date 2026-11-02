import { env } from '../../../core/config/env';
import { CampaignCard } from '../components/CampaignCard';
import { useOrganization } from '../hooks/useOrganization';

// src/features/admin/pages/OrganizationPage.jsx
// Módulo de Administración de Estructura Organizacional y K-Anonimato (RF-15)

import { Link } from 'react-router-dom';

import { Icon } from '../../../core/components/Icon';
import { CampaignModal } from '../components/CampaignModal';
import { TeamModal } from '../components/TeamModal';
import { AssignSupervisorModal } from '../components/AssignSupervisorModal';

import '../../../styles/admin.css';

export function OrganizationPage() {
  const {
    loading, loadError,
    feedback,
    campaignModalState,
    setCampaignModalState,
    teamModalState,
    setTeamModalState,
    assignModalState,
    setAssignModalState,
    campaigns,
    supervisorsList,
    handleSaveCampaign,
    handleToggleCampaign,
    handleSaveTeam,
    handleToggleTeam,
    handleSaveSupervisorAssignment,
    handleResetDemo,
    reload
  } = useOrganization();

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Estructura organizacional y k-anonimato</h1>
            <p className="page-subtitle">
              Gestión jerárquica de campañas y equipos de operaciones con control estricto de umbrales
              confidenciales.
            </p>
          </div>
        </div>
        <div
          className="supervisor-loading"
          style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--c-texto-suave)' }}
          role="status"
          aria-live="polite"
        >
          <Icon name="refresh" size={24} className="icon-spin" />
          <p style={{ marginTop: 'var(--space-2)' }}>Cargando estructura organizacional del servidor…</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div role="alert">
        <div className="page-header">
          <div>
            <h1 className="page-title">Estructura organizacional y k-anonimato</h1>
            <p className="page-subtitle">
              Gestión jerárquica de campañas y equipos de operaciones con control estricto de umbrales
              confidenciales.
            </p>
          </div>
        </div>
        <div
          className="alert-banner danger"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}
        >
          <span>No se pudieron cargar los datos: {loadError}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={reload}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Estructura organizacional y k-anonimato</h1>
          <p className="page-subtitle">
            Gestión jerárquica de campañas y equipos de operaciones con control estricto de umbrales
            confidenciales.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setCampaignModalState({ isOpen: true, campaign: null })}
          >
            <Icon name="plus" size={16} />
            <span>Crear campaña</span>
          </button>
          <Link to="/admin/parametros" className="btn btn-secondary">
            <Icon name="tune" size={16} />
            <span>Parámetros y SLAs</span>
          </Link>
          <button type="button" className="btn btn-secondary" onClick={handleResetDemo} disabled={!env.useMockStorage} title={!env.useMockStorage ? "Disponible únicamente en la demostración local" : undefined}>
            <Icon name="refresh" size={16} />
            <span>Restablecer demo</span>
          </button>
        </div>
      </div>

      {/* Mensaje de feedback */}
      {feedback && (
        <div className={`alert-banner ${feedback.startsWith("Error") ? "danger" : "ok"}`} role={feedback.startsWith("Error") ? "alert" : "status"} style={{ marginBottom: 'var(--space-4)' }}>
          <Icon name={feedback.startsWith("Error") ? "alertTriangle" : "checkCircle"} size={18} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Árbol de Campañas */}
      {campaigns.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--c-texto-suave)' }}>
            No hay campañas configuradas en el sistema actualmente.
          </p>
        </div>
      ) : (
        campaigns.map((c) => {
          const isCampActive = c.active !== false;

          return (
            <CampaignCard
              key={c.id}
              c={c}
              isCampActive={isCampActive}
              setTeamModalState={setTeamModalState}
              setCampaignModalState={setCampaignModalState}
              handleToggleCampaign={handleToggleCampaign}
              setAssignModalState={setAssignModalState}
              handleToggleTeam={handleToggleTeam}
            />
          );
        })
      )}

      {/* Modales */}
      <CampaignModal
        isOpen={campaignModalState.isOpen}
        campaign={campaignModalState.campaign}
        onClose={() => setCampaignModalState({ isOpen: false, campaign: null })}
        onSave={handleSaveCampaign}
      />

      <TeamModal
        isOpen={teamModalState.isOpen}
        campaign={teamModalState.campaign}
        team={teamModalState.team}
        supervisorsList={supervisorsList}
        onClose={() => setTeamModalState({ isOpen: false, campaign: null, team: null })}
        onSave={handleSaveTeam}
      />

      <AssignSupervisorModal
        isOpen={assignModalState.isOpen}
        campaign={assignModalState.campaign}
        team={assignModalState.team}
        supervisorsList={supervisorsList}
        onClose={() => setAssignModalState({ isOpen: false, campaign: null, team: null })}
        onSave={handleSaveSupervisorAssignment}
      />
    </div>
  );
}
