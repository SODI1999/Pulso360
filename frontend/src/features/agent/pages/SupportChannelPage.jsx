// src/features/agent/pages/SupportChannelPage.jsx
// Canal voluntario de solicitudes de orientación preventiva y acompañamiento con SST (RF-10)
// Integrado formalmente al ciclo de vida de Radicados (SG-SST, Ley 1581 / Res. 2646)

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSupportChannel } from '../hooks/useSupportChannel';
import { Icon } from '../../../core/components/Icon';
import { SupportRequestForm } from '../components/SupportRequestForm';
import { SupportChatCard } from '../components/SupportChatCard';
import { chatService } from '../../../core/api/chatService';
import { useSocket } from '../../../core/socket/socketClient';
import '../../../styles/apoyo.css';

export function SupportChannelPage() {
  const { socket } = useSocket();
  const [activeChatsMap, setActiveChatsMap] = useState({});
  const [expandedChatRequestId, setExpandedChatRequestId] = useState(null);

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
    } catch {
      // Ignorar error de red no bloqueante
    }
  }, []);

  useEffect(() => {
    loadActiveChatsMap();
  }, [loadActiveChatsMap]);

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

  const toggleChatForRequest = (reqId) => {
    setExpandedChatRequestId((prev) => (prev === reqId ? null : reqId));
  };

  return (
    <div className="agent-page support-editorial-page">
      {/* Navegación superior sobria */}
      <nav className="agent-subnav" aria-label="Navegación secundaria">
        <button type="button" className="agent-back-btn" onClick={() => navigate('/agente/panel')}>
          <Icon name="arrowLeft" size={16} />
          <span>Volver al panel</span>
        </button>
      </nav>

      {/* Cabecera institucional editorial */}
      <header className="support-page-header">
        <h1 className="support-page-title">Canal de acompañamiento con SST</h1>
        <p className="support-page-subtitle">
          Canal preventivo para ergonomía, mitigación de fatiga de turno y coordinación de casos con Seguridad y Salud en el Trabajo.
          Toda solicitud formal genera un radicado institucional con trazabilidad protegida.
        </p>
      </header>

      {/* Formulario Estructurado de Radicación */}
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

      {/* Sección de Radicados con Chat Embebido */}
      <section className="support-history-section" aria-labelledby="history-heading">
        <div className="support-history-header">
          <div>
            <h2 id="history-heading" className="support-history-title">
              Mis solicitudes de acompañamiento ({userRequests.length})
            </h2>
            <p className="support-history-subtitle">
              Seguimiento a tus radicados. Cuando el especialista SST active la conversación, podrás chatear en vivo directamente desde aquí.
            </p>
          </div>
        </div>

        {userRequests.length === 0 ? (
          <div className="support-empty-state">
            <Icon name="support" size={32} className="support-empty-icon" />
            <strong className="support-empty-title">No tienes solicitudes registradas en este momento</strong>
            <p className="support-empty-desc">
              Cuando radiques una solicitud a SST, aquí podrás hacer seguimiento a su estado y conversar en vivo con el especialista asignado.
            </p>
          </div>
        ) : (
          <div className="support-requests-flow" role="list">
            {userRequests.map((req) => {
              const chatEntry = activeChatsMap[req.id];
              const isChatActive = chatEntry?.status === 'activa';
              const hasChatHistory = chatEntry?.status === 'cerrada';
              const isExpanded = expandedChatRequestId === req.id;

              return (
                <article key={req.id} className={`support-request-item ${isChatActive ? 'has-active-chat' : ''}`} role="listitem">
                  <div className="support-request-header">
                    <div className="support-request-header-left">
                      <strong className="support-request-code">{req.code || req.id}</strong>
                      <span className={`support-request-badge ${req.mode === 'anonimo' ? 'is-anon' : ''}`}>
                        <Icon name={req.mode === 'anonimo' ? 'eyeOff' : 'shieldCheck'} size={13} />
                        <span>{req.mode === 'anonimo' ? 'Modalidad Anónima' : 'Modalidad Confidencial'}</span>
                      </span>
                      {isChatActive && (
                        <span className="badge badge-ok">
                          <Icon name="CircleDot" size={12} />
                          <span>Chat preventivo habilitado por SST</span>
                        </span>
                      )}
                      {hasChatHistory && (
                        <span className="badge badge-neutral">
                          <Icon name="checkCircle" size={12} />
                          <span>Orientación concluida (Historial)</span>
                        </span>
                      )}
                    </div>

                    <div className="support-request-header-actions">
                      {isChatActive && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm support-open-chat-btn"
                          onClick={() => toggleChatForRequest(req.id)}
                          aria-expanded={isExpanded}
                        >
                          <Icon name="MessagesSquare" size={14} />
                          <span>{isExpanded ? 'Ocultar chat' : 'Entrar al chat con SST'}</span>
                        </button>
                      )}
                      {hasChatHistory && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm support-history-chat-btn"
                          onClick={() => toggleChatForRequest(req.id)}
                          aria-expanded={isExpanded}
                        >
                          <Icon name="MessagesSquare" size={14} />
                          <span>{isExpanded ? 'Ocultar historial' : 'Ver conversación'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="support-request-meta-grid">
                    <div>
                      <span className="support-meta-label">Motivo:</span> {req.reason}
                    </div>
                    <div>
                      <span className="support-meta-label">Estado:</span>
                      <span className={`support-meta-status status-${(req.status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                        {req.status}
                      </span>
                    </div>
                    <div>
                      <span className="support-meta-label">Atención estimada:</span> {req.sla || '24 h hábiles'}
                    </div>
                  </div>

                  {/* Detalle o chat embebido desplegado */}
                  {isExpanded && (
                    <div className="support-request-chat-container">
                      <SupportChatCard
                        requestId={req.id}
                        requestCode={req.code || req.id}
                        isAnonymous={req.mode === 'anonimo'}
                        onChatClosed={() => loadActiveChatsMap()}
                      />
                    </div>
                  )}

                  {!chatEntry && !isExpanded && (
                    <div className="support-request-pending-hint">
                      <Icon name="clock" size={13} />
                      <span>En espera de revisión por el equipo de SST. Si el caso amerita intervención interactiva, se habilitará el chat aquí.</span>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
