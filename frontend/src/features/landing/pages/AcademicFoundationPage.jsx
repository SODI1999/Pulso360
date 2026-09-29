import { AcademicLegalFramework } from '../components/AcademicLegalFramework';
import { AcademicCitation } from '../components/AcademicCitation';
import { AcademicTransfer } from '../components/AcademicTransfer';
import { AcademicEvidence } from '../components/AcademicEvidence';
import { AcademicHeader } from '../components/AcademicHeader';
// src/features/landing/pages/AcademicFoundationPage.jsx
// Pagina publica institucional: Fundamentación Cientifica, Evidencia Empírica y Transferencia Tecnologica

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ScrollToTopButton } from '../components/ScrollToTopButton';
import { Icon } from '../../../core/components/Icon';
import { CITATION_DATA, ANTI_SURVEILLANCE_PILLARS } from '../data/academicFoundationData';

export function AcademicFoundationPage() {
  const [citationFormat, setCitationFormat] = useState('apa7');
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
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
            <span className="breadcrumb-current">Fundamentación científica y origen</span>
          </nav>

          <article className="academic-article-shell">
            {/* HERO EDITORIAL */}
            <AcademicHeader handlePrint={handlePrint} />

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

            {/* CIERRE Y RETORNO */}
            <footer className="academic-article-footer no-print">
              <div className="footer-actions-left">
                <Link to="/" className="btn-return-primary">
                  <Icon name="arrowLeft" size={16} />
                  <span>Volver al inicio</span>
                </Link>
                <Link to="/login" className="btn-action-secondary">
                  <Icon name="lock" size={15} />
                  <span>Iniciar sesión</span>
                </Link>
              </div>
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
