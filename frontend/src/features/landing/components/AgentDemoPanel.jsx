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
        <div className="act-header-lead">
          <strong className="act-header-title">Espacio personal · Ejemplo ilustrativo</strong>
          <span className="act-header-scope">Micro-pulso voluntario de 60 segundos sin consecuencias laborales</span>
        </div>
        <div className="demo-context-notice" role="note" aria-label="Aviso sobre escenarios ilustrativos preconfigurados">
          <Icon name="info" size={14} className="notice-icon" />
          <span>
            <strong>Simulación demostrativa:</strong> Los textos, citas y recomendaciones mostrados en este componente corresponden a <em>escenarios interactivos ilustrativos preconfigurados</em>, diseñados para exhibir la funcionalidad de orientación no médica del motor léxico antes del inicio o al cierre de turno. Se diferencian nítidamente del procesamiento de texto libre en la bitácora confidencial real del agente, donde la reflexión se ejecuta en el navegador local bajo estricta privacidad, sin exposición ante supervisores ni impacto en evaluaciones laborales.
          </span>
        </div>
      </div>

      {/* Selector de Carga Cognitiva y Emocional (1 al 5) */}
      <div className="agent-eval-block">
        <div className="agent-eval-prompt">
          <h3>¿Cómo percibes la carga cognitiva y emocional al cierre del turno?</h3>
          <p>Evalúa el ritmo de atención, la fricción técnica y la presión de llamadas consecutivas.</p>
        </div>

        <div
          className="factor-scale-interactive"
          role="radiogroup"
          aria-label="Escala de carga del turno"
          onKeyDown={(e) => {
            const factors = AGENT_SCALE_FACTORS.map((f) => f.level);
            const currentIdx = factors.indexOf(selectedFactor);
            let nextIdx = null;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
              e.preventDefault();
              nextIdx = (currentIdx + 1) % factors.length;
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
              e.preventDefault();
              nextIdx = (currentIdx - 1 + factors.length) % factors.length;
            }
            if (nextIdx !== null) {
              const nextLevel = factors[nextIdx];
              setSelectedFactor(nextLevel);
              document.getElementById(`factor-chip-${nextLevel}`)?.focus();
            }
          }}
        >
          {AGENT_SCALE_FACTORS.map((f) => (
            <button
              key={f.level}
              id={`factor-chip-${f.level}`}
              type="button"
              role="radio"
              tabIndex={selectedFactor === f.level ? 0 : -1}
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
          <div
            className="situation-pills-row"
            role="tablist"
            aria-label="Escenarios de piso"
            onKeyDown={(e) => {
              const items = BPO_SIMULATION_SCENARIOS;
              const currentIdx = items.findIndex((s) => s.id === selectedSituation.id);
              let nextIdx = null;
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                nextIdx = (currentIdx + 1) % items.length;
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                nextIdx = (currentIdx - 1 + items.length) % items.length;
              }
              if (nextIdx !== null) {
                const nextItem = items[nextIdx];
                setSelectedSituation(nextItem);
                document.getElementById(`situation-pill-${nextItem.id}`)?.focus();
              }
            }}
          >
            {BPO_SIMULATION_SCENARIOS.map((s) => (
              <button
                key={s.id}
                id={`situation-pill-${s.id}`}
                type="button"
                role="tab"
                tabIndex={selectedSituation.id === s.id ? 0 : -1}
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
              <div className="nlp-meta-lead">
                <Icon name="healing" size={13} className="nlp-meta-icon" />
                <span className="nlp-meta-label">Motor Léxico Preventivo · Orientación no médica</span>
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
