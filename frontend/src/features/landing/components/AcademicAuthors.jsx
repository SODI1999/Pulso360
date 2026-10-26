import { Icon } from '../../../core/components/Icon';
import { AUTHORS_MATRIX } from '../data/academicFoundationData';

export function AcademicAuthors() {
  return (
    <section className="academic-authorship-showcase" id="autores" aria-label="Autoría interdisciplinaria">
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
    </section>
  );
}
