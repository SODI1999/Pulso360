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
            <span className="citation-type">Atribución del material de aula</span>
            <h2 id="sec-citacion-titulo" className="citation-card-title">
              Referencia del trabajo no publicado
            </h2>
          </div>
          <div className="citation-actions-group">
            <div className="citation-tabs" role="group" aria-label="Formato de referencia del material de aula">
              <button
                type="button"
                id="tab-format-apa"
                aria-controls="panel-citation-format"
                aria-pressed={citationFormat === 'apa7'}
                className={'tab-btn ' + (citationFormat === 'apa7' ? 'is-active' : '')}
                onClick={() => setCitationFormat('apa7')}
              >
                Estilo APA (7.ª ed.)
              </button>
              <button
                type="button"
                id="tab-format-bibtex"
                aria-controls="panel-citation-format"
                aria-pressed={citationFormat === 'bibtex'}
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
              aria-label="Copiar cita bibliográfica al portapapeles"
            >
              <Icon name={copied ? 'check' : 'copy'} size={15} />
              <span aria-live="polite">
                {copied ? 'Cita copiada' : copyFailed ? 'Reintentar copia' : 'Copiar cita'}
              </span>
            </button>
          </div>
        </div>
        <div
          className="citation-body-box"
          id="panel-citation-format"
          role="region"
          aria-labelledby={citationFormat === 'apa7' ? 'tab-format-apa' : 'tab-format-bibtex'}
        >
          {citationFormat === 'apa7' ? (
            <blockquote className="apa-citation-text">{CITATION_DATA.apa7}</blockquote>
          ) : (
            <pre className="bibtex-citation-code">
              <code>{CITATION_DATA.bibtex}</code>
            </pre>
          )}
        </div>
        {copyFailed && <p role="alert">No se pudo copiar la referencia. Puedes reintentar o seleccionar y copiar el texto que se muestra.</p>}
        <div className="citation-footer-row">
          <p className="citation-note">
            <Icon name="info" size={13} className="note-icon" />
            <span>{CITATION_DATA.academicNote}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
