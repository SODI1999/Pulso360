// src/features/landing/pages/ContactenosPage.jsx
// Contexto académico y demostración local del formulario de contacto, sin envío conectado.

import { useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ContactForm } from '../components/ContactForm';
import { Icon } from '../../../core/components/Icon';

export function ContactenosPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="landing-page-root contact-page-root">
      <Navbar />

      <main id="contenido" className="contact-page-main">
        <div className="landing-container">
          <div className="contact-editorial-layout">
            {/* Columna Izquierda: Información de contacto y canales */}
            <div className="contact-info-panel">
              <h1 className="contact-heading">Contacto de ejemplo para una operación BPO</h1>
              <p className="contact-lead">
                Esta página del proyecto académico muestra cómo preparar una consulta sobre Pulso360.
                El formulario funciona en esta página: no hay un canal de recepción de mensajes conectado.
              </p>

              <div className="contact-channels-list" role="region" aria-label="Alcance de la demostración de contacto">
                <div className="channel-item">
                  <div className="channel-icon-wrap" aria-hidden="true">
                    <Icon name="mail" size={18} />
                  </div>
                  <div className="channel-details">
                    <strong className="channel-title">Formulario sin envío conectado</strong>
                    <span className="channel-static-val">Demostración local</span>
                    <p className="channel-meta">Puedes validar campos y revisar un resumen. No se registra una solicitud de contacto.</p>
                  </div>
                </div>

                <div className="channel-item">
                  <div className="channel-icon-wrap" aria-hidden="true">
                    <Icon name="Scale" size={18} />
                  </div>
                  <div className="channel-details">
                    <strong className="channel-title">Datos de ejemplo</strong>
                    <span className="channel-static-val">Evita información personal o sensible</span>
                    <p className="channel-meta">El formulario no es un canal de atención de SST. Si tienes una cuenta, utiliza el canal de apoyo dentro de la aplicación.</p>
                  </div>
                </div>

                <div className="channel-item">
                  <div className="channel-icon-wrap" aria-hidden="true">
                    <Icon name="building" size={18} />
                  </div>
                  <div className="channel-details">
                    <strong className="channel-title">Equipo estudiantil</strong>
                    <span className="channel-static-val">Contexto: Tecnológico de Antioquia (TdeA)</span>
                    <p className="channel-meta">Propuesta de software surgida de una actividad de materia.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Formulario de Contacto */}
            <div className="contact-form-column">
              <ContactForm />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
