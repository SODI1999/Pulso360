// src/features/agent/components/NlpAnalysisPanel.jsx
// Panel explicable de factores identificados por NLP, evidencia léxica y acciones de corrección

import { Icon } from '../../../core/components/Icon';

const CATEGORY_ICONS = {
  'Sobrecarga percibida': 'phone',
  'Recuperación insuficiente': 'battery_low',
  'Exigencia emocional': 'shieldAlert',
  'Conflicto de rol': 'sliders',
  'Bajo apoyo organizacional': 'users',
  'Distanciamiento laboral': 'eyeOff',
  'Frustración por métricas operativas': 'lineChart',
  'Percepción de ineficacia': 'alertTriangle'
};

export function NlpAnalysisPanel({ journal, onOpenCorrection, onOpenHistory }) {
  if (!journal?.analysis) return null;

  const activeCategories = journal.correctedCategories || journal.analysis.categories.map((c) => c.name);
  const uniqueEvidence = [...new Set((journal.analysis.categories || []).flatMap((c) => c.evidence || []))];
  const historyCount = (journal.correctionHistory || []).length;
  const isCorrected = Boolean(journal.correctedCategories);

  return (
    <div id="analysisPanel" className="analysis-card">
      {/* Cabecera con icono Compass y versión discreta */}
      <div className="analysis-panel-head">
        <div className="analysis-panel-title">
          <Icon name="compass" size={18} className="analysis-title-icon" />
          <strong>Reflexión asistida sobre tu nota</strong>
        </div>
        <span className="analysis-version-tag" title={`Motor léxico determinista ${journal.analysis.version}`}>
          v{journal.analysis.version} local
        </span>
      </div>

      {/* Factores orientativos con icono y nombre */}
      <div className="analysis-panel-factors">
        <div className="analysis-panel-label">Factores orientativos identificados:</div>
        <div className="analysis-panel-chips">
          {activeCategories.map((catName) => (
            <span
              key={catName}
              className={`analysis-factor-badge ${isCorrected ? 'factor-chip-adjusted' : ''}`}
            >
              <Icon
                name={isCorrected ? 'check_circle' : (CATEGORY_ICONS[catName] || 'psychology')}
                size={14}
              />
              <span>{catName}</span>
              {isCorrected && <span className="factor-chip-subtext">· Ajustado</span>}
            </span>
          ))}
          {activeCategories.length === 0 && (
            <span className="badge badge-neutral">Ninguna aplica</span>
          )}
        </div>
      </div>

      {/* Términos de la nota: texto plano tipo hashtag sin badge */}
      <div className="analysis-panel-evidence">
        <div className="analysis-panel-evidence-label">
          Términos de tu nota que orientaron esta reflexión:
        </div>
        {uniqueEvidence.length > 0 ? (
          <div className="analysis-evidence-row">
            {uniqueEvidence.map((term) => (
              <span key={term} className="analysis-term-hash">
                #{term}
              </span>
            ))}
          </div>
        ) : (
          <span className="analysis-evidence-empty">
            Sin términos explícitos de tensión identificados en el texto.
          </span>
        )}
      </div>

      {/* Botones de acción humana */}
      <div className="analysis-panel-actions">
        <button type="button" className="btn btn-secondary" onClick={onOpenCorrection}>
          <Icon name="tune" size={14} />
          <span>Corregir clasificación</span>
        </button>

        {historyCount > 0 && (
          <button type="button" className="btn btn-ghost" onClick={onOpenHistory}>
            <span>Ver historial ({historyCount})</span>
          </button>
        )}
      </div>

      {/* Nota unificada y sobria: procesamiento local y alcance no clínico (sin cajas apiladas) */}
      <div className="analysis-panel-footer-note">
        <Icon name="shieldCheck" size={15} />
        <span>
          <strong>Procesamiento léxico local en tu dispositivo</strong> · Orientación pedagógica para tu autorreflexión; no constituye diagnóstico médico ni evaluación de desempeño.
        </span>
      </div>
    </div>
  );
}
