import { useNavigate } from 'react-router-dom';
import { useMyDataPrivacy } from '../hooks/useMyDataPrivacy';

import { Icon } from '../../../core/components/Icon';
import { PrivacyVisibilityMatrix } from '../components/PrivacyVisibilityMatrix';
import { ConsentSummaryCard } from '../components/ConsentSummaryCard';
import { AgentRecordsExplorer } from '../components/AgentRecordsExplorer';
import { HabeasDataActionCenter } from '../components/HabeasDataActionCenter';
import { SuppressionConfirmModal } from '../components/SuppressionConfirmModal';
import { HabeasRequestsTimeline } from '../components/HabeasRequestsTimeline';

import '../../../styles/agent.css';

/**
 * Centro de Datos Personales, Salvaguardas y Habeas Data del Agente.
 * Organizado en 3 pestañas focales accesibles bajo el estándar WAI-ARIA.
 */
export function MyDataPrivacyPage() {
  const navigate = useNavigate();

  const {
    loading,
    loadError,
    reload,
    activeTab,
    setActiveTab,
    handleTabKeyDown,
    isSuppressionModalOpen,
    setIsSuppressionModalOpen,
    rectificationText,
    setRectificationText,
    rectificationFeedback,
    suppressionConfirmText,
    setSuppressionConfirmText,
    suppressionFeedback,
    formatDate,
    summary,
    portabilityFiles,
    handleDownloadPortability,
    handleRectificationSubmit,
    handleSuppressionSubmit,
    handleSelectForRectification,
    isSuppressionConfirmed
  } = useMyDataPrivacy();

  // 1. Estado de Carga
  if (loading) {
    return (
      <div className="agent-page agent-page--privacy">
        <div className="loading-state-box" role="status" style={{ padding: '48px 16px', textAlign: 'center' }}>
          <Icon name="RefreshCw" size={24} className="icon-spin" style={{ color: 'var(--c-primario)', marginBottom: '12px' }} />
          <p style={{ fontSize: '13.5px', color: 'var(--c-texto-suave)', margin: 0 }}>
            Consultando registros y salvaguardas de privacidad…
          </p>
        </div>
      </div>
    );
  }

  // 2. Estado de Error
  if (loadError) {
    return (
      <div className="agent-page agent-page--privacy">
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
        <div
          className="alert-banner danger"
          role="alert"
          style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="AlertTriangle" size={16} />
            <div>
              <strong>Error al cargar la información:</strong> {loadError}
            </div>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={reload}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const totalRecordsCount =
    (summary?.checkins?.length || 0) +
    (summary?.journals?.length || 0) +
    (summary?.support?.length || 0);

  const tabs = [
    {
      id: 'safeguards',
      label: 'Salvaguardas & Quién ve qué',
      icon: 'ShieldCheck'
    },
    {
      id: 'records',
      label: 'Mi Registro de Datos',
      icon: 'FileLock',
      count: totalRecordsCount
    },
    {
      id: 'habeas',
      label: 'Derechos & Trámites',
      icon: 'Scale',
      count: summary?.requests?.length || 0
    }
  ];

  return (
    <div className="agent-page agent-page--privacy">
      {/* Subnavegación de retorno */}
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

      {/* Cabecera institucional sobria */}
      <header className="page-header" style={{ marginBottom: '20px' }}>
        <h1 className="page-title">Centro de Datos y Privacidad del Agente</h1>
        <p className="page-subtitle">
          Transparencia total sobre tu información, quién tiene acceso y tus derechos bajo la Ley Estatutaria 1581 de 2012.
        </p>
      </header>

      {/* Barra de pestañas WAI-ARIA */}
      <div className="agent-privacy-tabs" role="tablist" aria-label="Pestañas de gestión de datos personales y privacidad">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              className={`agent-privacy-tab ${isActive ? 'agent-privacy-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
            >
              <Icon name={tab.icon} size={15} />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`agent-privacy-tab-badge ${isActive ? 'is-active' : ''}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Pestaña 1: Salvaguardas & Quién ve qué */}
      <div
        id="panel-safeguards"
        role="tabpanel"
        aria-labelledby="tab-safeguards"
        hidden={activeTab !== 'safeguards'}
        className="privacy-tab-content"
      >
        <PrivacyVisibilityMatrix />
        <ConsentSummaryCard consent={summary.consent} formatDate={formatDate} />
      </div>

      {/* Pestaña 2: Mi Registro de Datos */}
      <div
        id="panel-records"
        role="tabpanel"
        aria-labelledby="tab-records"
        hidden={activeTab !== 'records'}
        className="privacy-tab-content"
      >
        <AgentRecordsExplorer
          summary={summary}
          formatDate={formatDate}
          onSelectForRectification={handleSelectForRectification}
        />
      </div>

      {/* Pestaña 3: Derechos & Trámites Habeas Data */}
      <div
        id="panel-habeas"
        role="tabpanel"
        aria-labelledby="tab-habeas"
        hidden={activeTab !== 'habeas'}
        className="privacy-tab-content"
      >
        <HabeasDataActionCenter
          rectificationText={rectificationText}
          setRectificationText={setRectificationText}
          handleRectificationSubmit={handleRectificationSubmit}
          rectificationFeedback={rectificationFeedback}
          onOpenSuppressionModal={() => setIsSuppressionModalOpen(true)}
          portabilityFiles={portabilityFiles}
          handleDownloadPortability={handleDownloadPortability}
        />

        <HabeasRequestsTimeline requests={summary.requests} formatDate={formatDate} />
      </div>

      {/* Modal Seguro de Confirmación para Supresión */}
      <SuppressionConfirmModal
        isOpen={isSuppressionModalOpen}
        onClose={() => setIsSuppressionModalOpen(false)}
        suppressionConfirmText={suppressionConfirmText}
        setSuppressionConfirmText={setSuppressionConfirmText}
        handleSuppressionSubmit={async () => {
          await handleSuppressionSubmit();
          setIsSuppressionModalOpen(false);
        }}
        suppressionFeedback={suppressionFeedback}
        isSuppressionConfirmed={isSuppressionConfirmed}
      />
    </div>
  );
}
