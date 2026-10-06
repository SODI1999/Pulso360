import { useExpiredFormDraft } from '../../../core/auth/useExpiredFormDraft';
// src/features/admin/components/HabeasAdvanceModal.jsx
// Modal para avanzar estado y registrar respuesta en solicitud de Habeas Data (RF-14)

import { useState, useEffect, useRef } from 'react';
import { Icon } from '../../../core/components/Icon';
import { useModalA11y } from '../../../core/hooks/useModalA11y';

export function HabeasAdvanceModal({ isOpen, onClose, onConfirm, request, nextStatus }) {
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef(null);

  useModalA11y({ isOpen, onClose, modalRef });

  useEffect(() => {
    if (nextStatus === 'Respondida') {
      setNote(request?.note || '');
    } else if (nextStatus === 'Cerrada') {
      setNote(request?.note || '');
    } else {
      setNote(request?.note || '');
    }
  }, [request, nextStatus, isOpen]);

  useExpiredFormDraft(`habeas:${request?.id}:${nextStatus}`, { note }, draft => setNote(draft.note), isOpen && !!request);
  if (!isOpen || !request) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await onConfirm({
        requestId: request.id,
        nextStatus,
        note: note.trim()
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
            <h2 className="modal-title">Avanzar Estado de Solicitud</h2>
            <div className="modal-subtitle">
              Radicado: <strong>{request.id}</strong> ({request.type})
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Cerrar modal">
            <Icon name="close" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <p className="alert-banner danger" role="alert">{error}</p>}
          <div className="modal-body">
            <p style={{ fontSize: '13.5px', marginBottom: 'var(--space-3)' }}>
              La solicitud pasará del estado <span className="badge badge-info">{request.status}</span> al
              estado <span className="badge badge-ok">{nextStatus}</span>.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="habeasModalNote">
                Nota o constancia administrativa del trámite
              </label>
              <textarea
                id="habeasModalNote"
                className="form-textarea"
                rows={3}
                placeholder="Registra el detalle de la respuesta o la gestión realizada..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                autoFocus
              />
              <span className="form-hint">
                Esta observación quedará registrada en el radicado y en el registro de auditoría.
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              <Icon name="check" size={16} />
              <span>Confirmar Transición</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
