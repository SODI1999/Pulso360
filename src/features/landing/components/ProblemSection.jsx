// src/features/landing/components/ProblemSection.jsx
// Sección del problema y público objetivo de Pulso360

export function ProblemSection() {
  return (
    <>
      {/* Resumen del Funcionamiento */}
      <section className="journey-summary" aria-label="Resumen del funcionamiento de Pulso360">
        <div className="landing-container journey-summary-grid">
          <article>
            <span>1</span>
            <div>
              <strong>El agente responde</strong>
              <p>Registra cómo vivió su jornada.</p>
            </div>
          </article>
          <article>
            <span>2</span>
            <div>
              <strong>Pulso360 protege</strong>
              <p>Agrupa respuestas sin mostrar personas.</p>
            </div>
          </article>
          <article>
            <span>3</span>
            <div>
              <strong>SST actúa</strong>
              <p>Recibe tendencias y hace seguimiento.</p>
            </div>
          </article>
        </div>
      </section>

      {/* El Problema */}
      <section className="landing-section problem-section" id="problema" aria-labelledby="problem-title">
        <div className="landing-container">
          <div className="section-heading section-heading-split">
            <div>
              <p className="eyebrow eyebrow-dark">El problema</p>
              <h2 id="problem-title">
                Muchas empresas descubren el desgaste cuando ya se refleja en ausentismo, rotación o crisis.
              </h2>
            </div>
            <p>
              En los Contact Centers la presión puede cambiar de una semana a otra. Las mediciones ocasionales no siempre muestran lo que está viviendo el equipo hoy, y los agentes pueden evitar hablar si sienten que serán identificados.
            </p>
          </div>

          <div className="problem-grid">
            <article className="problem-card">
              <span className="problem-number">01</span>
              <h3>No existe una lectura continua</h3>
              <p>Una encuesta anual no permite observar cambios rápidos en energía, carga, recuperación o apoyo.</p>
            </article>
            <article className="problem-card problem-card-accent">
              <span className="problem-number">02</span>
              <h3>Expresarse puede generar temor</h3>
              <p>Si una respuesta puede llegar al jefe directo, la persona puede ocultar lo que realmente siente.</p>
            </article>
            <article className="problem-card">
              <span className="problem-number">03</span>
              <h3>Actuar sin datos dificulta prevenir</h3>
              <p>SST necesita tendencias oportunas para priorizar acciones y comprobar si el equipo mejora.</p>
            </article>
          </div>

          <aside className="audience-panel">
            <div>
              <span>¿Para quién es Pulso360?</span>
              <h3>Para agentes de Contact Center y los equipos responsables de cuidar su bienestar laboral.</h3>
            </div>
            <p><strong>El agente</strong> obtiene un espacio privado para expresar cómo se siente.</p>
            <p><strong>Supervisores y SST</strong> reciben información colectiva para prevenir, nunca respuestas individuales.</p>
          </aside>
        </div>
      </section>
    </>
  );
}
