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

  return (
    <div>
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Estructura organizacional y k-anonimato</h1>
          <p className="page-subtitle">
            Gestión jerárquica de campañas y equipos de operaciones con control estricto de umbrales
            confidenciales (RF-15).
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
          <button type="button" className="btn btn-secondary" onClick={handleResetDemo}>
            <Icon name="refresh" size={16} />
            <span>Restablecer demo</span>
          </button>
        </div>
      </div>

      {/* Banner de K-Anonimato y Confidencialidad */}
      <div className="alert-banner info" style={{ marginBottom: 'var(--space-5)' }}>
        <Icon name="info" size={18} />
        <div>
          <strong>Regla de K-Anonimato Activa:</strong> El umbral mínimo del sistema está configurado en{' '}
          <strong>N = {minThreshold}</strong>. Los equipos con menos de {minThreshold} integrantes no
          publicarán tableros agregados a supervisores para imposibilitar la reidentificación de respuestas.
        </div>
      </div>

      {/* Mensaje de feedback */}
      {feedback && (
        <div className="alert-banner ok" role="status" style={{ marginBottom: 'var(--space-4)' }}>
          <Icon name="checkCircle" size={18} />
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
