// src/features/landing/components/ThreeActsSection.jsx
// Recorrido interactivo unificado de los Tres Actos de Pulso360
// Dirección A: Editorial Humano & Sereno — Fusión Elegante y Respiración,

import { useState } from 'react';
import { Icon } from '../../../core/components/Icon';
import {
  UNIFIED_SHOWCASE_TABS,
  AGENT_SCALE_FACTORS,
  AGENT_SCALE_SCENARIOS,
  BPO_SIMULATION_SCENARIOS,
  KANONYMITY_SIMULATION_DATA,
  SST_OPERATIONAL_SIGNALS
} from '../data/landingData';

export function ThreeActsSection() {
  const [activeTab, setActiveTab] = useState('agente');
  const [selectedFactor, setSelectedFactor] = useState(4);
  const [selectedSituation, setSelectedSituation] = useState(BPO_SIMULATION_SCENARIOS[0]);
  const [agentCount, setAgentCount] = useState(KANONYMITY_SIMULATION_DATA.sliderDefault || 6);
  const [showNlpAdvice, setShowNlpAdvice] = useState(false);

  // Escenario dinámico según el nivel de escala 1-5 seleccionado
  const currentScaleScenario = AGENT_SCALE_SCENARIOS[selectedFactor] || AGENT_SCALE_SCENARIOS[4];

  return (
    <section className="three-acts-section" id="los-tres-actos" aria-labelledby="acts-main-title">
      {/* Ancla para enlaces directos desde el Hero */}
      <span id="demostracion" className="section-anchor-offset" aria-hidden="true" />

      <div className="landing-container">
        {/* Encabezado Editorial del Recorrido */}
        <div className="three-acts-header">
          <span className="acts-eyebrow">Arquitectura Ética & Demostración Interactiva</span>
          <h2 id="acts-main-title">Los Tres Actos de Pulso360</h2>
          <p className="acts-lead">
            Un único recorrido sereno que articula el cuidado en tiempo real: desde el micro-pulso voluntario
            de 60 segundos del agente hasta la intervención oportuna de SST, respaldado por el muro matemático
            de k-anonimato.
          </p>
        </div>

        {/* Barra de Control de Pestañas Unificadas con navegación accesible por teclado */}
        <div
          className="unified-acts-nav"
          role="tablist"
          aria-label="Recorrido interactivo de los tres actos"
          onKeyDown={(e) => {
            const tabs = UNIFIED_SHOWCASE_TABS.map((t) => t.id);
            const currentIndex = tabs.indexOf(activeTab);
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              const nextIndex = (currentIndex + 1) % tabs.length;
              setActiveTab(tabs[nextIndex]);
              document.getElementById(`tab-${tabs[nextIndex]}`)?.focus();
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
              setActiveTab(tabs[prevIndex]);
              document.getElementById(`tab-${tabs[prevIndex]}`)?.focus();
            }
          }}
        >
          {UNIFIED_SHOWCASE_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                className={`unified-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-btn-icon" aria-hidden="true">
                  <Icon name={tab.icon} size={18} />
                </span>
                <span className="tab-btn-texts">
                  <strong className="tab-btn-label">{tab.label}</strong>
                  <span className="tab-btn-sub">{tab.subtitle}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Tarjeta Unificada de Demostración */}
        <div className="unified-showcase-viewport">
          {/* =========================================================================
              ACTO I: ESPACIO ÍNTIMO DEL AGENTE
              ========================================================================= */}
          {activeTab === 'agente' && (
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
                <span className="act-step-label">
                  Micro-pulso de 60 segundos · Muestra interactiva de evaluación
                </span>
              </div>

              {/* Selector de Carga Cognitiva y Emocional (1 al 5) */}
              <div className="agent-eval-block">
                <div className="agent-eval-prompt">
                  <h3>¿Cómo percibes la carga cognitiva y emocional al cierre del turno?</h3>
                  <p>
                    Evalúa el ritmo de atención, la fricción técnica y la presión de llamadas consecutivas.
                  </p>
                </div>

                <div
                  className="factor-scale-interactive"
                  role="radiogroup"
                  aria-label="Escala de carga del turno"
                >
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
                      En esta demo, el texto permanece en la bitácora individual y no aparece en la vista
                      agregada
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
          )}

          {/* =========================================================================
              ACTO II: ESCUDO K-ANONIMATO (k >= 5)
              ========================================================================= */}
          {activeTab === 'kanonymity' && (
            <div
              className="act-tab-content act-kanonymity-content"
              id="panel-kanonymity"
              role="tabpanel"
              aria-labelledby="tab-kanonymity"
            >
              <div className="act-content-header">
                <div className="act-pill-badge shield-badge">
                  <Icon name="shieldCheck" size={14} />
                  <span>Escudo Matemático de Privacidad · Disociación Algorítmica</span>
                </div>
                <span className="act-step-label">Umbral Ético: k &ge; 5 respuestas</span>
              </div>

              <div className="kanonymity-simulator-grid">
                {/* Control Interactivo de Umbral */}
                <div className="kanonymity-control-card">
                  <div className="kanonymity-prompt">
                    <h3>{KANONYMITY_SIMULATION_DATA.title}</h3>
                    <p>{KANONYMITY_SIMULATION_DATA.description}</p>
                  </div>

                  <div className="slider-interactive-box">
                    <div className="slider-readout-row">
                      <span>Respuestas registradas en el equipo:</span>
                      <strong className="slider-counter">
                        {agentCount} {agentCount === 1 ? 'participante distinto' : 'participantes distintos'}
                      </strong>
                    </div>

                    <input
                      type="range"
                      min={KANONYMITY_SIMULATION_DATA.sliderMin}
                      max={KANONYMITY_SIMULATION_DATA.sliderMax}
                      value={agentCount}
                      onChange={(e) => setAgentCount(Number(e.target.value))}
                      className="kanonymity-slider"
                      aria-label="Número de participantes respondiendo en el equipo"
                    />

                    <div className="slider-ticks-row">
                      <span className="tick-min">1 (Mínimo)</span>
                      <span className="tick-threshold">
                        <Icon name="shield" size={12} />k = 5 (Umbral)
                      </span>
                      <span className="tick-max">12 (Óptimo)</span>
                    </div>
                  </div>

                  <div className="kanonymity-math-guarantee">
                    <Icon name="fileShield" size={15} />
                    <span>
                      En grupos menores a 5 participantes, cualquier reporte permitiría inferir respuestas
                      individuales. Pulso360 protege deliberadamente la visualización para salvaguardar la
                      privacidad.
                    </span>
                  </div>
                </div>

                {/* Resultado Dinámico: Protegido por Privacidad vs Desbloqueado */}
                <div className="kanonymity-result-card">
                  {agentCount < 5 ? (
                    <div className="k-status-box status-protected" role="status">
                      <div className="status-icon-circle shield-protected">
                        <Icon name="kAnonymityShield" size={24} />
                      </div>
                      <div className="status-copy">
                        <span className="status-pill pill-shield">
                          Visualización Protegida por Privacidad
                        </span>
                        <h4>Protegido por Privacidad ({agentCount} de 5 participantes)</h4>
                        <p>
                          Este bloqueo deliberado protege la identidad de los colaboradores mientras el quórum
                          de participantes sea menor a 5 personas.
                        </p>
                        <small className="status-subnote">
                          Al alcanzar k &ge; 5 participantes distintos, SG-SST visualiza promedios colectivos
                          sin identificar registros individuales.
                        </small>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="sst-unlocked-report-card"
                      role="region"
                      aria-label="Reporte Preventivo Colectivo Desbloqueado"
                    >
                      {/* Cabecera del reporte */}
                      <div className="unlocked-report-head">
                        <div className="unlocked-badge-row">
                          <span className="unlocked-k-badge">
                            <Icon name="shieldCheck" size={13} />
                            k-Anonimato Activo (k = {agentCount})
                          </span>
                          <span className="unlocked-validity-badge">Muestra Representativa</span>
                        </div>
                        <h4 className="unlocked-report-title">
                          Reporte Preventivo Agregado · Campaña Soporte N1
                        </h4>
                        <p className="unlocked-report-sub">
                          Respuestas agrupadas y promediadas matemáticamente. Ningún dato nominal expuesto.
                        </p>
                      </div>

                      {/* Métrica 1: Índice de Energía Colectiva */}
                      <div className="unlocked-metric-block">
                        <div className="energy-index-header">
                          <span className="energy-index-label">Índice de Energía Colectiva</span>
                          <span className="energy-index-val">
                            <strong>72</strong> / 100 <span className="energy-status-text">(Sostenible)</span>
                          </span>
                        </div>
                        <div className="energy-bar-track" aria-label="Barra de nivel de energía: 72%">
                          <div className="energy-bar-fill" style={{ width: '72%' }} />
                        </div>
                      </div>

                      {/* Métrica 2: Distribución Grupal Disociada */}
                      <div className="unlocked-distribution-block">
                        <span className="distribution-title">
                          Distribución anónima del equipo ({agentCount} respuestas):
                        </span>
                        <div className="distribution-chips-row">
                          <div className="dist-chip chip-balanced">
                            <span className="dist-chip-pct">67%</span>
                            <span className="dist-chip-label">Ritmo Balanceado</span>
                          </div>
                          <div className="dist-chip chip-fatigue">
                            <span className="dist-chip-pct">33%</span>
                            <span className="dist-chip-label">Fatiga Moderada</span>
                          </div>
                        </div>
                      </div>

                      {/* Sugerencia de Protocolo Oportuno SG-SST */}
                      <div className="unlocked-protocol-box">
                        <Icon name="checkCircle" size={16} className="protocol-icon" />
                        <div className="protocol-text">
                          <strong>Protocolo sugerido para SG-SST:</strong>
                          <p>Activar pausa activa guiada de 10 min a las 15:30 y balancear colas críticas.</p>
                        </div>
                      </div>

                      {/* Sello de Garantía y Privacidad */}
                      <div className="unlocked-privacy-seal">
                        <Icon name="lock" size={13} />
                        <span>
                          Métricas 100% desvinculadas de AHT y evaluaciones individuales de desempeño.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              ACTO III: VIGILANCIA PREVENTIVA SST
              ========================================================================= */}
          {activeTab === 'sst' && (
            <div
              className="act-tab-content act-sst-content"
              id="panel-sst"
              role="tabpanel"
              aria-labelledby="tab-sst"
            >
              <div className="act-content-header">
                <div className="act-pill-badge sst-badge">
                  <Icon name="healing" size={14} />
                  <span>Consola de Vigilancia Preventiva (SG-SST)</span>
                </div>
                <span className="act-step-label">k &ge; 5 verificado · Datos consolidados</span>
              </div>

              <div className="sst-signals-layout">
                <div className="sst-intro-block">
                  <h3>Intervención oportuna sobre condiciones de trabajo</h3>
                  <p>
                    Seguridad y Salud en el Trabajo interviene sobre los ritmos de piso, turnos y pausas
                    activas, sin vigilar individualmente a los colaboradores.
                  </p>
                </div>

                {/* Tarjetas de Turnos y Señales Operacionales */}
                <div className="sst-shift-grid">
                  {SST_OPERATIONAL_SIGNALS.map((sig) => (
                    <div
                      key={sig.id}
                      className={`sst-signal-card ${sig.statusType === 'warning' ? 'signal-warning' : 'signal-normal'}`}
                    >
                      <div className="signal-card-header">
                        <strong>{sig.shift}</strong>
                        <span
                          className={`signal-status-pill ${sig.statusType === 'warning' ? 'pill-amber' : 'pill-green'}`}
                        >
                          {sig.status}
                        </span>
                      </div>
                      <div className="signal-metric-row">
                        <span className="signal-metric-val">{sig.energyIndex}</span>
                        <span className="signal-metric-sub">Índice de soporte y energía grupal</span>
                      </div>
                      <p className="signal-summary-text">{sig.summary}</p>
                      <div className="signal-protocol-applied">
                        <Icon name="checkCircle" size={13} />
                        <span>{sig.actionProtocol}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Callout de Trazabilidad Auditable */}
                <div className="sst-traceability-callout">
                  <div className="callout-icon-wrap">
                    <Icon name="trendingUp" size={20} />
                  </div>
                  <div>
                    <strong>Cero consecuencias punitivas · Trazabilidad 100% auditable</strong>
                    <p>
                      La demo presenta intervenciones preventivas separadas de nómina, AHT y sanciones
                      laborales; la implementación debe conservar esa separación mediante sus controles de
                      acceso.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
