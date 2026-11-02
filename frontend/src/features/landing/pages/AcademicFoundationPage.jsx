// src/features/landing/pages/AcademicFoundationPage.jsx
// Origen estudiantil de Pulso360 a partir de datos recogidos en una actividad de materia.

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ScrollToTopButton } from '../components/ScrollToTopButton';
import { Icon } from '../../../core/components/Icon';
import { CITATION_DATA, ANTI_SURVEILLANCE_PILLARS } from '../data/academicFoundationData';
import { AcademicHeader } from '../components/AcademicHeader';
import { AcademicSidebarToc } from '../components/AcademicSidebarToc';
import { AcademicAuthors } from '../components/AcademicAuthors';
import { AcademicEvidence } from '../components/AcademicEvidence';
import { AcademicTransfer } from '../components/AcademicTransfer';
import { AcademicCitation } from '../components/AcademicCitation';
import { AcademicLegalFramework } from '../components/AcademicLegalFramework';

export function AcademicFoundationPage() {
  const [citationFormat, setCitationFormat] = useState('apa7');
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [activeSection, setActiveSection] = useState('autores');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // ScrollSpy reactivo para el rail lateral de navegación
  useEffect(() => {
    const sectionIds = [
      'autores',
      'evidencia-empirica',
      'transferencia',
      'antivigilancia',
      'citacion',
      'marco-legal'
    ];

    const handleScrollSpy = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50) {
        setActiveSection(sectionIds[sectionIds.length - 1]);
        return;
      }

      const offsetMargin = 220;
      let currentSection = sectionIds[0];
      for (let i = 0; i < sectionIds.length; i++) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offsetMargin) {
            currentSection = sectionIds[i];
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy();
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, []);

  const handleCopyCitation = async () => {
    const text = citationFormat === 'apa7' ? CITATION_DATA.apa7 : CITATION_DATA.bibtex;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setCopyFailed(false);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="landing-page-root academic-page-root">
      <Navbar />

      <main className="academic-page-main" id="contenido-principal">
        <div className="landing-container">
          {/* Migas de Pan */}
          <nav className="academic-breadcrumb" aria-label="Migas de pan">
            <Link to="/" className="breadcrumb-link">
              <Icon name="arrowLeft" size={14} className="breadcrumb-icon" />
              <span>Volver al inicio</span>
            </Link>
            <span className="breadcrumb-separator" aria-hidden="true">
              /
            </span>
            <span className="breadcrumb-current">Origen y datos de la actividad de aula</span>
          </nav>

          <article className="academic-article-shell">
            {/* HERO EDITORIAL */}
            <AcademicHeader handlePrint={handlePrint} />

            {/* LAYOUT EDITORIAL EN 2 COLUMNAS (RAIL TOC LATERAL + CONTENIDO) */}
            <div className="academic-body-layout">
              {/* COLUMNA IZQUIERDA: RAIL TOC STICKY */}
              <AcademicSidebarToc activeSection={activeSection} />

              {/* COLUMNA DERECHA: FLUJO EDITORIAL DE SECCIONES */}
              <div className="academic-content-flow">
                {/* SECCION AUTORES Y EQUIPO */}
                <AcademicAuthors />

                {/* SECCION 1: EVIDENCIA EMPIRICA */}
                <AcademicEvidence />

                {/* SECCION 2: MATRIZ DE TRANSFERENCIA METODOLOGICA */}
                <AcademicTransfer />

                {/* SECCION 3: PRINCIPIOS ETICOS & NO-VIGILANCIA */}
                <section
                  className="academic-editorial-section anti-surveillance-section"
                  id="antivigilancia"
                  aria-labelledby="sec-privacidad-titulo"
                >
                  <div className="anti-surveillance-card">
                    <div className="anti-surveillance-header">
                      <div className="shield-icon-badge">
                        <Icon name="shieldCheck" size={24} />
                      </div>
                      <div className="anti-surveillance-titles">
                        <span className="section-tag-light">Salvaguardas de Seguridad Psicológica</span>
                        <h2 id="sec-privacidad-titulo" className="anti-surveillance-heading">
                          Principios de diseño anti-vigilancia
                        </h2>
                        <p className="anti-surveillance-sub">
                          El bienestar laboral no debe convertirse en vigilancia, control disciplinario ni
                          persecución. Esta sección documenta salvaguardas y límites de diseño; su alcance depende
                          de los controles activos en cada despliegue:
                        </p>
                      </div>
                    </div>
                    <div className="surveillance-pillars-grid">
                      {ANTI_SURVEILLANCE_PILLARS.map((pillar) => (
                        <div key={pillar.title} className="pillar-item">
                          <div className="pillar-icon-box">
                            <Icon name={pillar.icon} size={16} />
                          </div>
                          <div className="pillar-content">
                            <strong className="pillar-title">{pillar.title}</strong>
                            <p className="pillar-desc">{pillar.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* SECCION 4: CITACION ACADEMICA FORMAL */}
                <AcademicCitation
                  citationFormat={citationFormat}
                  setCitationFormat={setCitationFormat}
                  copied={copied}
                  handleCopyCitation={handleCopyCitation}
                  copyFailed={copyFailed}
                />

                {/* SECCION 5: MARCO JURIDICO COLOMBIANO */}
                <AcademicLegalFramework />
              </div>
            </div>

            {/* Pie formal exclusivo para exportación a PDF / impresión institucional */}
            <footer className="print-document-footer only-print" aria-hidden="true">
              <span className="print-footer-inst">Pulso360 · Proyecto estudiantil</span>
              <span className="print-footer-doc">Datos de una actividad de aula y decisiones de diseño</span>
              <span className="print-footer-audit">Referencia de materia · Sin aval institucional</span>
            </footer>
          </article>
        </div>
      </main>

      <Footer />

      {/* Botón Flotante Accesible para Volver al Inicio en Documentos Extensos */}
      <ScrollToTopButton />
    </div>
  );
}
