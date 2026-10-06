import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../../core/socket/socketClient';
import { authService } from '../../../core/auth/authService';
import { Icon } from '../../../core/components/Icon';

/**
 * Componente de Chat de Acompañamiento Psicosocial en Tiempo Real (Socket.io).
 * Garantiza canal cifrado en transporte, confidencial entre el agente y el especialista
 * de Seguridad y Salud en el Trabajo (SST), excluyendo a supervisores operativos.
 */
export function SupportChatCard() {
  const { socket, isConnected } = useSocket();
  const currentUser = authService.getCurrentUser();
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      senderRole: 'SST',
      text: 'Hola. Este es tu canal directo y confidencial con el equipo de Salud Ocupacional (SST). ¿En qué podemos orientarte hoy?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    function handleIncomingMessage(msg) {
      setMessages((prev) => [...prev, msg]);
    }

    socket.on('support:message:received', handleIncomingMessage);
    return () => {
      socket.off('support:message:received', handleIncomingMessage);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    socket.emit('support:message:send', {
      text: inputText.trim()
    });
    setInputText('');
  };

  return (
    <section className="support-chat-card card" aria-labelledby="chat-heading" style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--c-borde)', paddingBottom: '0.75rem' }}>
        <div>
          <h2 id="chat-heading" style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>
            Chat de Orientación Psicosocial en Tiempo Real
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--c-texto-suave)' }}>
            Canal confidencial con el especialista de turno (Ley 1581 / Res. 2646)
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 500 }}>
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
            {isConnected ? 'En línea (SST activo)' : 'Conectando...'}
          </span>
        </div>
      </div>

      {/* Lista de Mensajes */}
      <div
        role="log"
        aria-live="polite"
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          padding: '1rem',
          backgroundColor: 'var(--c-fondo)',
          borderRadius: 'var(--radio-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}
      >
        {messages.map((m) => {
          const isMe = m.senderId === currentUser?.id || m.senderRole === 'AGENTE';
          return (
            <div
              key={m.id}
              style={{
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                padding: '0.65rem 0.9rem',
                borderRadius: 'var(--radio-md)',
                backgroundColor: isMe ? 'var(--c-primario)' : 'var(--c-superficie)',
                color: isMe ? '#ffffff' : 'var(--c-texto)',
                boxShadow: isMe ? 'none' : '0 1px 2px rgba(0,0,0,0.06)',
                border: isMe ? 'none' : '1px solid var(--c-borde)'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem', color: isMe ? '#ccfbf1' : 'var(--c-primario)' }}>
                {isMe ? 'Tú (Agente)' : 'Especialista SST'}
              </div>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.4 }}>{m.text}</div>
              <div style={{ fontSize: '0.7rem', textAlign: 'right', marginTop: '0.25rem', opacity: 0.8 }}>
                {m.timestamp ? (m.timestamp.length > 8 ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : m.timestamp) : ''}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Formulario de Entrada */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Escribe tu mensaje confidencial aquí..."
          className="form-input"
          style={{ flex: 1 }}
          disabled={!isConnected}
          aria-label="Mensaje para el especialista SST"
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!isConnected || !inputText.trim()}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
        >
          <Icon name="send" size={16} />
          <span>Enviar</span>
        </button>
      </form>
    </section>
  );
}
