import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export async function toggleCampaign(campId, actorLabel) {
  const data = pulsoStore.get();
  const camp = (data.organization?.campaigns || []).find((c) => c.id === campId);
  if (!camp) return null;
  const newActive = !(camp.active !== false);

  if (!env.useMockStorage && getAuthToken()) {
    try {
      await apiClient.patch('/admin/campaigns/' + campId, { activa: newActive });
      return { camp: { id: campId, active: newActive }, newStatus: newActive ? 'Activa' : 'Inactiva' };
    } catch (error) {
      return { error: error.response?.data?.error?.message || 'Error en el servidor' };
    }
  }

  camp.active = newActive;
  const newStatus = camp.active ? 'Activa' : 'Inactiva';
  pulsoStore.save(data);

  pulsoStore.audit({
    actor: actorLabel,
    action: 'CAMBIO_ESTADO_CAMPANA',
    target: `${camp.id} (${camp.name}) -> ${newStatus}`
  });
  return { camp, newStatus };
}

export async function toggleTeam(campId, teamId, actorLabel) {
  const data = pulsoStore.get();
  const camp = (data.organization?.campaigns || []).find((c) => c.id === campId);
  const team = camp?.teams?.find((t) => t.id === teamId);
  if (!team) return null;
  const newActive = !(team.active !== false);

  if (!env.useMockStorage && getAuthToken()) {
    try {
      await apiClient.patch('/admin/teams/' + teamId, { activo: newActive });
      return { team: { id: teamId, active: newActive }, newStatus: newActive ? 'Activo' : 'Inactivo' };
    } catch (error) {
      return { error: error.response?.data?.error?.message || 'Error en el servidor' };
    }
  }

  team.active = newActive;
  const newStatus = team.active ? 'Activo' : 'Inactivo';
  pulsoStore.save(data);

  pulsoStore.audit({
    actor: actorLabel,
    action: 'CAMBIO_ESTADO_EQUIPO',
    target: `Equipo "${team.name}" (${camp.name}) -> ${newStatus}`
  });
  return { team, newStatus };
}

export async function saveSupervisorAssignment(campId, teamId, newSupervisor, actorLabel, previousSupervisor) {
  if (!env.useMockStorage && getAuthToken()) {
    try {
      await apiClient.patch('/admin/teams/' + teamId, { supervisorNombre: newSupervisor });
      return { team: { id: teamId, supervisor: newSupervisor } };
    } catch (error) {
      return { error: error.response?.data?.error?.message || 'Error en el servidor' };
    }
  }

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
export async function saveCampaign(id, name, active, actorLabel) {
  if (!env.useMockStorage && getAuthToken()) {
    try {
      if (id) {
        await apiClient.patch('/admin/campaigns/' + id, { nombre: name, activa: active });
        return `Campaña "${name}" actualizada con éxito.`;
      } else {
        const codigo = name.toUpperCase().replace(/\s+/g, '-').slice(0, 20);
        await apiClient.post('/admin/campaigns', { codigo, nombre: name, descripcion: 'Campaña ' + name });
        return `Campaña "${name}" creada exitosamente.`;
      }
    } catch (error) {
      return { error: error.response?.data?.error?.message || 'Error en el servidor' };
    }
  }

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

export async function saveTeam(campId, teamId, name, n, supervisor, active, actorLabel) {
  if (!env.useMockStorage && getAuthToken()) {
    try {
      if (teamId) {
        await apiClient.patch('/admin/teams/' + teamId, { nombre: name, nMiembros: n, supervisorNombre: supervisor, activo: active });
        return `Equipo "${name}" modificado con éxito.`;
      } else {
        const codigo = name.toUpperCase().replace(/\s+/g, '-').slice(0, 20);
        await apiClient.post('/admin/teams', { campanaId: campId, codigo, nombre: name, descripcion: 'Equipo ' + name, supervisorNombre: supervisor, nMiembros: n });
        return `Equipo "${name}" creado exitosamente.`;
      }
    } catch (error) {
      return { error: error.response?.data?.error?.message || 'Error en el servidor' };
    }
  }

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
