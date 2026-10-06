import { useSupportChannel } from '../hooks/useSupportChannel';

// src/features/agent/pages/SupportChannelPage.jsx
// Canal voluntario de solicitudes de orientación psicosocial y acompañamiento con SST (RF-10)

import { Link } from 'react-router-dom';

import { Icon } from '../../../core/components/Icon';
import { SupportRequestForm } from '../components/SupportRequestForm';
import { SupportChatCard } from '../components/SupportChatCard';
import '../../../styles/apoyo.css';

export function SupportChannelPage() {
  const { loading,loadError,
    navigate,
    consent,
    setSupportMode,
    reason,
    setReason,
    details,
    setDetails,
    urgency,
    setUrgency,
    contactPreference,
    setContactPreference,
    timeWindow,
    setTimeWindow,
    feedback,
    userRequests,
    isAnonymous,
    handleSubmit
  } = useSupportChannel();
  if (loading) return <p className="agent-page" role="status">Cargando tus registros…</p>;
  if (loadError) return <p className="agent-page alert-banner danger" role="alert">{loadError}</p>;


  if (!consent?.c3) {
    return (
      <div className="agent-page support-editorial-page">
        <nav className="agent-subnav" aria-label="Navegación secundaria">
          <button type="button" className="agent-back-btn" onClick={() => navigate('/agente/panel')}>
            <Icon name="arrowLeft" size={16} />
            <span>Volver al panel</span>
          </button>
        </nav>

        <header className="support-page-header">
          <h1 className="support-page-title">Canal de acompañamiento con SST</h1>
          <p className="support-page-subtitle">
            Orientación psicosocial preventiva gestionada por Seguridad y Salud en el Trabajo.
          </p>
        </header>

        <section className="support-blocked-block" aria-labelledby="blocked-heading">
          <h2 id="blocked-heading" className="support-blocked-title">
            Canal de acompañamiento individual no habilitado
          </h2>
          <p className="support-blocked-desc">
            La finalidad C5 está inactiva en tus preferencias de consentimiento informado. Para que el equipo
            de SST pueda recibir solicitudes de acompañamiento y coordinar orientación personalizada, es
            necesario habilitar esta autorización bajo la Ley 1581 de 2012. Las líneas públicas de apoyo
            psicosocial y primeros auxilios continúan plenamente disponibles.
          </p>
          <div className="support-blocked-actions">
            <Link to="/consentimiento" className="btn-support-submit">
              <Icon name="shieldCheck" size={16} />
              <span>Gestionar finalidad C5 en consentimiento</span>
            </Link>
            <Link to="/apoyo-crisis" className="support-urgent-action">
              <Icon name="support" size={16} />
              <span>Ver ruta pública de apoyo y PAP</span>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="agent-page support-editorial-page">
      {/* Navegación superior sobria */}
      <nav className="agent-subnav" aria-label="Navegación secundaria">
        <button type="button" className="agent-back-btn" onClick={() => navigate('/agente/panel')}>
          <Icon name="arrowLeft" size={16} />
          <span>Volver al panel</span>
        </button>
      </nav>

      {/* Cabecera editorial sin cajas flotantes ni gradientes */}
      <header className="support-page-header">
        <h1 className="support-page-title">Canal de acompañamiento con SST</h1>
        <p className="support-page-subtitle">
          Orientación psicosocial preventiva canalizada exclusivamente al equipo de SST. Esta solicitud no es
          visible para supervisores ni coordinadores de campaña.
        </p>
      </header>

      {/* Chat interactivo de orientación psicosocial en tiempo real */}
      <SupportChatCard />

      {/* Formulario continuo estructurado */}
      <SupportRequestForm
        isAnonymous={isAnonymous}
        onSetSupportMode={setSupportMode}
        reason={reason}
        onChangeReason={setReason}
        details={details}
        onChangeDetails={setDetails}
        urgency={urgency}
        onChangeUrgency={setUrgency}
        contactPreference={contactPreference}
        onChangeContactPreference={setContactPreference}
        timeWindow={timeWindow}
        onChangeTimeWindow={setTimeWindow}
        onSubmit={handleSubmit}
        feedback={feedback}
      />

      {/* Historial editorial de solicitudes */}
      <section className="support-history-section" aria-labelledby="history-heading">
        <div className="support-history-header">
          <h2 id="history-heading" className="support-history-title">
            Mis solicitudes de acompañamiento
          </h2>
          <p className="support-history-subtitle">
            Seguimiento de radicados, tiempos estimados y respuestas de los profesionales de SST.
          </p>
        </div>

        {userRequests.length === 0 ? (
          <div className="support-empty-state">
            <Icon name="support" size={32} className="support-empty-icon" />
            <strong className="support-empty-title">No tienes solicitudes registradas en este momento</strong>
            <p className="support-empty-desc">
              Cuando envíes una consulta o solicitud a SST, aquí podrás hacer seguimiento seguro a su radicado
              y respuesta.
            </p>
          </div>
        ) : (
          <div className="support-requests-flow" role="list">
            {userRequests.map((req) => (
              <article key={req.id} className="support-request-item" role="listitem">
                <div className="support-request-header">
                  <strong className="support-request-code">{req.code}</strong>
                  <span className={`support-request-badge ${req.mode === 'anonimo' ? 'is-anon' : ''}`}>
                    <Icon name={req.mode === 'anonimo' ? 'eyeOff' : 'shieldCheck'} size={13} />
                    <span>{req.mode === 'anonimo' ? 'Modalidad Anónima' : 'Modalidad Confidencial'}</span>
                  </span>
                </div>
                <div className="support-request-meta-grid">
                  <div>
                    <span className="support-meta-label">Motivo:</span> {req.reason}
                  </div>
                  <div>
                    <span className="support-meta-label">Estado:</span>
                    <span className="support-meta-status">{req.status}</span>
                  </div>
                  <div>
                    <span className="support-meta-label">Atención estimada:</span> {req.sla}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
