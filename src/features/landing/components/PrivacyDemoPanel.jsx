import { Icon } from '../../../core/components/Icon';
import { KANONYMITY_SIMULATION_DATA } from '../data/landingData';
export function PrivacyDemoPanel({ agentCount, setAgentCount }) {
  return (
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
              individuales. Pulso360 protege deliberadamente la visualización para salvaguardar la privacidad.
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
                <span className="status-pill pill-shield">Visualización Protegida por Privacidad</span>
                <h4>Protegido por Privacidad ({agentCount} de 5 participantes)</h4>
                <p>
                  Este bloqueo deliberado protege la identidad de los colaboradores mientras el quórum de
                  participantes sea menor a 5 personas.
                </p>
                <small className="status-subnote">
                  Al alcanzar k &ge; 5 participantes distintos, SG-SST visualiza promedios colectivos sin
                  identificar registros individuales.
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
                <h4 className="unlocked-report-title">Reporte Preventivo Agregado · Campaña Soporte N1</h4>
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
                <span>Métricas 100% desvinculadas de AHT y evaluaciones individuales de desempeño.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
