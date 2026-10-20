import { Icon } from '../../../core/components/Icon';
import { NlpAnalysisPanel } from '../components/NlpAnalysisPanel';

/**
 * Main editing workplace for the private agent journal (Modo Desahogo).
 * Manages free-text composition, operational context tagging, third-party privacy alerts,
 * character counting, deletion controls, and lexical NLP analysis presentation.
 *
 * @param {Object} props - Component properties.
 * @param {Object|undefined} props.consent - User consent snapshot.
 * @param {boolean} props.hasThirdPartyData - True if privacy heuristic flags names, IDs or sensitive third-party terms.
 * @param {(e: import('react').FormEvent) => void} props.handleSaveJournal - Save/analyze submit handler.
 * @param {string} props.contextTag - Selected shift context tag.
 * @param {import('react').Dispatch<import('react').SetStateAction<string>>} props.setContextTag - Context tag setter.
 * @param {import('react').RefObject<HTMLTextAreaElement>} props.textareaRef - Ref to textarea element for focus management.
 * @param {string} props.journalText - Current journal text content.
 * @param {import('react').Dispatch<import('react').SetStateAction<string>>} props.setJournalText - Journal text setter.
 * @param {boolean} props.isAnalyzing - Indicates if lexical NLP analysis is processing.
 * @param {string|null} props.currentJournalId - ID of active entry if editing, or null if new.
 * @param {() => void} props.handleDeleteJournal - Handler for deleting current journal entry.
 * @param {{message: string, type: string}} props.feedback - Notification feedback state.
 * @param {Object|null} props.currentJournal - Active journal entry object.
 * @param {() => void} props.handleOpenCorrection - Callback to open NLP category correction modal.
 * @param {import('react').Dispatch<import('react').SetStateAction<boolean>>} props.setShowHistoryModal - History modal visibility setter.
 * @param {() => void} props.onOpenSomaticModal - Callback to initiate somatic breathing pause.
 * @returns {import('react').JSX.Element} Journal editor work surface.
 */
export function JournalEditor({
  consent,
  hasThirdPartyData,
  handleSaveJournal,
  contextTag,
  setContextTag,
  textareaRef,
  journalText,
  setJournalText,
  isAnalyzing,
  currentJournalId,
  handleDeleteJournal,
  feedback,
  currentJournal,
  handleOpenCorrection,
  setShowHistoryModal,
  onOpenSomaticModal
}) {
  return (
    <section className="card agent-work-surface agent-journal-editor">
      <div
        className="card-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <div>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="notebookPen" size={18} style={{ color: 'var(--c-primario, #0f766e)' }} />
            <span>Modo Desahogo</span>
          </div>
          <div className="card-subtitle">
            Escribe con libertad para procesar tu jornada operativa sin juicios.
          </div>
        </div>
      </div>

      {/* Alerta de Datos de Terceros (Reformulada pedagógicamente) */}
      {hasThirdPartyData && (
        <div
          className="alert-banner warn"
          style={{ display: 'flex', gap: '10px', margin: '14px 0', alignItems: 'flex-start' }}
        >
          <Icon name="info" size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
            <strong>Protege tu privacidad y la de los demás:</strong> Te sugerimos no incluir nombres de
            compañeros ni datos de clientes (cédulas o números de contrato). Enfócate en cómo te sentiste tú
            con la situación vivida.
          </div>
        </div>
      )}

      <form id="journalForm" onSubmit={handleSaveJournal} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="contextTag">
            Contexto operativo de tu jornada (opcional)
          </label>
          <select
            id="contextTag"
            className="form-select"
            value={contextTag}
            onChange={(e) => setContextTag(e.target.value)}
          >
            <option value="">Sin etiqueta contextual</option>
            <option value="Turno mañana (apertura)">Turno mañana (apertura)</option>
            <option value="Turno intermedio">Turno intermedio</option>
            <option value="Turno noche / cierre">Turno noche / cierre</option>
            <option value="Pico de llamadas / Caída de sistema">Pico de llamadas / Caída de sistema</option>
            <option value="Llamadas difíciles / clientes molestos">
              Llamadas difíciles / clientes molestos
            </option>
            <option value="Jornada habitual">Jornada habitual</option>
          </select>
        </div>

        <div className="desahogo-container">
          <div className="form-group">
            <label className="form-label" htmlFor="journalText">
              <span>Espacio de reflexión y desahogo personal</span>
            </label>
            <textarea
              ref={textareaRef}
              id="journalText"
              className="form-textarea desahogo-textarea"
              rows={9}
              maxLength={2000}
              placeholder="¿Tuviste una llamada que te dejó con el corazón acelerado? ¿El sistema estuvo lento o resolviste un caso difícil? Escribe con libertad; este espacio pertenece a tu registro personal y no se muestra en las vistas agregadas..."
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
            />
            <div
              className={`char-count ${journalText.length > 1950 ? 'danger' : journalText.length > 1800 ? 'warn' : ''}`}
            >
              <span>{journalText.length}</span> / 2000 caracteres
            </div>
          </div>
        </div>

        <div className="journal-editor-actions">
          <button type="submit" className="btn btn-primary" id="saveJournalBtn" disabled={isAnalyzing}>
            <Icon name={isAnalyzing ? 'sync' : 'save'} size={18} />
            <span>{isAnalyzing ? 'Analizando…' : consent?.c3 ? 'Guardar y analizar' : 'Guardar'}</span>
          </button>

          {currentJournalId && (
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleDeleteJournal}
              style={{ marginLeft: 'auto' }}
            >
              <Icon name="delete" size={15} />
              <span>Eliminar entrada</span>
            </button>
          )}
        </div>

        {feedback.message && (
          <div className={`form-feedback ${feedback.type}`} style={{ marginTop: '12px' }}>
            {feedback.message}
          </div>
        )}
      </form>

      {/* 3. Panel de Análisis NLP Explicable */}
      {currentJournal && journalText.trim() !== currentJournal.text && <p role="status">El texto tiene cambios sin guardar. El análisis anterior corresponde a la versión guardada.</p>}
      <NlpAnalysisPanel
        journal={currentJournal && journalText.trim() === currentJournal.text ? currentJournal : null}
        onOpenCorrection={handleOpenCorrection}
        onOpenHistory={() => setShowHistoryModal(true)}
        onOpenSomaticModal={onOpenSomaticModal}
      />
    </section>
  );
}
