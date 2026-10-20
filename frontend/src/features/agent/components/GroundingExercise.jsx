import { GROUNDING_STEPS } from '../data/crisisSupportData';
import { Icon } from '../../../core/components/Icon';
import { GroundingVisualMap } from '../components/GroundingVisualMap';

/**
 * Interactive execution shell for the Grounding 5-4-3-2-1 somatic exercise.
 * Coordinates step header information, assisted mode banners, SVG visual map rendering,
 * completion summaries, and step navigation controls.
 *
 * @param {Object} props - Component properties.
 * @param {Object} props.currentStep - Active step configuration object from GROUNDING_STEPS.
 * @param {string[]} props.stepCompletedList - List of completed anchor IDs in the current step.
 * @param {Array<{id: string, label: string, cue: string}>} props.currentStepAnchors - All anchors belonging to current step.
 * @param {'tactile'|'assisted'} props.groundingMode - Active pacing mode.
 * @param {boolean} props.isAssistedPlaying - Flag indicating if guided cadence timer is running.
 * @param {number} props.assistedAnchorIndex - Index of currently focused anchor in assisted mode.
 * @param {(step: number, id: string) => void} props.toggleAnchor - Anchor toggle callback.
 * @param {number} props.currentStepNumber - Current step countdown number (5 to 1).
 * @param {string} props.currentSubtitle - Active subtitle caption text.
 * @param {boolean} props.isVoiceEnabled - Voice synthesis toggle status.
 * @param {boolean} props.isFullGroundingCompleted - True if all 15 anchors across all 5 steps are checked.
 * @param {import('react-router-dom').NavigateFunction} props.navigate - Router navigation hook.
 * @param {() => void} props.resetGrounding - Callback to reset all anchor progress.
 * @param {number} props.activeGroundingIndex - Current index in GROUNDING_STEPS array (0 to 4).
 * @param {import('react').Dispatch<import('react').SetStateAction<number>>} props.setActiveGroundingIndex - Step index setter.
 * @param {import('react').Dispatch<import('react').SetStateAction<number>>} props.setAssistedAnchorIndex - Assisted anchor index setter.
 * @param {boolean} props.isStepFullyCompleted - True if all anchors in current step are completed.
 * @param {import('react').Dispatch<import('react').SetStateAction<Record<number, string[]>>>} props.setCompletedAnchors - Anchor map setter.
 * @returns {import('react').JSX.Element} Grounding exercise UI.
 */
