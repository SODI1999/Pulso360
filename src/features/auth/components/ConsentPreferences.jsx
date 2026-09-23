import { CONSENT_PURPOSES } from '../data/consentData';
import { Icon } from '../../../core/components/Icon';

export function ConsentPreferences({
  handleSubmit,
  consents,
  handleCheckboxChange,
  policyAccepted,
  setPolicyAccepted,
  openModal,
  activeCount,
  activeCodes,
  isSaving,
  statusMessage
}) {
  return (
    <section className="consent-settings-section" aria-labelledby="purposes-heading">
      <div className="consent-section-intro">
        <h2 id="purposes-heading" className="consent-section-heading">
          Finalidades de tratamiento
        </h2>
        <p className="consent-section-caption">
          Activa o desactiva cada funcionalidad de manera independiente según tu criterio personal.
        </p>
      </div>

      <form id="consentForm" onSubmit={handleSubmit}>
        <div className="consent-purposes-flow" role="group" aria-label="Finalidades del consentimiento">
          {CONSENT_PURPOSES.map((item) => {
            const isChecked = consents[item.key];
            return (
              <div key={item.key} className="consent-purpose-row">
                <div className="consent-purpose-info">
                  <div className="consent-purpose-header-line">
                    <span className="consent-code-tag">{item.code}</span>
                    <h3 id={`title-${item.key}`} className="consent-purpose-heading">
                      {item.title}
                    </h3>
                  </div>
                  <p id={`desc-${item.key}`} className="consent-purpose-description">
                    {item.desc}
                  </p>
                  <p id={`cons-${item.key}`} className="consent-purpose-consequence">
                    <strong className="consent-consequence-prefix">Al pausar:</strong> {item.consequence}
                  </p>
                </div>

                <div className="consent-purpose-action">
                  <button
                    type="button"
                    role="switch"
                    id={`switch-${item.key}`}
                    aria-checked={isChecked}
                    aria-labelledby={`title-${item.key}`}
                    aria-describedby={`desc-${item.key} cons-${item.key}`}
                    className={`editorial-switch ${isChecked ? 'is-active' : ''}`}
                    onClick={() => handleCheckboxChange(item.key)}
                  >
                    <span className="editorial-switch-track">
                      <span className="editorial-switch-thumb" />
                    </span>
                    <span className="editorial-switch-text">
                      {isChecked ? item.activeLabel : item.inactiveLabel}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bloque de confirmación y balance sereno */}
        <div className="consent-footer-flow">
          <div className="consent-terms-block">
            <label className="consent-terms-label" htmlFor="policyAccepted">
              <input
                type="checkbox"
                id="policyAccepted"
                className="consent-terms-input"
                checked={policyAccepted}
                onChange={(e) => setPolicyAccepted(e.target.checked)}
              />
              <span className="consent-terms-caption">
                He leído y comprendo las{' '}
                <button
                  type="button"
                  className="consent-terms-inline-link"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openModal();
                  }}
                >
                  condiciones de la política de tratamiento y garantías de privacidad
                </button>{' '}
                de Pulso360.
              </span>
            </label>
          </div>

          {/* Balance textual sereno sin cajas flotantes */}
          <div className="consent-balance-text" role="status" aria-live="polite">
            <p className="consent-balance-stat">
              <strong>Balance:</strong> {activeCount} de 5 finalidades autorizadas.
            </p>
            <p className="consent-balance-sub">
              {activeCount === 0
                ? 'No has autorizado finalidades opcionales. El sistema operará bajo mínima recolección de datos.'
                : `Permisos activos: ${activeCodes.join(', ')}. Puedes modificar o revocar estas autorizaciones en cualquier momento.`}
            </p>
          </div>

          {/* Botón de guardado proporcional */}
          <div className="consent-submit-bar">
            <button
              type="submit"
              className="btn btn-primary consent-save-button"
              disabled={!policyAccepted || isSaving}
            >
              {isSaving ? (
                <>
                  <Icon name="sync" size={16} className="consent-saving-icon" />
                  <span>Guardando preferencias...</span>
                </>
              ) : (
                <span>Confirmar y guardar preferencias</span>
              )}
            </button>
          </div>

          {/* Notificación de guardado */}
          {statusMessage && (
            <div role="status" aria-live="polite" className="consent-feedback-toast">
              <Icon name="checkCircle" size={16} />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>
      </form>
    </section>
  );
}
