import { Icon } from '../../../core/components/Icon';

export function CrisisContactLines() {
  return (
    <section className="crisis-lines-section" aria-labelledby="lines-heading">
      <div className="crisis-section-heading-group">
        <h2 id="lines-heading" className="crisis-section-title">
          Líneas de orientación y emergencias en Colombia
        </h2>
        <p className="crisis-section-desc">
          Elige el canal según lo que necesitas: orientación en salud mental, emergencia o atención a violencias basadas en género.
        </p>
      </div>

      <div className="crisis-lines-grid">
        {/* Línea Prioritaria: 106 */}
        <article className="crisis-line-card-primary">
          <div className="crisis-line-meta-primary">
            <strong>Línea 106: Escucha y Salud Mental (Distrital y Nacional)</strong>
            <p className="crisis-line-desc-primary">
              Orientación y apoyo en salud mental. El Ministerio de Salud informa atención gratuita las 24 horas, todos los días. Consulta también las líneas territoriales disponibles en tu ubicación.
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
              <strong>Línea 155: Orientación ante violencias basadas en género</strong>
              <p className="crisis-line-desc-secondary">
                Orientación gratuita las 24 horas a personas víctimas de violencias basadas en género. Esta línea no es el canal de atención de tu EPS o ARL.
              </p>
            </div>
            <a
              href="tel:155"
              className="btn-crisis-call btn-crisis-call--secondary"
              aria-label="Llamar a la Línea 155 de orientación ante violencias basadas en género"
            >
              <Icon name="phone" size={16} />
              <span>Marcar 155 (Orientación)</span>
            </a>
          </article>
        </div>
      </div>
      <p className="crisis-section-desc">Fuentes: <a href="https://www.minsalud.gov.co/salud/publica/salud-mental/Paginas/linea-106.aspx" target="_blank" rel="noreferrer">Ministerio de Salud: línea 106 y canales territoriales</a> · <a href="https://www.policia.gov.co/sites/default/files/2025-08/linea-155-orientacion-a-personas-victimas-de-violencias-basadas-en-genero.pdf" target="_blank" rel="noreferrer">Policía Nacional: línea 155</a>. Consultadas el 6 de octubre de 2026.</p>
    </section>
  );
}
