// frontend/src/features/agent/components/SupportChatCard.jsx
/**
 * @file SupportChatCard.jsx
 * @description Componente de chat interactivo preventivo subordinado a un Radicado Formal de SST (RF-10).
 * Integra el historial de PostgreSQL y confirmación de envío por WebSockets.
 * Mantiene el borrador ante fallos y explica el alcance de la identidad oculta.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSocket } from '../../../core/socket/socketClient';
import { useChatDelivery } from '../../../core/socket/useChatDelivery';
import { useChatScroll } from '../../../core/hooks/useChatScroll';
import { authService } from '../../../core/auth/authService';
import { chatService } from '../../../core/api/chatService';
import { Icon } from '../../../core/components/Icon';
import '../../../styles/support-chat.css';

/**
 * Muestra el canal de un radicado; conserva el borrador cuando el envío falla.
 * @param {object} props Contexto de la solicitud autorizada.
 * @param {string} props.requestId Identificador del radicado.
 * @param {string} [props.requestCode] Código visible del radicado.
 * @param {boolean} [props.isAnonymous] Nombre oculto a SST según la modalidad del caso.
 * @param {string} props.inputText Borrador del radicado en memoria de la página.
 * @param {import('react').Dispatch<import('react').SetStateAction<string>>} props.setInputText Actualiza solo el borrador de este radicado.
 * @param {Function} [props.onChatClosed] Actualiza el listado al cerrar el canal.
 * @returns {JSX.Element} Carga, error recuperable, espera o conversación con historial.
 */
