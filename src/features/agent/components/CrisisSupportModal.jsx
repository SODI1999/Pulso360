import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../core/components/Icon';
import { useAgentModalAccessibility } from '../hooks/useAgentModalAccessibility';

export function CrisisSupportModal({
  isOpen,
  priorityStep,
  onSetPriorityStep,
  crisisMode,
  onChangeCrisisMode,
  hasC5Consent,
  onConfirmPriority,
  onContinue,
  onClose
}) {
  const dialogRef = useRef(null);
  useAgentModalAccessibility({ isOpen, onClose, dialogRef });

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay active"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crisis-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={dialogRef} className="modal-box agent-modal">
        {!priorityStep ? (
          <div>
            <div className="modal-header">
              <div>
                <span className="agent-kicker">Cuidado Psicosocial Voluntario</span>
                <h2 id="crisis-modal-title" className="modal-title">
                  Estás a tiempo de pedir ayuda y apoyo
                </h2>
                <p className="modal-subtitle">
                  Lo que registraste sugiere que podrías estar experimentando una sobrecarga intensa o un
                  momento difícil. Pulso360 no es un servicio de salud y nada se compartirá sin tu decisión
                  explícita.
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={onClose}
                aria-label="Cerrar ventana de apoyo"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {/* Aviso explícito de privacidad para desactivar el pánico */}
            <div className="agent-notice">
              <Icon name="shieldCheck" size={22} className="agent-notice-icon" />
              <div className="agent-notice-text">
                <strong>Tranquilo/a:</strong> Esta sugerencia fue generada por coincidencias léxicas dentro de
                tu propio navegador. Ningún supervisor, directivo ni compañero ha recibido alerta alguna. Tú
                decides en total privacidad si deseas cerrar esta ventana o solicitar apoyo.
              </div>
            </div>

            {/* Enlaces rápidos a Línea 106 y canal prioritario SST */}
            <div className="agent-modal-quick">
              <div className="agent-modal-quick-label">Accesos rápidos de contención inmediata</div>
              <div className="agent-modal-quick-actions">
                <a
                  href="tel:106"
                  className="btn-clinical-support"
                  aria-label="Llamar directamente a la Línea 106 de salud mental"
                >
                  <Icon name="phone" size={16} />
                  <span>Llamar a Línea 106 (Gratis 24/7)</span>
                </a>
                <button type="button" className="btn btn-primary" onClick={() => onSetPriorityStep(true)}>
                  <Icon name="shield" size={16} />
                  <span>Solicitar contacto SST</span>
                </button>
              </div>
            </div>

            <div className="modal-footer modal-footer--split">
              <Link to="/apoyo-crisis" className="btn btn-secondary" onClick={onClose}>
                <Icon name="self_improvement" size={16} />
                <span>Ver primeros auxilios psicológicos y rutas</span>
              </Link>
              <button type="button" className="btn btn-ghost" onClick={onContinue}>
                Cerrar y continuar
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="modal-header">
              <div>
                <span className="agent-kicker agent-kicker--primario">Canal Reservado con SST</span>
                <h2 id="crisis-modal-title" className="modal-title">
                  Contacto prioritario con SST
                </h2>
                <p className="modal-subtitle">
                  Elige la modalidad para la atención de tu caso. Ningún texto de tu bitácora será enviado ni
                  compartido con supervisión.
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={onClose}
                aria-label="Cerrar ventana de apoyo"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {!hasC5Consent ? (
              <div className="alert-banner warn">
                <Icon name="info" size={18} />
                <div>
                  <strong>Finalidad C5 requerida:</strong> Debes activar la finalidad{' '}
                  <em>C5 (Acompañamiento)</em> en tus preferencias para solicitar contacto con SST.
                  <div style={{ marginTop: '10px' }}>
                    <Link to="/consentimiento" className="btn btn-primary" style={{ fontSize: '12.5px' }}>
                      Gestionar consentimiento
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="support-mode-list">
                <label className={`support-mode-capsule ${crisisMode === 'anonimo' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="crisisMode"
                    value="anonimo"
                    className="support-mode-radio"
                    checked={crisisMode === 'anonimo'}
                    onChange={() => onChangeCrisisMode('anonimo')}
                  />
                  <div>
                    <strong>Modalidad Anónima</strong>
                    <div className="support-mode-desc">
                      Tu identidad queda protegida. SST no recibirá tu nombre ni tu correo. Consultas la
                      respuesta dentro de la app con el radicado del caso.
                    </div>
                  </div>
                </label>

                <label className={`support-mode-capsule ${crisisMode === 'confidencial' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="crisisMode"
                    value="confidencial"
                    className="support-mode-radio"
                    checked={crisisMode === 'confidencial'}
                    onChange={() => onChangeCrisisMode('confidencial')}
                  />
                  <div>
                    <strong>Modalidad Confidencial Identificada</strong>
                    <div className="support-mode-desc">
                      Tus datos de contacto se muestran al profesional SST asignado para gestionar la
                      orientación. Este modal no notifica a tu líder o supervisor.
                    </div>
                  </div>
                </label>
              </div>
            )}

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => onSetPriorityStep(false)}>
                Atrás
              </button>
              {hasC5Consent && (
                <button type="button" className="btn btn-primary" onClick={onConfirmPriority}>
                  Confirmar solicitud prioritaria
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
