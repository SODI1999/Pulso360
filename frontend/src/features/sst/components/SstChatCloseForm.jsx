import { Icon } from '../../../core/components/Icon';

/**
 * Confirma el cierre del canal y el estado posterior del radicado en la misma superficie.
 * @param {object} props Estado/controladores de la confirmación, propiedad del panel SST.
 * @param {object} props.surfaceRef Referencia usada por useModalA11y para contener el foco.
 * @param {string} props.requestCode Radicado al que se aplica la decisión.
 * @param {string} props.notes Notas de cierre del caso.
 * @param {Function} props.onNotesChange Actualiza las notas, sin persistir antes de confirmar.
 * @param {string} props.targetStatus Estado posterior: Cerrada o En gestion.
 * @param {Function} props.onTargetStatusChange Selecciona uno de los estados existentes.
 * @param {Function} props.onCancel Vuelve a la conversación sin cerrarla.
 * @param {Function} props.onConfirm Envía la decisión al servicio de cierre.
 * @param {boolean} props.isClosing Bloquea envíos duplicados y salidas durante la confirmación.
 * @param {string|null} props.error Fallo recuperable devuelto por el cierre.
 * @returns {JSX.Element} Formulario nativo de confirmación, sin otro diálogo anidado.
 */
export function SstChatCloseForm({
  surfaceRef, requestCode, notes, onNotesChange, targetStatus, onTargetStatusChange,
  onCancel, onConfirm, isClosing, error
}) {
  return (
    <form ref={surfaceRef} tabIndex={-1} className="sst-close-panel" onSubmit={event => {
      event.preventDefault();
      if (!isClosing) onConfirm();
    }} aria-busy={isClosing}>
      <header className="sst-close-panel-header">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel} disabled={isClosing}>
          <Icon name="arrowLeft" size={16} />
          <span>Volver a la conversación</span>
        </button>
        <h2 id="modalCloseTitle">Concluir conversación</h2>
        <p>Radicado {requestCode}</p>
      </header>

      <div className="sst-close-panel-fields">
        <p className="sst-modal-disclaimer">
          El canal pasará a solo lectura. Los mensajes y las notas de cierre quedarán en el historial del radicado.
        </p>
        <fieldset className="sst-close-status-options" disabled={isClosing}>
          <legend>¿Cómo queda el radicado?</legend>
          <label>
            <input type="radio" name="targetRequestStatus" value="Cerrada" disabled={isClosing}
              checked={targetStatus === 'Cerrada'} onChange={event => onTargetStatusChange(event.target.value)} />
            <span><strong>Cerrar el radicado</strong><span>Finalizan el caso y la conversación.</span></span>
          </label>
          <label>
            <input type="radio" name="targetRequestStatus" value="En gestion" disabled={isClosing}
              checked={targetStatus === 'En gestion'} onChange={event => onTargetStatusChange(event.target.value)} />
            <span><strong>Mantener el seguimiento</strong><span>Termina esta conversación; el radicado continúa en gestión.</span></span>
          </label>
        </fieldset>

        <div className="form-group">
          <label className="form-label" htmlFor="sstCloseNotesInput">Notas de cierre y acuerdos (obligatorias)</label>
          <textarea id="sstCloseNotesInput" className="form-input form-textarea" rows={5}
            placeholder="Registra los acuerdos de orientación y seguimiento…"
            value={notes} onChange={event => onNotesChange(event.target.value)}
            maxLength={500} required disabled={isClosing}
            aria-invalid={Boolean(error && !notes.trim())}
            aria-describedby={`sst-close-notes-count${error ? ' sst-close-error' : ''}`} />
          <p id="sst-close-notes-count" className="sst-form-char-count">{notes.length} de 500 caracteres</p>
        </div>
        {error && <p id="sst-close-error" tabIndex={-1} className="chat-delivery-feedback alert-banner danger" role="alert">{error}</p>}
        <div role="status">{isClosing ? 'Guardando el cierre de la conversación…' : ''}</div>
      </div>

      <footer className="sst-close-panel-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isClosing}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={isClosing}>
          {isClosing ? 'Guardando cierre…' : 'Confirmar cierre de conversación'}
        </button>
      </footer>
    </form>
  );
}
