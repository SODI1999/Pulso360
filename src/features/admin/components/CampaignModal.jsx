// src/features/admin/components/CampaignModal.jsx
// Modal para creación y edición de campañas operativas (RF-15)

import { useState, useEffect } from 'react';
import { Icon } from '../../../core/components/Icon';

export function CampaignModal({ isOpen, onClose, onSave, campaign = null }) {
  const [name, setName] = useState('');
  const [active, setActive] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (campaign) {
      setName(campaign.name || '');
      setActive(campaign.active !== false);
    } else {
      setName('');
      setActive(true);
    }
    setError('');
  }, [campaign, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('El nombre de la campaña es obligatorio.');
      return;
    }

    onSave({
      id: campaign?.id || null,
      name: trimmedName,
      active
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              {campaign ? 'Editar Campaña' : 'Crear Nueva Campaña'}
            </h2>
            <div className="modal-subtitle">
              {campaign ? `Modificando: ${campaign.name}` : 'Registra una nueva unidad operativa en el sistema'}
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
              <label className="form-label" htmlFor="campModalName">
                Nombre de la campaña <span style={{ color: 'var(--c-critico)' }}>*</span>
              </label>
              <input
                id="campModalName"
                type="text"
                className="form-input"
                placeholder="Ej. Campaña Soporte Alpha"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="campModalStatus">
                Estado operativo
              </label>
              <select
                id="campModalStatus"
                className="form-select"
                value={active ? 'true' : 'false'}
                onChange={(e) => setActive(e.target.value === 'true')}
              >
                <option value="true">Activa</option>
                <option value="false">Inactiva</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <Icon name="check" size={16} />
              <span>{campaign ? 'Guardar Cambios' : 'Crear Campaña'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
