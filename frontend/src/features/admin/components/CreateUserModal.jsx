import { useExpiredFormDraft } from '../../../core/auth/useExpiredFormDraft';
// src/features/admin/components/CreateUserModal.jsx
// Modal para creación atómica de usuarios institucionales (RF-15)

import { useState, useEffect, useRef } from 'react';
import { useModalA11y } from '../../../core/hooks/useModalA11y';
import { env } from '../../../core/config/env';
import { Icon } from '../../../core/components/Icon';

const CANONICAL_ROLES = [
  { value: 'agente', label: 'Agente de Contact Center' },
  { value: 'supervisor', label: 'Supervisor de Operaciones' },
  { value: 'sst', label: 'Profesional SST' },
  { value: 'auditor', label: 'Auditor Interno' },
  { value: 'admin', label: 'Administrador del Sistema' }
];

export function CreateUserModal({ isOpen, onClose, onSave, orgScopes = [] }) {
  const modalRef = useRef(null);
  useModalA11y({ isOpen, onClose, modalRef });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('agente');
  const [orgScopeId, setOrgScopeId] = useState('');
  const [status, setStatus] = useState('Activo');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setName('');
    setPassword('');
    setEmail('');
    setRole('agente');
    setOrgScopeId(orgScopes[0]?.id || '');
    setStatus('Activo');
    setError('');
  }, [isOpen, orgScopes]);

  useExpiredFormDraft('user:new', { name, email, role, orgScopeId, status }, draft => {
    setName(draft.name); setEmail(draft.email); setRole(draft.role); setOrgScopeId(draft.orgScopeId);
    setStatus(draft.status); setPassword('');
    setError('Borrador recuperado. Vuelve a ingresar la contraseña inicial.');
  }, isOpen);
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Campos obligatorios
    if (!trimmedName || !trimmedEmail || !role || !orgScopeId || !status) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    // 2. Formato de correo electrónico (estricto con dominio y TLD calificado)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError(
        'El correo institucional no tiene una estructura válida con dominio calificado (ej. colaborador@pulso360.co).'
      );
      return;
    }

    setSubmitting(true);
    try {
      const result = await onSave({
        name: trimmedName,
        email: trimmedEmail,
        role,
        orgScopeId,
        status, password,
        onError: (msg) => setError(msg)
      });
      if (result?.success === false) setError(result.error?.message || result.error);
    } catch (error) { setError(error.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="modal-overlay active" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="create-user-title" ref={modalRef}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 id="create-user-title" className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                placeholder="colaborador@pulso360.co o usuario@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {!env.useMockStorage && <div className="form-group">
              <label className="form-label" htmlFor="createUserPassword">Contraseña inicial</label>
              <input id="createUserPassword" type="password" className="form-input" autoComplete="new-password"
                required minLength={8} maxLength={72} value={password} onChange={e => setPassword(e.target.value)} />
            </div>}
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
            <button type="submit" disabled={submitting} className="btn btn-primary">
              <Icon name="check" size={16} />
              <span>Crear Cuenta</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
