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
            {/* Columna Izquierda: Información Institucional & Canales de Enlace */}
            <div className="contact-info-panel">
              <span className="contact-badge">Atención Institucional & SST</span>

              <h1 className="contact-heading">Enlace Operativo, Coordinación de Pilotos y Transferencia Tecnológica</h1>
              <p className="contact-lead">
                Canal institucional de articulación entre centros de contacto (BPO), áreas de Seguridad y Salud en
                el Trabajo (SST) y el equipo de investigación del Tecnológico de Antioquia. Acompañamos el
                dimensionamiento de pilotos preventivos y la adopción de modelos de k-anonimato para proteger el
                bienestar de tus equipos sin fines de vigilancia laboral.
              </p>

              <div className="contact-channels-list" role="region" aria-label="Canales de atención institucional">
                <article className="channel-item">
                  <div className="channel-icon-wrap" aria-hidden="true">
                    <Icon name="fileShield" size={18} />
                  </div>
                  <div className="channel-details">
                    <strong className="channel-title">Coordinación de Pilotos en Centros de Contacto</strong>
                    <a href="mailto:pilotos@pulso360.co" className="channel-link">pilotos@pulso360.co</a>
                    <p className="channel-meta">Atención a operaciones BPO para turnos rotativos, colas de llamadas y pilotos técnicos.</p>
                  </div>
                </article>

                <article className="channel-item">
                  <div className="channel-icon-wrap" aria-hidden="true">
                    <Icon name="Scale" size={18} />
                  </div>
                  <div className="channel-details">
                    <strong className="channel-title">Consultoría Metodológica en k-Anonimato & SST</strong>
                    <a href="mailto:metodologia@pulso360.co" className="channel-link">metodologia@pulso360.co</a>
                    <p className="channel-meta">Asesoría en reglas de agregación colectiva (k &ge; 5) y alineación con la Res. 2764 de 2022.</p>
                  </div>
                </article>

                <article className="channel-item">
                  <div className="channel-icon-wrap" aria-hidden="true">
                    <Icon name="bookmark" size={18} />
                  </div>
                  <div className="channel-details">
                    <strong className="channel-title">Sede Académica & Investigación Formativa</strong>
                    <span className="channel-static-val">Tecnológico de Antioquia (TdeA)</span>
                    <p className="channel-meta">Facultad de Ingeniería · Semillero de Software · Medellín, Colombia.</p>
                  </div>
                </article>
              </div>

              {/* Protocolo de Aislamiento y Confidencialidad Técnica */}
              <aside className="contact-privacy-guarantee" aria-label="Garantía de confidencialidad">
                <div className="privacy-badge-icon" aria-hidden="true">
                  <Icon name="shieldCheck" size={20} />
                </div>
                <div className="privacy-text-block">
                  <strong className="privacy-title">Protocolo de Aislamiento y Confidencialidad Técnica</strong>
                  <p className="privacy-desc">
                    Las solicitudes institucionales se gestionan en un canal técnico independiente. No acceden,
                    vinculan ni correlacionan las bitácoras privadas de los operadores ni los registros individuales
                    de bienestar, garantizando reserva estricta conforme a la Ley 1581 de 2012 y el SG-SST.
                  </p>
                </div>
              </aside>
            </div>

            {/* Columna Derecha: Formulario Funcional & Ficha de Radicación */}
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
