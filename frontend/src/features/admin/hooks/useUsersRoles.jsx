import { getUserManagementData, fetchAdminUsers, fetchAdminOrganization } from '../services/adminQueries';
import { manageUser, saveCreateUser } from '../services/usersRolesService';
import { useState, useMemo, useEffect } from 'react';
import { env } from '../../../core/config/env';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';

import { ROLE_LABELS } from '../data/usersRolesData';

export function useUsersRoles() {
  const currentUser = authService.getCurrentUser();
  const [version, setVersion] = useState(0);
  const [storeData, setStoreData] = useState(() => getUserManagementData());
  const [loading, setLoading] = useState(() => {
    if (env.useMockStorage) return false;
    const initial = getUserManagementData();
    return !initial?.users?.length;
  });
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [feedback, setFeedback] = useState('');

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      const initial = getUserManagementData();
      if (!initial?.users?.length) setLoading(true);
      setLoadError('');
      if (!env.useMockStorage) {
        try {
          const [usersData, orgData] = await Promise.all([
            fetchAdminUsers(),
            fetchAdminOrganization()
          ]);
          if (active) {
            setStoreData({
              users: usersData,
              organization: orgData
            });
          }
        } catch (error) {
          if (active) setLoadError(error.message);
          if (active) setFeedback(`Error: ${error.message}`);
        } finally { if (active) setLoading(false); }
      } else {
        setStoreData(getUserManagementData());
        setLoading(false);
      }
    };
    loadData();
    return () => { active = false; };
  }, [version]);

  const users = useMemo(() => storeData.users || [], [storeData]);

  // Obtener ámbitos organizacionales válidos (Equipos + Áreas Centrales)
  const orgScopes = useMemo(() => {
    const scopes = [];

    // Equipos de operaciones
    (storeData.organization?.campaigns || []).forEach((c) => {
      (c.teams || []).forEach((t) => {
        scopes.push({
          id: `team:${t.id}`,
          teamId: t.id,
          name: t.name,
          campaign: c.name,
          label: `${c.name} · ${t.name}`,
          type: 'team'
        });
      });
    });

    // Áreas centrales canónicas
    const centralUnits = [
      {
        id: 'dept:sst',
        teamId: null,
        name: 'Seguridad y Salud en el Trabajo',
        campaign: null,
        label: 'Seguridad y Salud en el Trabajo (SST)',
        type: 'dept'
      },
      {
        id: 'dept:auditor',
        teamId: null,
        name: 'Auditoría',
        campaign: null,
        label: 'Auditoría Interna y Control',
        type: 'dept'
      },
      {
        id: 'dept:admin',
        teamId: null,
        name: 'Administración',
        campaign: null,
        label: 'Administración del Sistema',
        type: 'dept'
      },
      {
        id: 'dept:general',
        teamId: null,
        name: 'Operaciones Generales',
        campaign: null,
        label: 'Operaciones Generales (Sin asignar)',
        type: 'dept'
      }
    ];

    return [...scopes, ...centralUnits];
  }, [storeData]);

  const actorLabel = `${currentUser?.name || 'Administrador'} (${currentUser?.role || 'admin'})`;

  // Filtrado de usuarios
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (u.name && u.name.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term)) ||
        (u.teamName && u.teamName.toLowerCase().includes(term));

      return matchesRole && matchesSearch;
    });
  }, [users, searchTerm, roleFilter]);

  // Creación atómica de usuario (RF-15)
  const handleSaveCreateUser = async ({ name, email, role, orgScopeId, status, password, onError }) => {
    const operationResult = await saveCreateUser(email, orgScopes, orgScopeId, name, role, status, password);
    if (operationResult.success !== true) {
      onError(operationResult.error);
      return;
    }
    const { newUser } = operationResult;

    // Auditoría inmutable
    if (env.useMockStorage) pulsoStore.audit({
      actor: actorLabel,
      action: 'CREACION_USUARIO',
      target: `${newUser.id} (${newUser.email}) · Rol: ${ROLE_LABELS[newUser.role] || newUser.role} · Ámbito: ${newUser.teamName} · Estado: ${newUser.status}`
    });

    setIsCreateOpen(false);
    setFeedback(`Cuenta para "${name}" (${email}) creada exitosamente.`);
    setVersion((v) => v + 1);
  };

  // Gestión / edición de usuario (RF-15)
  const handleSaveManageUser = async ({ userId, newRole, newOrgScopeId, newStatus, onError }) => {
    const result = await manageUser(userId, newRole, newOrgScopeId, newStatus, orgScopes, actorLabel);
    if (result.success !== true) {
      onError(result.error);
      return;
    }
    setSelectedUser(null);
    if (result.unchanged) return;
    const { user } = result;
    setFeedback(`Actualización de la cuenta "${user.name}" aplicada y auditada.`);
    setVersion((v) => v + 1);
  };

  return {
    loading, loadError,
    currentUser,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    feedback,
    isCreateOpen,
    setIsCreateOpen,
    selectedUser,
    setSelectedUser,
    users,
    orgScopes,
    filteredUsers,
    handleSaveCreateUser,
    handleSaveManageUser
  };
}
