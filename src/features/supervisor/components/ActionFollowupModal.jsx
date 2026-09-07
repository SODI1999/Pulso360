// src/features/supervisor/components/ActionFollowupModal.jsx
// Modal estándar para registrar notas operativas de seguimiento en intervenciones de SST (RF-09)

import { useState } from 'react';
import { Icon } from '../../../core/components/Icon';

export function ActionFollowupModal({ intervention, onClose, onSave }) {
    const [actionType, setActionType] = useState('Ajuste de pausas y descansos');
    const [notes, setNotes] = useState('');
    const [progress, setProgress] = useState(intervention?.progress || 55);
    const [saving, setSaving] = useState(false);

    if (!intervention) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaving(true);

        onSave({
            interventionId: intervention.id,
            actionType,
            notes: notes.trim() || 'Seguimiento y revisión operativa registrada por el supervisor.',
            progress: Number(progress)
        });
    };

    return (
        <div className="modal-overlay active" role="dialog" aria-modal="true" aria-labelledby="modalFollowupTitle">
            <div className="modal-box" style={{ maxWidth: '520px' }}>
                {/* Cabecera del modal */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                        <h2 id="modalFollowupTitle" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--c-texto)', margin: '0 0 4px 0' }}>
                            Registrar seguimiento operativo
                        </h2>
                        <p style={{ fontSize: '13px', color: 'var(--c-texto-suave)', margin: 0 }}>
                            {intervention.title}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar modal"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--c-texto-suave)',
                            padding: '4px',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Icon name="x" size={20} />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '14px' }}>
                        <label className="form-label" htmlFor="followupActionType">Tipo de acción ejecutada</label>
                        <select
                            id="followupActionType"
                            className="form-select"
                            value={actionType}
                            onChange={(e) => setActionType(e.target.value)}
                        >
                            <option value="Ajuste de pausas y descansos">Ajuste de pausas y descansos</option>
                            <option value="Charla preventiva de inicio de turno">Charla preventiva de inicio de turno</option>
                            <option value="Apoyo en colas de llamadas críticas">Apoyo en colas de llamadas críticas</option>
                            <option value="Espacio de escucha y retroalimentación">Espacio de escucha y retroalimentación</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <label className="form-label" htmlFor="followupProgress" style={{ margin: 0 }}>
                                Porcentaje de avance estimado
                            </label>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--c-primario)' }}>
                                {progress}%
                            </span>
                        </div>
                        <input
                            type="range"
                            id="followupProgress"
                            min="0"
                            max="100"
                            step="5"
                            value={progress}
                            onChange={(e) => setProgress(e.target.value)}
                            style={{ width: '100%', accentColor: 'var(--c-primario)', cursor: 'pointer' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '14px' }}>
                        <label className="form-label" htmlFor="followupNotes">
                            Observaciones del supervisor <span style={{ fontWeight: '400', color: 'var(--c-texto-mutado)' }}>(opcional)</span>
                        </label>
                        <textarea
                            id="followupNotes"
                            className="form-input form-textarea"
                            rows={3}
                            maxLength={500}
                            style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', resize: 'vertical' }}
                            placeholder="Describe la acción coordinada con el equipo..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="alert-banner info" style={{ padding: '10px 14px', fontSize: '12px', marginBottom: '16px' }}>
                        <Icon name="info" size={16} />
                        <span>Esta nota quedará vinculada al registro inmutable de auditoría para trazabilidad ante SST.</span>
                    </div>

                    <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            <span>{saving ? 'Guardando...' : 'Guardar seguimiento'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
