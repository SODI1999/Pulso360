import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../../core/socket/socketClient';
import { Icon } from '../../../core/components/Icon';

/**
 * Consola de Chat en Vivo y Acompañamiento en Tiempo Real para SST (Socket.io).
 * Permite a los especialistas de Seguridad y Salud en el Trabajo atender consultas
 * inmediatas de agentes de Contact Center con estricto secreto profesional y confidencialidad.
 */
export function SstLiveChatConsole() {
  const { socket, isConnected } = useSocket();
  const [activeChats, setActiveChats] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [conversations, setConversations] = useState({});
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const messagesEndRef = useRef(null);

  // Cargar lista inicial de chats activos
  useEffect(() => {
    if (isConnected) {
      socket.emit('support:chats:get');
    }
  }, [isConnected, socket]);

  // Manejar eventos de lista y actualización de chats
  useEffect(() => {
    function handleChatsList(list) {
      if (Array.isArray(list)) {
        setActiveChats(list);
        if (list.length > 0 && !selectedAgentId) {
          setSelectedAgentId(list[0].agentId);
        }
      }
    }

    function handleChatsUpdated(list) {
      if (Array.isArray(list)) {
        setActiveChats(list);
        if (list.length > 0 && !selectedAgentId) {
          setSelectedAgentId(list[0].agentId);
        }
      }
    }

    function handleIncomingMessage(msg) {
      const agentId = msg.agentId || msg.senderId;
      if (!agentId) return;

      setConversations((prev) => {
        const currentList = prev[agentId] || [];
        // Evitar duplicados por id
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

  // Notificar lectura cuando cambia el agente seleccionado
  useEffect(() => {
    if (selectedAgentId && isConnected) {
      socket.emit('support:chat:read', { agentId: selectedAgentId });
    }
  }, [selectedAgentId, isConnected, socket]);

  // Scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, selectedAgentId]);

  const activeChat = activeChats.find((c) => c.agentId === selectedAgentId);
  const currentMessages = selectedAgentId ? (conversations[selectedAgentId] || []) : [];

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !selectedAgentId) return;

    socket.emit('support:message:send', {
      text: inputText.trim(),
      receiverId: selectedAgentId
    });
    setInputText('');
  };

  const handleQuickReply = (text) => {
    if (!selectedAgentId) return;
    socket.emit('support:message:send', {
      text,
      receiverId: selectedAgentId
    });
  };

  const handleCloseChat = () => {
    if (!selectedAgentId) return;
    if (window.confirm('¿Deseas dar por concluida esta sesión de orientación en vivo? El agente recibirá la notificación correspondiente.')) {
      socket.emit('support:chat:close', { agentId: selectedAgentId });
      setSelectedAgentId(null);
    }
  };

  const filteredChats = activeChats.filter((c) =>
    (c.agentName || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (c.agentId || '').toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--c-borde-suave)' }}>
      {/* Barra superior de estado */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--space-4) var(--space-5)',
          backgroundColor: 'var(--c-fondo)',
          borderBottom: '1px solid var(--c-borde-suave)'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--c-texto)' }}>
            Consola de Acompañamiento Psicosocial en Tiempo Real
          </h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--c-texto-suave)' }}>
            Canal confidencial reservado para Seguridad y Salud en el Trabajo (Ley 1581 / Res. 2646)
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isConnected ? '#10b981' : '#f59e0b',
              display: 'inline-block'
            }}
          />
          <span style={{ color: isConnected ? '#065f46' : '#92400e' }}>
            {isConnected ? 'Servidor de sockets activo' : 'Conectando al servidor...'}
          </span>
        </div>
      </div>

      {/* Disposición split de 2 columnas */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', minHeight: '480px' }}>
        {/* Panel lateral: Lista de Agentes en Vivo */}
        <aside
          style={{
            borderRight: '1px solid var(--c-borde-suave)',
            backgroundColor: 'var(--c-superficie)',
            display: 'flex',
            flexDirection: 'column'
          }}
          aria-label="Agentes con chat activo"
        >
          <div style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--c-borde-suave)' }}>
            <input
              type="text"
              placeholder="Buscar agente o ID..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.65rem' }}
              aria-label="Filtrar conversaciones activas"
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredChats.length === 0 ? (
              <div style={{ padding: 'var(--space-5)', textAlign: 'center', color: 'var(--c-texto-mutado)', fontSize: '0.85rem' }}>
                <Icon name="messageSquare" size={24} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                <p style={{ margin: 0 }}>No hay chats activos de agentes en este momento.</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem' }}>
                  Cuando un operador envíe un mensaje desde su panel, aparecerá aquí.
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
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: 'var(--space-3) var(--space-4)',
                      border: 'none',
                      borderBottom: '1px solid var(--c-borde-suave)',
                      backgroundColor: isSelected ? 'var(--c-primario-suave)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                      borderLeft: isSelected ? '3px solid var(--c-primario)' : '3px solid transparent'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--c-texto)' }}>
                        {chat.agentName}
                      </span>
                      {chat.unreadCount > 0 && (
                        <span
                          className="badge badge-danger"
                          style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '10px' }}
                        >
                          {chat.unreadCount} nuevo{chat.unreadCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--c-texto-suave)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {chat.lastMessage || 'Conversación iniciada'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--c-texto-mutado)', marginTop: '0.2rem' }}>
                      {chat.isAnonymous ? '● Modalidad confidencial' : '● Identificado'}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Panel principal: Conversación activa */}
        <section style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--c-fondo)' }}>
          {!selectedAgentId ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 'var(--space-6)',
                color: 'var(--c-texto-suave)',
                textAlign: 'center'
              }}
            >
              <Icon name="shield" size={40} style={{ color: 'var(--c-primario)', marginBottom: '1rem', opacity: 0.8 }} />
              <h3 style={{ margin: '0 0 0.5rem', color: 'var(--c-texto)' }}>
                Canal Listo para Atención Ocupacional
              </h3>
              <p style={{ maxWidth: '420px', margin: 0, fontSize: '0.88rem', lineHeight: 1.5 }}>
                Selecciona un agente de la lista lateral para iniciar la orientación en vivo. Si aún no hay mensajes, el canal se actualizará tan pronto como un operador solicite acompañamiento.
              </p>
            </div>
          ) : (
            <>
              {/* Cabecera del chat seleccionado */}
              <div
                style={{
                  padding: 'var(--space-3) var(--space-5)',
                  backgroundColor: 'var(--c-superficie)',
                  borderBottom: '1px solid var(--c-borde-suave)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--c-texto)' }}>
                    {activeChat?.agentName || `Agente (${selectedAgentId})`}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--c-texto-suave)', marginTop: '0.15rem' }}>
                    <span>ID: {selectedAgentId}</span>
                    <span>·</span>
                    <span style={{ color: 'var(--c-primario)', fontWeight: 600 }}>
                      {activeChat?.isAnonymous ? 'Reserva de identidad' : 'Datos visibles para SST'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={handleCloseChat}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    title="Cerrar sesión activa de chat"
                  >
                    <Icon name="xCircle" size={14} />
                    <span>Concluir sesión</span>
                  </button>
                </div>
              </div>

              {/* Registro de mensajes */}
              <div
                role="log"
                aria-live="polite"
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  maxHeight: '380px'
                }}
              >
                {currentMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--c-texto-mutado)', margin: 'auto', fontSize: '0.85rem' }}>
                    <p style={{ margin: 0 }}>Esperando primer mensaje o envía una orientación inicial al agente.</p>
                  </div>
                ) : (
                  currentMessages.map((msg) => {
                    const isSst = msg.senderRole === 'SST';
                    return (
                      <div
                        key={msg.id}
                        style={{
                          alignSelf: isSst ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          padding: '0.65rem 0.9rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isSst ? 'var(--c-primario)' : 'var(--c-superficie)',
                          color: isSst ? '#ffffff' : 'var(--c-texto)',
                          boxShadow: isSst ? 'none' : '0 1px 2px rgba(0,0,0,0.06)',
                          border: isSst ? 'none' : '1px solid var(--c-borde-suave)'
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            marginBottom: '0.2rem',
                            color: isSst ? '#ccfbf1' : 'var(--c-primario)'
                          }}
                        >
                          {isSst ? 'Tú (Especialista SST)' : (msg.senderName || 'Agente')}
                        </div>
                        <div style={{ fontSize: '0.88rem', lineHeight: 1.45 }}>{msg.text}</div>
                        <div style={{ fontSize: '0.68rem', textAlign: 'right', marginTop: '0.25rem', opacity: 0.8 }}>
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Respuestas rápidas ocupacionales */}
              <div
                style={{
                  padding: '0.4rem var(--space-4)',
                  backgroundColor: 'var(--c-superficie)',
                  borderTop: '1px solid var(--c-borde-suave)',
                  display: 'flex',
                  gap: '0.4rem',
                  overflowX: 'auto',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: '0.72rem', color: 'var(--c-texto-mutado)', whiteSpace: 'nowrap' }}>
                  Atajos SST:
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickReply('Hola, te escucho con total reserva y atención. ¿Cómo te sientes en este momento?')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '2px 8px', whiteSpace: 'nowrap' }}
                >
                  Saludo empático
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickReply('Si experimentas sobrecarga por llamadas continuas, tómate 2 minutos para respirar y relajar hombros.')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '2px 8px', whiteSpace: 'nowrap' }}
                >
                  Pausa de respiración
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickReply('¿Deseas que coordinemos una pausa activa o valoración con el equipo de salud ocupacional?')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '2px 8px', whiteSpace: 'nowrap' }}
                >
                  Proponer valoración
                </button>
              </div>

              {/* Formulario de envío de respuesta */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: 'var(--c-superficie)',
                  borderTop: '1px solid var(--c-borde-suave)',
                  display: 'flex',
                  gap: '0.5rem'
                }}
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Redacta tu orientación o mensaje confidencial para el agente..."
                  className="form-input"
                  style={{ flex: 1 }}
                  disabled={!isConnected}
                  aria-label="Mensaje para el agente"
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!isConnected || !inputText.trim()}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
                >
                  <Icon name="send" size={16} />
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
