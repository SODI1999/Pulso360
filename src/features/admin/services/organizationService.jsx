import { pulsoStore } from '../../../core/storage/pulsoStore';

export function toggleCampaign(campId, actorLabel) {
  const data = pulsoStore.get();
  const camp = (data.organization?.campaigns || []).find((c) => c.id === campId);
  if (!camp) return null;

  camp.active = !(camp.active !== false);
  const newStatus = camp.active ? 'Activa' : 'Inactiva';
  pulsoStore.save(data);

  pulsoStore.audit({
    actor: actorLabel,
    action: 'CAMBIO_ESTADO_CAMPANA',
    target: `${camp.id} (${camp.name}) -> ${newStatus}`
  });
  return { camp, newStatus };
}

export function toggleTeam(campId, teamId, actorLabel) {
  const data = pulsoStore.get();
  const camp = (data.organization?.campaigns || []).find((c) => c.id === campId);
  const team = camp?.teams?.find((t) => t.id === teamId);
  if (!team) return null;

  team.active = !(team.active !== false);
  const newStatus = team.active ? 'Activo' : 'Inactivo';
  pulsoStore.save(data);

  pulsoStore.audit({
    actor: actorLabel,
    action: 'CAMBIO_ESTADO_EQUIPO',
    target: `Equipo "${team.name}" (${camp.name}) -> ${newStatus}`
  });
  return { team, newStatus };
}

export function saveSupervisorAssignment(campId, teamId, newSupervisor, actorLabel, previousSupervisor) {
  const data = pulsoStore.get();
  const camp = (data.organization?.campaigns || []).find((c) => c.id === campId);
  const team = camp?.teams?.find((t) => t.id === teamId);
  if (!team) return null;

  team.supervisor = newSupervisor;
  pulsoStore.save(data);

  pulsoStore.audit({
    actor: actorLabel,
    action: 'ASIGNACION_SUPERVISOR',
    target: `Equipo "${team.name}" (${camp.name}) · Supervisor anterior: ${previousSupervisor} -> Nuevo supervisor: ${newSupervisor}`
  });
  return { team };
}
export function saveCampaign(id, name, active, actorLabel) {
  let message = '';
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
      message = `Campaña "${name}" actualizada con éxito.`;
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
    message = `Campaña "${name}" creada exitosamente.`;
  }

  return message;
}

export function saveTeam(campId, teamId, name, n, supervisor, active, actorLabel) {
  let message = '';
  const data = pulsoStore.get();
  const camp = (data.organization?.campaigns || []).find((c) => c.id === campId);
  if (!camp) return null;

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
      message = `Equipo "${name}" modificado con éxito.`;
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
    message = `Equipo "${name}" creado exitosamente en "${camp.name}".`;
  }

  return message;
}

export function resetDemo(actorLabel) {
  pulsoStore.reset();
  pulsoStore.audit({
    actor: actorLabel,
    action: 'REINICIO_DATOS_DEMO',
    target: 'Semilla inicial restaurada'
  });
}
