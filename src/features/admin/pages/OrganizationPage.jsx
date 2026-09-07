// src/features/admin/pages/OrganizationPage.jsx
// Módulo de Administración de Estructura Organizacional y K-Anonimato (RF-15)

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import { CampaignModal } from '../components/CampaignModal';
import { TeamModal } from '../components/TeamModal';
import { AssignSupervisorModal } from '../components/AssignSupervisorModal';

import '../../../styles/admin.css';

export function OrganizationPage() {
  const currentUser = authService.getCurrentUser();
  const [version, setVersion] = useState(0);
  const [feedback, setFeedback] = useState('');

  // Estados de modales
  const [campaignModalState, setCampaignModalState] = useState({ isOpen: false, campaign: null });
  const [teamModalState, setTeamModalState] = useState({ isOpen: false, campaign: null, team: null });
  const [assignModalState, setAssignModalState] = useState({ isOpen: false, campaign: null, team: null });

  // Cargar datos reactivos del almacén
  const storeData = useMemo(() => {
    void version;
    return pulsoStore.get();
  }, [version]);
  const campaigns = useMemo(() => storeData.organization?.campaigns || [], [storeData]);
  const minThreshold = storeData.settings?.umbralMinimo || 5;

  // Lista combinada de supervisores disponibles
  const supervisorsList = useMemo(() => {
    const fromUsers = (storeData.users || [])
      .filter((u) => u.role === 'supervisor')
      .map((u) => u.name);

    const fromTeams = [];
    campaigns.forEach((c) => {
      (c.teams || []).forEach((t) => {
        if (t.supervisor && !fromTeams.includes(t.supervisor)) {
          fromTeams.push(t.supervisor);
        }
      });
    });

    const combined = Array.from(new Set([...fromUsers, ...fromTeams, 'Carlos Mendoza', 'Supervisor Alpha 2', 'Supervisor Beta']));
    return combined.sort();
  }, [storeData, campaigns]);

  const actorLabel = `${currentUser?.name || 'Administrador'} (${currentUser?.role || 'admin'})`;

  // --- Handlers de Campaña ---
  const handleSaveCampaign = ({ id, name, active }) => {
    const data = pulsoStore.get();
    data.organization = data.organization || { campaigns: [] };

    if (id) {
      // Edición
      const camp = data.organization.campaigns.find((c) => c.id === id);
      if (camp) {
        const oldName = camp.name;
        camp.name = name;
        camp.active = active;
        pulsoStore.save(data);

        pulsoStore.audit({
          actor: actorLabel,
          action: 'EDICION_CAMPANA',
          target: `${camp.id} · "${oldName}" -> "${name}"`
        });
        setFeedback(`Campaña "${name}" actualizada con éxito.`);
      }
    } else {
      // Creación
      const newCamp = {
        id: `camp-${Date.now()}`,
        name,
        active,
        teams: []
      };
      data.organization.campaigns.push(newCamp);
      pulsoStore.save(data);

      pulsoStore.audit({
        actor: actorLabel,
        action: 'CREACION_CAMPANA',
        target: `${newCamp.id} (${newCamp.name}) · Estado: ${active ? 'Activa' : 'Inactiva'}`
      });
      setFeedback(`Campaña "${name}" creada exitosamente.`);
    }

    setCampaignModalState({ isOpen: false, campaign: null });
    setVersion((v) => v + 1);
  };

  const handleToggleCampaign = (campId) => {
    const data = pulsoStore.get();
    const camp = (data.organization?.campaigns || []).find((c) => c.id === campId);
    if (!camp) return;

    camp.active = !(camp.active !== false);
    const newStatus = camp.active ? 'Activa' : 'Inactiva';
    pulsoStore.save(data);

    pulsoStore.audit({
      actor: actorLabel,
      action: 'CAMBIO_ESTADO_CAMPANA',
      target: `${camp.id} (${camp.name}) -> ${newStatus}`
    });

    setFeedback(`Campaña "${camp.name}" marcada como ${newStatus}.`);
    setVersion((v) => v + 1);
  };

  // --- Handlers de Equipo ---
  const handleSaveTeam = ({ campId, teamId, name, n, supervisor, active }) => {
    const data = pulsoStore.get();
    const camp = (data.organization?.campaigns || []).find((c) => c.id === campId);
    if (!camp) return;

    camp.teams = camp.teams || [];

    if (teamId) {
      // Edición
      const team = camp.teams.find((t) => t.id === teamId);
      if (team) {
        const oldName = team.name;
        const oldN = team.n;
        team.name = name;
        team.n = n;
        team.active = active;
        pulsoStore.save(data);

        pulsoStore.audit({
          actor: actorLabel,
          action: 'EDICION_EQUIPO',
          target: `${team.id} en "${camp.name}" · "${oldName}" (N=${oldN}) -> "${name}" (N=${n})`
        });
        setFeedback(`Equipo "${name}" modificado con éxito.`);
      }
    } else {
      // Creación
      const newTeam = {
        id: `team-${Date.now()}`,
        name,
        n,
        supervisor,
        active
      };
      camp.teams.push(newTeam);
      pulsoStore.save(data);

      pulsoStore.audit({
        actor: actorLabel,
        action: 'CREACION_EQUIPO',
        target: `${newTeam.id} (${newTeam.name}, N=${n}) en "${camp.name}" · Sup: ${supervisor} · Estado: ${active ? 'Activo' : 'Inactivo'}`
      });
      setFeedback(`Equipo "${name}" creado exitosamente en "${camp.name}".`);
    }

    setTeamModalState({ isOpen: false, campaign: null, team: null });
    setVersion((v) => v + 1);
  };

  const handleToggleTeam = (campId, teamId) => {
    const data = pulsoStore.get();
    const camp = (data.organization?.campaigns || []).find((c) => c.id === campId);
    const team = camp?.teams?.find((t) => t.id === teamId);
    if (!team) return;

    team.active = !(team.active !== false);
    const newStatus = team.active ? 'Activo' : 'Inactivo';
    pulsoStore.save(data);

    pulsoStore.audit({
      actor: actorLabel,
      action: 'CAMBIO_ESTADO_EQUIPO',
      target: `Equipo "${team.name}" (${camp.name}) -> ${newStatus}`
    });

    setFeedback(`Equipo "${team.name}" marcado como ${newStatus}.`);
    setVersion((v) => v + 1);
  };

  const handleSaveSupervisorAssignment = ({ campId, teamId, previousSupervisor, newSupervisor }) => {
    const data = pulsoStore.get();
    const camp = (data.organization?.campaigns || []).find((c) => c.id === campId);
    const team = camp?.teams?.find((t) => t.id === teamId);
    if (!team) return;

    team.supervisor = newSupervisor;
    pulsoStore.save(data);

    pulsoStore.audit({
      actor: actorLabel,
      action: 'ASIGNACION_SUPERVISOR',
      target: `Equipo "${team.name}" (${camp.name}) · Supervisor anterior: ${previousSupervisor} -> Nuevo supervisor: ${newSupervisor}`
    });

    setFeedback(`Supervisor "${newSupervisor}" asignado al equipo "${team.name}".`);
    setAssignModalState({ isOpen: false, campaign: null, team: null });
    setVersion((v) => v + 1);
  };

  // Restablecer datos iniciales demo
  const handleResetDemo = () => {
    if (window.confirm('¿Deseas restablecer todos los datos demo a su configuración original de fábrica?')) {
      pulsoStore.reset();
      pulsoStore.audit({
        actor: actorLabel,
        action: 'REINICIO_DATOS_DEMO',
        target: 'Semilla inicial restaurada'
      });
      setFeedback('Datos demo restablecidos a su configuración original.');
      setVersion((v) => v + 1);
    }
  };

  return (
    <div>
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Estructura organizacional y k-anonimato</h1>
          <p className="page-subtitle">
            Gestión jerárquica de campañas y equipos de operaciones con control estricto de umbrales confidenciales (RF-15).
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
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleResetDemo}
          >
            <Icon name="refresh" size={16} />
            <span>Restablecer demo</span>
          </button>
        </div>
      </div>

      {/* Banner de K-Anonimato y Confidencialidad */}
      <div className="alert-banner info" style={{ marginBottom: 'var(--space-5)' }}>
        <Icon name="info" size={18} />
        <div>
          <strong>Regla de K-Anonimato Activa:</strong> El umbral mínimo del sistema está configurado en <strong>N = {minThreshold}</strong>. Los equipos con menos de {minThreshold} integrantes no publicarán tableros agregados a supervisores para imposibilitar la reidentificación de respuestas.
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
            <div key={c.id} className="card org-campaign-card">
              <div className="org-campaign-header">
                <div className="org-campaign-title-group">
                  <h2 className="card-title" style={{ marginBottom: 0 }}>{c.name}</h2>
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
