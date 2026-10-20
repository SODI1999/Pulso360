// src/features/agent/pages/CheckinWizardPage.jsx
// Formulario de Check-in diario por pasos (RF-03) somático, ergonómico y restaurador

import { Link, useNavigate } from 'react-router-dom';
import { CheckinStepForm } from '../components/CheckinStepForm';
import { CheckinConfirmation } from '../components/CheckinConfirmation';
import { useCheckinWizard } from '../hooks/useCheckinWizard';
import { QUESTIONS } from '../data/checkinWizardData';
import { Icon } from '../../../core/components/Icon';
import '../../../styles/agent.css';

/**
 * Página del Asistente de Check-in diario por pasos (RF-03).
 * Guía al agente por las 6 dimensiones somáticas y operativas con atajos de teclado,
 * prevención de fatiga, soporte para desconexión y confirmación reflexiva.
 *
 * @returns {JSX.Element} Vista del wizard de check-in.
 */
export function CheckinWizardPage() {
  const navigate = useNavigate();
  const {
    loading,
    loadError,
    reload,
    data,
    consent,
    isOutsideShift,
    currentStep,
    setCurrentStep,
    draft,
    setDraft,
    existingCheckin,
    isEditing,
    setIsEditing,
    submittedSuccess,
    draftNotice,
    validationError,
    dismissDisconnectNotice,
    setDismissDisconnectNotice,
    stepTimerRef,
    updateDraftValue,
    handleSubmit
  } = useCheckinWizard();

  if (loading) {
    return <p className="agent-page" role="status">Cargando tus registros…</p>;
  }

  if (loadError) {
    return (
      <div className="agent-page agent-page--checkin" role="alert">
        <div
          className="alert-banner danger"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}
        >
          <span>{loadError}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={reload}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!consent?.c1) {
    return (
      <div className="agent-page agent-page--checkin">
        <nav className="agent-subnav" aria-label="Navegación secundaria">
          <button
            type="button"
            className="agent-back-btn"
            onClick={() => navigate('/agente/panel')}
            aria-label="Volver al panel principal del agente"
          >
            <Icon name="arrowLeft" size={16} />
            <span>Volver al panel</span>
          </button>
        </nav>

        <div className="page-header">
          <div>
            <h1 className="page-title">Check-in de bienestar</h1>
          </div>
        </div>

        <div className="card center-card">
          <div
            className="center-icon-badge"
            style={{
              backgroundColor: 'var(--c-alerta-bg)',
              color: 'var(--c-alerta)',
              border: '1px solid var(--c-alerta-border)'
            }}
          >
            <Icon name="shield" size={32} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: 'var(--c-texto)' }}>
            Check-in no habilitado
          </h2>
          <p
            style={{
              color: 'var(--c-texto-suave)',
              marginBottom: '20px',
              maxWidth: '480px',
              margin: '0 auto 20px'
            }}
          >
            No tienes activa la finalidad C1 de registro diario en tus preferencias.
          </p>
          <Link to="/consentimiento" className="btn btn-primary">
            Activar en mis preferencias
          </Link>
        </div>
      </div>
    );
  }

  // 2. Caso: Pantalla de Cierre Restaurador (éxito)
  if (submittedSuccess) {
    return (
      <div className="agent-page agent-page--checkin">
        <nav className="agent-subnav" aria-label="Navegación secundaria">
          <button
            type="button"
            className="agent-back-btn"
            onClick={() => navigate('/agente/panel')}
            aria-label="Volver al panel principal del agente"
          >
            <Icon name="arrowLeft" size={16} />
            <span>Volver al panel</span>
          </button>
        </nav>

        <div className="page-header page-header--wizard">
          <div>
            <h1 className="page-title">Check-in de bienestar</h1>
          </div>
        </div>

        <CheckinConfirmation />
      </div>
    );
  }

  // 3. Caso: Check-in ya registrado para la jornada de hoy (Ventana de edición)
  if (existingCheckin && !isEditing) {
    const checkinTime = existingCheckin.submittedAt || existingCheckin.submitted_at || existingCheckin.createdAt || existingCheckin.created_at;
    const age = Date.now() - new Date(checkinTime).getTime();
    const editHours = Number(data.settings?.checkinEditHours || 2);
    const remainingTime = editHours * 60 * 60 * 1000 - age;

    return (
      <div className="agent-page agent-page--checkin">
        <nav className="agent-subnav" aria-label="Navegación secundaria">
          <button
            type="button"
            className="agent-back-btn"
            onClick={() => navigate('/agente/panel')}
            aria-label="Volver al panel principal del agente"
          >
            <Icon name="arrowLeft" size={16} />
            <span>Volver al panel</span>
          </button>
        </nav>

        <div className="page-header page-header--wizard">
          <div>
            <h1 className="page-title">Check-in de bienestar</h1>
          </div>
        </div>

        <div className="card restaurador-card">
          <div className="restaurador-media">
            <img
              src="/assets/fotos/bpo-agent-checkin-completed.jpg"
              alt="Operadora de Contact Center en su puesto ergonómico, serena y satisfecha tras registrar su bienestar de la jornada"
              className="restaurador-hero-img"
              loading="eager"
            />
          </div>

          <h2 className="restaurador-title">Ya registraste tu check-in de esta jornada</h2>

          {remainingTime > 0 ? (
            <>
              <p className="restaurador-subtitle">
                Tus respuestas están guardadas de forma segura. Puedes editar tus respuestas durante {Math.floor(remainingTime / 3600000)} h{' '}
                {Math.floor((remainingTime % 3600000) / 60000)} min si tu percepción de carga o energía cambia durante el turno.
              </p>

              <div className="restaurador-somatic-box">
                <div className="restaurador-somatic-icon-badge">
                  <Icon name="clock" size={18} />
                </div>
                <div className="restaurador-somatic-content">
                  <strong className="restaurador-somatic-headline">Ventana de edición activa</strong>
                  <p className="restaurador-somatic-text">
                    El registro sigue abierto por si necesitas ajustar algún valor antes de consolidar la tendencia diaria.
                  </p>
                </div>
              </div>

              <div className="restaurador-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setDraft({ ...existingCheckin });
                    setCurrentStep(0);
                    setIsEditing(true);
                  }}
                >
                  <Icon name="edit" size={16} />
                  <span>Editar registro</span>
                </button>
                <Link to="/agente/bitacora" className="btn btn-ghost">
                  <Icon name="edit_note" size={16} />
                  <span>Ir a mi bitácora</span>
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="restaurador-subtitle">
                La ventana de edición configurada ({editHours} horas) ya ha cerrado para esta jornada. Tus respuestas ya forman parte de la tendencia agregada y protegida de hoy.
              </p>

              <div className="restaurador-somatic-box">
                <div className="restaurador-somatic-icon-badge">
                  <Icon name="shieldCheck" size={18} />
                </div>
                <div className="restaurador-somatic-content">
                  <strong className="restaurador-somatic-headline">Autocuidado completado con éxito</strong>
                  <p className="restaurador-somatic-text">
                    Recuerda mantener tu postura ergonómica, relajar los hombros y tomar agua entre llamadas.
                  </p>
                </div>
              </div>

              <div className="restaurador-actions">
                <Link to="/apoyo-crisis" className="btn btn-secondary">
                  <Icon name="respiro" size={16} />
                  <span>Pausa de respiración</span>
                </Link>
                <Link to="/agente/bitacora" className="btn btn-ghost">
                  <Icon name="edit_note" size={16} />
                  <span>Ir a mi bitácora</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // 4. Caso: Formulario de Wizard por Pasos (Preguntas 1 a 6)
  const safeStep = Math.min(5, Math.max(0, currentStep));
  const currentQ = QUESTIONS[safeStep] || QUESTIONS[0];
  const currentValue = draft[currentQ.key];

  return (
    <div className="agent-page agent-page--checkin">
      <nav className="agent-subnav" aria-label="Navegación secundaria">
        <button
          type="button"
          className="agent-back-btn"
          onClick={() => navigate('/agente/panel')}
          aria-label="Volver al panel principal del agente"
        >
          <Icon name="arrowLeft" size={16} />
          <span>Volver al panel</span>
        </button>
      </nav>

      {/* Soporte de Desconexión Laboral (Ley 2191 de 2022) */}
      {isOutsideShift && !dismissDisconnectNotice && (
        <div className="disconnect-banner wizard-disconnect-banner">
          <div className="disconnect-info">
            <div className="disconnect-icon-wrapper">
              <Icon name="clock" size={20} />
            </div>
            <div>
              <div className="disconnect-title">
                <span>Desconexión Laboral Activa (Ley 2191 de 2022)</span>
                <span className="badge badge-ok">Fuera de horario ordinario</span>
              </div>
              <p className="disconnect-desc">
                Tu turno ordinario culminó. Registrar este check-in es voluntario y no tiene repercusiones
                laborales.
              </p>
            </div>
          </div>
          <div className="disconnect-actions">
            <button
              type="button"
              className="btn btn-modal-comprendido btn-sm"
              onClick={() => setDismissDisconnectNotice(true)}
            >
              Continuar registro
            </button>
          </div>
        </div>
      )}

      <div className="page-header page-header--wizard">
        <div>
          <h1 className="page-title">Check-in de bienestar</h1>
        </div>
      </div>

      <CheckinStepForm
        handleSubmit={handleSubmit}
        currentStep={currentStep}
        draftNotice={draftNotice}
        currentQ={currentQ}
        currentValue={currentValue}
        updateDraftValue={updateDraftValue}
        validationError={validationError}
        stepTimerRef={stepTimerRef}
        setCurrentStep={setCurrentStep}
      />
    </div>
  );
}
