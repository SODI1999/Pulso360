// src/features/sst/components/DismissAlertModal.jsx
// Modal accesible para registro obligatorio de motivo de descarte de alerta (RF-08)

import { useState } from 'react';
import { Icon } from '../../../core/components/Icon';

export function DismissAlertModal({ alertItem, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const minLength = 20;
  const isValid = reason.trim().length >= minLength;

  if (!alertItem) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    onConfirm(alertItem.id, reason.trim());
  };

  return (
    <div className="modal-overlay active" role="dialog" aria-modal="true" aria-labelledby="modalDismissTitle">
      <div className="modal-box" style={{ maxWidth: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h2 id="modalDismissTitle" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--c-texto)', margin: '0 0 4px 0' }}>
              Descartar alerta preventiva
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--c-texto-suave)', margin: 0 }}>
              {alertItem.rule} · {alertItem.campaign}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--c-texto-suave)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <p style={{ fontSize: '13.5px', color: 'var(--c-texto)', lineHeight: '1.5', marginBottom: '14px' }}>
            Para garantizar la trazabilidad de seguridad y salud en el trabajo, debes registrar una justificación técnica o contextual para descartar esta alerta.
          </p>

          <div className="form-group" style={{ marginBottom: '14px', width: '100%' }}>
            <label className="form-label" htmlFor="dismissReasonInput">
              Motivo técnico del descarte <span style={{ color: 'var(--c-critico)' }}>*</span>
            </label>
            <textarea
              id="dismissReasonInput"
              className="form-input form-textarea"
              rows={4}
              maxLength={500}
              style={{
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                resize: 'vertical',
                minHeight: '95px'
              }}
              placeholder="Describe detalladamente el contexto operativo o técnico por el cual no procede formular un plan de intervención (mínimo 20 caracteres)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              autoFocus
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '12px' }}>
              <span style={{ color: 'var(--c-texto-mutado)' }}>
                Requisito RF-08: mínimo 20 caracteres (máx. 500)
              </span>
              <span style={{ color: isValid ? 'var(--c-ok)' : 'var(--c-alerta)', fontWeight: '600' }}>
                {reason.trim().length} / {minLength} caracteres mínimos
              </span>
            </div>
          </div>

          <div className="alert-banner info" style={{ padding: '10px 14px', fontSize: '12.5px', marginBottom: '16px' }}>
            <Icon name="info" size={16} />
            <span>Esta justificación se registrará de manera inmutable en la cadena de auditoría.</span>
          </div>

          <div className="modal-footer" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isValid}
              style={{ opacity: isValid ? 1 : 0.6 }}
            >
              Confirmar descarte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
