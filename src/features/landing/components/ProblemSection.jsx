// src/features/landing/components/ProblemSection.jsx
// Sección editorial sobre la realidad operativa en BPO y la brecha de las mediciones tradicionales

import { Icon } from '../../../core/components/Icon';

export function ProblemSection() {
  return (
    <section className="problem-editorial-section" id="problema" aria-labelledby="problem-title">
      <div className="landing-container">
        {/* Cabecera Editorial */}
        <div className="problem-editorial-header">
          <span className="acts-eyebrow">La Realidad en Operaciones BPO</span>
          <h2 id="problem-title">
            El agotamiento no avisa con anticipación; se acumula llamada tras llamada.
          </h2>
          <p className="problem-lead">
            En un Contact Center, la presión de las largas jornadas, la complejidad de las solicitudes, la cantidad de llamadas y los clientes molestos generan un desgaste silencioso. Cuando la organización se entera a través de ausentismos imprevistos o renuncias masivas, el daño laboral ya está hecho.
          </p>
        </div>

        {/* Doble Página Editorial: Evidencia de Piso + Testimonio */}
        <div className="problem-editorial-spread">
          {/* Lado Izquierdo: Fotografía de Piso con Datos de Operación */}
          <div className="problem-evidence-col">
            <div className="problem-photo-container">
              <img
                src="/assets/bpo-operations-reality.jpg?v=4"
                alt="Agente de Contact Center con uniforme de Pulso360 tomando un breve respiro frente al micro-pulso de energía en su pantalla"
                className="problem-documentary-img"
                loading="lazy"
              />
              <div className="problem-photo-badge">
                <Icon name="alertTriangle" size={14} />
                <span>Desgaste Silencioso · Micro-pulso en pantalla</span>
              </div>
            </div>

            <div className="problem-stats-strip">
              <div className="problem-stat-item">
                <span className="stat-num">420s</span>
                <span className="stat-lbl">Meta típica de AHT (Average Handle Time)</span>
              </div>
              <div className="problem-stat-item">
                <span className="stat-num">35% - 40%</span>
                <span className="stat-lbl">Rotación anual promedio en la industria BPO</span>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Testimonio Real & Los Tres Puntos Ciegos */}
          <div className="problem-testimony-col">
            <div className="problem-quote-wrapper">
              <span className="quote-glyph">&ldquo;</span>
              <blockquote className="agent-real-quote">
                Llevo cuatro horas continuas atendiendo llamadas difíciles, las métricas están al límite y siento la cabeza a punto de estallar. Pero si manifiesto que no doy más, temo que me cambien de turno o afecte mi estabilidad laboral.
              </blockquote>
              <cite className="agent-quote-cite">— Agente de servicio al cliente en campaña bilingüe</cite>
            </div>

            <div className="blindspots-editorial-box">
              <h4>Los 3 Puntos Ciegos de la Gestión Tradicional:</h4>

              <div className="blindspot-row">
                <span className="blindspot-num">01</span>
                <div>
                  <strong>El temor a represalias laborales</strong>
                  <p>Si el trabajador sospecha que su líder sabrá lo que siente, maquilla la respuesta para proteger su empleo.</p>
                </div>
              </div>

              <div className="blindspot-row">
                <span className="blindspot-num">02</span>
                <div>
                  <strong>Mediciones tardías e inflexibles</strong>
                  <p>Las encuestas de clima anuales tardan meses en tabularse; en un call center, un equipo entra en crisis en días.</p>
                </div>
              </div>

              <div className="blindspot-row">
                <span className="blindspot-num">03</span>
                <div>
                  <strong>Falta de acción preventiva temprana</strong>
                  <p>Gestión humana se entera cuando la persona ya está en consulta médica o abandona el puesto de trabajo.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparativa Tipográfica Editorial: Tradicional vs Pulso360 */}
        <div className="editorial-comparison-wrap">
          <div className="comparison-intro">
            <h3>Comparativa de Abordaje Metodológico</h3>
            <p>Por qué la prevención continua supera a los cuestionarios anuales estáticos:</p>
          </div>

          <div className="editorial-comparison-grid">
            {/* Tradicional */}
            <div className="comparison-side side-traditional">
              <div className="side-badge badge-trad">Enfoque Tradicional</div>
              <ul className="side-list">
                <li>
                  <span className="bullet-cross"><Icon name="x" size={14} /></span>
                  <div>
                    <strong>Cuestionarios extensos (+45 preguntas)</strong>
                    <p>Interrumpen la operación y provocan fatiga al responder.</p>
                  </div>
                </li>
                <li>
                  <span className="bullet-cross"><Icon name="x" size={14} /></span>
                  <div>
                    <strong>Resultados 6 a 9 meses tarde</strong>
                    <p>Muestran la foto del pasado cuando la persona ya se marchó.</p>
                  </div>
                </li>
                <li>
                  <span className="bullet-cross"><Icon name="x" size={14} /></span>
                  <div>
                    <strong>Sospecha de anonimato en el piso</strong>
                    <p>El agente desconfía y no comparte su verdadera carga mental.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Pulso360 */}
            <div className="comparison-side side-pulso">
              <div className="side-badge badge-pulso">Enfoque Pulso360</div>
              <ul className="side-list">
                <li>
                  <span className="bullet-check"><Icon name="checkCircle" size={14} /></span>
                  <div>
                    <strong>Micro-pulso ágil de 60 segundos</strong>
                    <p>Voluntario al cerrar turno, sin interrumpir la operación.</p>
                  </div>
                </li>
                <li>
                  <span className="bullet-check"><Icon name="checkCircle" size={14} /></span>
                  <div>
                    <strong>Señales tempranas en menos de 48 horas</strong>
                    <p>SST interviene con pausas y rotación antes de que haya crisis.</p>
                  </div>
                </li>
                <li>
                  <span className="bullet-check"><Icon name="checkCircle" size={14} /></span>
                  <div>
                    <strong>k-Anonimato algorítmico matemático</strong>
                    <p>Garantía de que nadie con menos de 5 personas puede ser expuesto.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
