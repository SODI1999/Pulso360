// src/features/agent/pages/JournalPage.jsx
// Bitácora privada con análisis NLP explicable, corrección humana y protocolo de crisis

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { JournalEditor } from '../components/JournalEditor';
import { JournalEntryList } from '../components/JournalEntryList';
import { useJournal } from '../hooks/useJournal';
import { nlpEngine } from '../../../core/nlp/nlpEngine';
import { Icon } from '../../../core/components/Icon';
import { NlpCorrectionModal, NlpHistoryModal } from '../components/NlpCorrectionModal';
import { CrisisSupportModal } from '../components/CrisisSupportModal';
import { SomaticBreathingModal } from '../components/SomaticBreathingModal';
import '../../../styles/bitacora.css';
import '../../../styles/agent.css';

/**
 * Página de la Bitácora Privada de Desahogo del Agente.
 * Ofrece un espacio personal protegido con procesamiento léxico determinista en el cliente,
 * posibilidad de corrección humana activa y derivación prioritaria voluntaria ante crisis.
 *
 * @returns {JSX.Element} Vista de la bitácora personal.
 */
export function JournalPage() {
  const navigate = useNavigate();
  const {
    loading,
    loadError,
    reload,
    consent,
    journals,
    currentJournalId,
    journalText,
    setJournalText,
    contextTag,
    setContextTag,
    feedback,
    isAnalyzing,
    showCrisisModal,
    setShowCrisisModal,
    crisisPriorityStep,
    setCrisisPriorityStep,
    crisisMode,
    setCrisisMode,
    showCorrectionModal,
    setShowCorrectionModal,
    selectedCategories,
    correctionNote,
    setCorrectionNote,
    showHistoryModal,
    setShowHistoryModal,
    textareaRef,
    hasThirdPartyData,
    currentJournal,
    handleSelectJournal,
    handleNewEntry,
    handleSaveJournal,
    handleDeleteJournal,
    handleOpenCorrection,
    toggleCategorySelection,
    handleSaveCorrection,
    handleConfirmCrisisPriority,
    handleContinueFromCrisis
  } = useJournal();
  const [showSomaticModal, setShowSomaticModal] = useState(false);

  if (loading) {
    return <p className="agent-page" role="status">Cargando bitácora…</p>;
  }

  if (loadError) {
    return (
      <div className="agent-page agent-page--journal" role="alert">
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

  if (!consent?.c2) {
    return (
      <div className="agent-page agent-page--journal">
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
            <h1 className="page-title">Mi bitácora laboral</h1>
            <p className="page-subtitle">Bitácora personal y análisis local.</p>
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
            Bitácora desactivada
          </h2>
          <p
            style={{
              color: 'var(--c-texto-suave)',
              marginBottom: '20px',
              maxWidth: '480px',
              margin: '0 auto 20px'
            }}
          >
            No tienes activa la finalidad C2 de bitácora personal en tus preferencias.
          </p>
          <Link to="/consentimiento" className="btn btn-primary">
            Activar C2 en mis preferencias
          </Link>
        </div>
      </div>
    );
  }

  const allCategoriesWithNone = [...nlpEngine.getCategoryNames(), 'Ninguna aplica'];

  return (
    <div className="agent-page agent-page--journal">
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
          <h1 className="page-title">Mi bitácora laboral</h1>
          <p className="page-subtitle">
            Espacio privado de autorreflexión y desahogo. Tus notas no forman parte de las vistas operativas
            agregadas.
          </p>
        </div>
      </div>

      {/* Split View: Lista a la izquierda y Editor Modo Desahogo a la derecha */}
      <div id="journalArea" className="journal-layout agent-work-layout">
        {/* 1. Panel de Entradas Previas */}
        <JournalEntryList
          handleNewEntry={handleNewEntry}
          journals={journals}
          currentJournalId={currentJournalId}
          handleSelectJournal={handleSelectJournal}
        />

        {/* 2. Editor de Entrada: Modo Desahogo */}
        <JournalEditor
          consent={consent}
          hasThirdPartyData={hasThirdPartyData}
          handleSaveJournal={handleSaveJournal}
          contextTag={contextTag}
          setContextTag={setContextTag}
          textareaRef={textareaRef}
          journalText={journalText}
          setJournalText={setJournalText}
          isAnalyzing={isAnalyzing}
          currentJournalId={currentJournalId}
          handleDeleteJournal={handleDeleteJournal}
          feedback={feedback}
          currentJournal={currentJournal}
          handleOpenCorrection={handleOpenCorrection}
          setShowHistoryModal={setShowHistoryModal}
          onOpenSomaticModal={() => setShowSomaticModal(true)}
        />
      </div>

      {/* Modales Complementarios */}
      <SomaticBreathingModal
        isOpen={showSomaticModal}
        onClose={() => setShowSomaticModal(false)}
      />

      {/* MODAL 1: Protocolo de Apoyo en Crisis */}
      <CrisisSupportModal
        isOpen={showCrisisModal}
        priorityStep={crisisPriorityStep}
        onSetPriorityStep={setCrisisPriorityStep}
        crisisMode={crisisMode}
        onChangeCrisisMode={setCrisisMode}
        hasC3Consent={Boolean(consent?.c3)}
        hasC5Consent={Boolean(consent?.c3 || consent?.c5)}
        onConfirmPriority={handleConfirmCrisisPriority}
        onContinue={handleContinueFromCrisis}
        onClose={() => setShowCrisisModal(false)}
      />

      {/* MODAL 2: Corrección Humana de NLP */}
      <NlpCorrectionModal
        isOpen={showCorrectionModal}
        allCategories={allCategoriesWithNone}
        selectedCategories={selectedCategories}
        onToggleCategory={toggleCategorySelection}
        correctionNote={correctionNote}
        onChangeNote={setCorrectionNote}
        onSave={handleSaveCorrection}
        onClose={() => setShowCorrectionModal(false)}
      />

      {/* MODAL 3: Historial de Auditoría Local */}
      <NlpHistoryModal
        isOpen={showHistoryModal}
        currentJournal={currentJournal}
        onClose={() => setShowHistoryModal(false)}
      />
    </div>
  );
}
