// frontend/src/features/agent/components/SupportChatCard.jsx
/**
 * @file SupportChatCard.jsx
 * @description Componente de chat interactivo preventivo subordinado a un Radicado Formal de SST (RF-10).
 * Integra persistencia inmutable en PostgreSQL y WebSockets (Socket.io).
 * Modalidad preventiva de SG-SST (Ley 1581 / Res. 2646): ergonomía, pausas y mitigación de fatiga de turno.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSocket } from '../../../core/socket/socketClient';
import { authService } from '../../../core/auth/authService';
import { chatService } from '../../../core/api/chatService';
import { Icon } from '../../../core/components/Icon';

export function SupportChatCard({ requestId, requestCode, isAnonymous, onChatClosed }) {
  const { socket } = useSocket();
  const currentUser = authService.getCurrentUser();

  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
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
      setErrorBanner(err?.response?.data?.error?.message || 'No fue posible cargar el canal de este radicado.');
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

  // 4. Enviar mensaje del agente con reconciliación por clientMsgId
  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || !session?.id || session.status !== 'activa' || isSending) return;

    setIsSending(true);
    const clientMsgId = `cmsg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const optimisticMessage = {
      id: clientMsgId,
      clientMsgId,
      sessionId: session.id,
      senderId: currentUser?.id,
      senderRole: 'AGENTE',
      senderName: isAnonymous ? 'Agente Confidencial' : (currentUser?.name || 'Agente de Contact Center'),
      text,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInputText('');

    socket.emit('support:message:send', {
      sessionId: session.id,
      clientMsgId,
      receiverId: session.sstAtendioId || null,
      isAnonymous: Boolean(session.isAnonymous || isAnonymous),
      senderName: isAnonymous ? 'Agente Confidencial' : (currentUser?.name || 'Agente de Contact Center'),
      text
    });

    setIsSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
        <div className="embedded-chat-user-info">
          <div className="embedded-chat-avatar" aria-hidden="true">
            <Icon name="MessagesSquare" size={16} />
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
              {isAnonymous ? 'Identidad protegida · Orientación preventiva' : 'Confidencial SG-SST · Orientación preventiva'}
            </span>
          </div>
        </div>
      </div>

      {/* Lista de Mensajes */}
      <div
        ref={messagesContainerRef}
        className="embedded-chat-messages-area"
        role="log"
        aria-live="polite"
        aria-label={`Mensajes del radicado ${requestCode}`}
      >
        {messages.map((msg) => {
          const isMe = msg.senderRole === 'AGENTE' || msg.senderId === currentUser?.id;
          const isSystem = msg.senderRole === 'SISTEMA';

          if (isSystem) {
            return (
              <div key={msg.id} className="embedded-chat-msg system-msg">
                <Icon name="info" size={14} />
                <span>{msg.text}</span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
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
          );
        })}
      </div>

      {/* Compositor de Mensaje o Banner de Cierre */}
      {isClosed ? (
        <div className="embedded-chat-closed-footer">
          <Icon name="checkCircle" size={16} />
          <span>Este chat ha sido cerrado por SST y permanece como registro histórico para auditoría.</span>
        </div>
      ) : (
        <form
          className="embedded-chat-composer"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className="embedded-composer-input"
            placeholder="Escribe tu mensaje sobre este caso a SST… (Enter para enviar)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={600}
            disabled={isSending}
            aria-label="Mensaje para el especialista SST"
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm embedded-composer-submit"
            disabled={!inputText.trim() || isSending}
            aria-label="Enviar mensaje"
          >
            <Icon name="send" size={16} />
            <span>Enviar</span>
          </button>
        </form>
      )}
    </div>
  );
}

SupportChatCard.propTypes = {
  requestId: PropTypes.string.isRequired,
  requestCode: PropTypes.string,
  isAnonymous: PropTypes.bool,
  onChatClosed: PropTypes.func
};
