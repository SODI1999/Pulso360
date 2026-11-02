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
import { useChatScroll } from '../../../core/hooks/useChatScroll';
import { useModalA11y } from '../../../core/hooks/useModalA11y';
import { chatService } from '../../../core/api/chatService';
import { Icon } from '../../../core/components/Icon';
import { SstChatCloseForm } from './SstChatCloseForm';
import { getSupportUrgency } from '../utils/supportCasePresentation';
import '../../../styles/support-chat.css';

/**
 * Panel de atención SST por radicado, con una confirmación de cierre en la misma superficie.
 * @param {object} props Contexto autorizado del caso y acciones de su página.
 * @param {object} props.ticket Radicado devuelto por el servicio SST.
 * @param {string} props.inputText Borrador del radicado conservado en memoria del buzón.
 * @param {import('react').Dispatch<import('react').SetStateAction<string>>} props.setInputText Actualiza solo este borrador.
 * @param {Function} props.onClose Cierra el panel sin concluir la conversación.
 * @param {Function} [props.onSessionChanged] Refresca el buzón tras activación o cierre confirmado.
 * @returns {JSX.Element} Diálogo con historial, compositor, estados y confirmación.
 */
export function SstRequestChatDrawer({ ticket, inputText, setInputText, onClose, onSessionChanged }) {
  const { socket } = useSocket();

  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isSending, sendError, sendMessage } = useChatDelivery(socket, session?.id);
  const [isActivating, setIsActivating] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeNotes, setCloseNotes] = useState('');
  const [targetRequestStatus, setTargetRequestStatus] = useState('Cerrada');
  const [isClosing, setIsClosing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [closeError, setCloseError] = useState(null);

  const { containerRef, onScroll, hasNewMessages, scrollToLatest } = useChatScroll({
    messages,
    conversationId: session?.id,
    enabled: !showCloseModal && !isLoading && !errorMsg && Boolean(session)
  });
  const inputRef = useRef(null);
  const restoreComposerFocusRef = useRef(false);
  useEffect(() => {
    if (isSending || !restoreComposerFocusRef.current) return;
    restoreComposerFocusRef.current = false;
    if (document.activeElement === document.body || document.activeElement?.classList.contains('embedded-composer-send-btn')) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [isSending, sendError, messages]);
  const drawerRef = useRef(null);
  const closeModalRef = useRef(null);
  useModalA11y({
    isOpen: true,
    onClose: () => {
      if (isClosing) return;
      if (showCloseModal) setShowCloseModal(false);
      else onClose();
    },
    modalRef: showCloseModal ? closeModalRef : drawerRef
  });

  useEffect(() => {
    if (closeError) closeModalRef.current?.querySelector('#sst-close-error')?.focus();
  }, [closeError]);

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

  // Ajustar la altura del textarea dinámicamente según el contenido
  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    adjustTextareaHeight();
  };

  // 5. Enviar mensaje del especialista SST con reconciliación por clientMsgId
  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || !session?.id || session.status !== 'activa' || isSending) return;
    restoreComposerFocusRef.current = true;
    const confirmed = await sendMessage(text);
    if (!confirmed) return;
    scrollToLatest();
    setMessages(previous => previous.some(message => message.id === confirmed.id)
      ? previous : [...previous, confirmed]);
    setInputText(previous => {
      const next = previous.trim() === text ? '' : previous;
      if (next === '' && inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
      return next;
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper para agrupar mensajes por fecha calendario
  const shouldShowDateSeparator = (currentMsg, prevMsg) => {
    if (!currentMsg?.timestamp) return false;
    if (!prevMsg?.timestamp) return true;
    const currentDate = new Date(currentMsg.timestamp).toDateString();
    const prevDate = new Date(prevMsg.timestamp).toDateString();
    return currentDate !== prevDate;
  };

  const formatChatDateSeparator = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    }
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  // 6. Concluir formalmente el chat preventivo
  const handleConfirmClose = async () => {
    if (!session?.id || isClosing) return;
    if (!closeNotes.trim()) {
      setCloseError('Escribe las notas de cierre y los acuerdos antes de confirmar.');
      closeModalRef.current?.querySelector('textarea')?.focus();
      return;
    }
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
  const urgency = getSupportUrgency(ticket.urgency || ticket.severity);

  return (
    <aside className="sst-chat-drawer-overlay" role="dialog" aria-modal="true" aria-labelledby={showCloseModal ? 'modalCloseTitle' : 'drawer-title'}>
      <div className="sst-chat-drawer-panel" ref={drawerRef} tabIndex={-1}>
        <div className="sst-drawer-conversation" hidden={showCloseModal}>
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
              </div>

              <div className="sst-drawer-titles">
                <div className="sst-drawer-name-row">
                  <h2 id="drawer-title" className="sst-drawer-name">
                    {isAnon ? 'Solicitante con nombre oculto' : (ticket.userName || 'Agente')}
                  </h2>
                  {isActive && (
                    <span className="chat-status-pill live">
                      <span className="chat-status-dot" />
                      <span>Canal abierto</span>
                    </span>
                  )}
                  {isClosed && <span className="chat-status-pill closed">Solo lectura</span>}
                </div>
                <div className="sst-drawer-meta-line">
                  <span className="sst-meta-code">Radicado {ticket.code || ticket.id}</span>
                </div>
              </div>
            </div>

            <div className="sst-drawer-header-actions">
              {isActive && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm sst-btn-conclude"
                  onClick={() => setShowCloseModal(true)}
                  disabled={isSending}
                >
                  <Icon name="checkCircle" size={14} />
                  <span>Concluir conversación</span>
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

          <details className="sst-drawer-context">
            <summary tabIndex={0}>
              <span>Motivo y datos de solicitud</span>
              <span className={`sst-context-badge urgency-${urgency.tone}`}>Urgencia: {urgency.label}</span>
            </summary>
            <dl>
              <div><dt>Motivo</dt><dd>{ticket.reason || 'Sin motivo registrado'}</dd></div>
              <div><dt>Estado del radicado</dt><dd>{ticket.status || 'No registrado'}</dd></div>
              <div><dt>Plazo registrado</dt><dd>{ticket.sla || 'Sin plazo registrado'}</dd></div>
            </dl>
          </details>
          {/* Cuerpo del Drawer */}
          <div className="sst-drawer-body">
            {isLoading ? (
              <div className="sst-drawer-loading" role="status">
                <Icon name="clock" size={20} />
                <span>Cargando conversación del radicado…</span>
              </div>
            ) : errorMsg ? (
              <div className="sst-chat-state support-chat-state support-chat-state--error" role="alert">
                <Icon name="alertTriangle" size={16} />
                <span>{errorMsg}</span>
                <button type="button" className="btn btn-secondary btn-sm" onClick={fetchChat}>Reintentar carga</button>
              </div>
            ) : !session ? (
              (ticket.status === 'Cerrada' || ticket.status === 'Atendida') ? (
                <div className="sst-chat-state support-chat-state">
                  <Icon name="checkCircle" size={24} />
                  <strong>Radicado sin historial de chat</strong>
                  <p>
                    El estado de este radicado es {ticket.status}. No tiene una conversación de chat registrada.
                  </p>
                </div>
              ) : (
                <div className="sst-drawer-activate-callout">
                  <Icon name="MessagesSquare" size={32} />
                  <h3>Sin conversación abierta</h3>
                  <p>
                    Al abrir el canal podrás responder sobre este radicado. La solicitud pasará a <strong>En gestión</strong>.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary sst-activate-big-btn"
                    onClick={handleActivateChat}
                    disabled={isActivating}
                  >
                    <Icon name="MessagesSquare" size={16} />
                    <span>{isActivating ? 'Abriendo canal…' : 'Abrir conversación'}</span>
                  </button>
                </div>
              )
            ) : (
              <div className="sst-drawer-chat-stream">
                {isAnon && <p className="chat-privacy-note">El nombre y el identificador de cuenta del agente no se muestran. El contenido que comparta puede revelar su identidad.</p>}
                {sendError && <p className="chat-delivery-feedback alert-banner danger" role="alert">{sendError}</p>}
                {isSending && <p className="chat-delivery-feedback" role="status">Esperando confirmación del envío…</p>}
                {/* Contenedor de mensajes */}
                <div ref={containerRef} onScroll={onScroll} tabIndex={0} className="sst-drawer-messages-list" role="log" aria-live="polite" aria-label={`Mensajes del radicado ${ticket.code || ticket.id}`}>
                  {messages.length === 0 && <p className="sst-chat-history-empty">Esta conversación no tiene mensajes registrados.</p>}
                  {messages.map((m, index) => {
                    const prevMsg = index > 0 ? messages[index - 1] : null;
                    const showSeparator = shouldShowDateSeparator(m, prevMsg);
                    const separatorLabel = showSeparator ? formatChatDateSeparator(m.timestamp) : null;
                    const isSst = m.senderRole === 'SST';
                    const isSys = m.senderRole === 'SISTEMA';

                    return (
                      <div key={m.id || index} className="embedded-chat-msg-row">
                        {showSeparator && separatorLabel && (
                          <div className="chat-date-separator" role="separator" aria-label={`Mensajes del día: ${separatorLabel}`}>
                            <span className="chat-date-pill">{separatorLabel}</span>
                          </div>
                        )}
                        {isSys ? (
                          <div className="embedded-chat-msg system-msg">
                            <Icon name="info" size={14} />
                            <span>{m.text}</span>
                          </div>
                        ) : (
                          <div
                            className={`embedded-chat-bubble-wrap ${isSst ? 'msg-outgoing' : 'msg-incoming'}`}
                          >
                            <div className="embedded-chat-bubble">
                              <div className="embedded-msg-meta">
                                <strong className="embedded-msg-sender">
                                  {isSst ? 'Tú (SST)' : (m.senderName || 'Agente')}
                                </strong>
                                <span className="embedded-msg-time">
                                  {m.timestamp ? new Date(m.timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' }) : ''}
                                </span>
                              </div>
                              <p className="embedded-msg-text">{m.text}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="chat-new-messages" role="status">
                  {hasNewMessages && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => {
                      scrollToLatest();
                      containerRef.current?.focus({ preventScroll: true });
                    }}>
                      Ver mensajes nuevos
                    </button>
                  )}
                </div>

                {/* Footer: Input o Banner cerrado */}
                {!isActive ? (
                  <div className="sst-drawer-closed-banner">
                    <Icon name="checkCircle" size={16} />
                    <span>
                      {isClosed ? 'Conversación concluida. Puedes consultar su historial en solo lectura.' : 'Este canal no permite enviar mensajes en su estado actual.'}
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
                    <label className="sst-composer-label" htmlFor="sst-chat-message">Respuesta para el agente</label>
                    <div className="embedded-chat-composer-box">
                      <textarea
                        id="sst-chat-message"
                        ref={inputRef}
                        rows={1}
                        className="embedded-composer-textarea"
                        placeholder="Escribe tu respuesta sobre este radicado…"
                        value={inputText}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        maxLength={800}
                        disabled={isSending}
                        aria-describedby="sst-chat-keyboard-hint"
                      />
                      <div className="embedded-composer-footer">
                        <span id="sst-chat-keyboard-hint" className="composer-keyboard-hint">
                          Enter ↵ para enviar · Shift+Enter para salto de línea
                        </span>
                        <div className="composer-actions-group">
                          {inputText.length > 0 && (
                            <span className="embedded-composer-counter">
                              {inputText.length}/800
                            </span>
                          )}
                          <button
                            type="submit"
                            className="embedded-composer-send-btn"
                            disabled={!inputText.trim() || isSending}
                            aria-label={isSending ? 'Enviando respuesta…' : 'Enviar respuesta'}
                            title="Enviar respuesta (Enter)"
                          >
                            <Icon name="send" size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
        {showCloseModal && (
          <SstChatCloseForm surfaceRef={closeModalRef} requestCode={ticket.code || ticket.id}
            notes={closeNotes} onNotesChange={setCloseNotes}
            targetStatus={targetRequestStatus} onTargetStatusChange={setTargetRequestStatus}
            onCancel={() => setShowCloseModal(false)} onConfirm={handleConfirmClose}
            isClosing={isClosing} error={closeError} />
        )}
      </div>
    </aside>
  );
}

SstRequestChatDrawer.propTypes = {
  ticket: PropTypes.object.isRequired,
  inputText: PropTypes.string.isRequired,
  setInputText: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSessionChanged: PropTypes.func
};
