import { CheckinStepForm } from '../components/CheckinStepForm';
import { CheckinConfirmation } from '../components/CheckinConfirmation';
import { useCheckinWizard } from '../hooks/useCheckinWizard';
import { QUESTIONS } from '../data/checkinWizardData';

// src/features/agent/pages/CheckinWizardPage.jsx
// Formulario de Check-in diario por pasos (RF-03) somático, ergonómico y restaurador

import { Link, useNavigate } from 'react-router-dom';

import { Icon } from '../../../core/components/Icon';

import { BpoResetModal } from '../components/BpoResetModal';
import '../../../styles/agent.css';

export function CheckinWizardPage() {
  const navigate = useNavigate();
  const {
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
    isResetModalOpen,
    setIsResetModalOpen,
    dismissDisconnectNotice,
    setDismissDisconnectNotice,
    stepTimerRef,
    updateDraftValue,
    handleSubmit
  } = useCheckinWizard();

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

        <CheckinConfirmation setIsResetModalOpen={setIsResetModalOpen} />

        {/* Modal de Descompresión BPO (Box Breathing, Descanso Ocular, Estiramientos) */}
        <BpoResetModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} />
      </div>
    );
  }

  // 3. Caso: Check-in ya registrado para la jornada de hoy (Ventana de edición)
  if (existingCheckin && !isEditing) {
    const age = Date.now() - new Date(existingCheckin.submittedAt).getTime();
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

        <div className="card center-card">
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: 'var(--c-texto)' }}>
            Ya registraste tu check-in de esta jornada
          </h2>

          {remainingTime > 0 ? (
            <>
              <p style={{ color: 'var(--c-texto-suave)', marginBottom: '20px' }}>
                Puedes editar tus respuestas durante {Math.floor(remainingTime / 3600000)} h{' '}
                {Math.floor((remainingTime % 3600000) / 60000)} min.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setDraft({ ...existingCheckin });
                  setCurrentStep(0);
                  setIsEditing(true);
                }}
              >
                Editar registro
              </button>
            </>
          ) : (
            <p style={{ color: 'var(--c-texto-suave)' }}>
              La ventana de edición configurada ({editHours} horas) ya ha cerrado para esta jornada.
            </p>
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
