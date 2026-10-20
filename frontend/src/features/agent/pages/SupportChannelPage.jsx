// src/features/agent/pages/SupportChannelPage.jsx
// Canal voluntario de solicitudes de orientación preventiva y acompañamiento con SST (RF-10)
// Integrado formalmente al ciclo de vida de Radicados (SG-SST, Ley 1581 / Res. 2646)

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSupportChannel } from '../hooks/useSupportChannel';
import { Icon } from '../../../core/components/Icon';
import { SupportRequestForm } from '../components/SupportRequestForm';
import { SupportChatCard } from '../components/SupportChatCard';
import { SupportTimelineBadge } from '../components/SupportTimelineBadge';
import { SomaticBreathingModal } from '../components/SomaticBreathingModal';
import { chatService } from '../../../core/api/chatService';
import { useSocket } from '../../../core/socket/socketClient';
import '../../../styles/apoyo.css';

/**
 * Página del Canal de Acompañamiento y Diálogo con SST (RF-10).
 * Permite radicar solicitudes anónimas o confidenciales, consultar estados SLA
 * de radicado (SG-SST), interactuar por chat seguro en vivo y acceder a pausas somáticas.
 *
 * @returns {JSX.Element} Vista del canal de apoyo del agente.
 */
export function SupportChannelPage() {
  const { socket } = useSocket();
  const [activeChatsMap, setActiveChatsMap] = useState({});
  const [, setChatSyncDegraded] = useState(false);
  const [activeTab, setActiveTab] = useState('cases'); // 'cases' | 'new-request'
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);

  const tabsRef = useRef([]);

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
    userRequests,
    isAnonymous,
    handleSubmit,
    reload
  } = useSupportChannel();

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

  // Selección inteligente del radicado prioritario al cargar
  useEffect(() => {
    if (userRequests && userRequests.length > 0) {
      // Si no hay seleccionado o el seleccionado ya no existe
      const exists = userRequests.some((r) => r.id === selectedRequestId);
      if (!selectedRequestId || !exists) {
        // Priorizar uno que tenga chat en vivo activo
        const activeReq = userRequests.find((r) => activeChatsMap[r.id]?.status === 'activa');
        setSelectedRequestId(activeReq ? activeReq.id : userRequests[0].id);
      }
    }
  }, [userRequests, activeChatsMap, selectedRequestId]);

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
        setSelectedRequestId(payload.session.requestId);
        setActiveTab('cases');
        if (reload) reload();
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
        if (reload) reload();
      }
    }

    function handleRequestStatusChanged(payload) {
      if (payload?.requestId) {
        if (reload) reload();
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
  }, [socket, reload, loadActiveChatsMap]);

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

  if (loadError) {
    return (
      <div className="agent-page support-editorial-page" role="alert">
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
    <div className="agent-page support-workspace-root">
      {/* 1. Navegación superior sobria */}
      <nav className="agent-subnav" aria-label="Navegación secundaria">
        <button type="button" className="agent-back-btn" onClick={() => navigate('/agente/panel')}>
          <Icon name="arrowLeft" size={16} />
          <span>Volver al panel</span>
        </button>
      </nav>

      {/* 2. Hero Editorial con Situación de Diálogo (Operador BPO y Especialista SST) */}
      <header className="support-hero-banner" aria-label="Canal de acompañamiento y orientación con SST">
        <div className="support-hero-card">
          <div className="support-hero-text">
            <span className="support-hero-eyebrow">
              <Icon name="shieldCheck" size={14} />
              Salud Ocupacional · Res. 2646 de 2008
            </span>
            <h1 className="support-hero-title">Canal de Acompañamiento con SST</h1>
            <p className="support-hero-desc">
              Espacio preventivo y confidencial para coordinar orientación en fatiga de turno, sobrecarga en llamadas y ergonomía. Tu conversación se gestiona exclusivamente con el equipo de Seguridad y Salud en el Trabajo, con reserva técnica y sin impacto en métricas operativas.
            </p>
            <div className="support-hero-tags">
              <span className="support-hero-tag">
                <Icon name="lock" size={13} />
                Acceso restringido titular y SST
              </span>
              <span className="support-hero-tag">
                <Icon name="clock" size={13} />
                SLA habitual: 24 h hábiles
              </span>
            </div>
          </div>
          <div className="support-hero-image-wrap" aria-hidden="true">
            <img
              src="/assets/fotos/bpo-agent-support-dialogue.jpg"
              alt="Operador de contact center en sesión de diálogo y bienestar preventivo con especialista de SST"
              className="support-hero-photo"
              onError={(e) => {
                // Fallback suave en caso de formato
                if (!e.currentTarget.src.endsWith('.webp')) {
                  e.currentTarget.src = '/assets/fotos/bpo-agent-support-dialogue.webp';
                }
              }}
            />
          </div>
        </div>

        {/* Barra de Acceso Rápido a Primeros Auxilios y Respiración Somática (AC-06) */}
        <div className="support-quick-bridge-bar" role="region" aria-label="Opciones de descompresión y apoyo inmediato">
          <div className="support-bridge-lead">
            <Icon name="heartHandshake" size={15} />
            <span>¿Requieres descompresión inmediata durante tu turno?</span>
          </div>
          <div className="support-bridge-actions">
            <button
              type="button"
              className="support-bridge-btn support-bridge-btn--somatic"
              onClick={() => setIsBreathingModalOpen(true)}
              title="Abrir pausa de respiración somática 4-2-6"
            >
              <Icon name="activity" size={14} />
              <span>Pausa somática 4-2-6</span>
            </button>
            <Link
              to="/apoyo-crisis"
              className="support-bridge-btn support-bridge-btn--crisis"
              title="Ir a primeros auxilios psicológicos y Línea 106"
            >
              <Icon name="support" size={14} />
              <span>Primeros auxilios (Línea 106)</span>
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
          <span>Mis Radicados & Diálogo SST</span>
          <span className="support-tab-count">{userRequests.length}</span>
          {hasAnyActiveChat && (
            <span className="support-tab-pulse-dot" title="Tienes un chat en vivo activo con SST" aria-label="Chat activo" />
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
          <span>Nueva Solicitud a SST</span>
        </button>
      </div>

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
            <div className="support-workspace-grid">
              {/* Columna Izquierda: Lista de Radicados (Master) */}
              <div className="support-cases-master" aria-label="Lista de solicitudes radicadas">
                <div className="support-cases-master-head">
                  <h2 className="support-cases-master-title">Radicados institucionales</h2>
                  <span className="support-cases-master-subtitle">Selecciona un radicado para consultar o chatear</span>
                </div>

                <div className="support-cases-list" role="list">
                  {userRequests.map((req) => {
                    const chatEntry = activeChatsMap[req.id];
                    const isChatActive = chatEntry?.status === 'activa';
                    const isChatClosed = chatEntry?.status === 'cerrada';
                    const isSelected = req.id === selectedRequestId;

                    return (
                      <article
                        key={req.id}
                        role="listitem"
                        className={`support-case-card ${isSelected ? 'is-selected' : ''} ${isChatActive ? 'has-live-chat' : ''}`}
                        onClick={() => setSelectedRequestId(req.id)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedRequestId(req.id);
                          }
                        }}
                        aria-current={isSelected ? 'true' : undefined}
                      >
                        <div className="support-case-card-header">
                          <strong className="support-case-code">{req.code || req.id}</strong>
                          <span className={`support-case-mode ${req.mode === 'anonimo' ? 'is-anon' : ''}`}>
                            <Icon name={req.mode === 'anonimo' ? 'eyeOff' : 'shieldCheck'} size={12} />
                            <span>{req.mode === 'anonimo' ? 'Anónima' : 'Confidencial'}</span>
                          </span>
                        </div>

                        <div className="support-case-reason">
                          {req.reason}
                        </div>

                        <SupportTimelineBadge
                          status={req.status}
                          hasActiveChat={isChatActive}
                          isChatClosed={isChatClosed}
                        />

                        <div className="support-case-card-foot">
                          <span className="support-case-date">
                            {req.date || 'Reciente'} · SLA: {req.sla || '24 h'}
                          </span>
                          {isChatActive && (
                            <span className="support-live-chat-pill">
                              <span className="support-live-dot" />
                              <span>Chat en vivo</span>
                            </span>
                          )}
                          {isChatClosed && (
                            <span className="support-closed-chat-pill">
                              <span>Concluido</span>
                            </span>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              {/* Columna Derecha: Diálogo SST y Expediente Focalizado (Detail) */}
              <div className="support-cases-detail" aria-label="Sala de diálogo y seguimiento con SST">
                {selectedRequest ? (
                  <div className="support-detail-wrapper">
                    <SupportChatCard
                      requestId={selectedRequest.id}
                      requestCode={selectedRequest.code || selectedRequest.id}
                      isAnonymous={selectedRequest.mode === 'anonimo'}
                      onChatClosed={() => loadActiveChatsMap()}
                      onBack={() => setSelectedRequestId(null)}
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
            onSubmit={async (e) => {
              await handleSubmit(e);
            }}
            feedback={feedback}
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
