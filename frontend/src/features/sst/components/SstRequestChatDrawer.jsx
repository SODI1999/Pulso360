// frontend/src/features/sst/components/SstRequestChatDrawer.jsx
/**
 * @file SstRequestChatDrawer.jsx
 * @description Panel lateral de atención de chat preventivo para especialistas SST,
 * directamente vinculado a un Radicado Formal de Acompañamiento (RF-10).
 * Maneja activación de canal, mensajes en tiempo real (WebSockets + PostgreSQL),
 * atajos ergonómicos y cierre formal del caso.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSocket } from '../../../core/socket/socketClient';
import { useChatDelivery } from '../../../core/socket/useChatDelivery';
import { useModalA11y } from '../../../core/hooks/useModalA11y';
import { chatService } from '../../../core/api/chatService';
import { Icon } from '../../../core/components/Icon';

export function SstRequestChatDrawer({ ticket, onClose, onSessionChanged }) {
  const { socket } = useSocket();

  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const { isSending, sendError, sendMessage } = useChatDelivery(socket, session?.id);
  const [isActivating, setIsActivating] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeNotes, setCloseNotes] = useState('');
  const [targetRequestStatus, setTargetRequestStatus] = useState('Cerrada');
  const [isClosing, setIsClosing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [closeError, setCloseError] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const drawerRef = useRef(null);
  const closeModalRef = useRef(null);
  useModalA11y({ isOpen: !showCloseModal, onClose, modalRef: drawerRef });
  useModalA11y({ isOpen: showCloseModal, onClose: () => { if (!isClosing) setShowCloseModal(false); }, modalRef: closeModalRef });

  // 1. Cargar el estado del chat del radicado
  const fetchChat = useCallback(async () => {
    if (!ticket?.id) return;
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const res = await chatService.getChatByRequest(ticket.id);
      const chatSession = res?.session || res?.data?.session;
      const chatMessages = res?.messages || res?.data?.messages || [];
      if (chatSession) {
        setSession(chatSession);
        setMessages(chatMessages);
      } else {
        setSession(null);
        setMessages([]);
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.error?.message || err.message || 'Error al cargar la conversación del radicado.');
    } finally {
      setIsLoading(false);
    }
  }, [ticket?.id]);

  useEffect(() => {
    fetchChat();
  }, [fetchChat]);

  // 2. Suscripción a eventos de WebSockets
  useEffect(() => {
    function handleIncomingMessage(msg) {
      if (session?.id && msg.sessionId === session.id) {
        setMessages((prev) => {
          const matchIdx = prev.findIndex((m) =>
            m.id === msg.id || (msg.clientMsgId && (m.clientMsgId === msg.clientMsgId || m.id === msg.clientMsgId))
          );
          if (matchIdx !== -1) {
            const next = [...prev];
            next[matchIdx] = msg;
            return next;
          }
          return [...prev, msg];
        });
      }
    }

    function handleChatEnded(payload) {
      if (session?.id && payload.sessionId === session.id) {
        setSession((prev) => (prev ? { ...prev, status: 'cerrada' } : prev));
        if (onSessionChanged) onSessionChanged();
      }
    }

    socket.on('support:message:received', handleIncomingMessage);
    socket.on('support:chat:ended', handleChatEnded);

    return () => {
      socket.off('support:message:received', handleIncomingMessage);
      socket.off('support:chat:ended', handleChatEnded);
    };
  }, [socket, session?.id, onSessionChanged]);

  // 3. Scroll automático
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  // 4. Activar canal de chat preventivo para el radicado
  const handleActivateChat = async () => {
    try {
      setIsActivating(true);
      setErrorMsg(null);
      const res = await chatService.activateChatForRequest(ticket.id);
      const chatSession = res?.session || res?.data?.session;
      const chatMessages = res?.messages || res?.data?.messages || [];
      if (chatSession) {
        setSession(chatSession);
        setMessages(chatMessages);
        if (onSessionChanged) onSessionChanged();
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.error?.message || 'No fue posible activar el chat del radicado.');
    } finally {
      setIsActivating(false);
    }
  };

  // 5. Enviar mensaje del especialista SST con reconciliación por clientMsgId
  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || !session?.id || session.status !== 'activa' || isSending) return;
    const confirmed = await sendMessage(text);
    if (!confirmed) return;
    setMessages(previous => previous.some(message => message.id === confirmed.id)
      ? previous : [...previous, confirmed]);
    setInputText(previous => previous.trim() === text ? '' : previous);
  };

  // 6. Concluir formalmente el chat preventivo
  const handleConfirmClose = async () => {
    if (!session?.id) return;
    try {
      setIsClosing(true);
      setCloseError(null);
      await chatService.closeSession(session.id, {
        reason: 'ATENCION_CONCLUIDA',
        notes: closeNotes.trim(),
        targetRequestStatus
      });
      setSession((prev) => (prev ? { ...prev, status: 'cerrada' } : prev));
      setShowCloseModal(false);
      if (onSessionChanged) onSessionChanged();
    } catch (err) {
      setCloseError(err?.response?.data?.error?.message || 'No fue posible cerrar la conversación. Puedes volver a intentarlo.');
    } finally {
      setIsClosing(false);
    }
  };

  const isAnon = ticket.mode === 'anonimo';
  const isClosed = session?.status === 'cerrada';
  const isActive = session?.status === 'activa';

  return (
    <aside className="sst-chat-drawer-overlay" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <div className="sst-chat-drawer-panel" ref={drawerRef} tabIndex={-1}>
        {/* Cabecera del Drawer */}
        {/* Cabecera compacta y profesional del Chat */}
        <header className="sst-drawer-header">
          <div className="sst-drawer-user-info">
            <div className={`sst-drawer-avatar ${isAnon ? 'is-anon' : ''}`} aria-hidden="true">
              {isAnon ? (
                <Icon name="eyeOff" size={17} />
              ) : (
                <span>
                  {ticket.userName
                    ? ticket.userName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : 'AG'}
                </span>
              )}
              {isActive && <span className="sst-avatar-online-dot" title="En vivo" />}
            </div>

            <div className="sst-drawer-titles">
              <div className="sst-drawer-name-row">
                <h2 id="drawer-title" className="sst-drawer-name">
                  {isAnon ? 'Solicitante Anónimo' : (ticket.userName || 'Agente')}
                </h2>
                {isActive && (
                  <span className="chat-status-pill live">
                    <span className="chat-status-dot" />
                    <span>En vivo</span>
                  </span>
                )}
              </div>
              <div className="sst-drawer-meta-line">
                <span className="sst-meta-code">{ticket.code || ticket.id}</span>
              </div>
            </div>
          </div>

          <div className="sst-drawer-header-actions">
            {isActive && (
              <button
                type="button"
                className="btn btn-secondary btn-sm sst-btn-conclude"
                onClick={() => setShowCloseModal(true)}
              >
                <Icon name="checkCircle" size={14} />
                <span>Concluir caso</span>
              </button>
            )}
            <button
              type="button"
              className="sst-btn-icon-close"
              onClick={onClose}
              aria-label="Cerrar panel lateral"
              title="Cerrar panel"
            >
              <Icon name="x" size={18} />
            </button>
          </div>
        </header>

        {/* Modal canónico y accesible de confirmación de cierre */}
        {showCloseModal && (
          <div className="modal-overlay active" role="dialog" aria-modal="true" aria-labelledby="modalCloseTitle">
            <div className="modal-box sst-close-modal-box" ref={closeModalRef} tabIndex={-1}>
              <div className="modal-header">
                <div>
                  <h2 id="modalCloseTitle" className="modal-title">
                    Concluir orientación preventiva SG-SST
                  </h2>
                  <div className="modal-subtitle">
                    {ticket.code || ticket.id} · Radicado de acompañamiento ocupacional
                  </div>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setShowCloseModal(false)}
                  aria-label="Cerrar modal"
                  disabled={isClosing}
                >
                  <Icon name="x" size={18} />
                </button>
              </div>

              <div>
                <p className="sst-modal-disclaimer">
                  El canal pasará a <strong>solo lectura</strong>. Sus mensajes y las notas de cierre permanecerán en el historial del radicado.
                </p>

                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label" style={{ marginBottom: 'var(--space-2)' }}>
                    Estado posterior del radicado formal de acompañamiento:
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                      <input
                        type="radio"
                        name="targetRequestStatus"
                        value="Cerrada"
                        checked={targetRequestStatus === 'Cerrada'}
                        onChange={(e) => setTargetRequestStatus(e.target.value)}
                        disabled={isClosing}
                        style={{ marginTop: '2px' }}
                      />
                      <span>
                        <strong>Concluir radicado formalmente (Pasa a &quot;Cerrada&quot;)</strong>
                        <span style={{ display: 'block', fontSize: '12px', color: 'var(--c-texto-mutado)' }}>
                          El caso finaliza. Tanto el radicado como el canal de chat pasan a estado de consulta histórica.
                        </span>
                      </span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                      <input
                        type="radio"
                        name="targetRequestStatus"
                        value="En gestion"
                        checked={targetRequestStatus === 'En gestion'}
                        onChange={(e) => setTargetRequestStatus(e.target.value)}
                        disabled={isClosing}
                        style={{ marginTop: '2px' }}
                      />
                      <span>
                        <strong>Mantener en seguimiento formal (Permanece &quot;En gestión&quot;)</strong>
                        <span style={{ display: 'block', fontSize: '12px', color: 'var(--c-texto-mutado)' }}>
                          Finaliza la sesión de chat interactiva actual, pero el radicado queda abierto para acciones adicionales de SST.
                        </span>
                      </span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="sstCloseNotesInput">
                    Notas de cierre y acuerdos de orientación <span style={{ color: 'var(--c-critico)' }}>*</span>
                  </label>
                  <textarea
                    id="sstCloseNotesInput"
                    className="form-input form-textarea"
                    rows={4}
                    placeholder="Describe las micropausas sugeridas, acuerdos de seguimiento o ajuste ergonómico realizado…"
                    value={closeNotes}
                    onChange={(e) => setCloseNotes(e.target.value)}
                    maxLength={500}
                    required
                    autoFocus
                    disabled={isClosing}
                  />
                  <div className="sst-form-char-count">
                    <span>Notas de cierre del radicado</span>
                    <span>{closeNotes.length} / 500 caracteres</span>
                  </div>
                </div>

                {closeError && <p className="alert-banner danger" role="alert">{closeError}</p>}
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowCloseModal(false)}
                    disabled={isClosing}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleConfirmClose}
                    disabled={isClosing || !closeNotes.trim()}
                  >
                    <Icon name="checkCircle" size={14} />
                    <span>{isClosing ? 'Cerrando sesión…' : 'Confirmar cierre formal'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cuerpo del Drawer */}
        <div className="sst-drawer-body">
          {isLoading ? (
            <div className="sst-drawer-loading" role="status">
              <Icon name="clock" size={20} />
              <span>Cargando conversación del radicado…</span>
            </div>
          ) : errorMsg && !session ? (
            <div className="alert-banner danger" role="alert">
              <Icon name="alertTriangle" size={16} />
              <span>{errorMsg}</span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={fetchChat}>Reintentar carga</button>
            </div>
          ) : !session ? (
            (ticket.status === 'Cerrada' || ticket.status === 'Atendida') ? (
              <div className="sst-drawer-closed-banner" style={{ margin: 'var(--space-6) var(--space-4)', padding: 'var(--space-5)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <Icon name="checkCircle" size={24} />
                <strong style={{ fontSize: '14px', color: 'var(--c-texto)' }}>Radicado concluido sin canal de chat</strong>
                <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--c-texto-suave)', lineHeight: 1.4 }}>
                  Este caso fue gestionado y finalizado formalmente mediante el flujo de radicado sin requerir una sesión de chat interactiva en vivo.
                </p>
              </div>
            ) : (
              <div className="sst-drawer-activate-callout">
                <Icon name="MessagesSquare" size={32} />
                <h3>Este radicado no tiene chat preventivo iniciado</h3>
                <p>
                  Al hacer clic en el botón inferior, se creará la sala interactiva para este radicado,
                  se actualizará el estado del caso a <strong>En gestión</strong> y se notificará en tiempo real al agente.
                </p>
                <button
                  type="button"
                  className="btn btn-primary sst-activate-big-btn"
                  onClick={handleActivateChat}
                  disabled={isActivating}
                >
                  <Icon name="MessagesSquare" size={16} />
                  <span>{isActivating ? 'Activando canal…' : 'Iniciar chat preventivo ahora'}</span>
                </button>
              </div>
            )
          ) : (
            <div className="sst-drawer-chat-stream">
              {isAnon && <p className="chat-privacy-note">El nombre y el identificador de cuenta del agente no se muestran. El contenido que comparta puede revelar su identidad.</p>}
              {sendError && <p className="chat-delivery-feedback alert-banner danger" role="alert">{sendError}</p>}
              {isSending && <p className="chat-delivery-feedback" role="status">Esperando confirmación del envío…</p>}
              {/* Contenedor de mensajes */}
              <div ref={messagesEndRef} className="sst-drawer-messages-list" role="log" aria-live="polite">
                {messages.map((m) => {
                  const isSst = m.senderRole === 'SST';
                  const isSys = m.senderRole === 'SISTEMA';

                  if (isSys) {
                    return (
                      <div key={m.id} className="embedded-chat-msg system-msg">
                        <Icon name="info" size={14} />
                        <span>{m.text}</span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={m.id}
                      className={`embedded-chat-bubble-wrap ${isSst ? 'msg-outgoing' : 'msg-incoming'}`}
                    >
                      <div className="embedded-chat-bubble">
                        <div className="embedded-msg-meta">
                          <strong className="embedded-msg-sender">
                            {isSst ? 'Tú (SST)' : (m.senderName || 'Agente')}
                          </strong>
                          <span className="embedded-msg-time">
                            {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p className="embedded-msg-text">{m.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer: Input o Banner cerrado */}
              {isClosed ? (
                <div className="sst-drawer-closed-banner">
                  <Icon name="checkCircle" size={16} />
                  <span>
                    Caso concluido formalmente. El chat se encuentra en modo de solo lectura para trazabilidad SG-SST.
                  </span>
                </div>
              ) : (
                <form
                  className="sst-drawer-composer"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                >
                  <div className="sst-composer-input-wrap">
                    <input
                      ref={inputRef}
                      type="text"
                      className="form-input sst-composer-input"
                      placeholder="Escribe tu recomendación ocupacional o respuesta preventiva… (Enter para enviar)"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      maxLength={800}
                      disabled={isSending}
                      aria-label="Recomendación o respuesta para el agente"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary sst-composer-submit-btn"
                    disabled={!inputText.trim() || isSending}
                    aria-label="Enviar recomendación preventiva"
                  >
                    <Icon name="send" size={16} />
                    <span>{isSending ? 'Enviando…' : 'Enviar'}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

SstRequestChatDrawer.propTypes = {
  ticket: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSessionChanged: PropTypes.func
};
