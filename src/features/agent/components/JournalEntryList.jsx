import { Icon } from '../../../core/components/Icon';

export function JournalEntryList({ handleNewEntry, journals, currentJournalId, handleSelectJournal }) {
  return (
    <section className="card agent-work-surface">
      <div
        className="card-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div className="card-title">Mis entradas</div>
        <button type="button" className="btn btn-secondary" onClick={handleNewEntry}>
          <Icon name="edit_note" size={16} />
          <span>Nueva</span>
        </button>
      </div>

      <div id="journalsList" className="journal-sidebar-list">
        {journals.length === 0 ? (
          <p style={{ color: 'var(--c-texto-suave)', padding: '16px 0', textAlign: 'center' }}>
            Aún no has escrito entradas.
          </p>
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
                    <strong style={{ fontSize: '13px', color: 'var(--c-texto)' }}>{item.date}</strong>
                    <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                      {badge}
                    </span>
                  </div>
                  <small style={{ color: 'var(--c-texto-suave)', display: 'block', margin: '4px 0' }}>
                    {preview}
                    {ellipsis}
                  </small>
                  {item.context && (
                    <span style={{ fontSize: '11px', color: 'var(--c-texto-suave)' }}>{item.context}</span>
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
