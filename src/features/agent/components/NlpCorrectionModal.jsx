import { useEffect } from 'react';
import { Icon } from '../../../core/components/Icon';

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
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

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
            <div className="modal-box" style={{ maxWidth: '540px' }}>
                <div className="modal-header">
                    <div>
                        <h2 id="nlp-correction-title" className="modal-title">
                            Corregir clasificación orientativa
                        </h2>
                        <p className="modal-subtitle" style={{ marginTop: '4px', lineHeight: '1.5' }}>
                            Tú eres quien mejor sabe cómo viviste tu turno. Tu criterio siempre prima sobre cualquier clasificación léxica automática.
                        </p>
                    </div>
                    <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
                        <Icon name="close" size={18} />
                    </button>
                </div>

                {/* Garantía de privacidad BPO sin reporte punitivo */}
                <div className="analysis-calm-banner" style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <Icon name="lock" size={16} style={{ color: 'var(--c-calma-accent, #1b7a68)', flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '12px', lineHeight: '1.5' }}>
                        Esta corrección es estrictamente privada y queda almacenada en tu bitácora personal. No se comparte ni se reporta a supervisores, coordinadores ni monitoreo de calidad (QA).
                    </span>
                </div>

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
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

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
            <div className="modal-box" style={{ maxWidth: '580px' }}>
                <div className="modal-header">
                    <div>
                        <h2 id="nlp-history-title" className="modal-title">
                            Historial de correcciones NLP
                        </h2>
                        <p className="modal-subtitle" style={{ marginTop: '4px', lineHeight: '1.5' }}>
                            Trazabilidad cronológica de todas las intervenciones humanas sobre esta entrada.
                        </p>
                    </div>
                    <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
                        <Icon name="close" size={18} />
                    </button>
                </div>

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
                                        &ldquo;{h.note}&rdquo;
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
