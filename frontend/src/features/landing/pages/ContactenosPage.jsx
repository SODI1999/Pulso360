// src/features/landing/pages/ContactenosPage.jsx
// Vista de contacto directo y acompañamiento institucional para centros de contacto (BPO) y áreas de SST

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
              <h1 className="contact-heading">Hablemos sobre el cuidado de tu operación</h1>
              <p className="contact-lead">
                Pulso360 apoya a centros de contacto y áreas de Seguridad y Salud en el Trabajo (SST)
                a identificar señales tempranas de desgaste laboral mediante check-ins breves y tendencias
                colectivas protegidas con k-anonimato.
              </p>

              <div className="contact-channels-list" role="region" aria-label="Canales de atención">
                <div className="channel-item">
                  <div className="channel-icon-wrap" aria-hidden="true">
                    <Icon name="mail" size={18} />
                  </div>
                  <div className="channel-details">
                    <strong className="channel-title">Coordinación de Pilotos y Demostraciones</strong>
                    <a href="mailto:contacto@pulso360.co" className="channel-link">contacto@pulso360.co</a>
                    <p className="channel-meta">Acompañamiento para operaciones BPO, colas de atención y turnos rotativos.</p>
                  </div>
                </div>

                <div className="channel-item">
                  <div className="channel-icon-wrap" aria-hidden="true">
                    <Icon name="Scale" size={18} />
                  </div>
                  <div className="channel-details">
                    <strong className="channel-title">Consultoría Metodológica & SST</strong>
                    <a href="mailto:sst@pulso360.co" className="channel-link">sst@pulso360.co</a>
                    <p className="channel-meta">Orientación en agregación de datos (k &ge; 5) y articulación con el SG-SST.</p>
                  </div>
                </div>

                <div className="channel-item">
                  <div className="channel-icon-wrap" aria-hidden="true">
                    <Icon name="building" size={18} />
                  </div>
                  <div className="channel-details">
                    <strong className="channel-title">Sede Académica & Investigación</strong>
                    <span className="channel-static-val">Tecnológico de Antioquia (TdeA)</span>
                    <p className="channel-meta">Facultad de Ingeniería · Semillero de Software · Medellín, Colombia.</p>
                  </div>
                </div>
              </div>

              <div className="contact-privacy-guarantee">
                <div className="privacy-badge-icon" aria-hidden="true">
                  <Icon name="shieldCheck" size={18} />
                </div>
                <div className="privacy-text-block">
                  <strong className="privacy-title">Separación de flujos y privacidad</strong>
                  <p className="privacy-desc">
                    Las solicitudes de contacto se gestionan de forma independiente y no acceden a las bitácoras
                    personales de los operadores. Tratamiento conforme a la Ley 1581 de 2012.
                  </p>
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
