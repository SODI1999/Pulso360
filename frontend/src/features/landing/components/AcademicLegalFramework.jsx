import { Icon } from '../../../core/components/Icon';
import { LEGAL_FRAMEWORK_DATA } from '../data/academicFoundationData';

export function AcademicLegalFramework() {
  return (
    <section
      className="academic-editorial-section legal-framework-section"
      id="marco-legal"
      aria-labelledby="sec-legal-titulo"
    >
      <div className="section-title-wrap">
        <span className="section-tag">Marco Normativo Colombiano</span>
        <h2 id="sec-legal-titulo">Marco Normativo Colombiano & Salvaguardas Jurídicas</h2>
      </div>
      <p className="section-prose">
        Fundamentación jurídica y salvaguardas ético-legales de Colombia que orientan la naturaleza preventiva, los derechos de autoría y la protección de datos en Pulso360:
      </p>
      <div className="legal-dossier-shell">
        {LEGAL_FRAMEWORK_DATA.map((item) => {
          let themeClass = 'theme-sst';
          if (item.tag === 'Derechos Morales') themeClass = 'theme-copyright';
          else if (item.tag === 'Datos Sensibles') themeClass = 'theme-privacy';
          else if (item.tag === 'Desconexión Laboral' || item.tag === 'Desconexion Laboral')
            themeClass = 'theme-disconnection';
          else if (item.tag === 'SG-SST') themeClass = 'theme-sgsst';

          return (
            <article key={item.code} className={'legal-dossier-row ' + themeClass}>
              <div className="legal-row-meta">
                <div className="legal-meta-head">
                  <span className="legal-icon-wrap" aria-hidden="true">
                    <Icon name={item.icon || 'shieldCheck'} size={18} />
                  </span>
                  <span className="legal-tag-badge">{item.tag}</span>
                </div>
                <strong className="legal-code-pill">{item.code}</strong>
              </div>
              <div className="legal-row-content">
                <h3 className="legal-item-title">{item.title}</h3>
                <p className="legal-item-body">{item.body}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
