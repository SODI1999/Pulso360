import { AgentDemoPanel } from './AgentDemoPanel';
import { PrivacyDemoPanel } from './PrivacyDemoPanel';
import { SstDemoPanel } from './SstDemoPanel';
// src/features/landing/components/ThreeActsSection.jsx
// Recorrido interactivo unificado de los Tres Actos de Pulso360
// Dirección A: Editorial Humano & Sereno — Fusión Elegante y Respiración,

import { useState } from 'react';
import { Icon } from '../../../core/components/Icon';
import {
  UNIFIED_SHOWCASE_TABS,
  AGENT_SCALE_SCENARIOS,
  BPO_SIMULATION_SCENARIOS,
  KANONYMITY_SIMULATION_DATA
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
            Explora un ejemplo de registro personal, la protección de las tendencias colectivas y el
            seguimiento de SST. Los datos de esta demostración son ilustrativos.
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
            <AgentDemoPanel
              selectedFactor={selectedFactor}
              setSelectedFactor={setSelectedFactor}
              selectedSituation={selectedSituation}
              setSelectedSituation={setSelectedSituation}
              setShowNlpAdvice={setShowNlpAdvice}
              showNlpAdvice={showNlpAdvice}
              currentScaleScenario={currentScaleScenario}
            />
          )}

          {/* =========================================================================
              ACTO II: ESCUDO K-ANONIMATO (k >= 5)
              ========================================================================= */}
          {activeTab === 'kanonymity' && (
            <PrivacyDemoPanel agentCount={agentCount} setAgentCount={setAgentCount} />
          )}

          {/* =========================================================================
              ACTO III: VIGILANCIA PREVENTIVA SST
              ========================================================================= */}
          {activeTab === 'sst' && <SstDemoPanel />}
        </div>
      </div>
    </section>
  );
}
