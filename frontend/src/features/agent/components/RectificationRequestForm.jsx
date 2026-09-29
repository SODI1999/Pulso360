import { Icon } from '../../../core/components/Icon';

export function RectificationRequestForm({
  rectificationText,
  setRectificationText,
  handleRectificationSubmit,
  rectificationFeedback
}) {
  return (
    <div className="card">
      <div className="card-title">Solicitar rectificación de datos</div>
      <p style={{ fontSize: '13px', color: 'var(--c-texto-suave)', margin: '8px 0 14px' }}>
        Indica qué información consideras incorrecta. La solicitud queda formalmente registrada y auditada.
      </p>
      <textarea
        className="form-textarea"
        rows={3}
        maxLength={300}
        placeholder="Describe el dato o registro a revisar..."
        value={rectificationText}
        onChange={(e) => setRectificationText(e.target.value)}
      />
      <button
        type="button"
        className="btn btn-secondary"
        onClick={handleRectificationSubmit}
        style={{ marginTop: '12px' }}
      >
        <Icon name="edit_note" size={16} />
        <span>Crear solicitud de rectificación</span>
      </button>
      {rectificationFeedback && (
        <div className="form-feedback info" style={{ marginTop: '10px' }}>
          {rectificationFeedback}
        </div>
      )}
    </div>
  );
}
