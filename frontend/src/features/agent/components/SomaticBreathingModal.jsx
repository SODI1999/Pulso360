import { useRef } from 'react';
import { Icon } from '../../../core/components/Icon';
import { useAgentModalAccessibility } from '../hooks/useAgentModalAccessibility';
import { ZenBreathingOrb } from './ZenBreathingOrb';
import '../../../styles/crisis.css';

/**
 * SomaticBreathingModal: Modal accesible flotante in-situ para desacelerar taquicardia
 * y sobrecarga emocional dentro de la bitácora sin perder el contexto de la nota guardada.
 */
export function SomaticBreathingModal({ isOpen, onClose }) {
  const dialogRef = useRef(null);
  useAgentModalAccessibility({ isOpen, onClose, dialogRef });

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay active"
      role="dialog"
      aria-modal="true"
      aria-labelledby="somatic-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="modal-box agent-modal somatic-modal-box"
        style={{ maxWidth: '520px', padding: '24px' }}
      >
        <div className="modal-header" style={{ marginBottom: '16px' }}>
          <div>
            <h2 id="somatic-modal-title" className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="respiro" size={20} style={{ color: 'var(--c-primario, #0f766e)' }} />
              <span>Pausa Somática en Puesto</span>
            </h2>
            <p className="modal-subtitle" style={{ marginTop: '4px', fontSize: '13.5px' }}>
              Sigue el compás del círculo para desacelerar tu pulso y soltar la adrenalina tras una llamada difícil.
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Cerrar pausa somática"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="somatic-modal-body" style={{ margin: '16px 0' }}>
          <ZenBreathingOrb />
        </div>

        <div className="somatic-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--c-borde-suave)' }}>
          <span style={{ fontSize: '12px', color: 'var(--c-texto-suave)', maxWidth: '300px', lineHeight: '1.4' }}>
            <Icon name="shieldCheck" size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            Pausa de autorregulación privada. No afecta métricas ni monitoreo.
          </span>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onClose}
            autoFocus
          >
            <span>Listo, volver</span>
          </button>
        </div>
      </div>
    </div>
  );
}
