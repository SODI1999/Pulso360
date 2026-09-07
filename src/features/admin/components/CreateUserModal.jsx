// src/features/admin/components/CreateUserModal.jsx
// Modal para creación atómica de usuarios institucionales (RF-15)

import { useState, useEffect } from 'react';
import { Icon } from '../../../core/components/Icon';

const CANONICAL_ROLES = [
  { value: 'agente', label: 'Agente de Contact Center' },
  { value: 'supervisor', label: 'Supervisor de Operaciones' },
  { value: 'sst', label: 'Profesional SST' },
  { value: 'auditor', label: 'Auditor Interno' },
  { value: 'admin', label: 'Administrador del Sistema' }
];

export function CreateUserModal({
  isOpen,
  onClose,
  onSave,
  orgScopes = []
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('agente');
  const [orgScopeId, setOrgScopeId] = useState('');
  const [status, setStatus] = useState('Activo');
  const [error, setError] = useState('');

  useEffect(() => {
    setName('');
    setEmail('');
    setRole('agente');
    setOrgScopeId(orgScopes[0]?.id || '');
    setStatus('Activo');
    setError('');
  }, [isOpen, orgScopes]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Campos obligatorios
    if (!trimmedName || !trimmedEmail || !role || !orgScopeId || !status) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    // 2. Formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('El correo institucional no tiene una estructura válida (ej. usuario@organizacion.com).');
      return;
    }

    onSave({
      name: trimmedName,
      email: trimmedEmail,
      role,
      orgScopeId,
      status,
      onError: (msg) => setError(msg)
    });
  };

  return (
    <div className="modal-overlay active" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="userPlus" size={20} />
              <span>Crear nuevo usuario</span>
            </h2>
            <div className="modal-subtitle">Control de accesos y asignación de rol canónico (RF-15)</div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Cerrar modal">
            <Icon name="close" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert-banner danger" style={{ marginBottom: 'var(--space-4)' }}>
                <Icon name="alertTriangle" size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="createUserName">
                Nombre y Apellidos completos <span style={{ color: 'var(--c-critico)' }}>*</span>
              </label>
              <input
                id="createUserName"
                type="text"
                className="form-input"
                placeholder="Ej. Andrés Restrepo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="createUserEmail">
                Correo institucional <span style={{ color: 'var(--c-critico)' }}>*</span>
              </label>
              <input
                id="createUserEmail"
                type="email"
                className="form-input"
                placeholder="ejemplo@demo o usuario@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="createUserRole">
                Rol canónico asignado <span style={{ color: 'var(--c-critico)' }}>*</span>
              </label>
              <select
                id="createUserRole"
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {CANONICAL_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="createUserOrgScope">
                Ámbito organizacional / Área <span style={{ color: 'var(--c-critico)' }}>*</span>
              </label>
              <select
                id="createUserOrgScope"
                className="form-select"
                value={orgScopeId}
                onChange={(e) => setOrgScopeId(e.target.value)}
              >
                <option value="">Selecciona una asignación organizacional...</option>
                {orgScopes.map((scope) => (
                  <option key={scope.id} value={scope.id}>
                    {scope.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="createUserStatus">
                Estado inicial de la cuenta
              </label>
              <select
                id="createUserStatus"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Activo">Activo</option>
                <option value="Suspendido">Suspendido</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <Icon name="check" size={16} />
              <span>Crear Cuenta</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
