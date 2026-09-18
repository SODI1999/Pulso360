// src/features/landing/components/ProblemSection.jsx
// Sección editorial sobre la realidad operativa en BPO: Ritmo en 3 Tiempos y Cero Encajonamiento Robótico

import { Icon } from '../../../core/components/Icon';

export function ProblemSection() {
  return (
    <section className="problem-editorial-section" id="problema" aria-labelledby="problem-title">
      <div className="landing-container">
        {/* Cabecera Editorial abierta y serena */}
        <div className="problem-editorial-header">
          <span className="problem-eyebrow">La Realidad en Operaciones BPO</span>
          <h2 id="problem-title">
            El agotamiento no avisa con anticipación; se acumula llamada tras llamada.
          </h2>
          <p className="problem-lead">
            En un Contact Center, la presión sostenida por colas continuas, solicitudes complejas y fricciones técnicas genera un desgaste silencioso. Cuando la organización se entera a través de ausentismos no planificados o deserción imprevista, el daño laboral ya ocurrió.
          </p>
        </div>

        {/* =========================================================================
            TIEMPO 1: FRANJA MÉTRICA CORRIDA (SIN CAJAS CERRADAS)
            ========================================================================= */}
        <div className="problem-metric-strip" aria-label="Indicadores clave de la industria BPO">
          <div className="strip-metric-item">
            <span className="strip-metric-val">420s</span>
            <strong className="strip-metric-lbl">Meta típica de AHT (Average Handle Time)</strong>
            <p className="strip-metric-sub">
              Presión constante por acortar cada llamada en línea directa con el usuario.
            </p>
            <span className="strip-metric-source">Ref. sectorial BPrO / ANDI Colombia 2024</span>
          </div>

          <div className="strip-metric-item">
            <span className="strip-metric-val">35% – 40%</span>
            <strong className="strip-metric-lbl">Rotación anual promedio en centros de contacto</strong>
            <p className="strip-metric-sub">
              Deserción prematura impulsada por el desgaste acumulado y la falta de apoyo oportuno.
            </p>
            <span className="strip-metric-source">Ref. sectorial BPrO / ANDI Colombia 2024</span>
          </div>

          <div className="strip-metric-item highlight-item">
            <span className="strip-metric-val">84.3%</span>
            <strong className="strip-metric-lbl">Prevalencia de fatiga emocional (Hallazgo TdeA)</strong>
            <p className="strip-metric-sub">
              Evidencia empírica identificada en la investigación base del Semillero en Medellín.
            </p>
            <span className="strip-metric-source">Muestra: n=185 trabajadores · Medellín · 2024</span>
          </div>
        </div>

        {/* =========================================================================
            TIEMPO 2: DOBLE COLUMNA EDITORIAL (FOTOGRAFÍA DOCUMENTAL + CITA + 3 PUNTOS CIEGOS)
            ========================================================================= */}
        <div className="problem-editorial-dialogue">
          <div className="dialogue-quote-col">
            {/* Fotografía Documental de Piso BPO Real */}
            <div className="problem-documentary-frame">
              <img
                src="/assets/fotos/bpo-operations-reality.jpg"
                alt="Operación de centro de contacto en Medellín: fatiga y sobrecarga acumulada en piso de llamadas ininterrumpidas"
                className="problem-documentary-img"
                loading="lazy"
              />
              <div className="documentary-caption-strip">
                <span className="caption-tag">Evidencia de Piso · Operación BPO</span>
                <span className="caption-meta">Medellín, Colombia</span>
              </div>
            </div>

            <blockquote className="dialogue-quote-text">
              «Llevo cuatro horas de llamadas pegadas y clientes bravos. No alcanzo ni a tomar agua, pero si digo algo me clavan el turno de cierre o me toca domingo.»
            </blockquote>
            <cite className="dialogue-quote-cite">
              — Relato testimonial basado en la investigación cualitativa del TdeA con operadores en Medellín
            </cite>
          </div>

          <div className="dialogue-blindspots-col">
            <h3 className="blindspots-heading">Los 3 Puntos Ciegos de la Gestión Tradicional:</h3>

            <div className="blindspot-row">
              <span className="blindspot-index">01</span>
              <div>
                <strong>El silencio por miedo a represalias</strong>
                <p>Si el asesor cree que su supervisor va a ver lo que escribió, responde que todo está bien para no tener problemas.</p>
              </div>
            </div>

            <div className="blindspot-row">
              <span className="blindspot-index">02</span>
              <div>
                <strong>Mediciones retrospectivas tardías</strong>
                <p>Las encuestas anuales entregan resultados meses después. En una campaña de llamadas, el agotamiento escala en ciclos cortos de turnos.</p>
              </div>
            </div>

            <div className="blindspot-row">
              <span className="blindspot-index">03</span>
              <div>
                <strong>Gestión Humana llega tarde</strong>
                <p>SST y operaciones se enteran cuando la persona ya no aguanta más, se incapacita o pasa su carta de renuncia.</p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            TIEMPO 3: COMPARATIVA EDITORIAL DESATURADA
            ========================================================================= */}
        <div className="editorial-comparison-wrap">
          <div className="comparison-intro">
            <h3>Comparativa de Abordaje Metodológico</h3>
            <p>Por qué la prevención continua y serena supera a las encuestas anuales pasivas:</p>
          </div>

          <div className="editorial-comparison-grid">
            {/* Lado Tradicional: Tono piedra neutro, sin cruces rojas de castigo */}
            <div className="comparison-side side-traditional">
              <div className="side-label">Enfoque Tradicional Pasivo</div>
              <ul className="side-list">
                <li>
                  <span className="bullet-neutral" aria-hidden="true">—</span>
                  <div>
                    <strong>Cuestionarios extensos (+45 preguntas)</strong>
                    <p>Interrumpen la operación y fatigan al responder.</p>
                  </div>
                </li>
                <li>
                  <span className="bullet-neutral" aria-hidden="true">—</span>
                  <div>
                    <strong>Resultados 6 a 9 meses tarde</strong>
                    <p>Fotografía desactualizada cuando el agente ya desertó.</p>
                  </div>
                </li>
                <li>
                  <span className="bullet-neutral" aria-hidden="true">—</span>
                  <div>
                    <strong>Sospecha de anonimato en el piso</strong>
                    <p>El agente desconfía y oculta su sobrecarga real.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Lado Pulso360: Menta sereno y esmeralda */}
            <div className="comparison-side side-pulso">
              <div className="side-label">Enfoque Pulso360 Activo</div>
              <ul className="side-list">
                <li>
                  <span className="bullet-check"><Icon name="checkCircle" size={15} /></span>
                  <div>
                    <strong>Micro-pulso ágil de 60 segundos</strong>
                    <p>Voluntario al cerrar turno, sin fricción operativa.</p>
                  </div>
                </li>
                <li>
                  <span className="bullet-check"><Icon name="checkCircle" size={15} /></span>
                  <div>
                    <strong>Señales tempranas en menos de 48 horas</strong>
                    <p>Intervención de SST con pausas y rotación a tiempo.</p>
                  </div>
                </li>
                <li>
                  <span className="bullet-check"><Icon name="checkCircle" size={15} /></span>
                  <div>
                    <strong>k-Anonimato algorítmico matemático</strong>
                    <p>Garantía ética: grupos menores a 5 quedan blindados.</p>
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


