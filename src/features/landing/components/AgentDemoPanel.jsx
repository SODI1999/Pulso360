import { Icon } from '../../../core/components/Icon';
import { AGENT_SCALE_FACTORS } from '../data/landingData';
import { BPO_SIMULATION_SCENARIOS } from '../data/landingData';
export function AgentDemoPanel({
  selectedFactor,
  setSelectedFactor,
  selectedSituation,
  setSelectedSituation,
  setShowNlpAdvice,
  showNlpAdvice,
  currentScaleScenario
}) {
  return (
    <div
      className="act-tab-content act-agent-content"
      id="panel-agente"
      role="tabpanel"
      aria-labelledby="tab-agente"
    >
      <div className="act-content-header">
        <div className="act-pill-badge agent-badge">
          <Icon name="lock" size={14} />
          <span>Espacio personal · Ejemplo ilustrativo · No es una evaluación de desempeño</span>
        </div>
        <span className="act-step-label">Micro-pulso de 60 segundos · Muestra interactiva de evaluación</span>
      </div>

      {/* Selector de Carga Cognitiva y Emocional (1 al 5) */}
      <div className="agent-eval-block">
        <div className="agent-eval-prompt">
          <h3>¿Cómo percibes la carga cognitiva y emocional al cierre del turno?</h3>
          <p>Evalúa el ritmo de atención, la fricción técnica y la presión de llamadas consecutivas.</p>
        </div>

        <div className="factor-scale-interactive" role="radiogroup" aria-label="Escala de carga del turno">
          {AGENT_SCALE_FACTORS.map((f) => (
            <button
              key={f.level}
              type="button"
              role="radio"
              aria-checked={selectedFactor === f.level}
              className={`factor-chip factor-level-${f.level} ${selectedFactor === f.level ? 'selected' : ''}`}
              onClick={() => setSelectedFactor(f.level)}
            >
              <span className="chip-mood-icon" aria-hidden="true">
                <Icon name={f.icon} size={20} />
              </span>
              <strong className="chip-label">{f.label}</strong>
              <span className="chip-hint">{f.context}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Simulación de Situaciones Reales en Piso de Operaciones */}
      <div className="agent-journal-block">
        <div className="situation-row-header">
          <div className="situation-label">
            <Icon name="edit_note" size={16} />
            <span>Prueba un escenario de Contact Center:</span>
          </div>
          <div className="situation-pills-row" role="tablist" aria-label="Escenarios de piso">
            {BPO_SIMULATION_SCENARIOS.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={selectedSituation.id === s.id}
                className={`situation-pill ${selectedSituation.id === s.id ? 'active' : ''}`}
                onClick={() => setSelectedSituation(s)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tarjeta de Bitácora y Orientación Léxica Local */}
        <div className="journal-harmonious-card">
          <div className="journal-entry-area">
            <p className="journal-entry-text">{selectedSituation.agentQuote}</p>
            <span className="journal-privacy-notice">
              <Icon name="lock" size={12} />
              En esta demo, el texto permanece en la bitácora individual y no aparece en la vista agregada
            </span>
          </div>

          <div className="nlp-guidance-area">
            <div className="nlp-guidance-top">
              <div className="nlp-badge-group">
                <span className="nlp-engine-tag">
                  <Icon name="healing" size={13} />
                  Motor Léxico Preventivo
                </span>
                <span className="nlp-no-dx-tag">No emite diagnósticos médicos</span>
              </div>
              <button
                type="button"
                className="nlp-expand-btn"
                onClick={() => setShowNlpAdvice(!showNlpAdvice)}
              >
                {showNlpAdvice ? 'Ocultar recomendación' : 'Ver recomendación ergonómica por nivel'}
              </button>
            </div>

            <h4 className="nlp-feedback-title">{selectedSituation.nlpTitle}</h4>
            <p className="nlp-feedback-desc">{selectedSituation.nlpFeedback}</p>

            {showNlpAdvice && (
              <div className="nlp-extra-advice" role="note">
                <p>
                  <strong>Pauta ergonómica preventiva:</strong> {currentScaleScenario.advice}
                </p>
              </div>
            )}

            <div className="domain-context-strip">
              <Icon name="info" size={13} />
              <span>{selectedSituation.domainContext}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
