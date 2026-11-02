import { Icon } from '../../../core/components/Icon';
import { SST_OPERATIONAL_SIGNALS } from '../data/landingData';
export function SstDemoPanel() {
  return (
    <div className="act-tab-content act-sst-content" id="panel-sst" role="tabpanel" aria-labelledby="tab-sst">
      <div className="act-content-header">
        <div className="act-header-lead">
          <strong className="act-header-title">Consola de Vigilancia Preventiva (SG-SST)</strong>
          <span className="act-header-scope">k &ge; 5 verificado · Datos consolidados</span>
        </div>
      </div>

      <div className="sst-signals-layout">
        <div className="sst-intro-block">
          <h3>Intervención oportuna sobre condiciones de trabajo</h3>
          <p>
            Seguridad y Salud en el Trabajo interviene sobre los ritmos de piso, turnos y pausas activas, sin
            vigilar individualmente a los colaboradores.
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
            <Icon name="ClipboardList" size={20} />
          </div>
          <div>
            <strong>Seguimiento preventivo y trazabilidad para SST</strong>
            <p>
              La demo muestra acciones de orientación y seguimiento. No presenta nómina ni AHT, y no
              acredita decisiones institucionales sobre sanciones o condiciones laborales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
