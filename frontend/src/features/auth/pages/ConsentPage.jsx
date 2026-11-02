// src/features/auth/pages/ConsentPage.jsx
// Gestión del consentimiento informado del agente y preferencias C1 a C5
// Documento de consentimiento y preferencias bajo la Ley 1581 de 2012 y Res. 2646 de 2008.

import { useMemo } from 'react';
import { ConsentPolicyModal } from '../components/ConsentPolicyModal';
import { ConsentHistory } from '../components/ConsentHistory';
import { ConsentPreferences } from '../components/ConsentPreferences';
import { useConsent } from '../hooks/useConsent';
import { Icon } from '../../../core/components/Icon';
import '../../../styles/consentimiento.css';

/**
 * Página de Consentimiento Informado y Preferencias de Privacidad (C1 a C5).
 * Permite al agente habilitar o pausar con plena autonomía las finalidades de tratamiento,
 * consultar el marco legal (Ley 1581) y auditar el histórico inmutable de decisiones.
 *
 * @returns {JSX.Element} Vista del consentimiento informado.
 */
export function ConsentPage() {
  const {
    navigate,
    comesFromLogin,
    consents,
    policyAccepted,
    canSubmit,
    setPolicyAccepted,
    history,
    feedback,
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

  // Formatear fecha de vigencia a texto en español (ej. "15 de octubre de 2026")
  const formattedEffectiveDate = useMemo(() => {
    if (!settings.policyEffectiveDate) return 'reciente';
    try {
      const d = new Date(settings.policyEffectiveDate);
      if (isNaN(d.getTime())) return settings.policyEffectiveDate;
      return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'long',
        timeZone: 'America/Bogota'
      }).format(d);
    } catch {
      return settings.policyEffectiveDate;
    }
  }, [settings.policyEffectiveDate]);

  return (
    <main className="agent-page consent-editorial-page">
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
          versión {settings.policyVersion}, vigente desde el {formattedEffectiveDate}.
        </p>
      </header>

      {/* Principio de voluntariedad: texto institucional continuo sin franja lateral ni card-itis */}
      <section
        className="consent-preamble-section"
        aria-label="Principio de voluntariedad y dignidad laboral"
      >
        <h2 className="consent-preamble-title">Principio de voluntariedad y dignidad laboral</h2>
        <p className="consent-preamble-text">
          La participación en Pulso360 es voluntaria. Puedes activar, pausar o revocar cada finalidad C1 a C5.
          Tus elecciones cambian las herramientas y tratamientos de datos disponibles, según se explica
          en cada opción y en la política publicada. Revisa esos efectos antes de guardar.
        </p>
        <button type="button" className="consent-modal-trigger-link" onClick={openModal}>
          <span>Consultar política y aviso de privacidad</span>
        </button>
      </section>

      {/* Sección de finalidades C1 a C5: lista continua con divisores hairline */}
      <ConsentPreferences
        handleSubmit={handleSubmit}
        consents={consents}
        handleCheckboxChange={handleCheckboxChange}
        policyAccepted={policyAccepted}
        canSubmit={canSubmit}
        setPolicyAccepted={setPolicyAccepted}
        openModal={openModal}
        activeCount={activeCount}
        activeCodes={activeCodes}
        isSaving={isSaving}
        feedback={feedback}
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
    </main>
  );
}
