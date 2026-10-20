import { useEffect, useRef } from 'react';
import { Icon } from '../../../core/components/Icon';

/**
 * Modal Seguro de Confirmación para Solicitudes de Supresión de Datos.
 * Garantiza un flujo reflexivo y seguro para el agente con trampa de foco y cierre accesible.
 */
export function SuppressionConfirmModal({
  isOpen,
  onClose,
  suppressionConfirmText,
  setSuppressionConfirmText,
  handleSuppressionSubmit,
  suppressionFeedback,
  isSuppressionConfirmed
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="privacy-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        className="privacy-modal-dialog card"
        role="dialog"
        aria-modal="true"
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
            aria-label="Cerrar ventana de confirmación"
            style={{ padding: '6px', flexShrink: 0 }}
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--c-texto-suave)', marginBottom: '14px' }}>
          Esta acción registra una solicitud formal para revisión por el Oficial de Privacidad y el equipo de SG-SST. El registro no ejecuta un borrado inmediato e irrevocable de manera automática.
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
              Datos que conserva el radicado por norma:
            </strong>
            <ul style={{ fontSize: '11.5px', color: 'var(--c-texto-suave)', paddingLeft: '18px', marginTop: '4px' }}>
              <li>Código y fecha de radicación</li>
              <li>Estado de la gestión administrativa</li>
              <li>Respuesta oficial emitida (auditoría SG-SST)</li>
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
            onChange={(e) => setSuppressionConfirmText(e.target.value)}
            style={{ width: '100%', maxWidth: '280px' }}
          />
        </div>

        {suppressionFeedback && (
          <div className="form-feedback info" style={{ marginBottom: '16px' }}>
            <Icon name="Info" size={14} />
            <span>{suppressionFeedback}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            <span>Cancelar</span>
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            disabled={!isSuppressionConfirmed}
            onClick={handleSuppressionSubmit}
          >
            <Icon name="Scale" size={14} />
            <span>Crear solicitud de supresión</span>
          </button>
        </div>
      </div>
    </div>
  );
}
