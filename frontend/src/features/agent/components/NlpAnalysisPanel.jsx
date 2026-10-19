// src/features/agent/components/NlpAnalysisPanel.jsx
// Panel explicable de factores identificados por NLP, evidencia léxica y acciones de corrección

import { Icon } from '../../../core/components/Icon';

import { FACTOR_METADATA } from '../data/nlpFactorMetadata';

const TENSION_CATEGORIES = ['Exigencia emocional', 'Sobrecarga percibida', 'Recuperación insuficiente'];

export function NlpAnalysisPanel({ journal, onOpenCorrection, onOpenHistory, onOpenSomaticModal }) {
  if (!journal?.analysis) return journal?.analysisHistory?.length ? <button type="button" className="btn btn-secondary" onClick={onOpenHistory}>Ver análisis de versiones anteriores del texto</button> : null;

  const activeCategories = journal.correctedCategories || journal.analysis.categories.map((c) => c.name);
  const uniqueEvidence = [...new Set((journal.analysis.categories || []).flatMap((c) => c.evidence || []))];
  const historyCount = (journal.correctionHistory || []).length + (journal.analysisHistory || []).length;
  const isCorrected = Boolean(journal.correctedCategories);
  const hasTension = activeCategories.some((cat) => TENSION_CATEGORIES.includes(cat));

  return (
    <div id="analysisPanel" className="analysis-card">
      {/* Cabecera con icono HeartPulse y versión discreta */}
      <div className="analysis-panel-head">
        <div className="analysis-panel-title">
          <Icon name="heartPulse" size={18} className="analysis-title-icon" />
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
                name={FACTOR_METADATA[catName]?.icon || 'activity'}
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

      {/* Bloque proactivo de recuperación somática y puente a SST (SPEC-007) */}
      {hasTension && (
        <div className="analysis-relief-card" role="region" aria-label="Acciones sugeridas de recuperación">
          <div className="analysis-relief-header">
            <div className="analysis-relief-icon" aria-hidden="true">
              <Icon name="respiro" size={18} />
            </div>
            <div className="analysis-relief-text">
              <h4 className="analysis-relief-title">Recuperación recomendada tras este turno</h4>
              <p className="analysis-relief-desc">
                Identificamos tensión o sobrecarga en tu nota. Una pausa breve de respiración (4-2-6) en tu puesto ayuda a desacelerar el ritmo cardíaco y soltar la adrenalina antes de tu siguiente llamada.
              </p>
            </div>
          </div>
          <div className="analysis-relief-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm btn-relief-pause"
              onClick={onOpenSomaticModal}
            >
              <Icon name="respiro" size={15} />
              <span>Iniciar pausa somática (1 min)</span>
            </button>
            <a
              href="/agente/apoyo"
              className="btn btn-secondary btn-sm btn-relief-sst"
              title="Canal confidencial y voluntario de acompañamiento con el equipo de SST"
            >
              <Icon name="support_agent" size={15} />
              <span>Orientación con SST</span>
            </a>
          </div>
        </div>
      )}

      {/* Botones de acción humana */}
      <div className="analysis-panel-actions">
        <button type="button" className="btn btn-secondary" onClick={onOpenCorrection}>
          <Icon name="tune" size={14} />
          <span>Corregir clasificación</span>
        </button>

        {historyCount > 0 && (
          <button type="button" className="btn btn-ghost" onClick={onOpenHistory}>
            <Icon name="clock" size={14} />
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
