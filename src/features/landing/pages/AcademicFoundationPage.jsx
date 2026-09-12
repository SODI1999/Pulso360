// src/features/landing/pages/AcademicFoundationPage.jsx
// Pagina publica institucional: Fundamentación Cientifica, Evidencia Empírica y Transferencia Tecnologica

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Icon } from '../../../core/components/Icon';
import {
  FOUNDATION_META,
  AUTHORS_MATRIX,
  EMPIRICAL_DATA,
  TRANSFER_CARDS,
  CITATION_DATA,
  LEGAL_FRAMEWORK_DATA,
  ANTI_SURVEILLANCE_PILLARS,
} from '../data/academicFoundationData';

export function AcademicFoundationPage() {
  const [citationFormat, setCitationFormat] = useState('apa7');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleCopyCitation = async () => {
    const text = citationFormat === 'apa7' ? CITATION_DATA.apa7 : CITATION_DATA.bibtex;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className='landing-page-root academic-page-root'>
      <Navbar />

      <main className='academic-page-main' id='contenido-principal'>
        <div className='landing-container'>

          {/* Migas de Pan */}
          <nav className='academic-breadcrumb' aria-label='Migas de pan'>
            <Link to='/' className='breadcrumb-link'>
              <Icon name='arrowLeft' size={14} className='breadcrumb-icon' />
              <span>Volver al inicio</span>
            </Link>
            <span className='breadcrumb-separator' aria-hidden='true'>/</span>
            <span className='breadcrumb-current'>Fundamentación científica y origen</span>
          </nav>

          <article className='academic-article-shell'>

            {/* HERO EDITORIAL */}
            <header className='academic-hero-header'>
              <div className='academic-kicker-row'>
                <div className='kicker-badges-group'>
                  <span className='academic-kicker-badge'>
                    <Icon name='shieldCheck' size={13} />
                    <span>{FOUNDATION_META.badge}</span>
                  </span>
                  <span className='academic-meta-date'>
                    {FOUNDATION_META.kicker}
                  </span>
                </div>
                <button
                  type='button'
                  onClick={handlePrint}
                  className='btn-print-dossier no-print'
                  title='Imprimir o guardar ficha en PDF'
                  aria-label='Imprimir ficha metodologica'
                >
                  <Icon name='fileText' size={14} />
                  <span>Guardar / Imprimir Ficha</span>
                </button>
              </div>

              <h1 className='academic-hero-title'>
                {FOUNDATION_META.title}
              </h1>

              <p className='academic-hero-lead'>
                {FOUNDATION_META.lead}
              </p>

              {/* MATRIZ DE AUTORIA INTERDISCIPLINARIA */}
              <div className='academic-authorship-showcase' aria-label='Autoría interdisciplinaria'>
                {/* Trabajo Social */}
                <article className='authorship-card authorship-social'>
                  <div className='authorship-card-top'>
                    <div className='authorship-icon-wrap social-accent'>
                      <Icon name='users' size={20} />
                    </div>
                    <div className='authorship-meta-headings'>
                      <span className='authorship-kicker'>{AUTHORS_MATRIX.socialResearch.badge}</span>
                      <h2 className='authorship-faculty'>{AUTHORS_MATRIX.socialResearch.faculty}</h2>
                      <span className='authorship-inst'>{AUTHORS_MATRIX.socialResearch.institution}</span>
                    </div>
                  </div>
                  <div className='authorship-body'>
                    <div className='author-lead-item'>
                      <span className='author-role-label'>Asesoría & Docencia Líder:</span>
                      <p className='author-principal-name'>{AUTHORS_MATRIX.socialResearch.leadAuthor}</p>
                    </div>
                    <div className='author-coauthors-wrap'>
                      <span className='author-role-label'>Semillero de Investigación en Trabajo Social:</span>
                      <div className='coauthors-chips'>
                        {AUTHORS_MATRIX.socialResearch.coauthors.map((author) => (
                          <span key={author} className='coauthor-chip'>{author}</span>
                        ))}
                      </div>
                    </div>
                    <div className='authorship-footer-note'>
                      <span className='note-dot' aria-hidden='true'>•</span>
                      <p className='note-text'>{AUTHORS_MATRIX.socialResearch.focus}</p>
                    </div>
                  </div>
                </article>

                {/* Divisor Interdisciplinario */}
                <div className='authorship-divider' aria-hidden='true'>
                  <div className='divider-line'></div>
                  <span className='divider-chip'>Transferencia Metodológica</span>
                  <div className='divider-line'></div>
                </div>

                {/* Ingeniería de Software */}
                <article className='authorship-card authorship-tech'>
                  <div className='authorship-card-top'>
                    <div className='authorship-icon-wrap tech-accent'>
                      <Icon name='fileShield' size={20} />
                    </div>
                    <div className='authorship-meta-headings'>
                      <span className='authorship-kicker'>{AUTHORS_MATRIX.softwareEngineering.badge}</span>
                      <h2 className='authorship-faculty'>{AUTHORS_MATRIX.softwareEngineering.faculty}</h2>
                      <span className='authorship-inst'>{AUTHORS_MATRIX.softwareEngineering.institution}</span>
                    </div>
                  </div>
                  <div className='authorship-body'>
                    <div className='author-lead-item'>
                      <span className='author-role-label'>Arquitectura & Desarrollo de Software:</span>
                      <p className='author-principal-name'>{AUTHORS_MATRIX.softwareEngineering.leadAuthor}</p>
                    </div>
                    <div className='author-coauthors-wrap'>
                      <span className='author-role-label'>Equipo de Desarrollo:</span>
                      <div className='coauthors-chips'>
                        {AUTHORS_MATRIX.softwareEngineering.coauthors.map((dev) => (
                          <span key={dev} className='coauthor-chip tech-chip'>{dev}</span>
                        ))}
                      </div>
                    </div>
                    <div className='authorship-footer-note'>
                      <span className='note-dot' aria-hidden='true'>•</span>
                      <p className='note-text'>{AUTHORS_MATRIX.softwareEngineering.focus}</p>
                    </div>
                  </div>
                </article>
              </div>
            </header>

            {/* SECCION 1: EVIDENCIA EMPIRICA */}
            <section className='academic-editorial-section' aria-labelledby='sec-evidencia-titulo'>
              <div className='section-title-wrap'>
                <span className='section-tag'>Evidencia Empírica de Campo</span>
                <h2 id='sec-evidencia-titulo'>Radiografía del agotamiento en centros de contacto locales</h2>
              </div>
              <p className='section-prose'>
                {EMPIRICAL_DATA.sampleContext} La evaluación aplico instrumentos psicométricos validados internacionalmente:
              </p>
              <div className='instruments-row'>
                {EMPIRICAL_DATA.instruments.map((inst) => (
                  <div key={inst.acronym} className='instrument-pill'>
                    <span className='inst-acronym'>{inst.acronym}</span>
                    <div className='inst-info'>
                      <strong className='inst-name'>{inst.name}</strong>
                      <p className='inst-desc'>{inst.purpose}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className='empirical-dossier-grid'>
                {/* Tarjeta Principal */}
                <div className='empirical-dossier-main'>
                  <div className='dossier-stat-header'>
                    <span className='dossier-tag'>Prevalencia Global Diagnosticada</span>
                    <div className='dossier-big-number'>
                      <span className='number-val'>{EMPIRICAL_DATA.mainMetric.percentage}</span>
                      <span className='number-label'>{EMPIRICAL_DATA.mainMetric.label}</span>
                    </div>
                  </div>
                  <div className='distribution-visual-container'>
                    <div className='distribution-bar-track' role='progressbar' aria-label='Distribución de niveles de fatiga emocional' aria-valuenow='84.3'>
                      {EMPIRICAL_DATA.distribution.map((dist) => (
                        <div
                          key={dist.level}
                          className={'dist-segment ' + dist.toneClass}
                          style={{ width: dist.percentage + '%' }}
                          title={dist.level + ': ' + dist.percentage + '%'}
                        >
                          <span className='dist-bar-text'>{dist.percentage + '%'}</span>
                        </div>
                      ))}
                    </div>
                    <div className='distribution-legend-grid'>
                      {EMPIRICAL_DATA.distribution.map((dist) => (
                        <div key={dist.level} className='legend-item'>
                          <span className={'legend-dot ' + dist.toneClass} aria-hidden='true'></span>
                          <div className='legend-content'>
                            <strong className='legend-title'>{dist.label}</strong>
                            <p className='legend-sub'>{dist.summary}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className='dossier-context'>
                    {EMPIRICAL_DATA.mainMetric.description}
                  </p>
                </div>
                {/* Tarjetas Laterales */}
                <div className='empirical-dossier-aside'>
                  {EMPIRICAL_DATA.secondaryMetrics.map((sec) => (
                    <div
                      key={sec.id}
                      className={'dossier-aside-card ' + (sec.id === 'protective' ? 'aside-protective-card' : '')}
                    >
                      <div className='aside-card-header'>
                        <span className='aside-tag'>{sec.tag}</span>
                        <span className='aside-metric'>{sec.value}</span>
                      </div>
                      <h3 className='aside-title'>{sec.title}</h3>
                      <p className='aside-desc'>{sec.description}</p>
                      {sec.operationalMeaning && (
                        <div className='aside-highlight-box'>
                          <Icon name='info' size={14} className='highlight-icon' />
                          <span><strong>Traducción Operativa:</strong> {sec.operationalMeaning}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* SECCION 2: MATRIZ DE TRANSFERENCIA METODOLOGICA */}
            <section className='academic-editorial-section' aria-labelledby='sec-transferencia-titulo'>
              <div className='section-title-wrap'>
                <span className='section-tag'>Transferencia Metodológica</span>
                <h2 id='sec-transferencia-titulo'>De la problemática social a los requerimientos de software</h2>
              </div>
              <p className='section-prose'>
                Pulso360 no pretendio digitalizar un formulario pasivo, sino responder a las fricciones reales del piso de operacion de los centros de contacto:
              </p>
              <div className='transfer-cards-grid'>
                {TRANSFER_CARDS.map((card) => (
                  <article key={card.id} className='transfer-flow-card'>
                    <div className='card-top-bar'>
                      <div className='card-badge-row'>
                        <span className='card-step-number'>{'Eje ' + card.number}</span>
                        <span className='card-feature-badge'>{card.featureBadge}</span>
                      </div>
                      <h3 className='card-flow-title'>{card.title}</h3>
                    </div>
                    <div className='flow-steps-stack'>
                      <div className='flow-step step-social'>
                        <div className='step-indicator-col'>
                          <span className='step-dot dot-social' aria-hidden='true'></span>
                          <span className='step-line' aria-hidden='true'></span>
                        </div>
                        <div className='step-text-wrap'>
                          <span className='step-label'>Diagnostico Social (TdeA)</span>
                          <p>{card.socialProblem}</p>
                        </div>
                      </div>
                      <div className='flow-step step-bpo'>
                        <div className='step-indicator-col'>
                          <span className='step-dot dot-bpo' aria-hidden='true'></span>
                          <span className='step-line' aria-hidden='true'></span>
                        </div>
                        <div className='step-text-wrap'>
                          <span className='step-label'>Friccion en Call Center</span>
                          <p>{card.bpoBarrier}</p>
                        </div>
                      </div>
                      <div className='flow-step step-solution'>
                        <div className='step-indicator-col'>
                          <span className='step-dot dot-solution' aria-hidden='true'></span>
                        </div>
                        <div className='step-text-wrap'>
                          <span className='step-label solution-label'>
                            <Icon name='checkCircle' size={13} />
                            <span>Solucion en Pulso360</span>
                          </span>
                          <p>{card.pulsoSolution}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* SECCION 3: GARANTIAS ETICAS & NO-VIGILANCIA */}
            <section className='academic-editorial-section anti-surveillance-section' aria-labelledby='sec-privacidad-titulo'>
              <div className='anti-surveillance-card'>
                <div className='anti-surveillance-header'>
                  <div className='shield-icon-badge'>
                    <Icon name='shieldCheck' size={24} />
                  </div>
                  <div className='anti-surveillance-titles'>
                    <span className='section-tag-light'>Seguridad Psicológica Garantizada</span>
                    <h2 id='sec-privacidad-titulo' className='anti-surveillance-heading'>Garantía Anti-Vigilancia Punitiva</h2>
                    <p className='anti-surveillance-sub'>
                      El bienestar laboral nunca debe convertirse en un mecanismo de vigilancia, control disciplinario ni persecución. Pulso360 incorpora salvaguardas arquitectónicas inquebrantables por diseño:
                    </p>
                  </div>
                </div>
                <div className='surveillance-pillars-grid'>
                  {ANTI_SURVEILLANCE_PILLARS.map((pillar) => (
                    <div key={pillar.title} className='pillar-item'>
                      <div className='pillar-icon-box'>
                        <Icon name={pillar.icon} size={16} />
                      </div>
                      <div className='pillar-content'>
                        <strong className='pillar-title'>{pillar.title}</strong>
                        <p className='pillar-desc'>{pillar.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* SECCION 4: CITACION ACADEMICA FORMAL */}
            <section className='academic-editorial-section citation-section' aria-labelledby='sec-citacion-titulo'>
              <div className='citation-card'>
                <div className='citation-top-row'>
                  <div>
                    <span className='citation-type'>Citación Formal de la Investigación Base</span>
                    <h2 id='sec-citacion-titulo' className='citation-card-title'>Referencia Académica Oficial</h2>
                  </div>
                  <div className='citation-actions-group'>
                    <div className='citation-tabs' role='tablist' aria-label='Formato de citacion academica'>
                      <button
                        type='button'
                        role='tab'
                        aria-selected={citationFormat === 'apa7'}
                        className={'tab-btn ' + (citationFormat === 'apa7' ? 'is-active' : '')}
                        onClick={() => setCitationFormat('apa7')}
                      >
                        Normas APA (7.ª ed.)
                      </button>
                      <button
                        type='button'
                        role='tab'
                        aria-selected={citationFormat === 'bibtex'}
                        className={'tab-btn ' + (citationFormat === 'bibtex' ? 'is-active' : '')}
                        onClick={() => setCitationFormat('bibtex')}
                      >
                        BibTeX
                      </button>
                    </div>
                    <button
                      type='button'
                      className={'btn-copy-citation ' + (copied ? 'is-copied' : '')}
                      onClick={handleCopyCitation}
                      aria-label='Copiar referencia bibliográfica al portapapeles'
                    >
                      <Icon name={copied ? 'check' : 'copy'} size={15} />
                      <span aria-live='polite'>{copied ? '¡Cita copiada!' : 'Copiar cita'}</span>
                    </button>
                  </div>
                </div>
                <div className='citation-body-box'>
                  {citationFormat === 'apa7' ? (
                    <blockquote className='apa-citation-text'>
                      {CITATION_DATA.apa7}
                    </blockquote>
                  ) : (
                    <pre className='bibtex-citation-code'>
                      <code>{CITATION_DATA.bibtex}</code>
                    </pre>
                  )}
                </div>
                <p className='citation-note'>
                  <Icon name='info' size={13} className='note-icon' />
                  <span>{CITATION_DATA.academicNote}</span>
                </p>
              </div>
            </section>

            {/* SECCION 5: MARCO JURIDICO COLOMBIANO */}
            <section className='academic-editorial-section legal-framework-section' aria-labelledby='sec-legal-titulo'>
              <div className='section-title-wrap'>
                <span className='section-tag'>Marco Normativo Colombiano</span>
                <h2 id='sec-legal-titulo'>Deslinde de Responsabilidad & Blindaje Legal Integral</h2>
              </div>
              <p className='section-prose'>
                Pulso360 esta articulado bajo el ordenamiento jurídico colombiano en materia laboral, derechos de autor, reserva médica ocupacional y protección estricta de datos personales:
              </p>
              <div className='legal-dossier-shell'>
                {LEGAL_FRAMEWORK_DATA.map((item) => {
                  let themeClass = 'theme-sst';
                  if (item.tag === 'Derechos Morales') themeClass = 'theme-copyright';
                  else if (item.tag === 'Datos Sensibles') themeClass = 'theme-privacy';
                  else if (item.tag === 'Desconexión Laboral' || item.tag === 'Desconexion Laboral') themeClass = 'theme-disconnection';
                  else if (item.tag === 'SG-SST') themeClass = 'theme-sgsst';

                  return (
                    <article key={item.code} className={'legal-dossier-row ' + themeClass}>
                      <div className='legal-row-meta'>
                        <span className='legal-tag-badge'>{item.tag}</span>
                        <strong className='legal-code-pill'>{item.code}</strong>
                      </div>
                      <div className='legal-row-content'>
                        <h3 className='legal-item-title'>{item.title}</h3>
                        <p className='legal-item-body'>{item.body}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* CIERRE Y RETORNO */}
            <footer className='academic-article-footer no-print'>
              <div className='footer-actions-left'>
                <Link to='/' className='btn-return-primary'>
                  <Icon name='arrowLeft' size={16} />
                  <span>Volver a la plataforma</span>
                </Link>
                <Link to='/login' className='btn-action-secondary'>
                  <Icon name='lock' size={15} />
                  <span>Acceso a la plataforma</span>
                </Link>
              </div>

            </footer>

          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
