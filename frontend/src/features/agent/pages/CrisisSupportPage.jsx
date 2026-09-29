import { CrisisLegalDetails } from '../components/CrisisLegalDetails';
import { CrisisContactLines } from '../components/CrisisContactLines';
import { GroundingExercise } from '../components/GroundingExercise';
import { GroundingHeader } from '../components/GroundingHeader';
import { useCrisisSupport } from '../hooks/useCrisisSupport';
import { GROUNDING_STEPS } from '../data/crisisSupportData';
// src/features/agent/pages/CrisisSupportPage.jsx
// Ruta de contención, primeros auxilios psicológicos (PAP) y canalización legal diferenciada (RF-10)

import { Link } from 'react-router-dom';

import { Icon } from '../../../core/components/Icon';
import { BpoResetModal } from '../components/BpoResetModal';

import '../../../styles/crisis.css';

export function CrisisSupportPage() {
  const {
    navigate,
    consent,
    isBpoResetOpen,
    setIsBpoResetOpen,
    activeGroundingIndex,
    setActiveGroundingIndex,
    completedAnchors,
    setCompletedAnchors,
    groundingMode,
    setGroundingMode,
    isAssistedPlaying,
    setIsAssistedPlaying,
    assistedAnchorIndex,
    setAssistedAnchorIndex,
    isVoiceEnabled,
    setIsVoiceEnabled,
    currentSubtitle,
    currentStep,
    currentStepNumber,
    currentStepAnchors,
    stepCompletedList,
    isStepFullyCompleted,
    totalAnchorsCompleted,
    isFullGroundingCompleted,
    toggleAnchor,
    resetGrounding
  } = useCrisisSupport();

  return (
    <div className="agent-page crisis-editorial-page">
      {/* Navegación superior sobria */}
      <nav className="agent-subnav" aria-label="Navegación secundaria">
        <button type="button" className="agent-back-btn" onClick={() => navigate('/agente/panel')}>
          <Icon name="arrowLeft" size={16} />
          <span>Volver al panel</span>
        </button>
      </nav>

      {/* Cabecera Editorial de Contención */}
      <header className="crisis-page-header">
        <h1 className="crisis-page-title">Espacio de contención y primeros auxilios psicológicos</h1>
        <p className="crisis-page-subtitle">
          Herramientas de contención somática en puesto (Grounding 5-4-3-2-1), líneas oficiales de ayuda
          gratuita 24/7 y orientación preventiva con SST.
        </p>
      </header>

      {/* SECCIÓN 1: Primeros Auxilios Psicológicos (Grounding Somático en Puesto 5-4-3-2-1) */}
      <section className="crisis-grounding-section" aria-labelledby="grounding-heading">
        <GroundingHeader
          totalAnchorsCompleted={totalAnchorsCompleted}
          groundingMode={groundingMode}
          setGroundingMode={setGroundingMode}
          setIsAssistedPlaying={setIsAssistedPlaying}
          isAssistedPlaying={isAssistedPlaying}
          isVoiceEnabled={isVoiceEnabled}
          setIsVoiceEnabled={setIsVoiceEnabled}
          setIsBpoResetOpen={setIsBpoResetOpen}
        />

        {/* Barra global de fijación somática */}
        <div className="crisis-somatic-progress-track" aria-hidden="true">
          <div
            className="crisis-somatic-progress-bar"
            style={{ width: `${(totalAnchorsCompleted / 15) * 100}%` }}
          />
        </div>

        {/* Selector horizontal de pasos (5-4-3-2-1) */}
        <div className="crisis-grounding-tabs" role="tablist" aria-label="Pasos de la técnica de anclaje">
          {GROUNDING_STEPS.map((step, idx) => {
            const isActive = activeGroundingIndex === idx;
            const stepDoneCount = (completedAnchors[step.number] || []).length;
            const isStepDone = stepDoneCount === step.anchors.length;

            return (
              <button
                key={step.number}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActiveGroundingIndex(idx);
                  setAssistedAnchorIndex(0);
                }}
                className={`crisis-grounding-tab ${isActive ? 'is-active' : ''} ${isStepDone ? 'is-step-completed' : ''}`}
              >
                <div className="crisis-tab-num-row">
                  <span className="crisis-tab-num">{step.number}</span>
                  {isStepDone && <Icon name="check" size={14} className="crisis-tab-done-icon" />}
                </div>
                <div className="crisis-tab-label">
                  <span className="crisis-tab-badge">{step.badge}</span>
                  <span className="crisis-tab-sense">{step.sense}</span>
                  <span className="crisis-tab-progress-micro">
                    {stepDoneCount}/{step.anchors.length}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* DETALLE INTERACTIVO DEL PASO ACTIVO */}
        <GroundingExercise
          currentStep={currentStep}
          stepCompletedList={stepCompletedList}
          currentStepAnchors={currentStepAnchors}
          groundingMode={groundingMode}
          isAssistedPlaying={isAssistedPlaying}
          assistedAnchorIndex={assistedAnchorIndex}
          toggleAnchor={toggleAnchor}
          currentStepNumber={currentStepNumber}
          currentSubtitle={currentSubtitle}
          isVoiceEnabled={isVoiceEnabled}
          isFullGroundingCompleted={isFullGroundingCompleted}
          navigate={navigate}
          setIsBpoResetOpen={setIsBpoResetOpen}
          resetGrounding={resetGrounding}
          activeGroundingIndex={activeGroundingIndex}
          setActiveGroundingIndex={setActiveGroundingIndex}
          setAssistedAnchorIndex={setAssistedAnchorIndex}
          isStepFullyCompleted={isStepFullyCompleted}
          setCompletedAnchors={setCompletedAnchors}
        />
      </section>

      {/* SECCIÓN 2: Líneas Oficiales y Gratuitas 24/7 */}
      <CrisisContactLines />

      {/* SECCIÓN 3: Acordeón Sobrio de Rutas Institucionales y Marco Legal */}
      <CrisisLegalDetails />

      {/* SECCIÓN 4: Derivación y Acompañamiento con SST */}
      <section className="crisis-sst-section" aria-labelledby="sst-heading">
        <div className="crisis-sst-info">
          <h3 id="sst-heading" className="crisis-sst-title">
            ¿Requieres orientación personalizada con el equipo de SST?
          </h3>
          <p className="crisis-sst-desc">
            Puedes registrar una solicitud voluntaria en modalidad anónima o confidencial. Tus respuestas de
            check-in y bitácoras no se incorporan a la solicitud.
          </p>
        </div>

        <div className="crisis-sst-actions">
          {!consent?.c5 ? (
            <Link to="/consentimiento" className="btn-crisis-call btn-crisis-call--secondary">
              <Icon name="shieldCheck" size={16} />
              <span>Gestionar finalidad C5 en consentimiento</span>
            </Link>
          ) : (
            <Link to="/agente/apoyo" className="btn-crisis-call btn-crisis-call--primary">
              <Icon name="support_agent" size={18} />
              <span>Ir al canal de acompañamiento con SST</span>
            </Link>
          )}
        </div>
      </section>

      {/* Modal de Respiración Guiada de Emergencia (Box Breathing 4x4) */}
      <BpoResetModal isOpen={isBpoResetOpen} onClose={() => setIsBpoResetOpen(false)} />
    </div>
  );
}
