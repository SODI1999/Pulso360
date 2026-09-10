// src/features/landing/components/HowItWorksSection.jsx
// Sección interactiva del ciclo preventivo paso a paso con ilustraciones nativas

export function HowItWorksSection() {
  return (
    <section className="landing-section how-section" id="como-funciona" aria-labelledby="how-title">
      <div className="landing-container">
        <div className="section-heading centered">
          <p className="eyebrow eyebrow-dark">Cómo funciona</p>
          <h2 id="how-title">Así se usa Pulso360 durante una jornada real.</h2>
          <p>El recorrido es sencillo para quien responde y útil para quien debe tomar acciones de prevención.</p>
        </div>

        <ol className="how-grid">
          <li className="how-card">
            <div className="how-card-top"><span>1</span><small>Durante la jornada</small></div>
            <h3>El agente responde seis preguntas</h3>
            <p>Califica energía, carga, recuperación, apoyo, distanciamiento e ineficacia. También puede elegir no responder.</p>
            <div className="mini-survey" aria-hidden="true">
              <span>1</span><span>2</span><span className="active">3</span><span>4</span><span>5</span>
            </div>
          </li>
          <li className="how-card">
            <div className="how-card-top"><span>2</span><small>De forma automática</small></div>
            <h3>El sistema reúne y protege las respuestas</h3>
            <p>Los resultados se agrupan. Si hay muy pocas personas, Pulso360 oculta la información para evitar identificaciones.</p>
            <div className="mini-protection" aria-hidden="true">
              <div><i></i><i></i><i></i><i></i><i></i></div>
              <strong>Grupo protegido</strong>
            </div>
          </li>
          <li className="how-card">
            <div className="how-card-top"><span>3</span><small>Para prevenir</small></div>
            <h3>SST observa una tendencia y registra una acción</h3>
            <p>El equipo de bienestar puede detectar un cambio colectivo, intervenir y hacer seguimiento sin señalar a ningún agente.</p>
            <div className="mini-alert" aria-hidden="true">
              <span>!</span>
              <div><strong>Carga en aumento</strong><small>Revisar condiciones del equipo</small></div>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}
