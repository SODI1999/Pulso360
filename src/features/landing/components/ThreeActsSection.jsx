// src/features/landing/components/ThreeActsSection.jsx
// Unificación narrativa fluida de los 3 actos de Pulso360: Desahogo del Agente, Escudo k-anonimato y Acción SST

import { useState } from 'react';
import { Icon } from '../../../core/components/Icon';
import { BPO_SIMULATION_SCENARIOS } from '../data/landingData';

export function ThreeActsSection() {
  const [selectedSituation, setSelectedSituation] = useState(BPO_SIMULATION_SCENARIOS[0]);
  const [agentCount, setAgentCount] = useState(6);

  return (
    <section className="three-acts-section" id="los-tres-actos" aria-labelledby="acts-main-title">
      <div className="landing-container">
        {/* Encabezado Editorial del Recorrido */}
        <div className="three-acts-header">
          <span className="acts-eyebrow">Arquitectura Ética & Preventiva</span>
          <h2 id="acts-main-title">Los Tres Actos de Pulso360</h2>
          <p className="acts-lead">
            Cómo transformamos el cansancio silencioso de los pisos de operaciones en intervenciones tempranas y humanas, garantizando que el trabajador se exprese con total tranquilidad.
          </p>
        </div>

        <div className="acts-container">
          {/* ============================================================ */}
          {/* ACTO I: El Agente y su Desahogo Personal */}
          {/* ============================================================ */}
          <article className="act-spread" id="acto-1" aria-labelledby="act1-title">
            <div className="act-meta-column">
              <span className="act-roman-badge">Acto I</span>
              <span className="act-category-tag tag-agent">
                <Icon name="support_agent" size={14} />
                Espacio Íntimo del Agente
              </span>
              <h3 id="act1-title">El desahogo diario sin juicio ni vigilancia</h3>
              <p>
                Al terminar su jornada, el agente dedica 60 segundos a responder sobre 6 dimensiones operativas (energía, carga, recuperación, apoyo, distanciamiento e ineficacia) y dispone de una bitácora libre y confidencial.
              </p>
              <div className="act-guarantee-pill">
                <Icon name="lock" size={14} />
                <span>100% privado: su supervisor jamás lee lo que escribe</span>
              </div>
            </div>

            <div className="act-interactive-column">
              <div className="act-interactive-panel">
                <div className="panel-subhead">
                  <span>Simula una situación real en piso de Contact Center:</span>
                </div>

                <div className="situation-tab-row" role="tablist">
                  {BPO_SIMULATION_SCENARIOS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      role="tab"
                      aria-selected={selectedSituation.id === s.id}
                      className={`situation-tab ${selectedSituation.id === s.id ? 'active' : ''}`}
                      onClick={() => setSelectedSituation(s)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <div className="act-journal-card">
                  <div className="journal-entry-box">
                    <span className="quote-mark">&ldquo;</span>
                    <p>{selectedSituation.agentQuote}</p>
                  </div>

                  <div className="nlp-deterministic-card">
                    <div className="nlp-card-header">
                      <div className="nlp-icon-title">
                        <Icon name="healing" size={16} />
                        <strong>Orientación Empática Inmediata (NLP Léxico Local)</strong>
                      </div>
                      <span className="nlp-no-diagnosis-pill">No emite diagnósticos médicos</span>
                    </div>

                    <h5 className="nlp-feedback-title">{selectedSituation.nlpTitle}</h5>
                    <p className="nlp-feedback-text">{selectedSituation.nlpFeedback}</p>

                    <div className="domain-context-note">
                      <Icon name="info" size={13} />
                      <span>{selectedSituation.domainContext}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* ============================================================ */}
          {/* ACTO II: El Escudo Matemático de k-Anonimato */}
          {/* ============================================================ */}
          <article className="act-spread" id="acto-2" aria-labelledby="act2-title">
            <div className="act-meta-column">
              <span className="act-roman-badge">Acto II</span>
              <span className="act-category-tag tag-shield">
                <Icon name="fileShield" size={14} />
                El Escudo Algorítmico
              </span>
              <h3 id="act2-title">El muro matemático de k-anonimato (k &ge; 5)</h3>
              <p>
                En grupos pequeños, cualquier reporte permitiría deducir quién respondió. Por eso, Pulso360 impone un umbral matemático estricto: si un equipo o campaña tiene menos de 5 respuestas, los datos quedan completamente sellados.
              </p>
              <div className="act-guarantee-pill">
                <Icon name="shieldCheck" size={14} />
                <span>La identidad queda disociada e irrecuperable en el servidor</span>
              </div>
            </div>

            <div className="act-interactive-column">
              <div className="act-interactive-panel threshold-panel">
                <div className="threshold-header">
                  <div>
                    <h4>Simulador interactivo de protección de identidad</h4>
                    <p>Mueve el control para comprobar cuándo el sistema bloquea o permite la visualización.</p>
                  </div>
                </div>

                <div className="threshold-control-box">
                  <div className="threshold-label-row">
                    <span>Respuestas registradas en el equipo:</span>
                    <strong className="agent-count-display">{agentCount} agentes</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={agentCount}
                    onChange={(e) => setAgentCount(Number(e.target.value))}
                    className="threshold-slider-input"
                    aria-label="Número de agentes respondiendo en el equipo"
                  />
                  <div className="threshold-scale-guide">
                    <span>1 (Riesgo alto)</span>
                    <span className="scale-mark-k5">Umbral ético: k = 5</span>
                    <span>12 (Óptimo)</span>
                  </div>
                </div>

                <div className="threshold-result-view">
                  {agentCount < 5 ? (
                    <div className="threshold-status-box status-locked">
                      <div className="threshold-icon-circle lock">
                        <Icon name="lock" size={24} />
                      </div>
                      <div className="threshold-status-text">
                        <span className="badge-status-danger">Visualización Bloqueada por Seguridad</span>
                        <h5>Muestra Insuficiente ({agentCount} de 5 requeridos)</h5>
                        <p>
                          Pulso360 oculta automáticamente las métricas de este equipo. Un grupo menor a 5 personas permitiría deducir identidades individuales.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="threshold-status-box status-unlocked">
                      <div className="threshold-icon-circle check">
                        <Icon name="shieldCheck" size={24} />
                      </div>
                      <div className="threshold-status-text">
                        <span className="badge-status-success">k-Anonimato Cumplido (k = {agentCount} &ge; 5)</span>
                        <h5>Tendencia Colectiva Desbloqueada para SST</h5>
                        <p>
                          Los datos se promedian de forma colectiva. Es matemáticamente imposible rastrear la respuesta de ningún trabajador específico.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>

          {/* ============================================================ */}
          {/* ACTO III: La Intervención Preventiva en SST */}
          {/* ============================================================ */}
          <article className="act-spread" id="acto-3" aria-labelledby="act3-title">
            <div className="act-meta-column">
              <span className="act-roman-badge">Acto III</span>
              <span className="act-category-tag tag-sst">
                <Icon name="healing" size={14} />
                Acción Ocupacional SST
              </span>
              <h3 id="act3-title">Intervenciones oportunas en condiciones de trabajo</h3>
              <p>
                Los especialistas en Seguridad y Salud en el Trabajo (SST) no actúan como evaluadores ni jueces; actúan como facilitadores del entorno laboral, coordinando micro-pausas y balance de turnos antes de que el personal colapse.
              </p>
              <div className="act-guarantee-pill">
                <Icon name="trendingUp" size={14} />
                <span>Intervenciones registradas con trazabilidad auditable</span>
              </div>
            </div>

            <div className="act-interactive-column">
              <div className="act-interactive-panel sst-panel-preview">
                <div className="sst-panel-preview-head">
                  <div>
                    <h4>Mapa de Carga Operativa por Campaña</h4>
                    <small>Medición continua agregada según marco Maslach & Batería SST Colombia</small>
                  </div>
                  <span className="sst-active-tag">Vigilancia Preventiva Activa</span>
                </div>

                <div className="sst-actions-list">
                  <div className="sst-action-item">
                    <div className="action-indicator amber">
                      <Icon name="alertTriangle" size={16} />
                    </div>
                    <div>
                      <strong>Campaña Soporte Técnico — Turno Noche (20:00 - 04:00)</strong>
                      <p>Incremento del 38% en reporte de fatiga visual y cervical tras 3 días de alta demanda.</p>
                      <div className="action-applied-pill">
                        <Icon name="checkCircle" size={13} />
                        <span>Protocolo aplicado: Pausas activas guiadas de 10 min a las 23:00 y 02:00</span>
                      </div>
                    </div>
                  </div>

                  <div className="sst-action-item">
                    <div className="action-indicator green">
                      <Icon name="checkCircle" size={16} />
                    </div>
                    <div>
                      <strong>Campaña Cobranzas Especializadas — Turno Mañana (07:00 - 15:00)</strong>
                      <p>Índice de soporte y apoyo del supervisor en nivel óptimo (4.3 / 5.0). Estabilidad sostenida.</p>
                      <div className="action-applied-pill green">
                        <Icon name="checkCircle" size={13} />
                        <span>Condiciones estables: Seguimiento preventivo quincenal</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
