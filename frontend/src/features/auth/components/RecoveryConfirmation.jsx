import { Icon } from '../../../core/components/Icon';

export function RecoveryConfirmation({ dispatchedData, navigate, setDispatchedData, setRecoveryEmail }) {
  return (
    <div className="recovery-dispatched-card">
      <div className="dispatched-pill-status">
        <Icon name="checkCircle" size={15} />
        <span>Correo enviado correctamente</span>
      </div>

      {dispatchedData.devLink && (
        <div className="sandbox-eval-callout">
          <div className="sandbox-eval-header">
            <Icon name="fileText" size={14} />
            <strong>Simulación de Servicio SMTP (Sandbox)</strong>
          </div>
          <p className="sandbox-eval-text">
            En un servicio de correo conectado, este enlace se enviaría al correo corporativo. Para esta
            evaluación académica, puedes abrirlo directamente:
          </p>
          <div className="sandbox-token-badge">
            <code>Token: {dispatchedData.devToken}</code>
            <span>Caduca en {dispatchedData.expiresInMinutes || 30} min</span>
          </div>
          <button
            type="button"
            className="btn-proceed-reset"
            onClick={() => navigate(`/nueva-clave?token=${dispatchedData.devToken || ''}`)}
          >
            <span>Continuar restablecimiento (Modo Demo)</span>
          </button>
        </div>
      )}

      <div className="dispatched-footer-actions">
        <button
          type="button"
          className="btn-retry-other"
          onClick={() => {
            setDispatchedData(null);
            setRecoveryEmail('');
          }}
        >
          Usar otro correo
        </button>
      </div>
    </div>
  );
}
