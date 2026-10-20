import { useRef } from 'react';
import { Icon } from '../../../core/components/Icon';
import { useAgentModalAccessibility } from '../hooks/useAgentModalAccessibility';
import { FACTOR_METADATA } from '../data/nlpFactorMetadata';

/**
 * Accessible modal allowing agents to correct or fine-tune lexical NLP factor tags on their entries.
 * Upholds psychological safety: the agent's human lived experience strictly supersedes automated classifications.
 *
 * @param {Object} props - Component properties.
 * @param {boolean} props.isOpen - Modal open status.
 * @param {string[]} props.allCategories - All selectable factor keys.
 * @param {string[]} props.selectedCategories - Currently checked factor keys.
 * @param {(category: string) => void} props.onToggleCategory - Toggle handler for a factor.
 * @param {string} props.correctionNote - User feedback or explanation note text.
 * @param {(note: string) => void} props.onChangeNote - Note setter.
 * @param {() => void} props.onSave - Save callback.
 * @param {() => void} props.onClose - Modal dismissal callback.
 * @returns {import('react').JSX.Element|null} Rendered modal dialog.
 */
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

/**
 * Historical revision modal displaying previous textual versions and human adjustments of NLP analysis.
 *
 * @param {Object} props - Component properties.
 * @param {boolean} props.isOpen - Modal open status.
 * @param {Array<Object>} [props.history=[]] - Factor adjustment history records.
 * @param {Array<Object>} [props.analyses=[]] - Prior archived textual analyses.
 * @param {() => void} props.onClose - Modal dismissal callback.
 * @returns {import('react').JSX.Element|null} Rendered revision history dialog.
 */
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
              Historial de revisiones
            </h2>
            <p className="modal-subtitle">
              Consulta los cambios de texto y los factores ajustados en esta entrada.
            </p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="agent-modal-scroll">
          {analyses.map((analysis, index) => (
            <div className="agent-modal-history-item" key={`${analysis.contentHash || 'analysis'}-${index}`}>
              <div className="agent-modal-history-head">
                <strong className="agent-modal-history-title">
                  Versión anterior #{analyses.length - index}
                </strong>
                <span className="agent-modal-history-date">
                  {analysis.archivedAt
                    ? new Date(analysis.archivedAt).toLocaleString('es-CO', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })
                    : ''}
                </span>
              </div>

              {analysis.content && (
                <div className="agent-modal-history-note" style={{ fontStyle: 'normal' }}>
                  &ldquo;{analysis.content}&rdquo;
                </div>
              )}

              <div className="agent-modal-history-badges" style={{ marginTop: '8px' }}>
                {analysis.categories && analysis.categories.length > 0 ? (
                  analysis.categories.map((c) => {
                    const catName = c.name || c;
                    return (
                      <span key={catName} className="analysis-factor-badge">
                        <Icon name={FACTOR_METADATA[catName]?.icon || 'activity'} size={13} />
                        <span>{catName}</span>
                      </span>
                    );
                  })
                ) : (
                  <span className="badge badge-neutral">Sin factores de tensión</span>
                )}
              </div>

              {(analysis.correctionHistory || []).map((revision) => (
                <div key={revision.id} className="agent-modal-history-previous" style={{ marginTop: '6px' }}>
                  Ajuste realizado: <strong>{revision.categories?.join(', ') || 'Ninguna aplica'}</strong>
                  {revision.note ? ` · "${revision.note}"` : ''}
                </div>
              ))}
            </div>
          ))}

          {!history.length && !analyses.length && (
            <p style={{ color: 'var(--c-texto-suave)', textAlign: 'center', padding: '24px 0' }}>
              No hay revisiones anteriores para esta entrada.
            </p>
          )}

          {history.map((h, idx) => {
            const itemNumber = history.length - idx;
            return (
              <div key={idx} className="agent-modal-history-item">
                <div className="agent-modal-history-head">
                  <strong className="agent-modal-history-title">Ajuste de factores #{itemNumber}</strong>
                  <span className="agent-modal-history-date">
                    {h.dateFormatted || (h.timestamp || h.date ? new Date(h.timestamp || h.date).toLocaleString('es-CO', {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    }) : '')}
                  </span>
                </div>
                <div className="agent-modal-history-badges">
                  {h.categories && h.categories.length > 0 ? (
                    h.categories.map((cat) => (
                      <span key={cat} className="analysis-factor-badge factor-chip-adjusted">
                        <Icon name={FACTOR_METADATA[cat]?.icon || 'check'} size={13} />
                        <span>{cat}</span>
                      </span>
                    ))
                  ) : (
                    <span className="badge badge-neutral">Ninguna aplica</span>
                  )}
                </div>
                {h.previousCategories && (
                  <div className="agent-modal-history-previous">
                    Clasificación anterior: {h.previousCategories.join(', ') || 'Sin clasificar'}
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
