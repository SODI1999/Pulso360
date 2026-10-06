import { useExpiredFormDraft } from '../../../core/auth/useExpiredFormDraft';
// src/features/supervisor/components/ActionFollowupModal.jsx
// Modal estándar para registrar notas operativas de seguimiento en intervenciones de SST (RF-09)

import { useState, useRef } from 'react';
import { Icon } from '../../../core/components/Icon';
import { useModalA11y } from '../../../core/hooks/useModalA11y';

export function ActionFollowupModal({ intervention, onClose, onSave }) {
  const [actionType, setActionType] = useState('Ajuste de pausas y descansos');
  const [notes, setNotes] = useState('');
  const [progress, setProgress] = useState(intervention?.progress ?? 55);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef(null);

  useModalA11y({ isOpen: !!intervention, onClose, modalRef });

  useExpiredFormDraft(`followup:${intervention?.id}`, { actionType, notes, progress }, draft => {
    setActionType(draft.actionType); setNotes(draft.notes); setProgress(draft.progress);
  }, !!intervention);
  if (!intervention) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try { const result = await onSave({
      interventionId: intervention.id,
      actionType,
      notes: notes.trim() || 'Seguimiento y revisión operativa registrada por el supervisor.',
      progress: Number(progress)
    });
      if (result?.success === false) setError(result.error?.message || result.error);
    } catch (error) { setError(error.message); }
    finally { setSaving(false); }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay active"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalFollowupTitle"
      onClick={handleOverlayClick}
    >
      <div className="modal-box" ref={modalRef} style={{ maxWidth: '520px' }}>
        {/* Cabecera del modal */}
        <div className="modal-header">
          <div>
            <h2 id="modalFollowupTitle" className="modal-title">
              Registrar avance de intervención
            </h2>
            <div className="modal-subtitle">{intervention.title}</div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          {error && <p className="alert-banner danger" role="alert">{error}</p>}
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" htmlFor="followupActionType">
              Tipo de acción ejecutada
            </label>
            <select
              id="followupActionType"
              className="form-select"
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              autoFocus
            >
              <option value="Ajuste de pausas y descansos">Ajuste de pausas y descansos</option>
              <option value="Charla preventiva de inicio de turno">
                Charla preventiva de inicio de turno
              </option>
              <option value="Apoyo en colas de llamadas críticas">Apoyo en colas de llamadas críticas</option>
              <option value="Espacio de escucha y retroalimentación">
                Espacio de escucha y retroalimentación
              </option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="form-label" htmlFor="followupProgress" style={{ margin: 0 }}>
                Porcentaje de avance estimado
              </label>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--c-primario)' }}>
                {progress}%
              </span>
            </div>
            <input
              type="range"
              id="followupProgress"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--c-primario)', cursor: 'pointer' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" htmlFor="followupNotes">
              Observaciones del supervisor{' '}
              <span style={{ fontWeight: '400', color: 'var(--c-texto-mutado)' }}>(opcional)</span>
            </label>
            <textarea
              id="followupNotes"
              className="form-input form-textarea"
              rows={3}
              maxLength={500}
              style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', resize: 'vertical' }}
              placeholder="Describe la acción coordinada con el equipo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div
            className="alert-banner info"
            style={{ padding: '10px 14px', fontSize: '12px', marginBottom: '16px' }}
          >
            <Icon name="info" size={16} />
            <span>
              La nota se guarda en el seguimiento con tu identidad de supervisor. La auditoría registra la operación sin copiar su contenido.
            </span>
          </div>

          <div
            className="modal-footer"
            style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}
          >
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <span>{saving ? 'Guardando...' : 'Guardar avance'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