export function SupportChatCard({ requestId, requestCode, isAnonymous, inputText, setInputText, onChatClosed }) {
  const { socket } = useSocket();
  const currentUser = authService.getCurrentUser();

  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isSending, sendError, sendMessage } = useChatDelivery(socket, session?.id);
  const [errorBanner, setErrorBanner] = useState(null);

  const { containerRef, onScroll, hasNewMessages, scrollToLatest } = useChatScroll({
    messages,
    conversationId: session?.id,
    enabled: !isLoading && !errorBanner && Boolean(session)
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

  // 1. Cargar la sesión y mensajes del radicado desde el backend
  const loadChatData = useCallback(async () => {
    if (!requestId) return;
    try {
      setIsLoading(true);
      setErrorBanner(null);
      const res = await chatService.getChatByRequest(requestId);
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
      setErrorBanner(err?.response?.data?.error?.message || err.message || 'No fue posible cargar el canal de este radicado.');
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    loadChatData();
  }, [loadChatData]);

  // 2. Suscripción a WebSockets para mensajes y eventos del radicado
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

    function handleChatActivated(payload) {
      if (payload?.session?.requestId === requestId) {
        setSession(payload.session);
        setMessages(payload.messages || []);
      }
    }

    function handleChatEnded(payload) {
      const matchSession = session?.id && payload?.sessionId === session.id;
      const matchRequest = requestId && payload?.requestId === requestId;
      if (matchSession || matchRequest) {
        setSession((prev) => (prev ? { ...prev, status: 'cerrada' } : prev));
        if (onChatClosed) onChatClosed();
      }
    }

    socket.on('support:message:received', handleIncomingMessage);
    socket.on('support:chat:activated', handleChatActivated);
    socket.on('support:chat:ended', handleChatEnded);

    return () => {
      socket.off('support:message:received', handleIncomingMessage);
      socket.off('support:chat:activated', handleChatActivated);
      socket.off('support:chat:ended', handleChatEnded);
    };
  }, [socket, session?.id, requestId, onChatClosed]);

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

  // 4. Enviar mensaje del agente con reconciliación por clientMsgId
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

  if (isLoading) {
    return (
      <div className="support-chat-state" role="status">
        <Icon name="clock" size={16} />
        <span>Cargando canal de conversación del radicado…</span>
      </div>
    );
  }

  if (errorBanner) {
    return (
      <div className="support-chat-state support-chat-state--error" role="alert">
        <Icon name="alertTriangle" size={16} />
        <span>{errorBanner}</span>
        <button type="button" className="btn btn-secondary btn-sm" onClick={loadChatData}>Reintentar carga</button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="support-chat-state">
        <Icon name="clock" size={20} />
        <div>
          <strong>Sin conversación abierta</strong>
          <p>
            No hay una conversación disponible para el radicado <strong>{requestCode}</strong>.
            Si SST habilita un canal, podrás consultar el diálogo aquí.
          </p>
        </div>
      </div>
    );
  }

  const isClosed = session.status === 'cerrada';
  const isActive = session.status === 'activa';

  return (
    <div className={`support-embedded-chat-box ${isActive ? 'is-active' : 'is-closed'}`}>
      {/* Cabecera compacta y profesional del Chat */}
      <div className="embedded-chat-header">
        <div className="embedded-chat-user-info">
          <div className="embedded-chat-avatar" aria-hidden="true">
            <Icon name="MessagesSquare" size={18} />
          </div>
          <div className="embedded-chat-titles">
            <div className="embedded-chat-name-row">
              <strong className="embedded-chat-title">Conversación con SST</strong>
              <span className={`chat-status-pill ${isActive ? 'live' : 'closed'}`}>
                <span>{isClosed ? 'Concluido' : isActive ? 'Canal abierto' : 'Canal no disponible'}</span>
              </span>
            </div>
            <span className="embedded-chat-subtitle">
              {requestCode ? `Radicado ${requestCode} · ` : ''}
              {isAnonymous ? 'Tu nombre no se muestra a SST' : 'Orientación de bienestar con SST'}
            </span>
          </div>
        </div>
      </div>

      {isAnonymous && <p className="chat-privacy-note">El sistema vincula el chat a tu cuenta. Evita incluir datos que te identifiquen si prefieres reservar tu identidad.</p>}
      {sendError && <p className="chat-delivery-feedback alert-banner danger" role="alert">{sendError}</p>}
      {isSending && <p className="chat-delivery-feedback" role="status">Esperando confirmación del envío…</p>}

      {/* Lista de Mensajes */}
      <div
        ref={containerRef}
        onScroll={onScroll}
        tabIndex={0}
        className="embedded-chat-messages-area"
        role="log"
        aria-live="polite"
        aria-label={`Mensajes del radicado ${requestCode}`}
      >
        {messages.length === 0 && <p className="chat-history-empty">Esta conversación no tiene mensajes registrados.</p>}
        {messages.map((msg, index) => {
          const prevMsg = index > 0 ? messages[index - 1] : null;
          const showSeparator = shouldShowDateSeparator(msg, prevMsg);
          const separatorLabel = showSeparator ? formatChatDateSeparator(msg.timestamp) : null;
          const isMe = msg.senderRole === 'AGENTE' || msg.senderId === currentUser?.id;
          const isSystem = msg.senderRole === 'SISTEMA';

          return (
            <div key={msg.id || index} className="embedded-chat-msg-row">
              {showSeparator && separatorLabel && (
                <div className="chat-date-separator" role="separator" aria-label={`Mensajes del día: ${separatorLabel}`}>
                  <span className="chat-date-pill">{separatorLabel}</span>
                </div>
              )}
              {isSystem ? (
                <div className="embedded-chat-msg system-msg">
                  <Icon name="info" size={14} />
                  <span>{msg.text}</span>
                </div>
              ) : (
                <div
                  className={`embedded-chat-bubble-wrap ${isMe ? 'msg-outgoing' : 'msg-incoming'}`}
                >
                  <div className="embedded-chat-bubble">
                    <div className="embedded-msg-meta">
                      <strong className="embedded-msg-sender">
                        {isMe ? 'Tú' : (msg.senderName || 'Especialista SST')}
                      </strong>
                      <span className="embedded-msg-time">
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="embedded-msg-text">{msg.text}</p>
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

      {/* Compositor de Mensaje o Banner de Cierre */}
      {!isActive ? (
        <div className="embedded-chat-closed-footer">
          <Icon name="checkCircle" size={16} />
          <span>{isClosed ? 'La conversación ha concluido. Puedes consultar su historial en solo lectura.' : 'Este canal no permite enviar mensajes en su estado actual.'}</span>
        </div>
      ) : (
        <form
          className="embedded-chat-composer"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <div className="embedded-chat-composer-box">
            <textarea
              ref={inputRef}
              rows={1}
              className="embedded-composer-textarea"
              placeholder="Escribe tu mensaje sobre este caso a SST…"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              maxLength={600}
              disabled={isSending}
              aria-label="Mensaje para el especialista SST"
            />
            <div className="embedded-composer-footer">
              <span className="composer-keyboard-hint">
                Enter ↵ para enviar · Shift+Enter para salto de línea
              </span>
              <div className="composer-actions-group">
                {inputText.length > 0 && (
                  <span className="embedded-composer-counter" aria-live="polite">
                    {inputText.length}/600
                  </span>
                )}
                <button
                  type="submit"
                  className="embedded-composer-send-btn"
                  disabled={!inputText.trim() || isSending}
                  aria-label={isSending ? 'Enviando mensaje…' : 'Enviar mensaje'}
                  title="Enviar mensaje (Enter)"
                >
                  <Icon name="send" size={15} />
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

SupportChatCard.propTypes = {
  requestId: PropTypes.string.isRequired,
  requestCode: PropTypes.string,
  isAnonymous: PropTypes.bool,
  inputText: PropTypes.string.isRequired,
  setInputText: PropTypes.func.isRequired,
  onChatClosed: PropTypes.func
};
