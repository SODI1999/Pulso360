import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';
import { clearAdminCache } from './adminQueries';

export async function toggleCampaign(campId, currentActive, actorLabel) {
  const newActive = !currentActive;

  if (!env.useMockStorage) {
    if (!getAuthToken()) {
      return { success:false,data:null,error: 'Sesión no válida o token ausente' };
    }
    try {
      const response = await apiClient.patch('/admin/campaigns/' + campId, { activa: newActive });
      clearAdminCache();
      return { ...response,camp:response.data,newStatus:response.data.activa ? 'Activa' : 'Inactiva' };
    } catch (error) {
      return { success:false,data:null,error: error.response?.data?.error?.message || 'Error en el servidor' };
    }
  }

  const data = pulsoStore.get();
  const camp = (data.organization?.campaigns || []).find((c) => c.id === campId);
  if (!camp) return null;
  
  camp.active = newActive;
  const newStatus = camp.active ? 'Activa' : 'Inactiva';
  pulsoStore.save(data);

  pulsoStore.audit({
    actor: actorLabel,
    action: 'CAMBIO_ESTADO_CAMPANA',
    target: `${camp.id} (${camp.name}) -> ${newStatus}`
  });
  return {success:true,data:camp,camp,newStatus};
}

export async function toggleTeam(campId, teamId, currentActive, actorLabel) {
  const newActive = !currentActive;

  if (!env.useMockStorage) {
    if (!getAuthToken()) {
      return { success:false,data:null,error: 'Sesión no válida o token ausente' };
    }
    try {
      const response = await apiClient.patch('/admin/teams/' + teamId, { activo: newActive });
      clearAdminCache();
      return { ...response,team:response.data,newStatus:response.data.activo ? 'Activo' : 'Inactivo' };
    } catch (error) {
      return { success:false,data:null,error: error.response?.data?.error?.message || 'Error en el servidor' };
    }
  }

  const data = pulsoStore.get();
  const camp = (data.organization?.campaigns || []).find((c) => c.id === campId);
  const team = camp?.teams?.find((t) => t.id === teamId);
  if (!team) return null;

  team.active = newActive;
  const newStatus = team.active ? 'Activo' : 'Inactivo';
  pulsoStore.save(data);

  pulsoStore.audit({
    actor: actorLabel,
    action: 'CAMBIO_ESTADO_EQUIPO',
    target: `Equipo "${team.name}" (${camp.name}) -> ${newStatus}`
  });
  return {success:true,data:team,team,newStatus};
}

export async function saveSupervisorAssignment(campId, teamId, newSupervisor, actorLabel, previousSupervisor) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) {
      return { success:false,data:null,error: 'Sesión no válida o token ausente' };
    }
    try {
      const response = await apiClient.patch('/admin/teams/' + teamId, { supervisorId: newSupervisor });
      clearAdminCache();
      return { ...response,team:response.data };
    } catch (error) {
      return { success:false,data:null,error: error.response?.data?.error?.message || 'Error en el servidor' };
    }
  }

  const data = pulsoStore.get();
  const camp = (data.organization?.campaigns || []).find((c) => c.id === campId);
  const team = camp?.teams?.find((t) => t.id === teamId);
  if (!team) return null;

  team.supervisor = data.users.find(user => user.id === newSupervisor)?.name || newSupervisor;
  pulsoStore.save(data);

  pulsoStore.audit({
    actor: actorLabel,
    action: 'ASIGNACION_SUPERVISOR',
    target: `Equipo "${team.name}" (${camp.name}) · Supervisor anterior: ${previousSupervisor} -> Nuevo supervisor: ${newSupervisor}`
  });

  return {success:true,data:team,team};
}
export async function saveCampaign(id, name, active, actorLabel) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) {
      return { success:false,data:null,error: 'Sesión no válida o token ausente' };
    }
    try {
      if (id) {
        const response = await apiClient.patch('/admin/campaigns/' + id, { nombre: name, activa: active });
        clearAdminCache();
        return { ...response,message:`Campaña "${name}" actualizada con éxito.` };
      } else {
        const codigo = name.toUpperCase().replace(/\s+/g, '-').slice(0, 20);
        const response = await apiClient.post('/admin/campaigns', { codigo, nombre: name, descripcion: 'Campaña ' + name, activa: active });
        clearAdminCache();
        return { ...response,message:`Campaña "${name}" creada exitosamente.` };
      }
    } catch (error) {
      return { success:false,data:null,error: error.response?.data?.error?.message || 'Error en el servidor' };
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

  return message ? {success:true,data:null,message} : {success:false,error:"Registro no disponible."};
}

export async function saveTeam(campId, teamId, name, n, supervisor, active, actorLabel) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) {
      return { success:false,data:null,error: 'Sesión no válida o token ausente' };
    }
    try {
      if (teamId) {
        const response = await apiClient.patch('/admin/teams/' + teamId, { nombre: name, nMiembros: n, supervisorId: supervisor, activo: active });
        clearAdminCache();
        return { ...response,message:`Equipo "${name}" modificado con éxito.` };
      } else {
        const codigo = name.toUpperCase().replace(/\s+/g, '-').slice(0, 20);
        const response = await apiClient.post('/admin/teams', { campanaId: campId, codigo, nombre: name, descripcion: 'Equipo ' + name, supervisorId: supervisor, nMiembros: n, activo: active });
        clearAdminCache();
        return { ...response,message:`Equipo "${name}" creado exitosamente.` };
      }
    } catch (error) {
      return { success:false,data:null,error: error.response?.data?.error?.message || 'Error en el servidor' };
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
      team.supervisor = data.users.find(user => user.id === supervisor)?.name || supervisor;
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
      supervisor: data.users.find(user => user.id === supervisor)?.name || supervisor,
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

  return message ? {success:true,data:null,message} : {success:false,error:"Registro no disponible."};
}

export function resetDemo(actorLabel) {
  if (!env.useMockStorage) return {success:false,error:"El restablecimiento solo está disponible en la demostración local."};
  pulsoStore.reset();
  pulsoStore.audit({
    actor: actorLabel,
    action: 'REINICIO_DATOS_DEMO',
    target: 'Semilla inicial restaurada'
  });
}
