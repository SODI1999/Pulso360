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
            <div className="analysis-panel-head">
                <div className="analysis-panel-title">
                    <Icon name="self_improvement" size={18} />
                    <strong>
                        Reflexión asistida sobre tu nota
                    </strong>
                </div>
                <span className="badge badge-neutral">
                    Versión: {journal.analysis.version}
                </span>
            </div>

            {/* Sello explícito "Zero Remote Leakage" */}
            <div className="local-seal">
                <Icon name="verified_user" size={16} />
                <span>
                    <strong>Procesamiento léxico local en tu dispositivo</strong> · Sin envío a servidores de IA externos ni modelos remotos.
                </span>
            </div>

            {/* Aviso de alcance no clínico */}
            <div className="analysis-calm-banner">
                <Icon name="info" size={16} />
                <span>
                    Este clasificador identifica factores habituales de la jornada para apoyar tu autorreflexión. No constituye diagnóstico médico ni evaluación de desempeño.
                </span>
            </div>

            {/* Factores identificados sin porcentajes intimidantes */}
            <div className="analysis-panel-factors">
                <div className="analysis-panel-label">
                    Factores orientativos identificados:
                </div>
                <div className="analysis-panel-chips">
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
            <div className="analysis-panel-evidence">
                <div className="analysis-panel-evidence-label">
                    Términos de tu nota que orientaron esta reflexión:
                </div>
                {uniqueEvidence.length > 0 ? (
                    <div className="analysis-evidence-row">
                        {uniqueEvidence.map(term => (
                            <mark key={term} className="evidence">{term}</mark>
                        ))}
                    </div>
                ) : (
                    <span className="analysis-evidence-empty">
                        Sin términos explícitos de tensión identificados en el texto.
                    </span>
                )}
            </div>

            {/* Botones de acción humana intactos */}
            <div className="analysis-panel-actions">
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onOpenCorrection}
                >
                    <Icon name="tune" size={14} />
                    <span>Corregir clasificación</span>
                </button>

                {historyCount > 0 && (
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={onOpenHistory}
                    >
                        <span>Ver historial ({historyCount})</span>
                    </button>
                )}
            </div>
        </div>
    );
}
