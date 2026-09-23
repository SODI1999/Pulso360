import { useRef } from 'react';
import { Icon } from '../../../core/components/Icon';
import { useAgentModalAccessibility } from '../hooks/useAgentModalAccessibility';

export function NlpCorrectionModal({
  isOpen,
  allCategories,
  selectedCategories,
  onToggleCategory,
  correctionNote,
  onChangeNote,
  onSave,
  onClose
}) {
  const dialogRef = useRef(null);
  useAgentModalAccessibility({ isOpen, onClose, dialogRef });

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay active"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nlp-correction-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={dialogRef} className="modal-box agent-modal">
        <div className="modal-header">
          <div>
            <h2 id="nlp-correction-title" className="modal-title">
              Corregir clasificación orientativa
            </h2>
            <p className="modal-subtitle">
              Tú eres quien mejor sabe cómo viviste tu turno. Tu criterio siempre prima sobre cualquier
              clasificación léxica automática.
            </p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Garantía de privacidad BPO sin reporte punitivo */}
        <div className="agent-notice agent-notice--flat">
          <Icon name="lock" size={16} className="agent-notice-icon" />
          <span className="agent-notice-text">
            Esta corrección queda almacenada en tu bitácora personal y se utiliza para ajustar tu registro. No
            se incorpora a las vistas agregadas de supervisión.
          </span>
        </div>

        <div className="category-grid agent-modal-catgrid">
          {allCategories.map((categoryName) => {
            const isChecked = selectedCategories.includes(categoryName);
            return (
              <label key={categoryName}>
                <input type="checkbox" checked={isChecked} onChange={() => onToggleCategory(categoryName)} />
                <span>{categoryName}</span>
              </label>
            );
          })}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="nlpCorrectionNote">
            Comentario o motivo de tu ajuste (opcional)
          </label>
          <textarea
            id="nlpCorrectionNote"
            className="form-textarea"
            rows={2}
            maxLength={200}
            placeholder="Si lo deseas, anota por qué consideras que estos factores describen mejor lo vivido..."
            value={correctionNote}
            onChange={(e) => onChangeNote(e.target.value)}
          />
          <div className="char-count">
            <span>{correctionNote.length}</span> / 200 caracteres
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={onSave}>
            Guardar corrección
          </button>
        </div>
      </div>
    </div>
  );
}

export function NlpHistoryModal({ isOpen, history = [], onClose }) {
  const dialogRef = useRef(null);
  useAgentModalAccessibility({ isOpen, onClose, dialogRef });

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay active"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nlp-history-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={dialogRef} className="modal-box agent-modal agent-modal--wide">
        <div className="modal-header">
          <div>
            <h2 id="nlp-history-title" className="modal-title">
              Historial de correcciones NLP
            </h2>
            <p className="modal-subtitle">
              Trazabilidad cronológica de todas las intervenciones humanas sobre esta entrada.
            </p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="agent-modal-scroll">
          {history.map((h, idx) => {
            const itemNumber = history.length - idx;
            return (
              <div key={idx} className="agent-modal-history-item">
                <div className="agent-modal-history-head">
                  <strong className="agent-modal-history-title">Corrección #{itemNumber}</strong>
                  <span className="agent-modal-history-date">
                    {h.dateFormatted || new Date(h.timestamp || h.date).toLocaleString('es-CO')}
                  </span>
                </div>
                <div className="agent-modal-history-badges">
                  {h.categories && h.categories.length > 0 ? (
                    h.categories.map((cat) => (
                      <span key={cat} className="badge badge-info">
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span className="badge badge-neutral">Ninguna aplica</span>
                  )}
                </div>
                {h.previousCategories && (
                  <div className="agent-modal-history-previous">
                    Anterior: {h.previousCategories.join(', ') || 'Sin clasificar'}
                  </div>
                )}
                {h.note && <div className="agent-modal-history-note">&ldquo;{h.note}&rdquo;</div>}
              </div>
            );
          })}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