export function GroundingExercise({
  currentStep,
  stepCompletedList,
  currentStepAnchors,
  groundingMode,
  isAssistedPlaying,
  assistedAnchorIndex,
  toggleAnchor,
  currentStepNumber,
  currentSubtitle,
  isVoiceEnabled,
  isFullGroundingCompleted,
  navigate,
  resetGrounding,
  activeGroundingIndex,
  setActiveGroundingIndex,
  setAssistedAnchorIndex,
  isStepFullyCompleted,
  setCompletedAnchors
}) {
  return (
    <div className="crisis-grounding-display" role="tabpanel">
      <div className="crisis-step-header-row">
        <div className="crisis-step-heading">
          <span className="crisis-step-tag">{currentStep.number}</span>
          <div>
            <h3 className="crisis-step-title">{currentStep.title}</h3>
            <p className="crisis-step-guide">{currentStep.guide}</p>
          </div>
        </div>

        <div className="crisis-step-meta-status">
          <span className="crisis-step-status-text">
            {stepCompletedList.length} de {currentStepAnchors.length} anclas fijadas
          </span>
          <span className="crisis-step-hint-keyboard">
            Atajo: presiona teclas 1 a {currentStepAnchors.length}
          </span>
        </div>
      </div>

      {/* Cadencia visual en modo asistido */}
      {groundingMode === 'assisted' && (
        <div className="crisis-assisted-banner">
          <div className="crisis-assisted-wave" />
          <p className="crisis-assisted-text">
            {isAssistedPlaying
              ? `Respirando y enfocando el ancla ${assistedAnchorIndex + 1}... Toma aire despacio y nota el elemento.`
              : 'Cadencia en pausa. Haz clic en el botón superior para reanudar el avance guiado.'}
          </p>
        </div>
      )}

      {/* CUERPO INTERACTIVO: LIENZO VISUAL SVG INMERSIVO */}
      <div className="crisis-interactive-body">
        <GroundingVisualMap
          stepNumber={currentStep.number}
          completedAnchorIds={stepCompletedList}
          onToggleAnchor={(anchorId) => toggleAnchor(currentStepNumber, anchorId)}
          currentSubtitle={currentSubtitle}
          isVoiceEnabled={isVoiceEnabled}
        />
      </div>

      {/* REFUERZO AL COMPLETAR EL PASO O TODO EL EJERCICIO */}
      {isFullGroundingCompleted ? (
        <div className="crisis-grounding-completed-banner">
          <div className="crisis-completed-badge-row">
            <Icon name="checkCircle" size={20} className="crisis-completed-icon" />
            <h4 className="crisis-completed-title">Anclaje somático completo (15/15 anclas fijadas)</h4>
          </div>
          <p className="crisis-completed-desc">
            Has conectado tus 5 sentidos con tu estación física de trabajo. Ejercicio de anclaje completado
            para recuperar presencia y foco en tu turno. Recuerda que la llamada difícil ya terminó y tú
            marcas el compás de tu turno.
          </p>
          <div className="crisis-completed-actions">
            <button
              type="button"
              className="btn btn-primary crisis-action-btn"
              onClick={() => navigate('/agente/panel')}
            >
              <span>Volver al panel con calma</span>
            </button>
            <button type="button" className="btn-crisis-secondary-action" onClick={resetGrounding}>
              <Icon name="sync" size={15} />
              <span>Reiniciar anclaje</span>
            </button>
          </div>
        </div>
      ) : (
        /* Barra de navegación entre sentidos */
        <div className="crisis-step-nav">
          <button
            type="button"
            className="crisis-nav-btn"
            disabled={activeGroundingIndex === 0}
            onClick={() => {
              setActiveGroundingIndex((prev) => Math.max(0, prev - 1));
              setAssistedAnchorIndex(0);
            }}
          >
            <Icon name="arrowLeft" size={14} />
            <span>Sentido anterior</span>
          </button>

          <div className="crisis-step-nav-center">
            <span className="crisis-step-counter">
              Sentido {activeGroundingIndex + 1} de {GROUNDING_STEPS.length} ({currentStep.sense})
            </span>
            {stepCompletedList.length > 0 && !isStepFullyCompleted && (
              <button
                type="button"
                className="crisis-link-reset-step"
                onClick={() => {
                  setCompletedAnchors((prev) => ({ ...prev, [currentStepNumber]: [] }));
                }}
              >
                Limpiar paso
              </button>
            )}
          </div>

          {activeGroundingIndex < GROUNDING_STEPS.length - 1 ? (
            <button
              type="button"
              className={`crisis-nav-btn ${isStepFullyCompleted ? 'is-step-ready' : ''}`}
              onClick={() => {
                setActiveGroundingIndex((prev) => Math.min(GROUNDING_STEPS.length - 1, prev + 1));
                setAssistedAnchorIndex(0);
              }}
            >
              <span>
                {isStepFullyCompleted
                  ? `Continuar a ${GROUNDING_STEPS[activeGroundingIndex + 1].sense}`
                  : 'Siguiente sentido'}
              </span>
              <Icon name="arrowRight" size={14} />
            </button>
          ) : (
            <button
              type="button"
              className={`crisis-nav-btn ${isStepFullyCompleted ? 'is-step-ready' : ''}`}
              onClick={() => {
                if (isStepFullyCompleted) {
                  navigate('/agente/panel');
                }
              }}
            >
              <span>Finalizar y volver al panel</span>
              <Icon name="arrowRight" size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
