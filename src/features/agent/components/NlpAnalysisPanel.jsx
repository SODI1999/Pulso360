// src/features/agent/components/NlpAnalysisPanel.jsx
// Panel explicable de factores identificados por NLP, evidencia léxica y acciones de corrección

import { Icon } from '../../../core/components/Icon';

export function NlpAnalysisPanel({ journal, onOpenCorrection, onOpenHistory }) {
    if (!journal?.analysis) return null;

    const activeCategories = journal.correctedCategories || journal.analysis.categories.map(c => c.name);
    const uniqueEvidence = [...new Set((journal.analysis.categories || []).flatMap(c => c.evidence || []))];
    const historyCount = (journal.correctionHistory || []).length;
    const isCorrected = Boolean(journal.correctedCategories);

    return (
        <div id="analysisPanel" className="analysis-card">
            {/* Cabecera con título empático y versión */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon name="self_improvement" size={18} style={{ color: 'var(--c-calma-accent, #1b7a68)' }} />
                    <strong style={{ fontSize: '14px', color: 'var(--c-texto)' }}>
                        Reflexión asistida sobre tu nota
                    </strong>
                </div>
                <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                    Versión: {journal.analysis.version}
                </span>
            </div>

            {/* Sello explícito "Zero Remote Leakage" */}
            <div className="local-seal" style={{ marginBottom: '12px' }}>
                <Icon name="verified_user" size={16} style={{ color: 'var(--c-calma-accent, #1b7a68)', flexShrink: 0, marginTop: '2px' }} />
                <span>
                    <strong>Procesamiento léxico local en tu dispositivo</strong> · Sin envío a servidores de IA externos ni modelos remotos.
                </span>
            </div>

            {/* Aviso de alcance no clínico */}
            <div className="analysis-calm-banner" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <Icon name="info" size={16} style={{ color: 'var(--c-calma-accent, #1b7a68)', flexShrink: 0, marginTop: '2px' }} />
                    <span>
                        Este clasificador identifica factores habituales de la jornada para apoyar tu autorreflexión. No constituye diagnóstico médico ni evaluación de desempeño.
                    </span>
                </div>
            </div>

            {/* Factores identificados sin porcentajes intimidantes */}
            <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--c-texto-suave)', marginBottom: '8px' }}>
                    Factores orientativos identificados:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {activeCategories.map(catName => (
                        <span
                            key={catName}
                            className={`analysis-chip ${isCorrected ? 'factor-chip-adjusted' : ''}`}
                        >
                            <Icon name={isCorrected ? 'check_circle' : 'psychology'} size={14} />
                            <span>{catName}</span>
                            {isCorrected && (
                                <span className="factor-chip-subtext">· Ajustado por ti</span>
                            )}
                        </span>
                    ))}
                    {activeCategories.length === 0 && (
                        <span className="badge badge-neutral">Ninguna aplica</span>
                    )}
                </div>
            </div>

            {/* Evidencia léxica presentada con lectura relajante */}
            <div style={{ fontSize: '12.5px', color: 'var(--c-texto-suave)', marginBottom: '16px', lineHeight: '1.6' }}>
                <div style={{ fontWeight: '600', color: 'var(--c-texto)', marginBottom: '6px' }}>
                    Términos de tu nota que orientaron esta reflexión:
                </div>
                {uniqueEvidence.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                        {uniqueEvidence.map(term => (
                            <mark key={term} className="evidence">{term}</mark>
                        ))}
                    </div>
                ) : (
                    <span style={{ fontStyle: 'italic', color: 'var(--c-texto-mutado)' }}>
                        Sin términos explícitos de tensión identificados en el texto.
                    </span>
                )}
            </div>

            {/* Botones de acción humana intactos */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid var(--c-calma-border, #d5e0dc)' }}>
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
