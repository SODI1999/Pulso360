import { getOrganizationData } from '../services/adminQueries';
import { resetDemo } from '../services/organizationService';
import { saveTeam } from '../services/organizationService';
import { saveCampaign } from '../services/organizationService';
import { toggleCampaign, toggleTeam, saveSupervisorAssignment } from '../services/organizationService';
import { useState, useMemo } from 'react';

import { authService } from '../../../core/auth/authService';

export function useOrganization() {
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
    return getOrganizationData();
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
  const handleSaveCampaign = ({ id, name, active }) => {
    const message = saveCampaign(id, name, active, actorLabel);
    if (message) setFeedback(message);
    setCampaignModalState({ isOpen: false, campaign: null });
    setVersion((v) => v + 1);
  };

  const handleToggleCampaign = (campId) => {
    const operationResult = toggleCampaign(campId, actorLabel);
    if (!operationResult) return;
    const { camp, newStatus } = operationResult;

    setFeedback(`Campaña "${camp.name}" marcada como ${newStatus}.`);
    setVersion((v) => v + 1);
  };

  // --- Handlers de Equipo ---
  const handleSaveTeam = ({ campId, teamId, name, n, supervisor, active }) => {
    const message = saveTeam(campId, teamId, name, n, supervisor, active, actorLabel);
    if (message === null) return;
    if (message) setFeedback(message);
    setTeamModalState({ isOpen: false, campaign: null, team: null });
    setVersion((v) => v + 1);
  };

  const handleToggleTeam = (campId, teamId) => {
    const operationResult = toggleTeam(campId, teamId, actorLabel);
    if (!operationResult) return;
    const { team, newStatus } = operationResult;

    setFeedback(`Equipo "${team.name}" marcado como ${newStatus}.`);
    setVersion((v) => v + 1);
  };

  const handleSaveSupervisorAssignment = ({ campId, teamId, previousSupervisor, newSupervisor }) => {
    const operationResult = saveSupervisorAssignment(
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
