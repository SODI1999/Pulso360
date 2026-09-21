import { Link } from 'react-router-dom';

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
              Coordinemos una demostración técnica guiada para tu equipo de operaciones y talento humano, con revisión de umbrales de k-anonimato y límites de privacidad aplicados a la operación.
            </p>
            <div className="contact-cta-buttons">
              <Link to="/contactenos" className="btn-editorial btn-editorial-primary">
                Coordinar demostración o piloto
              </Link>
            </div>
            <p className="contact-cta-guarantee">
              La demostración se centra en umbrales de k-anonimato, tendencias agregadas y límites de acceso por rol.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
