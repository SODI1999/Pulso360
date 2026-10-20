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
import { authService } from '../../../core/auth/authService';
import { chatService } from '../../../core/api/chatService';
import { Icon } from '../../../core/components/Icon';

export function SupportChatCard({ requestId, requestCode, isAnonymous, onChatClosed, onBack }) {
  const { socket } = useSocket();
  const currentUser = authService.getCurrentUser();

  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const { isSending, sendError, sendMessage } = useChatDelivery(socket, session?.id);
  const [errorBanner, setErrorBanner] = useState(null);

  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

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

  // 3. Scroll automático al recibir mensajes
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
    const confirmed = await sendMessage(text);
    if (!confirmed) return;
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
    if (e.key === 'Enter' && !e.shiftKey) {
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
      <div className="support-embedded-chat-loading" role="status">
        <Icon name="clock" size={16} />
        <span>Cargando canal de conversación del radicado…</span>
      </div>
    );
  }

  if (errorBanner) {
    return (
      <div className="support-embedded-chat-error alert-banner danger" role="alert">
        <Icon name="alertTriangle" size={16} />
        <span>{errorBanner}</span>
        <button type="button" className="btn btn-secondary btn-sm" onClick={loadChatData}>Reintentar carga</button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="support-embedded-chat-empty">
        <Icon name="clock" size={20} />
        <div>
          <strong>Canal en espera de revisión por SST</strong>
          <p>
            El equipo de Salud Ocupacional evaluará el radicado <strong>{requestCode}</strong>. Cuando un especialista
            inicie la orientación en vivo, este canal se activará automáticamente.
          </p>
        </div>
      </div>
    );
  }

  const isClosed = session.status === 'cerrada';

  return (
    <div className={`support-embedded-chat-box ${isClosed ? 'is-closed' : 'is-active'}`}>
      {/* Cabecera compacta y profesional del Chat */}
      <div className="embedded-chat-header">
        {onBack && (
          <button
            type="button"
            className="btn-chat-back"
            onClick={onBack}
            aria-label="Volver a la lista de radicados"
            title="Volver a la lista"
          >
            <Icon name="arrowLeft" size={16} />
          </button>
        )}
        <div className="embedded-chat-user-info">
          <div className="embedded-chat-avatar" aria-hidden="true">
            <Icon name="MessagesSquare" size={18} />
            {!isClosed && <span className="embedded-avatar-online-dot" title="En vivo" />}
          </div>
          <div className="embedded-chat-titles">
            <div className="embedded-chat-name-row">
              <strong className="embedded-chat-title">Especialista SST (Salud Ocupacional)</strong>
              <span className={`chat-status-pill ${isClosed ? 'closed' : 'live'}`}>
                <span className={`chat-status-dot ${isClosed ? 'closed' : 'live'}`} />
                <span>{isClosed ? 'Concluido' : 'En vivo'}</span>
              </span>
            </div>
            <span className="embedded-chat-subtitle">
              {requestCode ? `Radicado ${requestCode} · ` : ''}
              {isAnonymous ? 'Tu nombre no se muestra a SST · Canal Seguro' : 'Orientación de Bienestar con SST'}
            </span>
          </div>
        </div>
      </div>

      {isAnonymous && <p className="chat-privacy-note">El sistema vincula el chat a tu cuenta. Evita incluir datos que te identifiquen si prefieres reservar tu identidad.</p>}
      {sendError && <p className="chat-delivery-feedback alert-banner danger" role="alert">{sendError}</p>}
      {isSending && <p className="chat-delivery-feedback" role="status">Esperando confirmación del envío…</p>}

      {/* Lista de Mensajes */}
      <div
        ref={messagesContainerRef}
        className="embedded-chat-messages-area"
        role="log"
        aria-live="polite"
        aria-label={`Mensajes del radicado ${requestCode}`}
      >
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

      {/* Compositor de Mensaje o Banner de Cierre */}
      {isClosed ? (
        <div className="embedded-chat-closed-footer">
          <Icon name="checkCircle" size={16} />
          <span>La conversación ha concluido. Puedes consultar su historial en solo lectura.</span>
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
  onChatClosed: PropTypes.func,
  onBack: PropTypes.func
};
