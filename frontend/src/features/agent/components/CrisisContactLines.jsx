import { Icon } from '../../../core/components/Icon';

export function CrisisContactLines() {
  return (
    <section className="crisis-lines-section" aria-labelledby="lines-heading">
      <div className="crisis-section-heading-group">
        <h2 id="lines-heading" className="crisis-section-title">
          Líneas oficiales y gratuitas de atención telefónica 24/7
        </h2>
        <p className="crisis-section-desc">
          Canales de escucha y atención inmediata atendidos por profesionales en salud mental y emergencias en
          Colombia.
        </p>
      </div>

      <div className="crisis-lines-grid">
        {/* Línea Prioritaria: 106 */}
        <article className="crisis-line-card-primary">
          <div className="crisis-line-meta-primary">
            <strong>Línea 106: Escucha y Salud Mental (Distrital y Nacional)</strong>
            <p className="crisis-line-desc-primary">
              Orientación y primeros auxilios psicológicos atendidos por profesionales en salud mental.
              Gratuita desde teléfonos fijos y móviles en todo el país. Recomendada para descompresión
              inmediata ante sobrecarga emocional.
            </p>
          </div>
          <a
            href="tel:106"
            className="btn-crisis-call btn-crisis-call--primary"
            aria-label="Llamar directamente a la Línea 106 de salud mental"
          >
            <Icon name="phone" size={18} />
            <span>Llamar a la Línea 106 (Tocar para marcar)</span>
          </a>
        </article>

        {/* Líneas Secundarias: 123 y 155 */}
        <div className="crisis-secondary-col">
          <article className="crisis-line-card-secondary">
            <div>
              <strong>Línea 123: Emergencias y Seguridad</strong>
              <p className="crisis-line-desc-secondary">
                Para situaciones con riesgo inminente de vida, integridad física o requerimiento urgente de
                traslado médico.
              </p>
            </div>
            <a
              href="tel:123"
              className="btn-crisis-call btn-crisis-call--emergency"
              aria-label="Llamar a la Línea 123 de emergencias"
            >
              <Icon name="phone" size={16} />
              <span>Marcar 123 (Emergencias)</span>
            </a>
          </article>

          <article className="crisis-line-card-secondary">
            <div>
              <strong>Línea 155: Orientación a Mujeres / Red EPS y ARL</strong>
              <p className="crisis-line-desc-secondary">
                Orientación gratuita 24h a mujeres víctimas de violencia y canal de apoyo psicológico de tu
                EPS o ARL asignada.
              </p>
            </div>
            <a
              href="tel:155"
              className="btn-crisis-call btn-crisis-call--secondary"
              aria-label="Llamar a la Línea 155 de orientación a mujeres"
            >
              <Icon name="phone" size={16} />
              <span>Marcar 155 (Orientación)</span>
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
