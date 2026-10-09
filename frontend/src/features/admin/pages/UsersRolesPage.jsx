import { useUsersRoles } from '../hooks/useUsersRoles';
import { ROLE_LABELS } from '../data/usersRolesData';

// src/features/admin/pages/UsersRolesPage.jsx
// Módulo de Administración de Usuarios, Roles y Gobernanza de Acceso (RF-15)

import { Icon } from '../../../core/components/Icon';
import { CreateUserModal } from '../components/CreateUserModal';
import { ManageUserModal } from '../components/ManageUserModal';

import '../../../styles/admin.css';

export function UsersRolesPage() {
  const {
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
  } = useUsersRoles();

  if (loading) return <p role="status">Cargando datos del servidor…</p>;
  if (loadError) return <p className="alert-banner danger" role="alert">No se pudieron cargar los datos: {loadError}</p>;

  return (
    <div>
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Usuarios, roles y gobernanza de acceso</h1>
          <p className="page-subtitle">
            Administración centralizada de identidades institucionales, roles canónicos y asignaciones
            organizacionales.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
          <Icon name="userPlus" size={16} />
          <span>Crear usuario</span>
        </button>
      </div>

      {/* Mensaje de feedback */}
      {feedback && (
        <div className={`alert-banner ${feedback.startsWith("Error") ? "danger" : "ok"}`} role={feedback.startsWith("Error") ? "alert" : "status"} style={{ marginBottom: 'var(--space-4)' }}>
          <Icon name={feedback.startsWith("Error") ? "alertTriangle" : "checkCircle"} size={18} />
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
                  <td
                    colSpan="6"
                    style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--c-texto-suave)' }}
                  >
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleLabel = ROLE_LABELS[u.role] || u.role;
                  const isSuspended = u.status === 'Suspendido';
                  const orgLabel = u.campaign ? `${u.campaign} · ${u.teamName || '—'}` : u.teamName || '—';

                  return (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.name}</strong>
                      </td>
                      <td>
                        <span className="audit-code-cell">{u.email}</span>
                      </td>
                      <td>
                        <span className={`user-role-badge role-${u.role}`}>{roleLabel}</span>
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
