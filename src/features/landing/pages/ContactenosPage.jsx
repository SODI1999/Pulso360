// src/features/landing/pages/ContactenosPage.jsx
// Vista dedicada para la ruta de Contáctenos con barra de navegación completa, columnas editoriales y pie de página institucional

import { useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ContactForm } from '../components/ContactForm';
import { Icon } from '../../../core/components/Icon';

export function ContactenosPage() {
  // A08: Resetear scroll al tope para evitar aterrizar en el footer
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="landing-page-root contact-page-root">
      {/* Barra de navegación institucional completa */}
      <Navbar />

      {/* Contenido Principal en 2 Columnas Editoriales */}
      <main id="contenido" className="contact-page-main">
        <div className="landing-container">
          <div className="contact-editorial-layout">
            {/* Columna Izquierda: Información Institucional & Canales de Acompañamiento */}
            <div className="contact-info-panel">
              <span className="contact-badge">
                Atención Institucional & SST
              </span>

              <h1>Hablemos de cómo cuidar el bienestar de tu operación.</h1>
              <p className="contact-lead">
                Pulso360 ayuda a los centros de contacto a detectar el agotamiento laboral antes de que se transforme en rotación o crisis, protegiendo la intimidad del agente con k-anonimato estricto. Acompañamos a tu equipo de gestión humana, SST y operaciones.
              </p>

              <div className="contact-channels-list">
                <div className="channel-item">
                  <div className="channel-icon">
                    <Icon name="mail" size={18} />
                  </div>
                  <div>
                    <strong>Canal de Consultoría & Demostración</strong>
                    <a href="mailto:contacto@pulso360.co">contacto@pulso360.co</a>
                  </div>
                </div>

                <div className="channel-item">
                  <div className="channel-icon">
                    <Icon name="clock" size={18} />
                  </div>
                  <div>
                    <strong>Horario de Acompañamiento Institucional</strong>
                    <span>Lunes a Viernes: 08:00 – 17:00 COT</span>
                    <small>Coordinación de pilotos técnicos para operaciones BPO</small>
                  </div>
                </div>

                <div className="channel-item">
                  <div className="channel-icon">
                    <Icon name="apartment" size={18} />
                  </div>
                  <div>
                    <strong>Sede Académica & Desarrollo Tecnológico</strong>
                    <span>Tecnológico de Antioquia (TdeA)</span>
                    <small>Facultad de Ingeniería · Medellín, Colombia</small>
                  </div>
                </div>
              </div>

              {/* Tarjeta de Garantía de Privacidad y Habeas Data */}
              <div className="contact-privacy-guarantee">
                <Icon name="shieldCheck" size={22} />
                <div>
                  <strong>Independencia Estricta de Datos</strong>
                  <p>
                    Las solicitudes comerciales o de soporte técnico jamás se vinculan con las bitácoras personales ni con las respuestas de bienestar de los agentes de tu organización.
                  </p>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Formulario Funcional */}
            <div className="contact-form-column">
              <ContactForm />
            </div>
          </div>
        </div>
      </main>

      {/* Pie de página institucional */}
      <Footer />
    </div>
  );
}

