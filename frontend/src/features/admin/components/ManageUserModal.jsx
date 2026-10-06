import { useExpiredFormDraft } from '../../../core/auth/useExpiredFormDraft';
// src/features/admin/components/ManageUserModal.jsx
// Modal para gestión y actualización atómica de usuario (RF-15)

import { useState, useEffect } from 'react';
import { Icon } from '../../../core/components/Icon';

const CANONICAL_ROLES = [
  { value: 'agente', label: 'Agente de Contact Center' },
  { value: 'supervisor', label: 'Supervisor de Operaciones' },
  { value: 'sst', label: 'Profesional SST' },
  { value: 'auditor', label: 'Auditor Interno' },
  { value: 'admin', label: 'Administrador del Sistema' }
];

export function ManageUserModal({ isOpen, onClose, onSave, user, orgScopes = [], currentUserId }) {
  const [role, setRole] = useState('agente');
  const [orgScopeId, setOrgScopeId] = useState('');
  const [status, setStatus] = useState('Activo');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isSelf = user?.id === currentUserId;

  useEffect(() => {
    if (user) {
      setRole(user.role || 'agente');
      setStatus(user.status || 'Activo');

      // Encontrar scope correspondiente
      let matched = null;
      if (user.teamId) {
        matched = orgScopes.find((s) => s.teamId === user.teamId);
      }
      if (!matched && user.teamName) {
        matched = orgScopes.find((s) => s.name?.toLowerCase() === user.teamName?.toLowerCase());
      }
      setOrgScopeId(matched ? matched.id : 'dept:general');
    }
    setError('');
  }, [user, isOpen, orgScopes]);

  useExpiredFormDraft(`user:${user?.id}`, { role, orgScopeId, status }, draft => {
    setRole(draft.role); setOrgScopeId(draft.orgScopeId); setStatus(draft.status);
  }, isOpen && !!user);
  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Regla de Protección: no permitir auto-suspensión
    if (isSelf && status === 'Suspendido') {
      setError(
        'Por seguridad operativa, no puedes suspender tu propia cuenta de administrador en la sesión activa.'
      );
      return;
    }

    // Regla de Protección: no auto-degradarse de administrador sin otra cuenta activa
    if (isSelf && role !== 'admin') {
      setError(
        'No puedes retirar tus propios privilegios de administrador para evitar el bloqueo del sistema.'
      );
      return;
    }

    if (!role || !orgScopeId || !status) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await onSave({
        userId: user.id,
        newRole: role,
        newOrgScopeId: orgScopeId,
        newStatus: status,
        onError: (msg) => setError(msg)
      });
      if (result?.success === false) setError(result.error?.message || result.error);
    } catch (error) { setError(error.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="modal-overlay active" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="manage_accounts" size={20} />
              <span>Gestionar usuario</span>
            </h2>
            <div className="modal-subtitle">
              <strong>{user.name}</strong> · <code>{user.email}</code>
            </div>
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

            {isSelf && (
              <div className="alert-banner info" style={{ marginBottom: 'var(--space-4)' }}>
                <Icon name="shield" size={16} />
                <span>
                  Estás gestionando tu propia cuenta activa de administrador. Algunas opciones de auto-bloqueo
                  están deshabilitadas.
                </span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="manageUserRole">
                Rol institucional en el sistema <span style={{ color: 'var(--c-critico)' }}>*</span>
              </label>
              <select
                id="manageUserRole"
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isSelf}
              >
                {CANONICAL_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              {isSelf && (
                <span className="form-hint">Tu rol de administrador está bloqueado durante esta sesión.</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="manageUserOrgScope">
                Ámbito organizacional / Traslado <span style={{ color: 'var(--c-critico)' }}>*</span>
              </label>
              <select
                id="manageUserOrgScope"
                className="form-select"
                value={orgScopeId}
                onChange={(e) => setOrgScopeId(e.target.value)}
              >
                {orgScopes.map((scope) => (
                  <option key={scope.id} value={scope.id}>
                    {scope.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="manageUserStatus">
                Estado de la cuenta
              </label>
              <select
                id="manageUserStatus"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={isSelf}
              >
                <option value="Activo">Activo</option>
                <option value="Suspendido">Suspendido</option>
              </select>
              {isSelf && (
                <span className="form-hint">
                  No puedes suspender la cuenta activa con la que has iniciado sesión.
                </span>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              <Icon name="check" size={16} />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
