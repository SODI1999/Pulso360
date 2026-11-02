import { useEffect, useRef } from 'react';
import { Icon } from '../../../core/components/Icon';
import { useModalA11y } from '../../../core/hooks/useModalA11y';

/**
 * Confirma y registra una solicitud administrativa de supresión.
 * Mantiene el resultado visible y bloquea salidas/otro envío mientras espera confirmación.
 * @param {object} props Estado del formulario, feedback tipado y acciones de la página.
 * @param {boolean} props.isSuppressing Hay un POST pendiente sin contrato de cancelación.
 * @returns {JSX.Element|null} Diálogo de confirmación con estados pendiente, error o éxito.
 */
export function SuppressionConfirmModal({
  isOpen,
  onClose,
  suppressionConfirmText,
  setSuppressionConfirmText,
  handleSuppressionSubmit,
  suppressionFeedback,
  isSuppressionConfirmed,
  isSuppressing
}) {
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const feedbackRef = useRef(null);
  useModalA11y({ isOpen, onClose: () => {
    if (!isSuppressing) onClose();
  }, modalRef, initialFocusRef: inputRef });
  useEffect(() => {
    if (isOpen && suppressionFeedback) feedbackRef.current?.focus();
  }, [isOpen, suppressionFeedback]);

  if (!isOpen) return null;

  return (
    <div
      className="privacy-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSuppressing) onClose();
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="privacy-modal-dialog card"
        role="dialog"
        aria-modal="true"
        aria-busy={isSuppressing}
        aria-labelledby="suppression-modal-title"
      >
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Icon name="Scale" size={18} style={{ color: 'var(--c-critico)', flexShrink: 0 }} />
              <h2 id="suppression-modal-title" className="card-title" style={{ fontSize: '16px', margin: 0 }}>
                Solicitud Formal de Supresión de Datos
              </h2>
            </div>
            <p className="card-subtitle" style={{ margin: 0 }}>
              Trámite de Habeas Data conforme a la Ley Estatutaria 1581 de 2012 de Colombia.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            disabled={isSuppressing}
            aria-label="Cerrar ventana de confirmación"
            style={{ padding: '6px', flexShrink: 0 }}
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--c-texto-suave)', marginBottom: '14px' }}>
          Esta acción registra una solicitud para su gestión administrativa. Crear el trámite no ejecuta un borrado automático; podrás consultar su estado y la respuesta registrada.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            background: 'var(--c-fondo)',
            padding: '12px',
            borderRadius: 'var(--radius-card, 8px)',
            marginBottom: '16px',
            border: '1px solid var(--c-borde-suave)'
          }}
        >
          <div>
            <strong style={{ fontSize: '12px', color: 'var(--c-texto)' }}>
              Información que puedes solicitar suprimir:
            </strong>
            <ul style={{ fontSize: '11.5px', color: 'var(--c-texto-suave)', paddingLeft: '18px', marginTop: '4px' }}>
              <li>Textos y reflexiones de tus bitácoras</li>
              <li>Registros somáticos de tus check-ins</li>
              <li>Histórico de acompañamiento psicosocial</li>
            </ul>
          </div>

          <div>
            <strong style={{ fontSize: '12px', color: 'var(--c-texto)' }}>
              Datos de seguimiento del trámite:
            </strong>
            <ul style={{ fontSize: '11.5px', color: 'var(--c-texto-suave)', paddingLeft: '18px', marginTop: '4px' }}>
              <li>Código y fecha de radicación</li>
              <li>Estado de la gestión administrativa</li>
              <li>Respuesta registrada para la solicitud</li>
            </ul>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="suppression-confirm-input"
            style={{ display: 'block', fontSize: '12.5px', color: 'var(--c-texto)', marginBottom: '6px' }}
          >
            Para confirmar, escribe la palabra <strong style={{ color: 'var(--c-critico)' }}>SUPRIMIR</strong>:
          </label>
          <input
            id="suppression-confirm-input"
            ref={inputRef}
            className="form-input"
            placeholder="Escribe SUPRIMIR..."
            autoComplete="off"
            value={suppressionConfirmText}
            readOnly={isSuppressing}
            onChange={(e) => setSuppressionConfirmText(e.target.value)}
            style={{ width: '100%', maxWidth: '280px' }}
          />
        </div>
        {isSuppressing && <p role="status">Esperando confirmación del registro de la solicitud…</p>}

        {suppressionFeedback && (
          <div ref={feedbackRef} tabIndex={-1} className={`alert-banner ${suppressionFeedback.type === 'error' ? 'danger' : 'ok'}`}
            role={suppressionFeedback.type === 'error' ? 'alert' : 'status'} style={{ marginBottom: '16px' }}>
            <Icon name={suppressionFeedback.type === 'error' ? 'AlertTriangle' : 'CheckCircle2'} size={14} />
            <span>{suppressionFeedback.message}</span>
          </div>
        )}

        <div className="modal-footer suppression-modal-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} disabled={isSuppressing}>
            <span>{suppressionFeedback?.type === 'success' ? 'Cerrar' : 'Cancelar'}</span>
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            disabled={isSuppressing || !isSuppressionConfirmed}
            onClick={handleSuppressionSubmit}
          >
            <Icon name="Scale" size={14} />
            <span>{isSuppressing ? 'Registrando solicitud…' : 'Crear solicitud de supresión'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
