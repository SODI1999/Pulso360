import { Icon } from '../../../core/components/Icon';

export function CrisisContactLines() {
  return (
    <section id="crisis-lines" className="crisis-lines-section" aria-labelledby="lines-heading">
      <div className="crisis-section-heading-group">
        <h2 id="lines-heading" className="crisis-section-title">
          Líneas de orientación y emergencias en Colombia
        </h2>
        <p className="crisis-section-desc">
          Canales oficiales, gratuitos y de atención continua (24/7) para apoyo inmediato.
        </p>
      </div>

      <div className="crisis-lines-list">
        {/* Línea Prioritaria: 106 Salud Mental */}
        <article className="crisis-line-item crisis-line-item--primary">
          <div className="crisis-line-item-info">
            <div className="crisis-line-item-badge">
              <span className="crisis-line-number">106</span>
              <span className="crisis-line-tag">Salud Mental y Escucha 24/7</span>
            </div>
            <p className="crisis-line-item-desc">
              Orientación y apoyo psicológico gratuito informado por Minsalud y canales territoriales.
            </p>
          </div>
          <a
            href="tel:106"
            className="btn-crisis-call btn-crisis-call--primary"
            aria-label="Llamar directamente a la Línea 106 de salud mental"
          >
            <Icon name="phone" size={15} />
            <span>Llamar 106</span>
          </a>
        </article>

        {/* Línea 123: Emergencias */}
        <article className="crisis-line-item">
          <div className="crisis-line-item-info">
            <div className="crisis-line-item-badge">
              <span className="crisis-line-number crisis-line-number--emergency">123</span>
              <span className="crisis-line-tag">Emergencias y Seguridad</span>
            </div>
            <p className="crisis-line-item-desc">
              Riesgo inminente de vida, integridad física o requerimiento urgente de traslado médico.
            </p>
          </div>
          <a
            href="tel:123"
            className="btn-crisis-call btn-crisis-call--emergency"
            aria-label="Llamar a la Línea 123 de emergencias"
          >
            <Icon name="phone" size={15} />
            <span>Marcar 123</span>
          </a>
        </article>

        {/* Línea 155: Orientación Género */}
        <article className="crisis-line-item">
          <div className="crisis-line-item-info">
            <div className="crisis-line-item-badge">
              <span className="crisis-line-number">155</span>
              <span className="crisis-line-tag">Violencias Basadas en Género</span>
            </div>
            <p className="crisis-line-item-desc">
              Orientación confidencial 24/7 por Policía Nacional. No reemplaza a tu EPS o ARL.
            </p>
          </div>
          <a
            href="tel:155"
            className="btn-crisis-call btn-crisis-call--secondary"
            aria-label="Llamar a la Línea 155 de orientación"
          >
            <Icon name="phone" size={15} />
            <span>Marcar 155</span>
          </a>
        </article>
      </div>

      <p className="crisis-section-desc crisis-sources-footnote">
        Fuentes: <a href="https://www.minsalud.gov.co/salud/publica/salud-mental/Paginas/linea-106.aspx" target="_blank" rel="noreferrer">Ministerio de Salud (Línea 106)</a> · <a href="https://www.policia.gov.co/sites/default/files/2025-08/linea-155-orientacion-a-personas-victimas-de-violencias-basadas-en-genero.pdf" target="_blank" rel="noreferrer">Policía Nacional (Línea 155)</a>. Consultadas el 6 de octubre de 2026.
      </p>
    </section>
  );
}
