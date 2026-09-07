// src/features/agent/components/NlpAnalysisPanel.jsx
// Panel explicable de factores identificados por NLP, evidencia léxica y acciones de corrección

import { Icon } from '../../../core/components/Icon';

export function NlpAnalysisPanel({ journal, onOpenCorrection, onOpenHistory }) {
    if (!journal?.analysis) return null;

    const activeCategories = journal.correctedCategories || journal.analysis.categories.map(c => c.name);
    const uniqueEvidence = [...new Set((journal.analysis.categories || []).flatMap(c => c.evidence || []))];
    const historyCount = (journal.correctionHistory || []).length;

    return (
        <div id="analysisPanel" className="analysis-card" style={{ marginTop: '24px', padding: '16px', background: 'var(--c-fondo)', borderRadius: 'var(--radius-md)', border: '1px solid var(--c-borde-suave)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <strong style={{ fontSize: '14px', color: 'var(--c-texto)' }}>Análisis de tu texto</strong>
                <span className="badge badge-neutral">{journal.analysis.version}</span>
            </div>

            {/* Categorías detectadas o corregidas */}
            <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12.5px', color: 'var(--c-texto-suave)', marginBottom: '6px' }}>
                    Factores identificados:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {activeCategories.map(catName => {
                        const original = journal.analysis.categories.find(c => c.name === catName);
                        const scoreLabel = original ? ` · ${Math.round(original.confidence * 100)}%` : ' · Corrección';
                        return (
                            <span key={catName} className="analysis-chip">
                                {catName}{scoreLabel}
                            </span>
                        );
                    })}
                    {activeCategories.length === 0 && (
                        <span className="badge badge-neutral">Ninguna aplica</span>
                    )}
                </div>
            </div>

            {/* Evidencia léxica destacada */}
            <div style={{ fontSize: '12px', color: 'var(--c-texto-mutado)', marginBottom: '16px' }}>
                Evidencia léxica: {
                    uniqueEvidence.length > 0
                        ? uniqueEvidence.map(term => (
                            <mark key={term} className="evidence">{term}</mark>
                        ))
                        : 'Sin evidencia explícita.'
                }
            </div>

            {/* Botones de acción humana */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '12.5px', padding: '6px 12px' }}
                    onClick={onOpenCorrection}
                >
                    <Icon name="tune" size={14} />
                    <span>Corregir clasificación</span>
                </button>

                {historyCount > 0 && (
                    <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ fontSize: '12.5px', padding: '6px 12px' }}
                        onClick={onOpenHistory}
                    >
                        <span>Ver historial ({historyCount})</span>
                    </button>
                )}
            </div>
        </div>
    );
}
