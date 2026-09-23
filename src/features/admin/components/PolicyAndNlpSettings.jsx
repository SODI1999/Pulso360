import { Icon } from '../../../core/components/Icon';

export function PolicyAndNlpSettings({
  settings,
  handlePublishPolicy,
  newPolicyVersion,
  setNewPolicyVersion,
  policyFeedback,
  handleActivateNlp,
  newNlpVersion,
  setNewNlpVersion,
  handleRevertNlp,
  nlpFeedback
}) {
  return (
    <div className="params-grid-2" style={{ marginBottom: 'var(--space-6)' }}>
      {/* Políticas de Tratamiento */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Versiones de Política de Privacidad</h2>
            <div className="card-subtitle">
              Publicación de términos y re-consentimiento obligatorio (RF-15).
            </div>
          </div>
        </div>

        <div className="version-badges-list">
          {(settings.policyVersions || [settings.policyVersion]).map((v) => {
            const isCurrent = v === settings.policyVersion;
            return (
              <span key={v} className={`badge ${isCurrent ? 'badge-ok' : 'badge-neutral'}`}>
                {isCurrent ? `${v} · Vigente` : v}
              </span>
            );
          })}
        </div>

        <form onSubmit={handlePublishPolicy}>
          <div className="version-input-group">
            <input
              type="text"
              className="form-input"
              placeholder="Ej. v2.5"
              value={newPolicyVersion}
              onChange={(e) => setNewPolicyVersion(e.target.value)}
              style={{ maxWidth: '140px' }}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <Icon name="policy" size={14} />
              <span>Publicar versión</span>
            </button>
          </div>
        </form>

        {policyFeedback && (
          <div className="alert-banner ok" role="status" style={{ marginTop: 'var(--space-3)' }}>
            <Icon name="checkCircle" size={16} />
            <span>{policyFeedback}</span>
          </div>
        )}
      </div>

      {/* Modelos de Léxico NLP */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Versiones de Léxico NLP</h2>
            <div className="card-subtitle">
              Control de modelos de análisis semántico para bitácoras (RF-15).
            </div>
          </div>
        </div>

        <div className="version-badges-list">
          {(settings.nlpVersions || [settings.nlpVersion]).map((v) => {
            const isCurrent = v === settings.nlpVersion;
            return (
              <span key={v} className={`badge ${isCurrent ? 'badge-ok' : 'badge-neutral'}`}>
                {isCurrent ? `${v} · Activo` : v}
              </span>
            );
          })}
        </div>

        <form onSubmit={handleActivateNlp}>
          <div className="version-input-group">
            <input
              type="text"
              className="form-input"
              placeholder="Ej. lexico-v1.3"
              value={newNlpVersion}
              onChange={(e) => setNewNlpVersion(e.target.value)}
              style={{ maxWidth: '160px' }}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <span>Activar modelo</span>
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleRevertNlp}>
              <span>Revertir</span>
            </button>
          </div>
        </form>

        {nlpFeedback && (
          <div className="alert-banner ok" role="status" style={{ marginTop: 'var(--space-3)' }}>
            <Icon name="checkCircle" size={16} />
            <span>{nlpFeedback}</span>
          </div>
        )}
      </div>
    </div>
  );
}
