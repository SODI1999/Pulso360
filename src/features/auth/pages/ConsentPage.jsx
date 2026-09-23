import { ConsentPolicyModal } from '../components/ConsentPolicyModal';
import { ConsentHistory } from '../components/ConsentHistory';
import { ConsentPreferences } from '../components/ConsentPreferences';
import { useConsent } from '../hooks/useConsent';

// src/features/auth/pages/ConsentPage.jsx
// Gestión del consentimiento informado del agente y preferencias C1 a C5
// Documento de consentimiento y preferencias.

import { Icon } from '../../../core/components/Icon';

// Estilos editoriales continuos
import '../../../styles/consentimiento.css';

// Finalidades de tratamiento C1 a C5 con terminología de Contact Center y salud ocupacional

export function ConsentPage() {
  const {
    navigate,
    comesFromLogin,
    consents,
    policyAccepted,
    setPolicyAccepted,
    history,
    statusMessage,
    isSaving,
    isModalOpen,
    settings,
    modalCloseBtnRef,
    backdropRef,
    openModal,
    closeModal,
    handleBackdropClick,
    handleCheckboxChange,
    handleSubmit,
    activeCount,
    activeCodes,
    formatDateTime
  } = useConsent();

  return (
    <div className="agent-page consent-editorial-page">
      {/* Retorno sobrio */}
      {!comesFromLogin && (
        <nav className="agent-subnav" aria-label="Navegación secundaria">
          <button type="button" className="agent-back-btn" onClick={() => navigate('/agente/panel')}>
            <Icon name="arrowLeft" size={16} />
            <span>Volver al panel</span>
          </button>
        </nav>
      )}

      {/* Cabecera editorial plana: sin tarjetas ni cajas */}
      <header className="consent-page-header">
        <h1 className="consent-page-title">Consentimiento informado y preferencias</h1>
        <p className="consent-page-subtitle">
          Decide con plena autonomía qué herramientas de bienestar deseas habilitar en tu estación. Política
          versión {settings.policyVersion}, vigente desde el {settings.policyEffectiveDate}.
        </p>
      </header>

      {/* Principio de voluntariedad: texto institucional continuo sin franja lateral ni card-itis */}
      <section
        className="consent-preamble-section"
        aria-label="Principio de voluntariedad y dignidad laboral"
      >
        <h2 className="consent-preamble-title">Principio de voluntariedad y dignidad laboral</h2>
        <p className="consent-preamble-text">
          La participación en Pulso360 es confidencial y enteramente voluntaria. Los datos recopilados son de
          carácter sensible y tienen como único propósito la prevención del desgaste laboral en el Contact
          Center. Ninguna de las finalidades C1 a C5 es obligatoria; activar, pausar o revocar cualquiera de
          ellas no afecta tu evaluación de desempeño, bonos de campaña, adherencia operativa ni estabilidad
          contractual.
        </p>
        <button type="button" className="consent-modal-trigger-link" onClick={openModal}>
          <span>Consultar garantías normativas completas (Ley 1581)</span>
        </button>
      </section>

      {/* Sección de finalidades C1 a C5: lista continua con divisores hairline */}
      <ConsentPreferences
        handleSubmit={handleSubmit}
        consents={consents}
        handleCheckboxChange={handleCheckboxChange}
        policyAccepted={policyAccepted}
        setPolicyAccepted={setPolicyAccepted}
        openModal={openModal}
        activeCount={activeCount}
        activeCodes={activeCodes}
        isSaving={isSaving}
        statusMessage={statusMessage}
      />

      {/* Historial inmutable: tabla editorial limpia sin caja gigante */}
      <ConsentHistory history={history} formatDateTime={formatDateTime} />

      {/* Modal accesible de detalle normativo */}
      {isModalOpen && (
        <ConsentPolicyModal
          backdropRef={backdropRef}
          handleBackdropClick={handleBackdropClick}
          settings={settings}
          closeModal={closeModal}
          modalCloseBtnRef={modalCloseBtnRef}
        />
      )}
    </div>
  );
}
