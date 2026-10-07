// frontend/src/features/agent/components/SupportChatCard.jsx
/**
 * @file SupportChatCard.jsx
 * @description Tarjeta de Chat de Orientación Psicosocial en Tiempo Real (Socket.io + PostgreSQL).
 * Canal confidencial entre el agente y el especialista de Seguridad y Salud en el Trabajo (SST),
 * excluyendo terminantemente a supervisores operativos (RF-10, Ley 1581 / Res. 2646).
 */

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../../core/socket/socketClient';
import { authService } from '../../../core/auth/authService';
import { chatService } from '../../../core/api/chatService';
import { Icon } from '../../../core/components/Icon';

const INITIAL_GREETING = {
  id: 'welcome-initial',
  senderRole: 'SST',
  senderName: 'Especialista SST (Salud Ocupacional)',
  text: 'Hola. Este es tu canal directo y confidencial con el equipo de Salud Ocupacional (SST). ¿En qué podemos orientarte hoy?',
  timestamp: new Date().toISOString()
};

export function SupportChatCard() {
  const { socket, isConnected } = useSocket();
  const currentUser = authService.getCurrentUser();

  const [activeSession, setActiveSession] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [inputText, setInputText] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const messagesContainerRef = useRef(null);

  // 1. Carga inicial del historial persistente desde PostgreSQL vía REST
  useEffect(() => {
    let isMounted = true;

    async function loadActiveChatHistory() {
      try {
        setIsLoadingHistory(true);
        const res = await chatService.getActiveChat();
        if (!isMounted) return;

        if (res?.session) {
          setActiveSession(res.session);
          const anonVal = res.session.isAnonymous ?? res.session.is_anonymous;
          if (anonVal !== undefined) {
            setIsAnonymous(Boolean(anonVal));
          }
        }

        if (Array.isArray(res?.messages) && res.messages.length > 0) {
          const mapped = res.messages.map((m) => ({
            id: m.id,
            senderId: m.senderId || m.sender_id,
            senderRole: m.senderRole || m.sender_role,
            senderName: m.senderName || m.sender_name,
            text: m.text || m.message_text,
            timestamp: m.timestamp || m.created_at
          }));
          setMessages(mapped);
        } else {
          setMessages([INITIAL_GREETING]);
        }
      } catch {
        // En caso de modo offline o error de red, se mantiene el mensaje de bienvenida local
      } finally {
        if (isMounted) setIsLoadingHistory(false);
      }
    }

    loadActiveChatHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Suscripción reactiva a eventos de WebSockets (Socket.io)
  useEffect(() => {
    function handleIncomingMessage(msg) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    }

    function handleChatEnded(payload) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ended-${Date.now()}`,
          senderRole: 'SISTEMA',
          senderName: 'Sistema de Acompañamiento',
          text: payload?.message || 'La sesión de orientación en vivo ha finalizado. Puedes volver a escribir cuando lo requieras.',
          timestamp: new Date().toISOString()
        }
      ]);
      setActiveSession(null);
    }

    socket.on('support:message:received', handleIncomingMessage);
    socket.on('support:chat:ended', handleChatEnded);

    return () => {
      socket.off('support:message:received', handleIncomingMessage);
      socket.off('support:chat:ended', handleChatEnded);
    };
  }, [socket]);

  // 3. Scroll contenido únicamente dentro del contenedor de mensajes (sin saltos en la ventana)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 4. Envío de mensaje en vivo
  const handleSendMessage = (e, customText = null) => {
    e?.preventDefault();
    const textToSend = (customText || inputText).trim();
    if (!textToSend || !isConnected) return;

    socket.emit('support:message:send', {
      sessionId: activeSession?.id,
      text: textToSend,
      isAnonymous,
      senderName: isAnonymous
        ? 'Agente Confidencial'
        : (currentUser?.name || currentUser?.nombres || 'Agente de Contact Center')
    });

    if (!customText) {
      setInputText('');
    }
  };

  // 5. Conclusión voluntaria de la sesión de orientación
  const handleEndChat = async () => {
    if (window.confirm('¿Deseas concluir la conversación actual con el especialista de SST?')) {
      socket.emit('support:chat:close');
      if (activeSession?.id) {
        try {
          await chatService.closeSession(activeSession.id, {
            reason: 'Concluido voluntariamente por el agente'
          });
        } catch {
          // Si el socket ya lo cerró, se ignora el error
        }
      }
    }
  };

  return (
    <section className="support-chat-container" aria-labelledby="chat-heading">
      {/* Encabezado del Chat */}
      <header className="support-chat-header">
        <div className="support-chat-title-group">
          <h2 id="chat-heading" className="support-chat-heading">
            <Icon name="Headphones" size={18} />
            <span>Orientación Psicosocial en Tiempo Real</span>
          </h2>
          <p className="support-chat-subtitle">
            Canal confidencial directo con el especialista de SST · Supervisores excluidos (Ley 1581 / Res. 2646)
          </p>
        </div>

        <div className="support-chat-header-actions">
          <div className={`support-chat-status ${isConnected ? 'is-online' : 'is-offline'}`}>
            <span className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
            <span>{isConnected ? 'SST en línea' : 'Conectando...'}</span>
          </div>

          <button
            type="button"
            onClick={handleEndChat}
            className="btn btn-secondary btn-sm"
            title="Concluir conversación en vivo con SST"
          >
            Concluir orientación
          </button>
        </div>
      </header>

      {/* Selector de Confidencialidad y Reserva de Identidad */}
      <div className="support-chat-privacy-toggle">
        <label className="support-privacy-checkbox-label">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
          <span>Modo confidencial (Ocultar mi nombre real al especialista de SST)</span>
        </label>
        <span className="support-privacy-badge-text">
          {isAnonymous ? 'Mostrando: Agente Confidencial' : `Mostrando: ${currentUser?.name || currentUser?.nombres || 'Agente'}`}
        </span>
      </div>

      {/* Historial de Mensajes con Scroll Aislado */}
      <div
        ref={messagesContainerRef}
        className="support-chat-messages"
        role="log"
        aria-live="polite"
        aria-label="Historial de mensajes de orientación psicosocial"
      >
        {isLoadingHistory && (
          <div className="support-chat-msg is-system">
            <div className="support-msg-bubble">
              Cargando historial seguro de la conversación…
            </div>
          </div>
        )}

        {messages.map((m) => {
          const isAgent = m.senderRole === 'AGENTE' || m.senderId === currentUser?.id;
          const isSystem = m.senderRole === 'SISTEMA';
          const msgClass = isSystem ? 'is-system' : (isAgent ? 'is-agent' : 'is-sst');

          return (
            <div key={m.id} className={`support-chat-msg ${msgClass}`}>
              <div className="support-msg-bubble">
                {!isSystem && (
                  <div className="support-msg-header">
                    <span className="support-msg-sender">
                      {isAgent ? (
                        <>
                          <Icon name="User" size={12} />
                          <span>Tú (Agente)</span>
                        </>
                      ) : (
                        <>
                          <Icon name="ShieldCheck" size={12} />
                          <span>{m.senderName || 'Especialista SST'}</span>
                        </>
                      )}
                    </span>
                  </div>
                )}
                <div className="support-msg-text">{m.text}</div>
                {m.timestamp && !isSystem && (
                  <div className="support-msg-time">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Atajos de consulta rápida contextualizados en operaciones BPO */}
      <div className="support-chat-chips-bar" aria-label="Consultas frecuentes de piso BPO">
        <span className="support-chips-label">Atajos BPO:</span>
        <button
          type="button"
          onClick={() => handleSendMessage(null, 'Siento sobrecarga y fatiga por llamadas continuas en la cola.')}
          className="support-chip-btn"
          disabled={!isConnected}
        >
          Sobrecarga de llamadas
        </button>
        <button
          type="button"
          onClick={() => handleSendMessage(null, 'Tengo tensión muscular en el cuello y fatiga visual por la pantalla.')}
          className="support-chip-btn"
          disabled={!isConnected}
        >
          Tensión física / cervical
        </button>
        <button
          type="button"
          onClick={() => handleSendMessage(null, '¿Podemos realizar un ejercicio breve de respiración consciente o pausa guiada?')}
          className="support-chip-btn"
          disabled={!isConnected}
        >
          Pausa activa guiada
        </button>
        <button
          type="button"
          onClick={() => handleSendMessage(null, 'Necesito orientación sobre manejo de estrés ante usuarios difíciles.')}
          className="support-chip-btn"
          disabled={!isConnected}
        >
          Manejo de estrés operativo
        </button>
      </div>

      {/* Compositor / Formulario de Entrada */}
      <form onSubmit={(e) => handleSendMessage(e)} className="support-chat-composer">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Escribe tu mensaje confidencial para el especialista SST..."
          className="support-chat-input"
          disabled={!isConnected}
          aria-label="Mensaje para el especialista SST"
        />
        <button
          type="submit"
          className="support-chat-send-btn"
          disabled={!isConnected || !inputText.trim()}
        >
          <Icon name="Send" size={15} />
          <span>Enviar</span>
        </button>
      </form>
    </section>
  );
}
