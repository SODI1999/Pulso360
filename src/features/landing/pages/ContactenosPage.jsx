// src/features/landing/pages/ContactenosPage.jsx
// Vista dedicada para la ruta de Contáctenos con barra de navegación completa, columnas editoriales y pie de página institucional

import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Contactenos } from '../components/Contactenos';
import { Icon } from '../../../core/components/Icon';

export function ContactenosPage() {
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
              <div className="contact-badge">
                <Icon name="support_agent" size={15} />
                <span>Atención Institucional & SST</span>
              </div>

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
                    <strong>Horario de Soporte Especializado</strong>
                    <span>Lunes a Viernes: 07:00 – 18:00 COT</span>
                    <small>Atención a incidencias críticas en turnos rotativos</small>
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
              <Contactenos />
            </div>
          </div>
        </div>
      </main>

      {/* Pie de página institucional */}
      <Footer />
    </div>
  );
}

// Alias de exportación retrocompatible
export { ContactenosPage as FormularioPage, ContactenosPage as FormularioView };
