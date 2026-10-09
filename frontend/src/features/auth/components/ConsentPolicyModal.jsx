import { Icon } from '../../../core/components/Icon';
import { env } from '../../../core/config/env';

export function ConsentPolicyModal({
  backdropRef,
  handleBackdropClick,
  settings,
  closeModal,
  modalCloseBtnRef
}) {
  return (
    <div className="consent-modal-scrim" ref={backdropRef} onClick={handleBackdropClick}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-policy-title"
        aria-describedby="modal-policy-subtitle"
        className="consent-modal-frame"
      >
        <header className="consent-modal-header-strip">
          <div>
            <h2 id="modal-policy-title" className="consent-modal-main-title">
              Política de tratamiento de datos y garantías normativas
            </h2>
            <p id="modal-policy-subtitle" className="consent-modal-sub-title">
              Versión {settings.policyVersion} · En vigor desde el {settings.policyEffectiveDate}
            </p>
          </div>
          <button
            type="button"
            className="consent-modal-dismiss-btn"
            onClick={closeModal}
            ref={modalCloseBtnRef}
            aria-label="Cerrar modal de política"
          >
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="consent-modal-scrollable-body">
          {!env.useMockStorage ? <div className="consent-modal-text-flow">
            <section className="consent-modal-clause">
              <h3 className="consent-modal-clause-heading">Política publicada</h3>
              <p className="consent-modal-clause-text" style={{ whiteSpace: 'pre-wrap' }}>{settings.policyText || 'No hay una política vigente disponible.'}</p>
            </section>
            <section className="consent-modal-clause">
              <h3 className="consent-modal-clause-heading">Aviso de privacidad</h3>
              <p className="consent-modal-clause-text" style={{ whiteSpace: 'pre-wrap' }}>{settings.noticeText || 'La política publicada no incluye un aviso adicional.'}</p>
            </section>
          </div> : <div className="consent-modal-text-flow">
            <section className="consent-modal-clause">
              <h3 className="consent-modal-clause-heading">
                1. Aislamiento de la supervisión y k-anonimato
              </h3>
              <p className="consent-modal-clause-text">
                Tus respuestas individuales, notas de bitácora y estados de fatiga nunca están disponibles
                para supervisores, monitores de calidad ni coordinadores de cuenta. Las vistas de supervisión
                únicamente presentan tendencias numéricas colectivas cuando el grupo operativo supera el
                umbral estricto de k-anonimato. Si una campaña o turno cuenta con menos agentes de los
                requeridos por el umbral, los datos quedan bloqueados automáticamente para impedir deducciones
                individuales.
              </p>
            </section>

            <section className="consent-modal-clause">
              <h3 className="consent-modal-clause-heading">
                2. Naturaleza preventiva no clínica y riesgo psicosocial
              </h3>
              <p className="consent-modal-clause-text">
                Esta plataforma es un instrumento de autogestión y acompañamiento en el turno de atención. No
                emite diagnósticos médicos ni psiquiátricos, no evalúa aptitud laboral y no sustituye la
                aplicación periódica de la Batería oficial de Riesgo Psicosocial exigida por el Ministerio del
                Trabajo (Resoluciones 2646 de 2008 y 2764 de 2022). Ningún dato individual se utiliza con
                fines disciplinarios ni de despido.
              </p>
            </section>

            <section className="consent-modal-clause">
              <h3 className="consent-modal-clause-heading">
                3. Procesamiento léxico local, determinista y explicable
              </h3>
              <p className="consent-modal-clause-text">
                Si decides autorizar el análisis en tu bitácora (finalidad C3), el procesamiento se ejecuta
                mediante un diccionario léxico transparente y local en tu navegador. El texto de tus notas no
                se transmite a modelos generativos de lenguaje externos ni se entrena con tus reflexiones
                privadas.
              </p>
            </section>

            <section className="consent-modal-clause">
              <h3 className="consent-modal-clause-heading">
                4. Control permanente, revocatoria inmediata y derechos ARCO
              </h3>
              <p className="consent-modal-clause-text">
                De conformidad con la Ley Estatutaria 1581 de 2012 y el Decreto 1377 de 2013 de Protección de
                Datos Personales (Habeas Data), conservas el derecho a conocer, actualizar, rectificar y
                suprimir tus datos en cualquier momento. La revocatoria de autorizaciones no requiere preaviso
                ni trámite burocrático; entra en vigencia de inmediato al guardar tus preferencias.
              </p>
            </section>
          </div>}

          <div className="consent-modal-contact-note">
            <Icon name="info" size={16} />
            <span>
              Para consultas sobre el tratamiento de datos o ejercicio de derechos ARCO, puedes acudir al área
              de Seguridad y Salud en el Trabajo o utilizar el canal institucional habilitado en la
              organización.
            </span>
          </div>
        </div>

        <footer className="consent-modal-footer-strip">
          <button type="button" className="btn btn-primary consent-modal-return-button" onClick={closeModal}>
            Entendido y volver al formulario
          </button>
        </footer>
      </div>
    </div>
  );
}
