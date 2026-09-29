import { Icon } from '../../../core/components/Icon';
import { TRANSFER_CARDS } from '../data/academicFoundationData';

export function AcademicTransfer() {
  return (
    <section
      className="academic-editorial-section"
      id="transferencia"
      aria-labelledby="sec-transferencia-titulo"
    >
      <div className="section-title-wrap">
        <span className="section-tag">Transferencia Metodológica</span>
        <h2 id="sec-transferencia-titulo">De la problemática social a los requerimientos de software</h2>
      </div>
      <p className="section-prose">
        Pulso360 no pretendió digitalizar un formulario pasivo, sino responder a las fricciones reales del
        piso de operación de los centros de contacto:
      </p>
      <div className="transfer-cards-grid">
        {TRANSFER_CARDS.map((card) => (
          <article key={card.id} className="transfer-flow-card">
            <div className="card-top-bar">
              <div className="card-badge-row">
                <div className="card-badge-left">
                  <span className="card-axis-icon-wrap" aria-hidden="true">
                    <Icon name={card.icon || 'shieldCheck'} size={15} />
                  </span>
                  <span className="card-step-number">{'Eje ' + card.number}</span>
                </div>
                <span className="card-feature-badge">{card.featureBadge}</span>
              </div>
              <h3 className="card-flow-title">{card.title}</h3>
            </div>
            <div className="flow-steps-stack">
              <div className="flow-step step-social">
                <div className="step-indicator-col">
                  <span className="step-dot dot-social" aria-hidden="true"></span>
                  <span className="step-line" aria-hidden="true"></span>
                </div>
                <div className="step-text-wrap">
                  <span className="step-label">Diagnóstico Social (TdeA)</span>
                  <p>{card.socialProblem}</p>
                </div>
              </div>
              <div className="flow-step step-bpo">
                <div className="step-indicator-col">
                  <span className="step-dot dot-bpo" aria-hidden="true"></span>
                  <span className="step-line" aria-hidden="true"></span>
                </div>
                <div className="step-text-wrap">
                  <span className="step-label">Fricción en Call Center</span>
                  <p>{card.bpoBarrier}</p>
                </div>
              </div>
              <div className="flow-step step-solution">
                <div className="step-indicator-col">
                  <span className="step-dot dot-solution" aria-hidden="true"></span>
                </div>
                <div className="step-text-wrap">
                  <span className="step-label solution-label">
                    <Icon name="checkCircle" size={13} />
                    <span>Solución en Pulso360</span>
                  </span>
                  <p>{card.pulsoSolution}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
