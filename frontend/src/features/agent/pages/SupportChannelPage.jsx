// src/features/agent/pages/SupportChannelPage.jsx
// Canal voluntario de solicitudes de orientación preventiva y acompañamiento con SST (RF-10)
// Integrado formalmente al ciclo de vida de Radicados (SG-SST, Ley 1581 / Res. 2646)

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSupportChannel } from '../hooks/useSupportChannel';
import { Icon } from '../../../core/components/Icon';
import { SupportRequestForm } from '../components/SupportRequestForm';
import { SupportChatCard } from '../components/SupportChatCard';
import { SomaticBreathingModal } from '../components/SomaticBreathingModal';
import { chatService } from '../../../core/api/chatService';
import { useSocket } from '../../../core/socket/socketClient';
import '../../../styles/apoyo.css';

/**
 * Página del Canal de Acompañamiento y Diálogo con SST (RF-10).
 * Permite radicar solicitudes, consultar estados y abrir el diálogo de un caso con SST.
 * La selección es explícita; las actualizaciones no cambian el caso que se está leyendo.
 *
 * @returns {JSX.Element} Vista del canal de apoyo del agente.
 */
export function SupportChannelPage() {
  const { socket } = useSocket();
  const [activeChatsMap, setActiveChatsMap] = useState({});
  const [chatSyncDegraded, setChatSyncDegraded] = useState(false);
  const [refreshError, setRefreshError] = useState('');
  const [activeTab, setActiveTab] = useState('cases'); // 'cases' | 'new-request'
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [chatDrafts, setChatDrafts] = useState({});
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);

  const tabsRef = useRef([]);
  const requestButtonsRef = useRef(new Map());
  const detailRef = useRef(null);
  const returnFocusRef = useRef(null);

  const {
    loading,
    loadError,
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
    isSubmitting,
    isRefreshingHistory,
    retryHistory,
    userRequests,
    isAnonymous,
    handleSubmit,
    reload
  } = useSupportChannel();

  const reloadRecords = useCallback(async () => {
    try {
      await reload();
      setRefreshError('');
    } catch (error) {
      setRefreshError(error.message);
    }
  }, [reload]);

  useEffect(() => {
    if (!loadError) setRefreshError('');
  }, [loadError]);

  // Cargar mapa de chats activos para los radicados del agente
  const loadActiveChatsMap = useCallback(async () => {
    try {
      const res = await chatService.getAgentActiveChatsMap();
      const entries = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      const map = {};
      entries.forEach((entry) => {
        if (entry.requestId) {
          map[entry.requestId] = entry;
        }
      });
      setActiveChatsMap(map);
      setChatSyncDegraded(false);
    } catch {
      // Modo degradado elegante: se preserva el estado local de radicados
      setChatSyncDegraded(true);
    }
  }, []);

  useEffect(() => {
    loadActiveChatsMap();
  }, [loadActiveChatsMap]);

  useEffect(() => {
    if (!loading && !loadError && selectedRequestId && !userRequests.some(r => r.id === selectedRequestId)) {
      returnFocusRef.current = selectedRequestId;
      setSelectedRequestId(null);
    }
  }, [userRequests, selectedRequestId, loading, loadError]);

  useEffect(() => {
    if (loading || loadError || activeTab !== 'cases') return;
    if (selectedRequestId) {
      detailRef.current?.focus();
    } else if (returnFocusRef.current) {
      const trigger = requestButtonsRef.current.get(returnFocusRef.current) || tabsRef.current[0];
      trigger?.focus();
      returnFocusRef.current = null;
    }
  }, [selectedRequestId, loading, loadError, activeTab]);

  const handleBackToCases = () => {
    returnFocusRef.current = selectedRequestId;
    setSelectedRequestId(null);
  };

  // Suscribirse a eventos de activación y finalización de chat en vivo y cambios de estado por SST
  useEffect(() => {
    function handleChatActivated(payload) {
      if (payload?.session?.requestId) {
        setActiveChatsMap((prev) => ({
          ...prev,
          [payload.session.requestId]: {
            sessionId: payload.session.id,
            requestId: payload.session.requestId,
            status: 'activa'
          }
        }));
        reloadRecords();
      }
    }

    function handleChatEnded(payload) {
      if (payload?.requestId) {
        setActiveChatsMap((prev) => ({
          ...prev,
          [payload.requestId]: {
            ...prev[payload.requestId],
            status: 'cerrada'
          }
        }));
        reloadRecords();
      }
    }

    function handleRequestStatusChanged(payload) {
      if (payload?.requestId) {
        reloadRecords();
        loadActiveChatsMap();
      }
    }

    socket.on('support:chat:activated', handleChatActivated);
    socket.on('support:chat:ended', handleChatEnded);
    socket.on('support:request:statusChanged', handleRequestStatusChanged);

    return () => {
      socket.off('support:chat:activated', handleChatActivated);
      socket.off('support:chat:ended', handleChatEnded);
      socket.off('support:request:statusChanged', handleRequestStatusChanged);
    };
  }, [socket, reloadRecords, loadActiveChatsMap]);

  // Navegación accesible por teclado entre pestañas (WAI-ARIA)
  const handleTabKeyDown = (e, index) => {
    const tabsCount = 2;
    let nextIndex = index;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabsCount;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tabsCount) % tabsCount;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabsCount - 1;
    } else {
      return;
    }
    e.preventDefault();
    const targetTab = nextIndex === 0 ? 'cases' : 'new-request';
    setActiveTab(targetTab);
    tabsRef.current[nextIndex]?.focus();
  };

  if (loading) return <p className="agent-page" role="status">Cargando tus registros…</p>;

  if (loadError && !consent) {
    return (
      <div className="agent-page support-editorial-page" role="alert">
        <div
          className="alert-banner danger"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}
        >
          <span>{loadError}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={reloadRecords}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

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
            Orientación preventiva y salud ocupacional gestionada exclusivamente por Seguridad y Salud en el Trabajo.
          </p>
        </header>

        <section className="support-blocked-block" aria-labelledby="blocked-heading">
          <h2 id="blocked-heading" className="support-blocked-title">
            Canal de acompañamiento individual no habilitado
          </h2>
          <p className="support-blocked-desc">
            La finalidad C3 de apoyo está inactiva en tus preferencias de consentimiento informado. Para que el equipo
            de SST pueda recibir solicitudes de acompañamiento y coordinar orientación ocupacional preventiva, es
            necesario habilitar esta autorización bajo la Ley 1581 de 2012. Las líneas públicas de apoyo y primeros auxilios
            continúan plenamente disponibles.
          </p>
          <div className="support-blocked-actions">
            <Link to="/consentimiento" className="btn-support-submit">
              <Icon name="shieldCheck" size={16} />
              <span>Gestionar finalidad C3 en consentimiento</span>
            </Link>
            <Link to="/apoyo-crisis" className="support-urgent-action">
              <Icon name="support" size={16} />
              <span>Ver ruta pública de apoyo y primeros auxilios</span>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const selectedRequest = userRequests.find((r) => r.id === selectedRequestId);
  const hasAnyActiveChat = userRequests.some((r) => activeChatsMap[r.id]?.status === 'activa');

  return (
    <div className={`agent-page support-workspace-root ${selectedRequest && activeTab === 'cases' ? 'has-selected-case' : ''}`}>
      {/* 1. Navegación superior sobria */}
      <nav className="agent-subnav" aria-label="Navegación secundaria">
        <button type="button" className="agent-back-btn" onClick={() => navigate('/agente/panel')}>
          <Icon name="arrowLeft" size={16} />
          <span>Volver al panel</span>
        </button>
      </nav>

      <header className="support-channel-header">
        <h1 className="support-page-title">Acompañamiento con SST</h1>
        <p className="support-page-subtitle">
          Solicita orientación sobre sobrecarga de llamadas, fatiga o ergonomía, y consulta el seguimiento de cada radicado.
        </p>

        {/* Barra de Acceso Rápido a Primeros Auxilios y Respiración Somática (AC-06) */}
        <div className="support-quick-bridge-bar" role="region" aria-label="Opciones de descompresión y apoyo inmediato">
          <div className="support-bridge-lead">
            <Icon name="heartHandshake" size={15} />
            <span>Opciones para una pausa o apoyo inmediato</span>
          </div>
          <div className="support-bridge-actions">
            <button
              type="button"
              className="support-bridge-btn support-bridge-btn--somatic"
              onClick={() => setIsBreathingModalOpen(true)}
              title="Abrir pausa de respiración somática 4-2-6"
            >
              <Icon name="activity" size={14} />
              <span>Abrir pausa de respiración</span>
            </button>
            <Link
              to="/apoyo-crisis"
              className="support-bridge-btn support-bridge-btn--crisis"
              title="Ir a primeros auxilios psicológicos y Línea 106"
            >
              <Icon name="support" size={14} />
              <span>Consultar apoyo inmediato</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Navegación por Pestañas WAI-ARIA (AC-01) */}
      <div className="support-tabs-nav" role="tablist" aria-label="Secciones del canal de acompañamiento">
        <button
          ref={(el) => (tabsRef.current[0] = el)}
          id="tab-cases"
          type="button"
          role="tab"
          aria-selected={activeTab === 'cases'}
          aria-controls="panel-cases"
          tabIndex={activeTab === 'cases' ? 0 : -1}
          className={`support-tab-btn ${activeTab === 'cases' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('cases')}
          onKeyDown={(e) => handleTabKeyDown(e, 0)}
        >
          <Icon name="MessagesSquare" size={16} />
          <span>Mis radicados</span>
          <span className="support-tab-count">{userRequests.length}</span>
          {hasAnyActiveChat && (
            <span className="support-open-channel-note">Canal abierto</span>
          )}
        </button>

        <button
          ref={(el) => (tabsRef.current[1] = el)}
          id="tab-new-request"
          type="button"
          role="tab"
          aria-selected={activeTab === 'new-request'}
          aria-controls="panel-new-request"
          tabIndex={activeTab === 'new-request' ? 0 : -1}
          className={`support-tab-btn ${activeTab === 'new-request' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('new-request')}
          onKeyDown={(e) => handleTabKeyDown(e, 1)}
        >
          <Icon name="plus" size={15} />
          <span>Solicitar acompañamiento</span>
        </button>
      </div>

      {(refreshError || loadError) && (
        <div className="support-sync-feedback" role="alert">
          <span>No se pudo actualizar el historial. {loadError || refreshError}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={reloadRecords}>Reintentar actualización</button>
        </div>
      )}

      {chatSyncDegraded && (
        <div className="support-sync-feedback" role="status">
          <span>No se pudieron actualizar los estados de conversación. Puedes abrir un radicado para consultar su canal.</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={loadActiveChatsMap}>Actualizar estados</button>
        </div>
      )}

      {/* 4. Tabpanel: Mis Radicados y Diálogo SST */}
      {activeTab === 'cases' && (
        <section
          id="panel-cases"
          role="tabpanel"
          aria-labelledby="tab-cases"
          className="support-tabpanel"
        >
          {userRequests.length === 0 ? (
            <div className="support-empty-workspace">
              <div className="support-empty-icon-wrap" aria-hidden="true">
                <Icon name="MessagesSquare" size={36} />
              </div>
              <strong className="support-empty-title">No tienes solicitudes registradas actualmente</strong>
              <p className="support-empty-desc">
                Si experimentas sobrecarga por volumen de llamadas, fatiga física o desgaste emocional, puedes radicar una solicitud preventiva para coordinar orientación personalizada con el equipo de Salud Ocupacional.
              </p>
              <button
                type="button"
                className="btn-support-submit"
                onClick={() => setActiveTab('new-request')}
              >
                <Icon name="plus" size={15} />
                <span>Radicar mi primera solicitud</span>
              </button>
            </div>
          ) : (
            <div className={`support-workspace-grid ${selectedRequest ? 'is-detail-open' : ''}`}>
              {/* Columna Izquierda: Lista de Radicados (Master) */}
              <div className="support-cases-master" aria-label="Lista de solicitudes radicadas">
                <div className="support-cases-master-head">
                  <h2 className="support-cases-master-title">Radicados institucionales</h2>
                  <span className="support-cases-master-subtitle">Selecciona un radicado para consultar o chatear</span>
                </div>

                <ul className="support-cases-list">
                  {userRequests.map((req) => {
                    const chatEntry = activeChatsMap[req.id];
                    const isChatActive = chatEntry?.status === 'activa';
                    const isChatClosed = chatEntry?.status === 'cerrada';
                    const isSelected = req.id === selectedRequestId;

                    return (
                      <li key={req.id}>
                        <button
                          ref={element => {
                            if (element) requestButtonsRef.current.set(req.id, element);
                            else requestButtonsRef.current.delete(req.id);
                          }}
                          type="button"
                          className={`support-case-card ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => setSelectedRequestId(req.id)}
                          aria-current={isSelected ? 'true' : undefined}
                          aria-controls="support-case-detail"
                        >
                          <span className="support-case-card-header">
                            <strong className="support-case-code">{req.code || req.id}</strong>
                            <span className={`support-case-mode ${req.mode === 'anonimo' ? 'is-anon' : ''}`}>
                              <Icon name={req.mode === 'anonimo' ? 'eyeOff' : 'shieldCheck'} size={12} />
                              <span>{req.mode === 'anonimo' ? 'Nombre oculto a SST' : 'Identificada'}</span>
                            </span>
                          </span>

                          <span className="support-case-reason">
                            {req.reason}
                          </span>
                          <span className="support-case-status">{req.status}</span>

                          <span className="support-case-card-foot">
                            <span className="support-case-date">
                              {req.date || 'Fecha no disponible'}
                            </span>
                            {isChatActive && (
                              <span className="support-live-chat-pill">
                                <span>Canal abierto</span>
                              </span>
                            )}
                            {isChatClosed && (
                              <span className="support-closed-chat-pill">
                                <span>Concluido</span>
                              </span>
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Columna Derecha: Diálogo SST y Expediente Focalizado (Detail) */}
              <div id="support-case-detail" className="support-cases-detail">
                {selectedRequest ? (
                  <div className="support-detail-wrapper">
                    <div className="support-detail-heading">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={handleBackToCases}>
                        <Icon name="arrowLeft" size={16} />
                        <span>Volver a radicados</span>
                      </button>
                      <h2 ref={detailRef} tabIndex={-1}>Radicado {selectedRequest.code || selectedRequest.id}</h2>
                    </div>
                    <SupportChatCard
                      key={selectedRequest.id}
                      requestId={selectedRequest.id}
                      requestCode={selectedRequest.code || selectedRequest.id}
                      isAnonymous={selectedRequest.mode === 'anonimo'}
                      inputText={chatDrafts[selectedRequest.id] || ''}
                      setInputText={update => setChatDrafts(previous => ({
                        ...previous,
                        [selectedRequest.id]: typeof update === 'function'
                          ? update(previous[selectedRequest.id] || '') : update
                      }))}
                      onChatClosed={() => loadActiveChatsMap()}
                    />
                  </div>
                ) : (
                  <div className="support-no-selection">
                    <Icon name="MessagesSquare" size={32} />
                    <p>Selecciona un radicado de la lista para ver el canal de diálogo y estado de atención.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 5. Tabpanel: Nueva Solicitud Guiada */}
      {activeTab === 'new-request' && (
        <section
          id="panel-new-request"
          role="tabpanel"
          aria-labelledby="tab-new-request"
          className="support-tabpanel"
        >
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
            isSubmitting={isSubmitting}
            isRefreshingHistory={isRefreshingHistory}
            onRetryHistory={retryHistory}
          />
        </section>
      )}

      {/* 6. Modal In-Situ de Respiración Somática (AC-06) */}
      <SomaticBreathingModal
        isOpen={isBreathingModalOpen}
        onClose={() => setIsBreathingModalOpen(false)}
      />
    </div>
  );
}
