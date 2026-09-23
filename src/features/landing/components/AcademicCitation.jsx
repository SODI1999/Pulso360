import { Icon } from '../../../core/components/Icon';
import { CITATION_DATA } from '../data/academicFoundationData';

export function AcademicCitation({
  citationFormat,
  setCitationFormat,
  copied,
  handleCopyCitation,
  copyFailed
}) {
  return (
    <section
      className="academic-editorial-section citation-section"
      id="citacion"
      aria-labelledby="sec-citacion-titulo"
    >
      <div className="citation-card">
        <div className="citation-top-row">
          <div>
            <span className="citation-type">Citación Formal de la Investigación Base</span>
            <h2 id="sec-citacion-titulo" className="citation-card-title">
              Referencia Académica Oficial
            </h2>
          </div>
          <div className="citation-actions-group">
            <div className="citation-tabs" role="tablist" aria-label="Formato de citación académica">
              <button
                type="button"
                role="tab"
                aria-selected={citationFormat === 'apa7'}
                className={'tab-btn ' + (citationFormat === 'apa7' ? 'is-active' : '')}
                onClick={() => setCitationFormat('apa7')}
              >
                Normas APA (7.ª ed.)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={citationFormat === 'bibtex'}
                className={'tab-btn ' + (citationFormat === 'bibtex' ? 'is-active' : '')}
                onClick={() => setCitationFormat('bibtex')}
              >
                BibTeX
              </button>
            </div>
            <button
              type="button"
              className={'btn-copy-citation ' + (copied ? 'is-copied' : '')}
              onClick={handleCopyCitation}
              aria-label="Copiar referencia bibliográfica al portapapeles"
            >
              <Icon name={copied ? 'check' : 'copy'} size={15} />
              <span aria-live="polite">
                {copied ? '¡Cita copiada!' : copyFailed ? 'No se pudo copiar' : 'Copiar cita'}
              </span>
            </button>
          </div>
        </div>
        <div className="citation-body-box">
          {citationFormat === 'apa7' ? (
            <blockquote className="apa-citation-text">{CITATION_DATA.apa7}</blockquote>
          ) : (
            <pre className="bibtex-citation-code">
              <code>{CITATION_DATA.bibtex}</code>
            </pre>
          )}
        </div>
        <p className="citation-note">
          <Icon name="info" size={13} className="note-icon" />
          <span>{CITATION_DATA.academicNote}</span>
        </p>
      </div>
    </section>
  );
}
