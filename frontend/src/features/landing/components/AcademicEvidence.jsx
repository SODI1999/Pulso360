import { Icon } from '../../../core/components/Icon';
import { EMPIRICAL_DATA } from '../data/academicFoundationData';

export function AcademicEvidence() {
  return (
    <section
      className="academic-editorial-section"
      id="evidencia-empirica"
      aria-labelledby="sec-evidencia-titulo"
    >
      <div className="section-title-wrap">
        <span className="section-tag">Datos recogidos en la actividad de aula</span>
        <h2 id="sec-evidencia-titulo">Qué reporta el grupo de la actividad</h2>
      </div>
      <p className="section-prose">
        {EMPIRICAL_DATA.sampleContext} El material de aula menciona los siguientes instrumentos como
        referencias. No se presentan como instrumentos de Pulso360 ni como validación de la plataforma:
      </p>
      <div className="instruments-row">
        {EMPIRICAL_DATA.instruments.map((inst) => (
          <div key={inst.acronym} className="instrument-pill">
            <span className="inst-acronym">{inst.acronym}</span>
            <div className="inst-info">
              <strong className="inst-name">{inst.name}</strong>
              <p className="inst-desc">{inst.purpose}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="empirical-dossier-grid">
        {/* Tarjeta Principal */}
        <div className="empirical-dossier-main">
          <div className="dossier-stat-header">
            <span className="dossier-tag">{EMPIRICAL_DATA.mainMetric.tag}</span>
            <div className="dossier-big-number">
              <span className="number-val">{EMPIRICAL_DATA.mainMetric.percentage}</span>
              <span className="number-label">{EMPIRICAL_DATA.mainMetric.label}</span>
            </div>
          </div>
          <div className="distribution-visual-container">
            <div
              className="distribution-bar-track"
              role="progressbar"
              aria-label="Distribución de categorías de agotamiento reportadas en la actividad de aula"
              aria-valuenow="84.3"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuetext="84.3% en categorías media y alta, según los datos de la actividad de aula"
            >
              {EMPIRICAL_DATA.distribution.map((dist) => (
                <div
                  key={dist.level}
                  className={
                    'dist-segment ' + dist.toneClass + (dist.percentage < 20 ? ' dist-segment-small' : '')
                  }
                  style={{ width: dist.percentage + '%' }}
                  title={dist.level + ': ' + dist.percentage + '%'}
                >
                  <span className="dist-bar-text">{dist.percentage + '%'}</span>
                </div>
              ))}
            </div>
            <div className="distribution-legend-grid">
              {EMPIRICAL_DATA.distribution.map((dist) => (
                <div key={dist.level} className="legend-item">
                  <span className={'legend-dot ' + dist.toneClass} aria-hidden="true"></span>
                  <div className="legend-content">
                    <strong className="legend-title">{dist.label}</strong>
                    <p className="legend-sub">{dist.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="dossier-context">{EMPIRICAL_DATA.mainMetric.description}</p>
        </div>
        {/* Tarjetas Laterales */}
        <div className="empirical-dossier-aside">
          {EMPIRICAL_DATA.secondaryMetrics.map((sec) => (
            <div
              key={sec.id}
              className={'dossier-aside-card ' + (sec.id === 'protective' ? 'aside-protective-card' : '')}
            >
              <div className="aside-card-header">
                <span className="aside-tag">{sec.tag}</span>
                <span className="aside-metric">{sec.value}</span>
              </div>
              <h3 className="aside-title">{sec.title}</h3>
              <p className="aside-desc">{sec.description}</p>
              {sec.id === 'protective' && (
                <div
                  className="correlation-vector-box"
                  role="group"
                  aria-label="Asociación reportada en la actividad de aula: mayor apoyo social y menor agotamiento (r = -0.428, p < 0.01); no establece causalidad"
                  title="Asociación inversa reportada en el material de aula; no demuestra causalidad ni resultados de Pulso360."
                >
                  <div className="correlation-node node-support">
                    <span className="node-label">Apoyo Social</span>
                    <span className="node-arrow" aria-hidden="true">
                      &uarr;
                    </span>
                  </div>
                  <div className="correlation-vector-arrow" aria-hidden="true">
                    <span className="vector-line" />
                    <span className="vector-tag">se asocia</span>
                    <span className="vector-line" />
                  </div>
                  <div className="correlation-node node-burnout">
                    <span className="node-label">Agotamiento</span>
                    <span className="node-arrow" aria-hidden="true">
                      &darr;
                    </span>
                  </div>
                  <span className="correlation-sig-badge">p &lt; 0.01</span>
                </div>
              )}
              {sec.operationalMeaning && (
                <div className="aside-highlight-box">
                  <Icon name="info" size={14} className="highlight-icon" />
                  <span>
                    <strong>Relación con la idea del proyecto:</strong> {sec.operationalMeaning}
                  </span>
                </div>
              )}
              {sec.footnote && (
                <p className="aside-footnote" role="note">
                  {sec.footnote}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
