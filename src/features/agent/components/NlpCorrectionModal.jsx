// src/features/agent/components/NlpCorrectionModal.jsx
// Modal de intervención humana (Human-in-the-loop) para corregir clasificaciones NLP

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
    if (!isOpen) return null;

    return (
        <div className="modal-overlay active" role="dialog" aria-modal="true">
            <div className="modal-box" style={{ maxWidth: '540px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: 'var(--c-texto)' }}>
                    Corregir clasificación orientativa
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--c-texto-suave)', marginBottom: '16px' }}>
                    Tu corrección humana tiene prioridad absoluta y quedará registrada en tu historial de intervenciones.
                </p>

                <div className="category-grid" style={{ marginBottom: '16px', maxHeight: '240px', overflowY: 'auto' }}>
                    {allCategories.map(categoryName => {
                        const isChecked = selectedCategories.includes(categoryName);
                        return (
                            <label
                                key={categoryName}
                                style={{
                                    background: isChecked ? 'var(--c-primario-suave)' : 'var(--c-superficie)',
                                    borderColor: isChecked ? 'var(--c-primario)' : 'var(--c-borde-suave)'
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => onToggleCategory(categoryName)}
                                />
                                <span>{categoryName}</span>
                            </label>
                        );
                    })}
                </div>

                <div className="form-group">
                    <label className="form-label">Comentario u observación (opcional)</label>
                    <textarea
                        className="form-textarea"
                        rows={2}
                        maxLength={200}
                        placeholder="Detalle adicional para tu registro..."
                        value={correctionNote}
                        onChange={(e) => onChangeNote(e.target.value)}
                    />
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
    if (!isOpen) return null;

    return (
        <div className="modal-overlay active" role="dialog" aria-modal="true">
            <div className="modal-box" style={{ maxWidth: '580px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px', color: 'var(--c-texto)' }}>
                    Historial de correcciones NLP
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--c-texto-suave)', marginBottom: '16px' }}>
                    Trazabilidad cronológica de todas las intervenciones humanas sobre esta entrada.
                </p>

                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {history.map((h, idx) => {
                        const itemNumber = history.length - idx;
                        return (
                            <div key={idx} style={{ padding: '12px', background: 'var(--c-fondo)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--c-borde-suave)', fontSize: '12.5px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <strong style={{ fontSize: '13px', color: 'var(--c-texto)' }}>Corrección #{itemNumber}</strong>
                                    <span style={{ fontSize: '11px', color: 'var(--c-texto-mutado)' }}>
                                        {h.dateFormatted || new Date(h.timestamp || h.date).toLocaleString('es-CO')}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', margin: '4px 0' }}>
                                    {(h.categories && h.categories.length > 0) ? (
                                        h.categories.map(cat => (
                                            <span key={cat} className="badge badge-info" style={{ fontSize: '11px' }}>{cat}</span>
                                        ))
                                    ) : (
                                        <span className="badge badge-neutral" style={{ fontSize: '11px' }}>Ninguna aplica</span>
                                    )}
                                </div>
                                {h.previousCategories && (
                                    <div style={{ fontSize: '11.5px', color: 'var(--c-texto-mutado)', marginTop: '4px' }}>
                                        Anterior: {h.previousCategories.join(', ') || 'Sin clasificar'}
                                    </div>
                                )}
                                {h.note && (
                                    <div style={{ color: 'var(--c-texto-suave)', fontStyle: 'italic', marginTop: '6px', background: 'var(--c-superficie)', padding: '6px 10px', borderRadius: 'var(--radius-xs)' }}>
                                        "{h.note}"
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="modal-footer" style={{ marginTop: '16px' }}>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
