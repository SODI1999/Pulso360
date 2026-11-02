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
            <h2 id="contact-cta-title">
              ¿Lideras una operación BPO o gestionas Seguridad y Salud en el Trabajo?
            </h2>
            <p className="contact-cta-lead">
              Revisa cómo se explica Pulso360 y prueba un formulario de contacto de ejemplo para una operación BPO.
              La página muestra su alcance antes de introducir datos.
            </p>
            <div className="contact-cta-buttons">
              <Link to="/contactenos" className="btn-editorial btn-editorial-primary">
                Probar formulario de contacto
              </Link>
            </div>
            <p className="contact-cta-guarantee">
              El formulario es una demostración local: prepara un resumen y no envía mensajes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
