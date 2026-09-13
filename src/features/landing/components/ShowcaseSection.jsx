// src/features/landing/components/ShowcaseSection.jsx
// Sección dedicada a la demostración interactiva del software y puesto documental de operación BPO

import { useState } from 'react';
import { Icon } from '../../../core/components/Icon';
import { AGENT_SCALE_FACTORS, AGENT_SCALE_SCENARIOS } from '../data/landingData';

export function ShowcaseSection() {
  const [activeTab, setActiveTab] = useState('agente');
  const [selectedFactor, setSelectedFactor] = useState(4);
  const [showNlpDetail, setShowNlpDetail] = useState(false);

  // Escenario reactivo dinámico según el factor Likert seleccionado
  const currentScenario = AGENT_SCALE_SCENARIOS[selectedFactor] || AGENT_SCALE_SCENARIOS[4];

  return (
    <section className="showcase-editorial-section" id="demostracion" aria-labelledby="showcase-title">
      <div className="landing-container">
        {/* Encabezado Editorial Propio */}
        <div className="showcase-editorial-header">
          <span className="acts-eyebrow">Transparencia Operativa en Pantalla</span>
          <h2 id="showcase-title">
            Dos vistas independientes. Cero ambigüedad entre el agente y SST.
          </h2>
          <p className="showcase-lead">
            El agente dispone de un espacio íntimo y privado para registrar su fatiga sin temor a represalias; Seguridad y Salud en el Trabajo (SST) recibe analítica agregada para intervenir oportunamente sin vigilar al trabajador.
          </p>
        </div>

        {/* Composición Híbrida: Retrato Documental (Izquierda) + Mockup Real del Software (Derecha) */}
        <div className="hero-hybrid-grid">
          {/* Lado Izquierdo: Fotografía Documental de Agente en Operación Real */}
          <div className="hero-portrait-card">
            <div className="portrait-image-wrapper">
              <img
                src="/assets/bpo-agent-authentic.jpg?v=2"
                alt="Agente de Contact Center en Medellín realizando su check-in diario de bienestar en Pulso360 frente a su pantalla"
                className="portrait-image"
                loading="lazy"
              />
              <div className="portrait-tag-overlay">
                <span className="portrait-location">
                  <Icon name="support_agent" size={14} />
                  Piso de Operaciones BPO · Medellín, Colombia
                </span>
                <span className="portrait-status-pill">Micro-pulso en curso</span>
              </div>
            </div>

            <div className="portrait-caption-box">
              <p className="portrait-quote">
                <strong>En pantalla:</strong> la agente responde la evaluación de carga emocional del micro-pulso diario (Paso 2 de 6). Un registro voluntario de 60 segundos en su estación que permite a SST detectar fatiga acumulada sin exponer su identidad ante supervisión.
              </p>
              <div className="portrait-footer-meta">
                <span>Micro-pulso voluntario al cierre del turno</span>
                <strong>60 segundos · Cero vigilancia</strong>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Interfaz Viva y Real de Pulso360 */}
          <div className="hero-software-showcase" id="software-preview">
            {/* Barra de Control de Vistas */}
            <div className="software-view-tabs" role="tablist" aria-label="Selector de vista de software">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'agente'}
                className={`software-tab-btn ${activeTab === 'agente' ? 'active' : ''}`}
                onClick={() => setActiveTab('agente')}
              >
                <Icon name="support_agent" size={16} />
                <span>1. Vista del Agente (Íntima)</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'sst'}
                className={`software-tab-btn ${activeTab === 'sst' ? 'active' : ''}`}
                onClick={() => setActiveTab('sst')}
              >
                <Icon name="shield" size={16} />
                <span>2. Vista de SST (Colectiva)</span>
              </button>
            </div>

            {/* Contenido Dinámico según la Vista */}
            {activeTab === 'agente' ? (
              <div className="software-screen agent-screen">
                <div className="screen-header">
                  <div className="screen-badge-private">
                    <Icon name="lock" size={13} />
                    <span>Tu espacio privado · Cifrado en origen</span>
                  </div>
                  <span className="screen-step-count">Paso 1 de 6 · 45s restantes</span>
                </div>

                <div className="screen-factor-prompt">
                  <h3>¿Cómo percibes la carga cognitiva al cierre del turno?</h3>
                  <p>Evalúa el ritmo de atención y la presión de llamadas consecutivas.</p>
                </div>

                <div className="factor-scale-interactive">
                  {AGENT_SCALE_FACTORS.map((f) => (
                    <button
                      key={f.level}
                      type="button"
                      className={`factor-chip ${selectedFactor === f.level ? 'selected' : ''}`}
                      onClick={() => setSelectedFactor(f.level)}
                    >
                      <span className="chip-level">{f.level}</span>
                      <span className="chip-label">{f.label}</span>
                    </button>
                  ))}
                </div>

                {/* Sub-bloque de Bitácora Confidencial Reactiva */}
                <div className="journal-micro-preview">
                  <div className="journal-micro-header">
                    <div className="journal-label">
                      <Icon name="edit_note" size={15} />
                      <strong>Bitácora de Desahogo Opcional</strong>
                    </div>
                    <span className="journal-nlp-pill">NLP Léxico Local</span>
                  </div>

                  <div className="journal-sample-entry">
                    <p>{currentScenario.quote}</p>
                  </div>

                  <div className="journal-nlp-return">
                    <div className="nlp-badge-row">
                      <span className={`nlp-tag ${currentScenario.tagType}`}>
                        <Icon
                          name={currentScenario.tagType === 'success' ? 'checkCircle' : 'alertTriangle'}
                          size={12}
                        />
                        {currentScenario.tagText}
                      </span>
                      <button
                        type="button"
                        className="nlp-toggle-btn"
                        onClick={() => setShowNlpDetail(!showNlpDetail)}
                      >
                        {showNlpDetail ? 'Ocultar orientación' : 'Ver orientación preventiva'}
                      </button>
                    </div>
                    {showNlpDetail && (
                      <p className="nlp-text-advice">
                        {currentScenario.advice} <em>Esta anotación no es visible para tu supervisor.</em>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="software-screen sst-screen">
                <div className="screen-header sst-header">
                  <div className="screen-badge-sst">
                    <Icon name="shieldCheck" size={14} />
                    <span>Consola de Vigilancia Epidemiológica (SST)</span>
                  </div>
                  <span className="k-anonymity-badge">
                    k &ge; 5 verificado (N = 42 agentes)
                  </span>
                </div>

                <div className="sst-operational-summary">
                  <h4>Campañas de Operación · Tendencias de Turno Hoy</h4>
                  <p>Métricas disociadas: los profesionales de salud ocupacional solo ven patrones colectivos.</p>

                  <div className="shift-telemetry-grid">
                    <div className="shift-card shift-normal">
                      <div className="shift-card-head">
                        <strong>Turno Mañana (06:00 - 14:00)</strong>
                        <span className="shift-pill pill-green">Estable</span>
                      </div>
                      <div className="shift-metric-val">82%</div>
                      <span className="shift-desc">Energía y apoyo grupal dentro de parámetros normales</span>
                    </div>

                    <div className="shift-card shift-alert">
                      <div className="shift-card-head">
                        <strong>Turno Tarde/Noche (14:00 - 22:00)</strong>
                        <span className="shift-pill pill-amber">Alerta Temprana</span>
                      </div>
                      <div className="shift-metric-val">46%</div>
                      <span className="shift-desc">Sobrecarga por picos de llamadas continuas reportada</span>
                    </div>
                  </div>

                  <div className="sst-action-callout">
                    <div className="callout-icon">
                      <Icon name="healing" size={20} />
                    </div>
                    <div>
                      <strong>Intervención Preventiva Sugerida para SST:</strong>
                      <p>Coordinar con operaciones pausas activas escalonadas de 10 minutos y balanceo de colas para el Turno Tarde.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
