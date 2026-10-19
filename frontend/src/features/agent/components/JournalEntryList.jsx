import { Icon } from '../../../core/components/Icon';

export function JournalEntryList({ handleNewEntry, journals, currentJournalId, handleSelectJournal }) {
  return (
    <section className="card agent-work-surface">
      <div
        className="card-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div className="card-title">Mis entradas</div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={handleNewEntry}>
          <Icon name="plus" size={14} />
          <span>Nueva entrada</span>
        </button>
      </div>

      <div id="journalsList" className="journal-sidebar-list">
        {journals.length === 0 ? (
          <div className="journal-empty-container">
            <div className="journal-empty-media">
              <img
                src="/assets/fotos/bpo-agent-journal-calm.jpg"
                alt="Operadora de Contact Center escribiendo tranquilamente en su libreta de notas"
                className="journal-empty-photo"
                loading="lazy"
              />
            </div>
            <div className="journal-empty-content">
              <h3 className="journal-empty-title">Tu refugio de descarga</h3>
              <p className="journal-empty-text">
                Procesa las llamadas difíciles, la sobrecarga o lo vivido en tu turno. Tus notas son personales y no se comparten con supervisión ni SST.
              </p>
            </div>
          </div>
        ) : (
          journals.map((item) => {
            const isSelected = item.id === currentJournalId;
            const preview = item.text.slice(0, 50);
            const ellipsis = item.text.length > 50 ? '…' : '';
            const badge = item.analysis ? 'Analizada' : 'Sin análisis';

            return (
              <button
                key={item.id}
                type="button"
                className={`btn btn-ghost journal-row ${isSelected ? 'active' : ''}`}
                onClick={() => handleSelectJournal(item)}
              >
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="journal-row-date">
                      <Icon name="calendar" size={13} />
                      <strong>{item.date}</strong>
                    </span>
                    <span className={`badge ${item.analysis ? 'badge-info' : 'badge-neutral'}`} style={{ fontSize: '10px' }}>
                      {badge}
                    </span>
                  </div>
                  <small style={{ color: 'var(--c-texto-suave)', display: 'block', margin: '4px 0' }}>
                    {preview}
                    {ellipsis}
                  </small>
                  {item.context && (
                    <span className="journal-row-context">
                      {item.context}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
