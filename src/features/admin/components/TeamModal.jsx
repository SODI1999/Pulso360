// src/features/admin/components/TeamModal.jsx
// Modal para creación y edición de equipos operativos (RF-15)

import { useState, useEffect } from 'react';
import { Icon } from '../../../core/components/Icon';

export function TeamModal({
  isOpen,
  onClose,
  onSave,
  campaign,
  team = null,
  supervisorsList = []
}) {
  const [name, setName] = useState('');
  const [n, setN] = useState(10);
  const [supervisor, setSupervisor] = useState('');
  const [active, setActive] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (team) {
      setName(team.name || '');
      setN(team.n || 5);
      setSupervisor(team.supervisor || '');
      setActive(team.active !== false);
    } else {
      setName('');
      setN(10);
      setSupervisor(supervisorsList[0] || '');
      setActive(true);
    }
    setError('');
  }, [team, isOpen, supervisorsList]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const parsedN = parseInt(n, 10);

    if (!trimmedName) {
      setError('El nombre del equipo es obligatorio.');
      return;
    }

    if (isNaN(parsedN) || parsedN < 1) {
      setError('El número de integrantes (N) debe ser un entero mayor o igual a 1.');
      return;
    }

    if (!team && !supervisor) {
      setError('Debes asignar un supervisor responsable para el nuevo equipo.');
      return;
    }

    onSave({
      campId: campaign.id,
      teamId: team?.id || null,
      name: trimmedName,
      n: parsedN,
      supervisor: team ? (supervisor || team.supervisor) : supervisor,
      active
    });
  };

  const isLowK = parseInt(n, 10) < 5;

  return (
    <div className="modal-overlay active" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              {team ? 'Editar Equipo' : 'Crear Nuevo Equipo'}
            </h2>
            <div className="modal-subtitle">
              Campaña: <strong>{campaign?.name}</strong>
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

            <div className="form-group">
              <label className="form-label" htmlFor="teamModalName">
                Nombre del equipo <span style={{ color: 'var(--c-critico)' }}>*</span>
              </label>
              <input
                id="teamModalName"
                type="text"
                className="form-input"
                placeholder="Ej. Equipo Alpha 3"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="teamModalN">
                Cantidad de integrantes activos (N) <span style={{ color: 'var(--c-critico)' }}>*</span>
              </label>
              <input
                id="teamModalN"
                type="number"
                min="1"
                max="500"
                className="form-input"
                value={n}
                onChange={(e) => setN(e.target.value)}
              />
              <span className="form-hint">
                {isLowK ? (
                  <span style={{ color: 'var(--c-alerta)', fontWeight: 500 }}>
                    Alerta de k-anonimato: con N &lt; 5, los tableros del supervisor no publicarán métricas para resguardar la identidad.
                  </span>
                ) : (
                  'Con N &ge; 5 las métricas agregadas son publicables sin riesgo de reidentificación.'
                )}
              </span>
            </div>

            {!team && (
              <div className="form-group">
                <label className="form-label" htmlFor="teamModalSupervisor">
                  Supervisor responsable <span style={{ color: 'var(--c-critico)' }}>*</span>
                </label>
                <select
                  id="teamModalSupervisor"
                  className="form-select"
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                >
                  <option value="">Selecciona un supervisor...</option>
                  {supervisorsList.map((sup) => (
                    <option key={sup} value={sup}>
                      {sup}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="teamModalStatus">
                Estado del equipo
              </label>
              <select
                id="teamModalStatus"
                className="form-select"
                value={active ? 'true' : 'false'}
                onChange={(e) => setActive(e.target.value === 'true')}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <Icon name="check" size={16} />
              <span>{team ? 'Guardar Cambios' : 'Crear Equipo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
