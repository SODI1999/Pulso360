// frontend/src/features/sst/components/SstLiveChatConsole.jsx
/**
 * @file SstLiveChatConsole.jsx
 * @description Consola de Atención Psicosocial en Tiempo Real para Especialistas SST (RF-10).
 * Integra WebSockets (Socket.io) y persistencia en PostgreSQL vía REST (chatService).
 * Garantiza confidencialidad bajo Ley 1581 de 2012 y Res. 2646 de 2008.
 */

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../../core/socket/socketClient';
import { chatService } from '../../../core/api/chatService';
import { Icon } from '../../../core/components/Icon';

export function SstLiveChatConsole() {
  const { socket, isConnected } = useSocket();
  const [activeChats, setActiveChats] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [conversations, setConversations] = useState({});
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const messagesContainerRef = useRef(null);

  // 1. Cargar lista de sesiones activas desde el backend vía REST y Socket.io
  useEffect(() => {
    let isMounted = true;

    async function loadActiveSessions() {
      try {
        const data = await chatService.getActiveChat();
        if (isMounted && Array.isArray(data)) {
          setActiveChats(data);
          if (data.length > 0) {
            setSelectedAgentId((prev) => prev || data[0].agentId);
          }
        }
      } catch {
        // En fallo de red se espera sincronización del socket
      }
    }

    loadActiveSessions();

    if (isConnected) {
      socket.emit('support:chats:get');
    }

    return () => {
      isMounted = false;
    };
  }, [isConnected, socket]);

  // 2. Suscripción a eventos de lista y mensajes entrantes por WebSockets
  useEffect(() => {
    function handleChatsList(list) {
      if (Array.isArray(list)) {
        setActiveChats(list);
        if (list.length > 0) {
          setSelectedAgentId((prev) => prev || list[0].agentId);
        }
      }
    }

    function handleChatsUpdated(list) {
      if (Array.isArray(list)) {
        setActiveChats(list);
        if (list.length > 0) {
          setSelectedAgentId((prev) => prev || list[0].agentId);
        }
      }
    }

    function handleIncomingMessage(msg) {
      const agentId = msg.agentId || msg.senderId;
      if (!agentId) return;

      setConversations((prev) => {
        const currentList = prev[agentId] || [];
        if (currentList.some((m) => m.id === msg.id)) return prev;
        return {
          ...prev,
          [agentId]: [...currentList, msg]
        };
      });
    }

    socket.on('support:chats:list', handleChatsList);
    socket.on('support:chats:updated', handleChatsUpdated);
    socket.on('support:message:received', handleIncomingMessage);

    return () => {
      socket.off('support:chats:list', handleChatsList);
      socket.off('support:chats:updated', handleChatsUpdated);
      socket.off('support:message:received', handleIncomingMessage);
    };
  }, [socket, selectedAgentId]);

  // 3. Notificar lectura por socket cuando cambia el agente
  useEffect(() => {
    if (selectedAgentId && isConnected) {
      socket.emit('support:chat:read', { agentId: selectedAgentId });
    }
  }, [selectedAgentId, isConnected, socket]);

  const activeChat = activeChats.find((c) => c.agentId === selectedAgentId);
  const currentSessionId = activeChat?.sessionId || activeChat?.id;
  const currentMessages = selectedAgentId ? conversations[selectedAgentId] || [] : [];

  // 4. Cargar mensajes persistentes al cambiar de sesión activa
  useEffect(() => {
    if (!currentSessionId || !selectedAgentId) {
      setIsLoadingMessages(false);
      return;
    }

    const targetAgentId = selectedAgentId;
    setIsLoadingMessages(true);

    chatService
      .getSessionMessages(currentSessionId)
      .then((res) => {
        const msgList = Array.isArray(res) ? res : (res?.messages || []);
        const mapped = msgList.map((m) => ({
          id: m.id,
          senderId: m.senderId || m.sender_id,
          senderRole: m.senderRole || m.sender_role,
          senderName: m.senderName || m.sender_name,
          text: m.text || m.message_text,
          timestamp: m.timestamp || m.created_at,
          agentId: targetAgentId
        }));
        setConversations((prev) => ({
          ...prev,
          [targetAgentId]: mapped
        }));
      })
      .catch((err) => {
        console.error('Error al cargar historial SST:', err);
      })
      .finally(() => {
        setIsLoadingMessages(false);
      });
  }, [currentSessionId, selectedAgentId]);

  // 4. Scroll contenido únicamente dentro de la caja de mensajes (sin alterar el documento)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [conversations, selectedAgentId]);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !selectedAgentId) return;

    socket.emit('support:message:send', {
      text: inputText.trim(),
      receiverId: selectedAgentId,
      sessionId: currentSessionId
    });
    setInputText('');
  };

  const handleQuickReply = (text) => {
    if (!selectedAgentId) return;
    socket.emit('support:message:send', {
      text,
      receiverId: selectedAgentId,
      sessionId: currentSessionId
    });
  };

  const handleCloseChat = async () => {
    if (!selectedAgentId) return;
    const confirmClose = window.confirm(
      '¿Deseas dar por concluida esta sesión de orientación en vivo? El agente recibirá la notificación correspondiente.'
    );
    if (!confirmClose) return;

    socket.emit('support:chat:close', { agentId: selectedAgentId, sessionId: currentSessionId });

    if (currentSessionId) {
      try {
        await chatService.closeSession(currentSessionId, {
          reason: 'Concluido por el profesional de SST',
          notes: 'Sesión de orientación y contención psicosocial finalizada satisfactoriamente.'
        });
      } catch {
        // En caso de cierre previo por socket
      }
    }

    setActiveChats((prev) => prev.filter((c) => c.agentId !== selectedAgentId));
    setSelectedAgentId(null);
  };

  const filteredChats = activeChats.filter(
    (c) =>
      (c.agentName || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
      (c.agentId || '').toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="sst-chat-console-card">
      {/* Barra superior de estado */}
      <header className="sst-console-header">
        <div>
          <h2 className="sst-console-header-title">
            <Icon name="Headphones" size={18} />
            <span>Consola de Acompañamiento Psicosocial en Tiempo Real</span>
          </h2>
          <p className="sst-console-header-sub">
            Canal confidencial reservado para Seguridad y Salud en el Trabajo (Ley 1581 / Res. 2646)
          </p>
        </div>
        <div className={`support-chat-status ${isConnected ? 'is-online' : 'is-offline'}`}>
          <span className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
          <span>{isConnected ? 'Servidor en línea' : 'Conectando...'}</span>
        </div>
      </header>

      {/* Disposición split de 2 columnas */}
      <div className="sst-console-grid">
        {/* Panel lateral: Lista de Agentes en Vivo */}
        <aside className="sst-console-sidebar" aria-label="Operadores con chat activo">
          <div className="sst-console-search-box">
            <input
              type="text"
              placeholder="Buscar operador o ID..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: '13px', padding: '6px 10px' }}
              aria-label="Filtrar conversaciones activas"
            />
          </div>

          <div className="sst-console-agents-list">
            {filteredChats.length === 0 ? (
              <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--c-texto-mutado)', fontSize: '13px' }}>
                <Icon name="Headphones" size={24} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                <p style={{ margin: 0, fontWeight: 600 }}>No hay chats activos en este momento.</p>
                <p style={{ margin: '4px 0 0', fontSize: '12px' }}>
                  Cuando un operador envíe un mensaje desde su panel, se listará automáticamente aquí.
                </p>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isSelected = chat.agentId === selectedAgentId;
                return (
                  <button
                    key={chat.agentId}
                    type="button"
                    onClick={() => setSelectedAgentId(chat.agentId)}
                    className={`sst-agent-item-btn ${isSelected ? 'is-active' : ''}`}
                  >
                    <div className="sst-agent-item-header">
                      <span className="sst-agent-item-name">{chat.agentName}</span>
                      {chat.unreadCount > 0 && (
                        <span className="badge badge-danger" style={{ fontSize: '11px', padding: '1px 6px' }}>
                          {chat.unreadCount} nuevo{chat.unreadCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="sst-agent-item-last">
                      {chat.lastMessage || 'Conversación iniciada'}
                    </div>
                    <div className="sst-agent-item-meta">
                      <Icon name={chat.isAnonymous ? 'EyeOff' : 'ShieldCheck'} size={12} />
                      <span>{chat.isAnonymous ? 'Modalidad confidencial' : 'Identificado'}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Panel principal: Conversación activa */}
        <section className="sst-console-main-chat">
          {!selectedAgentId ? (
            <div className="sst-chat-empty-panel">
              <Icon name="Shield" size={40} style={{ color: 'var(--c-rol-sst, #7c3aed)', marginBottom: '1rem', opacity: 0.8 }} />
              <h3 style={{ margin: '0 0 0.5rem', color: 'var(--c-texto)', fontSize: '16px' }}>
                Canal Listo para Atención Ocupacional
              </h3>
              <p style={{ maxWidth: '420px', margin: 0, fontSize: '13.5px', lineHeight: 1.5 }}>
                Selecciona un operador de la lista lateral para iniciar la orientación en vivo. La conversación se preserva de manera segura e inalterable.
              </p>
            </div>
          ) : (
            <>
              {/* Cabecera del chat seleccionado */}
              <div className="sst-chat-header-bar">
                <div className="sst-chat-agent-info">
                  <h3 className="sst-chat-agent-title">
                    {activeChat?.agentName || `Operador (${selectedAgentId})`}
                  </h3>
                  <div className="sst-chat-agent-tags">
                    <span>ID: {selectedAgentId}</span>
                    <span>·</span>
                    <span style={{ color: 'var(--c-rol-sst, #7c3aed)', fontWeight: 600 }}>
                      {activeChat?.isAnonymous ? 'Reserva de identidad (Confidencial)' : 'Datos visibles para SST'}
                    </span>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleCloseChat}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '5px' }}
                    title="Concluir sesión activa de orientación"
                  >
                    <Icon name="X" size={14} />
                    <span>Concluir sesión</span>
                  </button>
                </div>
              </div>

              {/* Registro de mensajes con scroll aislado */}
              <div
                ref={messagesContainerRef}
                className="sst-chat-messages-container"
                role="log"
                aria-live="polite"
              >
                {isLoadingMessages && (
                  <div className="support-chat-msg is-system">
                    <div className="support-msg-bubble">
                      Cargando historial seguro desde el servidor…
                    </div>
                  </div>
                )}

                {currentMessages.length === 0 && !isLoadingMessages ? (
                  <div style={{ textAlign: 'center', color: 'var(--c-texto-mutado)', margin: 'auto', fontSize: '13px' }}>
                    <p style={{ margin: 0 }}>Esperando primer mensaje o envía una orientación inicial al operador.</p>
                  </div>
                ) : (
                  currentMessages.map((msg) => {
                    const isSst = msg.senderRole === 'SST';
                    return (
                      <div
                        key={msg.id}
                        className={`support-chat-msg ${isSst ? 'is-agent' : 'is-sst'}`}
                      >
                        <div className="support-msg-bubble">
                          <div className="support-msg-header">
                            <span className="support-msg-sender">
                              {isSst ? (
                                <>
                                  <Icon name="ShieldCheck" size={12} />
                                  <span>Tú (Especialista SST)</span>
                                </>
                              ) : (
                                <>
                                  <Icon name="User" size={12} />
                                  <span>{msg.senderName || 'Operador'}</span>
                                </>
                              )}
                            </span>
                          </div>
                          <div className="support-msg-text">{msg.text}</div>
                          {msg.timestamp && (
                            <div className="support-msg-time">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Respuestas rápidas ocupacionales para SST */}
              <div className="sst-console-quick-actions" aria-label="Atajos de orientación ocupacional">
                <span className="support-chips-label">Atajos SST:</span>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickReply(
                      'Hola, te escucho con total reserva y atención. ¿Cómo te sientes en este momento?'
                    )
                  }
                  className="support-chip-btn"
                >
                  Saludo empático
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickReply(
                      'Si experimentas sobrecarga por llamadas continuas, tómate 2 minutos para respirar y relajar hombros.'
                    )
                  }
                  className="support-chip-btn"
                >
                  Pausa de respiración
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickReply(
                      '¿Deseas que coordinemos una pausa activa asistida o valoración preventiva con el equipo de salud ocupacional?'
                    )
                  }
                  className="support-chip-btn"
                >
                  Proponer valoración
                </button>
              </div>

              {/* Formulario de envío de respuesta */}
              <form onSubmit={handleSendMessage} className="sst-console-composer">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Redacta tu orientación o mensaje confidencial para el operador..."
                  className="support-chat-input"
                  disabled={!isConnected}
                  aria-label="Mensaje para el operador"
                />
                <button
                  type="submit"
                  className="support-chat-send-btn"
                  disabled={!isConnected || !inputText.trim()}
                >
                  <Icon name="Send" size={15} />
                  <span>Responder</span>
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
