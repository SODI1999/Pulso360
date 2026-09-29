import { Icon } from '../../../core/components/Icon';
import { ScaleSelector } from '../components/ScaleSelector';

export function CheckinStepForm({
  handleSubmit,
  currentStep,
  draftNotice,
  currentQ,
  currentValue,
  updateDraftValue,
  validationError,
  stepTimerRef,
  setCurrentStep
}) {
  return (
    <form className="card wizard-card agent-work-surface" onSubmit={handleSubmit}>
      <div className="wizard-header-meta">
        <strong className="wizard-step-indicator">Dimensión {currentStep + 1} de 6</strong>
        <span className="wizard-draft-notice">{draftNotice}</span>
      </div>

      {/* Barra de Progreso */}
      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${((currentStep + 1) / 6) * 100}%` }} />
      </div>

      {/* Sección de la pregunta activa con escala somática */}
      <ScaleSelector
        question={currentQ}
        currentValue={currentValue}
        onSelectValue={(val) => updateDraftValue(currentQ.key, val)}
        onSkip={() => updateDraftValue(currentQ.key, null)}
      />

      {/* Alerta de validación accesible en caso de dimensiones incompletas */}
      {validationError && (
        <div className="alert alert-danger" role="alert" style={{ marginBottom: '16px' }}>
          <Icon name="warning" size={16} />
          <span>{validationError}</span>
        </div>
      )}

      {/* Botones de Navegación del Wizard con anticipación simétrica */}
      <div className="wizard-footer-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
            setCurrentStep((prev) => Math.max(0, prev - 1));
          }}
          disabled={currentStep === 0}
        >
          <Icon name="arrowLeft" size={16} />
          <span>Atrás</span>
        </button>

        {currentStep < 5 ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
              setCurrentStep((prev) => Math.min(5, prev + 1));
            }}
          >
            <span>Siguiente</span>
            <Icon name="arrowRight" size={16} />
          </button>
        ) : (
          <button type="submit" className="btn btn-primary">
            <span>Enviar check-in</span>
            <Icon name="check" size={16} />
          </button>
        )}
      </div>

      {/* Regla visible de agregación y alcance por rol */}
      <div className="privacy-notice-box wizard-privacy-box">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <Icon
            name="shieldCheck"
            size={16}
            style={{ color: 'var(--c-primario)', flexShrink: 0, marginTop: '2px' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <strong style={{ color: 'var(--c-texto)', fontSize: '12.5px' }}>
              Regla de agregación (k ≥ 5)
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--c-texto-suave)', lineHeight: '1.45' }}>
              En los flujos definidos, las respuestas individuales quedan fuera de la vista colectiva mientras
              el grupo no alcanza al menos 5 personas. Los roles operativos reciben tendencias agregadas, no
              el detalle de cada respuesta.
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}
