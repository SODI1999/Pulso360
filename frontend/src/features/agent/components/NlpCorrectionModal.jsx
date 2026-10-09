import { useRef } from 'react';
import { Icon } from '../../../core/components/Icon';
import { useAgentModalAccessibility } from '../hooks/useAgentModalAccessibility';

import { FACTOR_METADATA } from '../data/nlpFactorMetadata';

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

  const standardCategories = allCategories.filter((c) => c !== 'Ninguna aplica');
  const hasNoneOption = allCategories.includes('Ninguna aplica');
  const isNoneChecked = selectedCategories.includes('Ninguna aplica');

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
      <div ref={dialogRef} className="modal-box agent-modal agent-modal--correction">
        <div className="modal-header">
          <div>
            <h2 id="nlp-correction-title" className="modal-title">
              Corregir clasificación orientativa
            </h2>
            <p className="modal-subtitle">
              Tú eres quien mejor sabe cómo viviste tu turno. Tu criterio siempre prima sobre la clasificación automática.
            </p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Selector interactivo de factores */}
        <div className="correction-selector-section">
          <div className="correction-options-grid">
            {standardCategories.map((categoryName) => {
              const isChecked = selectedCategories.includes(categoryName);
              const meta = FACTOR_METADATA[categoryName] || {
                icon: 'sliders',
                desc: 'Factor orientativo de la jornada.'
              };

              return (
                <label
                  key={categoryName}
                  className={`correction-option-tile ${isChecked ? 'is-selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="correction-hidden-checkbox"
                    checked={isChecked}
                    onChange={() => onToggleCategory(categoryName)}
                  />
                  <div className="correction-option-icon">
                    <Icon name={meta.icon} size={18} />
                  </div>
                  <div className="correction-option-content">
                    <span className="correction-option-name">{categoryName}</span>
                    <span className="correction-option-desc">{meta.desc}</span>
                  </div>
                  <div className="correction-check-indicator" aria-hidden="true">
                    {isChecked && <Icon name="check" size={12} strokeWidth={2.5} />}
                  </div>
                </label>
              );
            })}
          </div>

          {/* Opción exclusiva "Ninguna aplica" */}
          {hasNoneOption && (
            <div className="correction-none-wrapper">
              <label
                className={`correction-option-tile correction-option-tile--none ${isNoneChecked ? 'is-selected' : ''}`}
              >
                <input
                  type="checkbox"
                  className="correction-hidden-checkbox"
                  checked={isNoneChecked}
                  onChange={() => onToggleCategory('Ninguna aplica')}
                />
                <div className="correction-option-icon">
                  <Icon name={FACTOR_METADATA['Ninguna aplica'].icon} size={18} />
                </div>
                <div className="correction-option-content">
                  <span className="correction-option-name">Ninguna aplica</span>
                  <span className="correction-option-desc">
                    {FACTOR_METADATA['Ninguna aplica'].desc}
                  </span>
                </div>
                <div className="correction-check-indicator" aria-hidden="true">
                  {isNoneChecked && <Icon name="check" size={12} strokeWidth={2.5} />}
                </div>
              </label>
            </div>
          )}
        </div>

        <div className="form-group" style={{ marginTop: '14px' }}>
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

        {/* Garantía de privacidad BPO: ubicada al pie como en PerspectiveSimModal */}
        <div className="agent-notice agent-notice--flat">
          <Icon name="shieldCheck" size={16} className="agent-notice-icon" />
          <div className="agent-notice-text">
            <strong>Privacidad de tu registro:</strong> Este ajuste queda registrado exclusivamente en tu bitácora personal. No se incorpora a las vistas agregadas de supervisión.
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

export function NlpHistoryModal({ isOpen, history = [], analyses = [], onClose }) {
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
          {analyses.map((analysis,index) => <div className="agent-modal-history-item" key={`${analysis.contentHash}-${index}`}>
            <strong>Análisis anterior · {analysis.version}</strong>
            <p>Contenido analizado: {analysis.contentHash?.slice(0,12)}… · {new Date(analysis.archivedAt).toLocaleString('es-CO')}</p>
            <p>{analysis.categories?.map(category => category.name).join(', ') || 'Sin categorías'}</p>
            {analysis.content && <p>Texto de esa versión: {analysis.content}</p>}
            {(analysis.correctionHistory || []).map(revision => <p key={revision.id}>Revisión: {revision.categories.join(', ') || 'Ninguna aplica'}{revision.note ? ` · ${revision.note}` : ''}</p>)}
          </div>)}
          {!history.length && !analyses.length && <p>No hay revisiones anteriores.</p>}
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
