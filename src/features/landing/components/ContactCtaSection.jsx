import { Link } from 'react-router-dom';
import { Icon } from '../../../core/components/Icon';

/**
 * Módulo Institucional de Contacto y Acompañamiento Operativo
 */
export function ContactCtaSection() {
  return (
    <section className="contact-cta-section" id="contacto-operativo" aria-labelledby="contact-cta-title">
      <div className="landing-container">
        <div className="contact-cta-card">
          <div className="contact-cta-content">
            <span className="acts-eyebrow">Atención Institucional & SST</span>
            <h2 id="contact-cta-title">
              ¿Lideras una operación BPO o gestionas Seguridad y Salud en el Trabajo?
            </h2>
            <p className="contact-cta-lead">
              Coordinemos una demostración técnica guiada para tu equipo de operaciones y talento humano, con dimensionamiento de umbrales éticos de k-anonimato y auditoría de privacidad sin fricción operativa.
            </p>
            <div className="contact-cta-buttons">
              <Link to="/contactenos" className="btn-editorial btn-editorial-primary">
                Coordinar demostración o piloto
              </Link>
              <a href="mailto:contacto@pulso360.co" className="btn-editorial btn-editorial-outline btn-contact-email" title="Enviar correo a contacto@pulso360.co">
                Escribir correo
              </a>
            </div>
            <span className="contact-cta-guarantee">
              <Icon name="shieldCheck" size={14} />
              Las consultas comerciales o institucionales jamás se vinculan con las bitácoras o respuestas anónimas de los agentes.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
