// src/features/landing/components/HowItWorksSection.jsx
// Sección interactiva del Muro de Privacidad y Flujo Ético de Datos en Pulso360

import { useState } from 'react';
import { Icon } from '../../../core/components/Icon';

export function HowItWorksSection() {
  const [simulationThreshold, setSimulationThreshold] = useState(6);

  return (
    <section className="landing-section how-section" id="como-funciona" aria-labelledby="how-title">
      <div className="landing-container">
        <div className="section-heading centered">
          <p className="eyebrow eyebrow-dark">El Muro de Privacidad</p>
          <h2 id="how-title">Cómo viaja la información: del desahogo del agente a la prevención en SST.</h2>
          <p>
            Ningún supervisor puede ver lo que respondió un agente individual. La arquitectura de Pulso360 separa la intimidad personal de la analítica colectiva mediante k-anonimato.
          </p>
        </div>

        {/* Pipeline de Privacidad Conectado */}
        <div className="privacy-pipeline-container">
          <div className="pipeline-steps">
            {/* Paso 1: Puesto del Agente */}
            <article className="pipeline-step-card">
              <div className="step-card-header">
                <span className="step-badge">Paso 1</span>
                <span className="step-tag tag-private">
                  <Icon name="lock" size={13} />
                  Espacio Privado
                </span>
              </div>
              <div className="step-icon-wrap">
                <Icon name="support_agent" size={24} />
              </div>
              <h3>El Agente responde al final del turno</h3>
              <p>
                En 60 segundos califica 6 factores clave de su jornada. Si no desea responder, puede omitir libremente sin que nadie sea notificado.
              </p>
              <div className="pipeline-meta">
                <span>Cifrado en origen</span>
                <span>•</span>
                <span>Sin juicio laboral</span>
              </div>
            </article>

            {/* Paso Central: Muro de k-Anonimato */}
            <article className="pipeline-step-card pipeline-barrier-card">
              <div className="step-card-header">
                <span className="step-badge step-badge-barrier">Barrera Ética</span>
                <span className="step-tag tag-shield">
                  <Icon name="shieldCheck" size={13} />
                  Filtro k-Anonimato
                </span>
              </div>
              <div className="step-icon-wrap barrier-icon">
                <Icon name="fileShield" size={24} />
              </div>
              <h3>El Muro de Agregación Oculta Identidades</h3>
              <p>
                Las respuestas individuales se disocian de los usuarios. Solo si un equipo cuenta con <strong>al menos 5 personas respondiendo</strong> se genera una métrica visible.
              </p>
              <div className="barrier-indicator">
                <div className="barrier-visual">
                  <span className="dot active"></span>
                  <span className="dot active"></span>
                  <span className="dot active"></span>
                  <span className="dot active"></span>
                  <span className="dot active"></span>
                  <span className="barrier-line"></span>
                  <span className="dot-result">Tendencia colectiva</span>
                </div>
              </div>
            </article>

            {/* Paso 3: Panel SST */}
            <article className="pipeline-step-card">
              <div className="step-card-header">
                <span className="step-badge">Paso 3</span>
                <span className="step-tag tag-sst">
                  <Icon name="insights" size={13} />
                  Acción Colectiva
                </span>
              </div>
              <div className="step-icon-wrap">
                <Icon name="healing" size={24} />
              </div>
              <h3>SST detecta tendencias y activa mejoras</h3>
              <p>
                Seguridad y Salud en el Trabajo recibe mapas de calor agregados. Si una campaña presenta sobrecarga, se activan pausas o rotación de turnos sin señalar a nadie.
              </p>
              <div className="pipeline-meta">
                <span>Acción preventiva</span>
                <span>•</span>
                <span>Cero vigilancia</span>
              </div>
            </article>
          </div>
        </div>

        {/* Demostrador Interactivo del Umbral de Protección */}
        <div className="interactive-privacy-sandbox">
          <div className="sandbox-copy">
            <div className="sandbox-badge">
              <Icon name="tune" size={16} />
              <span>Simulador de Protección de Identidad</span>
            </div>
            <h4>Prueba cómo funciona el k-anonimato en tiempo real</h4>
            <p>
              Ajusta el número de personas en una campaña para ver cómo Pulso360 protege automáticamente a los equipos pequeños para evitar que un supervisor deduzca quién respondió.
            </p>

            <div className="sandbox-controls">
              <label htmlFor="agent-count-slider">
                Agentes respondiendo en el equipo: <strong>{simulationThreshold} personas</strong>
              </label>
              <input
                id="agent-count-slider"
                type="range"
                min="1"
                max="12"
                value={simulationThreshold}
                onChange={(e) => setSimulationThreshold(Number(e.target.value))}
                className="threshold-slider"
              />
              <div className="slider-labels">
                <span>1 (Riesgo alto)</span>
                <span>Umbral mínimo k=5</span>
                <span>12 (Óptimo)</span>
              </div>
            </div>
          </div>

          <div className="sandbox-display">
            {simulationThreshold < 5 ? (
              <div className="sandbox-result-wrapper">
                <div className="sandbox-status status-blocked">
                  <div className="status-icon"><Icon name="lock" size={26} /></div>
                  <div>
                    <span className="status-label label-danger">Datos Bloqueados por Protección</span>
                    <h5>Muestra insuficiente ({simulationThreshold} de 5 requeridos)</h5>
                    <p>
                      Pulso360 oculta la métrica de esta campaña para el supervisor. Con tan pocas respuestas, cualquier reporte permitiría deducir quién respondió.
                    </p>
                  </div>
                </div>

                {/* Mini Gráfica Bloqueada */}
                <div className="sandbox-graph-preview graph-locked">
                  <div className="graph-preview-header">
                    <span>Métrica de Carga — Campaña Servicio</span>
                    <span className="graph-badge badge-locked">
                      <Icon name="lock" size={12} /> Bloqueado k &lt; 5
                    </span>
                  </div>
                  <div className="graph-preview-canvas canvas-locked">
                    <div className="locked-glass-shield">
                      <Icon name="fileShield" size={26} />
                      <strong>Información protegida</strong>
                      <small>Oculta para evitar deducción individual</small>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="sandbox-result-wrapper">
                <div className="sandbox-status status-safe">
                  <div className="status-icon"><Icon name="shieldCheck" size={26} /></div>
                  <div>
                    <span className="status-label label-success">Visualización Agregada Segura</span>
                    <h5>k-Anonimato Cumplido ({simulationThreshold} agentes verificados)</h5>
                    <p>
                      Los datos se promedian de forma colectiva. La identidad individual queda matemáticamente disociada e irrecuperable.
                    </p>
                  </div>
                </div>

                {/* Mini Gráfica Desbloqueada */}
                <div className="sandbox-graph-preview graph-unlocked">
                  <div className="graph-preview-header">
                    <span>Métrica de Carga — Campaña Servicio</span>
                    <span className="graph-badge badge-unlocked">
                      <Icon name="checkCircle" size={12} /> k ≥ 5 Activo
                    </span>
                  </div>
                  <div className="graph-preview-canvas canvas-unlocked">
                    <div className="graph-live-indicator">
                      <svg viewBox="0 0 240 50" className="trend-svg" aria-label="Curva de tendencia">
                        <path d="M 10 38 Q 60 18, 120 28 T 230 18" fill="none" stroke="#0d9488" strokeWidth="2.5" />
                        <circle cx="10" cy="38" r="4" fill="#0d9488" />
                        <circle cx="120" cy="28" r="4" fill="#0d9488" />
                        <circle cx="230" cy="18" r="4" fill="#0d9488" />
                      </svg>
                      <div className="graph-legend-row">
                        <span>Promedio grupal: <strong>3.2 / 5.0</strong></span>
                        <span className="safe-tag">Estable</span>
                      </div>
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
