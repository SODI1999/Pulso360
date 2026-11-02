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
        <span className="section-tag">Origen de la propuesta de software</span>
        <h2 id="sec-transferencia-titulo">De los datos de aula a las decisiones de diseño</h2>
      </div>
      <p className="section-prose">
        Los datos recogidos en la actividad dieron origen a la idea de Pulso360. El equipo formuló las
        siguientes preguntas y decisiones de diseño; las funciones de software no son resultados
        comprobados de aquella actividad:
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
                  <span className="step-label">Punto de partida en la actividad de aula</span>
                  <p>{card.socialProblem}</p>
                </div>
              </div>
              <div className="flow-step step-bpo">
                <div className="step-indicator-col">
                  <span className="step-dot dot-bpo" aria-hidden="true"></span>
                  <span className="step-line" aria-hidden="true"></span>
                </div>
                <div className="step-text-wrap">
                  <span className="step-label">Pregunta del equipo de estudiantes</span>
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
                    <span>Decisión de diseño en Pulso360</span>
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
