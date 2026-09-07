// src/features/admin/pages/UsersRolesPage.jsx
// Módulo de Administración de Usuarios, Roles y Gobernanza de Acceso (RF-15)

import { useState, useMemo } from 'react';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import { CreateUserModal } from '../components/CreateUserModal';
import { ManageUserModal } from '../components/ManageUserModal';

import '../../../styles/admin.css';

const ROLE_LABELS = {
  agente: 'Agente',
  supervisor: 'Supervisor',
  sst: 'Profesional SST',
  auditor: 'Auditor',
  admin: 'Administrador'
};

export function UsersRolesPage() {
  const currentUser = authService.getCurrentUser();
  const [version, setVersion] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [feedback, setFeedback] = useState('');

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Obtener datos del almacén
  const storeData = useMemo(() => {
    void version;
    return pulsoStore.get();
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
      { id: 'dept:sst', teamId: null, name: 'Seguridad y Salud en el Trabajo', campaign: null, label: 'Seguridad y Salud en el Trabajo (SST)', type: 'dept' },
      { id: 'dept:auditor', teamId: null, name: 'Auditoría', campaign: null, label: 'Auditoría Interna y Control', type: 'dept' },
      { id: 'dept:admin', teamId: null, name: 'Administración', campaign: null, label: 'Administración del Sistema', type: 'dept' },
      { id: 'dept:general', teamId: null, name: 'Operaciones Generales', campaign: null, label: 'Operaciones Generales (Sin asignar)', type: 'dept' }
    ];

    return [...scopes, ...centralUnits];
  }, [storeData]);

  const actorLabel = `${currentUser?.name || 'Administrador'} (${currentUser?.role || 'admin'})`;

  // Filtrado de usuarios
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term ||
        (u.name && u.name.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term)) ||
        (u.teamName && u.teamName.toLowerCase().includes(term));

      return matchesRole && matchesSearch;
    });
  }, [users, searchTerm, roleFilter]);

  // Creación atómica de usuario (RF-15)
  const handleSaveCreateUser = ({ name, email, role, orgScopeId, status, onError }) => {
    const data = pulsoStore.get();

    // Validación atómica: correo único
    const emailExists = (data.users || []).some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      onError(`El correo institucional "${email}" ya se encuentra asignado a otra cuenta.`);
      return;
    }

    const targetScope = orgScopes.find((s) => s.id === orgScopeId);
    if (!targetScope) {
      onError('La asignación organizacional seleccionada no es válida.');
      return;
    }

    const newUserId = `usr-${Date.now()}`;
    const newUser = {
      id: newUserId,
      name,
      email,
      role,
      teamId: targetScope.teamId || null,
      teamName: targetScope.name,
      campaign: targetScope.campaign || undefined,
      status: status === 'Suspendido' ? 'Suspendido' : 'Activo'
    };

    // Si es agente, inicializar su estructura de consentimientos
    if (role === 'agente') {
      data.consents = data.consents || {};
      data.consents[newUserId] = {
        policyAccepted: false,
        policyVersion: null,
        c1: false, c2: false, c3: false, c4: false, c5: false,
        updatedAt: null
      };
    }

    data.users.push(newUser);
    pulsoStore.save(data);

    // Auditoría inmutable
    pulsoStore.audit({
      actor: actorLabel,
      action: 'CREACION_USUARIO',
      target: `${newUser.id} (${newUser.email}) · Rol: ${ROLE_LABELS[newUser.role] || newUser.role} · Ámbito: ${newUser.teamName} · Estado: ${newUser.status}`
    });

    setIsCreateOpen(false);
    setFeedback(`Cuenta para "${name}" (${email}) creada exitosamente.`);
    setVersion((v) => v + 1);
  };

  // Gestión / edición de usuario (RF-15)
  const handleSaveManageUser = ({ userId, newRole, newOrgScopeId, newStatus, onError }) => {
    const data = pulsoStore.get();
    const userIndex = (data.users || []).findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      onError('El usuario no existe.');
      return;
    }

    const targetScope = orgScopes.find((s) => s.id === newOrgScopeId);
    if (!targetScope) {
      onError('La asignación organizacional no es válida.');
      return;
    }

    const user = data.users[userIndex];
    const auditEntries = [];

    // 1. Cambio de rol
    if (user.role !== newRole) {
      auditEntries.push({
        actor: actorLabel,
        action: 'CAMBIO_ROL',
        target: `${user.id} (${user.email}) · ${ROLE_LABELS[user.role] || user.role} -> ${ROLE_LABELS[newRole] || newRole}`
      });
      user.role = newRole;
    }

    // 2. Traslado organizacional
    const currentTeamId = user.teamId || null;
    const targetTeamId = targetScope.teamId || null;
    const currentTeamName = user.teamName || '';
    if (currentTeamId !== targetTeamId || currentTeamName !== targetScope.name) {
      auditEntries.push({
        actor: actorLabel,
        action: 'TRASLADO_ORGANIZACIONAL',
        target: `${user.id} (${user.email}) · ${user.teamName || 'Sin asignar'} -> ${targetScope.label}`
      });
      user.teamId = targetTeamId;
      user.teamName = targetScope.name;
      user.campaign = targetScope.campaign || undefined;
    }

    // 3. Cambio de estado de cuenta
    const currentStatus = user.status || 'Activo';
    if (currentStatus !== newStatus) {
      const action = newStatus === 'Suspendido' ? 'SUSPENSION_USUARIO' : 'ACTIVACION_USUARIO';
      auditEntries.push({
        actor: actorLabel,
        action,
        target: `${user.id} (${user.email}) · Estado: ${currentStatus} -> ${newStatus}`
      });
      user.status = newStatus;
    }

    if (auditEntries.length === 0) {
      setSelectedUser(null);
      return;
    }

    pulsoStore.save(data);
    auditEntries.forEach((entry) => pulsoStore.audit(entry));

    setSelectedUser(null);
    setFeedback(`Actualización de la cuenta "${user.name}" aplicada y auditada.`);
    setVersion((v) => v + 1);
  };

  return (
    <div>
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Usuarios, roles y gobernanza de acceso</h1>
          <p className="page-subtitle">
            Administración centralizada de identidades institucionales, roles canónicos y asignaciones organizacionales (RF-15).
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsCreateOpen(true)}
        >
          <Icon name="userPlus" size={16} />
          <span>Crear usuario</span>
        </button>
      </div>

      {/* Banner Informativo */}
      <div className="alert-banner info" style={{ marginBottom: 'var(--space-5)' }}>
        <Icon name="info" size={18} />
        <div>
          <strong>Control de Acceso Basado en Roles (RBAC):</strong> Cada cuenta tiene asignado uno de los 5 roles canónicos estrictos. Cualquier cambio de perfil, traslado entre campañas o suspensión de acceso genera un asiento inmutable de auditoría.
        </div>
      </div>

      {/* Mensaje de feedback */}
      {feedback && (
        <div className="alert-banner ok" role="status" style={{ marginBottom: 'var(--space-4)' }}>
          <Icon name="checkCircle" size={18} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Tarjeta de Lista de Usuarios */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Cuentas institucionales registradas</div>
            <div className="card-subtitle">{users.length} cuentas configuradas en la plataforma.</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="audit-filter-bar">
          <input
            type="search"
            className="form-input audit-filter-input"
            placeholder="Buscar por nombre, correo o equipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select audit-filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">Todos los roles</option>
            <option value="agente">Solo Agentes</option>
            <option value="supervisor">Solo Supervisores</option>
            <option value="sst">Solo SST</option>
            <option value="auditor">Solo Auditores</option>
            <option value="admin">Solo Administradores</option>
          </select>
        </div>

        {/* Tabla */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo Institucional</th>
                <th>Rol Canónico</th>
                <th>Ámbito / Equipo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--c-texto-suave)' }}>
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleLabel = ROLE_LABELS[u.role] || u.role;
                  const isSuspended = u.status === 'Suspendido';
                  const orgLabel = u.campaign ? `${u.campaign} · ${u.teamName || '—'}` : (u.teamName || '—');

                  return (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.name}</strong>
                      </td>
                      <td>
                        <span className="audit-code-cell">{u.email}</span>
                      </td>
                      <td>
                        <span className={`user-role-badge role-${u.role}`}>
                          {roleLabel}
                        </span>
                      </td>
                      <td>{orgLabel}</td>
                      <td>
                        <span className={`badge ${isSuspended ? 'badge-danger' : 'badge-ok'}`}>
                          {u.status || 'Activo'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedUser(u)}
                        >
                          <Icon name="manage_accounts" size={14} />
                          <span>Gestionar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales */}
      <CreateUserModal
        isOpen={isCreateOpen}
        orgScopes={orgScopes}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleSaveCreateUser}
      />

      <ManageUserModal
        isOpen={Boolean(selectedUser)}
        user={selectedUser}
        orgScopes={orgScopes}
        currentUserId={currentUser?.id}
        onClose={() => setSelectedUser(null)}
        onSave={handleSaveManageUser}
      />
    </div>
  );
}
