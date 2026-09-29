import { Icon } from '../../../core/components/Icon';
import { FOUNDATION_META, AUTHORS_MATRIX } from '../data/academicFoundationData';

export function AcademicHeader({ handlePrint }) {
  return (
    <header className="academic-hero-header">
      <div className="academic-kicker-row">
        <div className="kicker-badges-group">
          <span className="academic-editorial-kicker">{FOUNDATION_META.badge}</span>
          <span className="kicker-separator" aria-hidden="true">
            ·
          </span>
          <span className="academic-meta-date">{FOUNDATION_META.kicker}</span>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="btn-print-dossier no-print"
          title="Imprimir o guardar ficha en PDF"
          aria-label="Imprimir ficha metodológica"
        >
          <Icon name="fileText" size={14} />
          <span>Guardar / Imprimir Ficha</span>
        </button>
      </div>

      <h1 className="academic-hero-title">{FOUNDATION_META.title}</h1>

      <p className="academic-hero-lead">{FOUNDATION_META.lead}</p>

      {/* ÍNDICE EDITORIAL DE SECCIONES (JUMP LINKS / TOC ACCESIBLE A15) */}
      <nav className="academic-toc-strip" aria-label="Índice temático del dossier">
        <div className="toc-header-label">
          <Icon name="bookmark" size={14} />
          <span>Secciones del documento:</span>
        </div>
        <div className="toc-links-row">
          <a href="#autores" className="toc-pill-link">
            <Icon name="users" size={13} />
            <span>Equipo</span>
          </a>
          <a href="#evidencia-empirica" className="toc-pill-link">
            <Icon name="insights" size={13} />
            <span>1. Evidencia</span>
          </a>
          <a href="#transferencia" className="toc-pill-link">
            <Icon name="fileShield" size={13} />
            <span>2. Transferencia</span>
          </a>
          <a href="#antivigilancia" className="toc-pill-link">
            <Icon name="shieldCheck" size={13} />
            <span>3. Principios de diseño</span>
          </a>
          <a href="#citacion" className="toc-pill-link">
            <Icon name="fileText" size={13} />
            <span>4. Citación</span>
          </a>
          <a href="#marco-legal" className="toc-pill-link">
            <Icon name="lock" size={13} />
            <span>5. Marco Legal</span>
          </a>
        </div>
      </nav>

      {/* MATRIZ DE AUTORIA INTERDISCIPLINARIA */}
      <div className="academic-authorship-showcase" id="autores" aria-label="Autoría interdisciplinaria">
        {/* Trabajo Social */}
        <article className="authorship-card authorship-social">
          <div className="authorship-card-top">
            <div className="authorship-icon-wrap social-accent">
              <Icon name="users" size={20} />
            </div>
            <div className="authorship-meta-headings">
              <span className="authorship-kicker">{AUTHORS_MATRIX.socialResearch.badge}</span>
              <h2 className="authorship-faculty">{AUTHORS_MATRIX.socialResearch.faculty}</h2>
              <span className="authorship-inst">{AUTHORS_MATRIX.socialResearch.institution}</span>
            </div>
          </div>
          <div className="authorship-body">
            <div className="author-lead-item">
              <span className="author-role-label">Asesoría & Docencia Líder:</span>
              <p className="author-principal-name">{AUTHORS_MATRIX.socialResearch.leadAuthor}</p>
            </div>
            <div className="author-coauthors-wrap">
              <span className="author-role-label">Semillero de Investigación en Trabajo Social:</span>
              <div className="coauthors-chips">
                {AUTHORS_MATRIX.socialResearch.coauthors.map((author) => (
                  <span key={author} className="coauthor-chip">
                    {author}
                  </span>
                ))}
              </div>
            </div>
            <div className="authorship-footer-note">
              <span className="note-dot" aria-hidden="true">
                •
              </span>
              <p className="note-text">{AUTHORS_MATRIX.socialResearch.focus}</p>
            </div>
          </div>
        </article>

        {/* Ingeniería de Software */}
        <article className="authorship-card authorship-tech">
          <div className="authorship-card-top">
            <div className="authorship-icon-wrap tech-accent">
              <Icon name="fileShield" size={20} />
            </div>
            <div className="authorship-meta-headings">
              <span className="authorship-kicker">{AUTHORS_MATRIX.softwareEngineering.badge}</span>
              <h2 className="authorship-faculty">{AUTHORS_MATRIX.softwareEngineering.faculty}</h2>
              <span className="authorship-inst">{AUTHORS_MATRIX.softwareEngineering.institution}</span>
            </div>
          </div>
          <div className="authorship-body">
            <div className="author-lead-item">
              <span className="author-role-label">{AUTHORS_MATRIX.softwareEngineering.leadAuthorRole}:</span>
              <p className="author-principal-name">{AUTHORS_MATRIX.softwareEngineering.leadAuthor}</p>
            </div>
            <div className="author-coauthors-wrap">
              <span className="author-role-label">Naturaleza Jurídica & Adscripción:</span>
              <div className="coauthors-chips">
                {AUTHORS_MATRIX.softwareEngineering.coauthors.map((dev) => (
                  <span key={dev} className="coauthor-chip tech-chip">
                    {dev}
                  </span>
                ))}
              </div>
            </div>
            <div className="authorship-footer-note">
              <span className="note-dot" aria-hidden="true">
                •
              </span>
              <p className="note-text">{AUTHORS_MATRIX.softwareEngineering.focus}</p>
            </div>
          </div>
        </article>
      </div>
    </header>
  );
}
