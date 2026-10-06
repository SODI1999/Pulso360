import { useState } from 'react';
import { useExpiredFormDraft } from '../../../core/auth/useExpiredFormDraft';
import { Icon } from '../../../core/components/Icon';
import { env } from '../../../core/config/env';

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
  const [policyTitle,setPolicyTitle] = useState('');
  const [policyText,setPolicyText] = useState('');
  const [noticeText,setNoticeText] = useState('');
  useExpiredFormDraft('policy:publication', { policyTitle, policyText, noticeText, newPolicyVersion, newNlpVersion }, draft => {
    setPolicyTitle(draft.policyTitle); setPolicyText(draft.policyText); setNoticeText(draft.noticeText);
    setNewPolicyVersion(draft.newPolicyVersion); setNewNlpVersion(draft.newNlpVersion);
  });
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
          {!env.useMockStorage && <>
            <label className="form-label" htmlFor="policyTitle">Título de la política</label>
            <input id="policyTitle" name="policyTitle" value={policyTitle} onChange={e=>setPolicyTitle(e.target.value)} className="form-input" required />
            <label className="form-label" htmlFor="policyText">Texto de la política</label>
            <textarea id="policyText" name="policyText" value={policyText} onChange={e=>setPolicyText(e.target.value)} className="form-textarea" required rows={5} />
            <label className="form-label" htmlFor="noticeText">Aviso de privacidad</label>
            <textarea id="noticeText" name="noticeText" value={noticeText} onChange={e=>setNoticeText(e.target.value)} className="form-textarea" required rows={3} />
          </>}
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
          <div className={`alert-banner ${policyFeedback.startsWith("Error") ? "danger" : "ok"}`} role={policyFeedback.startsWith("Error") ? "alert" : "status"} style={{ marginTop: 'var(--space-3)' }}>
            <Icon name={policyFeedback.startsWith("Error") ? "alertTriangle" : "checkCircle"} size={16} />
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
              Diccionarios registrados del motor léxico determinista.
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
            {!env.useMockStorage ? <select className="form-select" aria-label="Versión de léxico registrada"
              required value={newNlpVersion} onChange={e => setNewNlpVersion(e.target.value)}>
              <option value="">Selecciona una versión registrada</option>
              {(settings.lexiconCatalog || []).map(v => <option key={v.id} value={v.id} disabled={!v.has_content}>{v.version}{!v.has_content ? ' · sin diccionario' : ''}</option>)}
            </select> : <input
              type="text"
              className="form-input"
              placeholder="Ej. lexico-v1.3"
              value={newNlpVersion}
              onChange={(e) => setNewNlpVersion(e.target.value)}
              style={{ maxWidth: '160px' }}
            />}
            <button type="submit" className="btn btn-primary btn-sm">
              <span>Activar léxico</span>
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleRevertNlp}>
              <span>Revertir</span>
            </button>
          </div>
        </form>

        {nlpFeedback && (
          <div className={`alert-banner ${nlpFeedback.startsWith("Error") ? "danger" : "ok"}`} role={nlpFeedback.startsWith("Error") ? "alert" : "status"} style={{ marginTop: 'var(--space-3)' }}>
            <Icon name={nlpFeedback.startsWith("Error") ? "alertTriangle" : "checkCircle"} size={16} />
            <span>{nlpFeedback}</span>
          </div>
        )}
      </div>
    </div>
  );
}
