import { getOrganizationData, fetchAdminOrganization, fetchAdminUsers, fetchAdminParams } from '../services/adminQueries';
import { resetDemo, saveTeam, saveCampaign, toggleCampaign, toggleTeam, saveSupervisorAssignment } from '../services/organizationService';
import { useState, useMemo, useEffect } from 'react';
import { env } from '../../../core/config/env';
import { authService } from '../../../core/auth/authService';

export function useOrganization() {
  const currentUser = authService.getCurrentUser();
  const [version, setVersion] = useState(0);
  const [storeData, setStoreData] = useState(() => getOrganizationData());
  const [loading, setLoading] = useState(() => {
    if (env.useMockStorage) return false;
    const initial = getOrganizationData();
    return !initial?.organization?.campaigns?.length;
  });
  const [loadError, setLoadError] = useState('');
  const [feedback, setFeedback] = useState('');

  // Estados de modales
  const [campaignModalState, setCampaignModalState] = useState({ isOpen: false, campaign: null });
  const [teamModalState, setTeamModalState] = useState({ isOpen: false, campaign: null, team: null });
  const [assignModalState, setAssignModalState] = useState({ isOpen: false, campaign: null, team: null });



  useEffect(() => {
    let active = true;
    const loadData = async () => {
      const initial = getOrganizationData();
      if (!initial?.organization?.campaigns?.length) setLoading(true);
      setLoadError('');
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
          if (active) setLoadError(error.message);
          if (active) setFeedback(`Error: ${error.message}`);
        } finally { if (active) setLoading(false); }
      } else {
        setStoreData(getOrganizationData());
        setLoading(false);
      }
    };
    loadData();
    return () => { active = false; };
  }, [version]);

  const campaigns = useMemo(() => storeData.organization?.campaigns || [], [storeData]);
  const minThreshold = storeData.settings?.umbralMinimo || 5;

  // Lista combinada de supervisores disponibles
  const supervisorsList = useMemo(() => (storeData.users || [])
    .filter(u => u.role === 'supervisor' && u.status === 'Activo')
    .map(u => ({ id: u.id, name: u.name })).sort((a,b) => a.name.localeCompare(b.name)), [storeData]);

  const actorLabel = `${currentUser?.name || 'Administrador'} (${currentUser?.role || 'admin'})`;

  // --- Handlers de Campaña ---
  const handleSaveCampaign = async ({ id, name, active }) => {
    const message = await saveCampaign(id, name, active, actorLabel);
    if (message?.success !== true) { setFeedback(`Error: ${message.error}`); return message; }
    if (message) setFeedback(message.message);
    setCampaignModalState({ isOpen: false, campaign: null });
    setVersion((v) => v + 1);
    return message;
  };

  const handleToggleCampaign = async (campId) => {
    const currentCamp = campaigns.find(c => c.id === campId);
    if (!currentCamp) return;
    const currentActive = currentCamp.active !== false;

    const operationResult = await toggleCampaign(campId, currentActive, actorLabel);
    if (!operationResult) return;
    if (operationResult.success !== true) { setFeedback(`Error: ${operationResult.error}`); return; }
    const { camp, newStatus } = operationResult;

    setFeedback(`Campaña "${camp.name || campId}" marcada como ${newStatus}.`);
    setVersion((v) => v + 1);
  };

  // --- Handlers de Equipo ---
  const handleSaveTeam = async ({ campId, teamId, name, n, supervisor, active }) => {
    const message = await saveTeam(campId, teamId, name, n, supervisor, active, actorLabel);
    if (message === null) return;
    if (message?.success !== true) { setFeedback(`Error: ${message.error}`); return message; }
    if (message) setFeedback(message.message);
    setTeamModalState({ isOpen: false, campaign: null, team: null });
    setVersion((v) => v + 1);
    return message;
  };

  const handleToggleTeam = async (campId, teamId) => {
    const camp = campaigns.find(c => c.id === campId);
    const currentTeam = camp?.teams?.find(t => t.id === teamId);
    if (!currentTeam) return;
    const currentActive = currentTeam.active !== false;

    const operationResult = await toggleTeam(campId, teamId, currentActive, actorLabel);
    if (!operationResult) return;
    if (operationResult.success !== true) { setFeedback(`Error: ${operationResult.error}`); return; }
    const { team, newStatus } = operationResult;

    setFeedback(`Equipo "${team.name || team.nombre || teamId}" marcado como ${newStatus}.`);
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
    if (operationResult.success !== true) { setFeedback(`Error: ${operationResult.error}`); return operationResult; }
    const { team } = operationResult;

    setFeedback(`Supervisor "${team.supervisor || team.supervisor_nombre || newSupervisor}" asignado al equipo "${team.name || team.nombre || teamId}".`);
    setAssignModalState({ isOpen: false, campaign: null, team: null });
    setVersion((v) => v + 1);
    return operationResult;
  };

  // Restablecer datos iniciales demo
  const handleResetDemo = () => {
    if (!env.useMockStorage) { setFeedback('El restablecimiento solo está disponible en la demostración local.'); return; }
    if (window.confirm('¿Deseas restablecer todos los datos demo a su configuración original de fábrica?')) {
      resetDemo(actorLabel);

      setFeedback('Datos demo restablecidos a su configuración original.');
      setVersion((v) => v + 1);
    }
  };

  return {
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
    handleResetDemo,
    reload: () => setVersion((v) => v + 1)
  };
}
