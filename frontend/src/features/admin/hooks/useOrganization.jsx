import { getOrganizationData, fetchAdminOrganization, fetchAdminUsers, fetchAdminParams } from '../services/adminQueries';
import { resetDemo, saveTeam, saveCampaign, toggleCampaign, toggleTeam, saveSupervisorAssignment } from '../services/organizationService';
import { useState, useMemo, useEffect } from 'react';
import { env } from '../../../core/config/env';
import { authService } from '../../../core/auth/authService';

export function useOrganization() {
  const currentUser = authService.getCurrentUser();
  const [version, setVersion] = useState(0);
  const [feedback, setFeedback] = useState('');

  // Estados de modales
  const [campaignModalState, setCampaignModalState] = useState({ isOpen: false, campaign: null });
  const [teamModalState, setTeamModalState] = useState({ isOpen: false, campaign: null, team: null });
  const [assignModalState, setAssignModalState] = useState({ isOpen: false, campaign: null, team: null });

  const [storeData, setStoreData] = useState(() => getOrganizationData());

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      if (!env.useMockStorage) {
        try {
          const [org, usersData, paramsData] = await Promise.all([
            fetchAdminOrganization(),
            fetchAdminUsers(),
            fetchAdminParams()
          ]);
          if (active) {
            setStoreData({
              organization: org,
              users: usersData,
              settings: paramsData
            });
          }
        } catch (error) {
          console.error('Error fetching live organization data:', error);
        }
      } else {
        setStoreData(getOrganizationData());
      }
    };
    loadData();
    return () => { active = false; };
  }, [version]);

  const campaigns = useMemo(() => storeData.organization?.campaigns || [], [storeData]);
  const minThreshold = storeData.settings?.umbralMinimo || 5;

  // Lista combinada de supervisores disponibles
  const supervisorsList = useMemo(() => {
    const fromUsers = (storeData.users || []).filter((u) => u.role === 'supervisor').map((u) => u.name);

    const fromTeams = [];
    campaigns.forEach((c) => {
      (c.teams || []).forEach((t) => {
        if (t.supervisor && !fromTeams.includes(t.supervisor)) {
          fromTeams.push(t.supervisor);
        }
      });
    });

    const combined = Array.from(
      new Set([...fromUsers, ...fromTeams, 'Carlos Mendoza', 'Supervisor Alpha 2', 'Supervisor Beta'])
    );
    return combined.sort();
  }, [storeData, campaigns]);

  const actorLabel = `${currentUser?.name || 'Administrador'} (${currentUser?.role || 'admin'})`;

  // --- Handlers de Campaña ---
  const handleSaveCampaign = async ({ id, name, active }) => {
    const message = await saveCampaign(id, name, active, actorLabel);
    if (message) setFeedback(message);
    setCampaignModalState({ isOpen: false, campaign: null });
    setVersion((v) => v + 1);
  };

  const handleToggleCampaign = async (campId) => {
    const operationResult = await toggleCampaign(campId, actorLabel);
    if (!operationResult) return;
    const { camp, newStatus } = operationResult;

    setFeedback(`Campaña "${camp.name}" marcada como ${newStatus}.`);
    setVersion((v) => v + 1);
  };

  // --- Handlers de Equipo ---
  const handleSaveTeam = async ({ campId, teamId, name, n, supervisor, active }) => {
    const message = await saveTeam(campId, teamId, name, n, supervisor, active, actorLabel);
    if (message === null) return;
    if (message) setFeedback(message);
    setTeamModalState({ isOpen: false, campaign: null, team: null });
    setVersion((v) => v + 1);
  };

  const handleToggleTeam = async (campId, teamId) => {
    const operationResult = await toggleTeam(campId, teamId, actorLabel);
    if (!operationResult) return;
    const { team, newStatus } = operationResult;

    setFeedback(`Equipo "${team.name}" marcado como ${newStatus}.`);
    setVersion((v) => v + 1);
  };

  const handleSaveSupervisorAssignment = async ({ campId, teamId, previousSupervisor, newSupervisor }) => {
    const operationResult = await saveSupervisorAssignment(
      campId,
      teamId,
      newSupervisor,
      actorLabel,
      previousSupervisor
    );
    if (!operationResult) return;
    const { team } = operationResult;

    setFeedback(`Supervisor "${newSupervisor}" asignado al equipo "${team.name}".`);
    setAssignModalState({ isOpen: false, campaign: null, team: null });
    setVersion((v) => v + 1);
  };

  // Restablecer datos iniciales demo
  const handleResetDemo = () => {
    if (window.confirm('¿Deseas restablecer todos los datos demo a su configuración original de fábrica?')) {
      resetDemo(actorLabel);

      setFeedback('Datos demo restablecidos a su configuración original.');
      setVersion((v) => v + 1);
    }
  };

  return {
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
  };
}
