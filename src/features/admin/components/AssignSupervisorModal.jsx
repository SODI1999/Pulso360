// src/features/admin/components/AssignSupervisorModal.jsx
// Modal para asignar supervisor responsable a un equipo (RF-15)

import { useState, useEffect } from 'react';
import { Icon } from '../../../core/components/Icon';

export function AssignSupervisorModal({
  isOpen,
  onClose,
  onSave,
  campaign,
  team,
  supervisorsList = []
}) {
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (team) {
      setSelectedSupervisor(team.supervisor || '');
    }
    setError('');
  }, [team, isOpen]);

  if (!isOpen || !team) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSupervisor) {
      setError('Debes seleccionar un supervisor responsable.');
      return;
    }

    onSave({
      campId: campaign.id,
      teamId: team.id,
      previousSupervisor: team.supervisor || 'Sin asignar',
      newSupervisor: selectedSupervisor
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Asignar Supervisor de Equipo</h2>
            <div className="modal-subtitle">
              Equipo: <strong>{team.name}</strong> · Campaña: {campaign?.name}
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

            <p style={{ fontSize: '13px', color: 'var(--c-texto-suave)', marginBottom: 'var(--space-4)' }}>
              Supervisor asignado actualmente: <strong>{team.supervisor || 'Sin asignar'}</strong>
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="assignSupSelect">
                Nuevo supervisor responsable <span style={{ color: 'var(--c-critico)' }}>*</span>
              </label>
              <select
                id="assignSupSelect"
                className="form-select"
                value={selectedSupervisor}
                onChange={(e) => setSelectedSupervisor(e.target.value)}
                autoFocus
              >
                <option value="">Selecciona un supervisor...</option>
                {supervisorsList.map((sup) => (
                  <option key={sup} value={sup}>
                    {sup}
                  </option>
                ))}
              </select>
              <span className="form-hint">
                El usuario asignado tendrá acceso a los tableros agregados y planes de acción de este equipo.
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <Icon name="check" size={16} />
              <span>Confirmar Asignación</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
