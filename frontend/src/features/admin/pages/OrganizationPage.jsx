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
    minThreshold,
    supervisorsList,
    handleSaveCampaign,
    handleToggleCampaign,
    handleSaveTeam,
    handleToggleTeam,
    handleSaveSupervisorAssignment,
    handleResetDemo
  } = useOrganization();

  if (loading) return <p role="status">Cargando datos del servidor…</p>;
  if (loadError) return <p className="alert-banner danger" role="alert">No se pudieron cargar los datos: {loadError}</p>;

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
              minThreshold={minThreshold}
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
