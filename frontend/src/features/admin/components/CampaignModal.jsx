import { useExpiredFormDraft } from '../../../core/auth/useExpiredFormDraft';
// src/features/admin/components/CampaignModal.jsx
// Modal para creación y edición de campañas operativas (RF-15)

import { useState, useEffect, useRef } from 'react';
import { Icon } from '../../../core/components/Icon';
import { useModalA11y } from '../../../core/hooks/useModalA11y';

export function CampaignModal({ isOpen, onClose, onSave, campaign = null }) {
  const [name, setName] = useState('');
  const [active, setActive] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef(null);

  useModalA11y({ isOpen, onClose, modalRef });

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

  useExpiredFormDraft(`campaign:${campaign?.id || 'new'}`, { name, active }, draft => {
    setName(draft.name); setActive(draft.active);
  }, isOpen);
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('El nombre de la campaña es obligatorio.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await onSave({
        id: campaign?.id || null,
        name: trimmedName,
        active
      });
      if (result?.success === false) setError(result.error?.message || result.error);
    } catch (error) { setError(error.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="modal-overlay active" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{campaign ? 'Editar Campaña' : 'Crear Nueva Campaña'}</h2>
            <div className="modal-subtitle">
              {campaign
                ? `Modificando: ${campaign.name}`
                : 'Registra una nueva unidad operativa en el sistema'}
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
            <button type="submit" disabled={submitting} className="btn btn-primary">
              <Icon name="check" size={16} />
              <span>{campaign ? 'Guardar Cambios' : 'Crear Campaña'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
