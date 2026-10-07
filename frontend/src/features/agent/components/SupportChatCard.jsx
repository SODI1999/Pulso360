import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../../core/socket/socketClient';
import { authService } from '../../../core/auth/authService';
import { Icon } from '../../../core/components/Icon';

/**
 * Componente de Chat de Acompañamiento Psicosocial en Tiempo Real (Socket.io).
 * Garantiza canal cifrado en transporte, confidencial entre el agente y el especialista
 * de Seguridad y Salud en el Trabajo (SST), excluyendo totalmente a supervisores operativos.
 */
export function SupportChatCard() {
  const { socket, isConnected } = useSocket();
  const currentUser = authService.getCurrentUser();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      senderRole: 'SST',
      senderName: 'Especialista SST (Salud Ocupacional)',
      text: 'Hola. Este es tu canal directo y confidencial con el equipo de Salud Ocupacional (SST). ¿En qué podemos orientarte hoy?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

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
          senderRole: 'SST',
          senderName: 'Sistema de Acompañamiento',
          text: payload?.message || 'La sesión de orientación en vivo ha finalizado. Puedes volver a escribir cuando lo requieras.',
          timestamp: new Date().toISOString()
        }
      ]);
    }

    socket.on('support:message:received', handleIncomingMessage);
    socket.on('support:chat:ended', handleChatEnded);

    return () => {
      socket.off('support:message:received', handleIncomingMessage);
      socket.off('support:chat:ended', handleChatEnded);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e, customText = null) => {
    e?.preventDefault();
    const textToSend = (customText || inputText).trim();
    if (!textToSend || !isConnected) return;

    socket.emit('support:message:send', {
      text: textToSend,
      isAnonymous,
      senderName: currentUser?.name || currentUser?.nombres || 'Agente de Contact Center'
    });

    if (!customText) {
      setInputText('');
    }
  };

  const handleEndChat = () => {
    if (window.confirm('¿Deseas concluir la conversación actual con el especialista de SST?')) {
      socket.emit('support:chat:close');
    }
  };

  return (
    <section className="support-chat-card card" aria-labelledby="chat-heading" style={{ marginTop: '1.5rem', border: '1px solid var(--c-borde-suave)' }}>
      {/* Encabezado del Chat */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          borderBottom: '1px solid var(--c-borde-suave)',
          paddingBottom: '0.75rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
      >
        <div>
          <h2 id="chat-heading" style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700, color: 'var(--c-texto)' }}>
            Chat de Orientación Psicosocial en Tiempo Real
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: 'var(--c-texto-suave)' }}>
            Canal confidencial con el especialista de turno (Ley 1581 / Res. 2646) · Supervisores excluidos
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Indicador de Conexión */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600 }}>
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
              {isConnected ? '● En línea (SST activo)' : '○ Conectando...'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleEndChat}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '3px 8px' }}
            title="Concluir conversación en vivo"
          >
            Concluir chat
          </button>
        </div>
      </div>

      {/* Controles de Confidencialidad y Modo Anónimo */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--c-fondo)',
          padding: '0.5rem 0.75rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '0.75rem',
          border: '1px solid var(--c-borde-suave)'
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--c-texto)', cursor: 'pointer', margin: 0 }}>
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            style={{ accentColor: 'var(--c-primario)' }}
          />
          <span>Modo confidencial (Ocultar mi nombre real al especialista SST)</span>
        </label>
        <span style={{ fontSize: '0.75rem', color: 'var(--c-texto-suave)' }}>
          {isAnonymous ? 'Mostrando: Agente Confidencial' : `Mostrando: ${currentUser?.name || 'Agente'}`}
        </span>
      </div>

      {/* Historial de Mensajes */}
      <div
        role="log"
        aria-live="polite"
        style={{
          maxHeight: '320px',
          overflowY: 'auto',
          padding: '1rem',
          backgroundColor: 'var(--c-fondo)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          border: '1px solid var(--c-borde-suave)'
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
                padding: '0.65rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isMe ? 'var(--c-primario)' : 'var(--c-superficie)',
                color: isMe ? '#ffffff' : 'var(--c-texto)',
                boxShadow: isMe ? 'none' : '0 1px 2px rgba(0,0,0,0.06)',
                border: isMe ? 'none' : '1px solid var(--c-borde-suave)'
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  marginBottom: '0.2rem',
                  color: isMe ? '#ccfbf1' : 'var(--c-primario)'
                }}
              >
                {isMe ? 'Tú (Agente)' : (m.senderName || 'Especialista SST')}
              </div>
              <div style={{ fontSize: '0.88rem', lineHeight: 1.45 }}>{m.text}</div>
              <div style={{ fontSize: '0.68rem', textAlign: 'right', marginTop: '0.25rem', opacity: 0.8 }}>
                {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Atajos de consulta rápida para el agente */}
      <div
        style={{
          display: 'flex',
          gap: '0.4rem',
          overflowX: 'auto',
          padding: '0.5rem 0',
          alignItems: 'center'
        }}
      >
        <span style={{ fontSize: '0.75rem', color: 'var(--c-texto-suave)', whiteSpace: 'nowrap' }}>
          Consultas rápidas:
        </span>
        <button
          type="button"
          onClick={() => handleSendMessage(null, 'Siento agotamiento y sobrecarga por llamadas continuas.')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.72rem', padding: '2px 8px', whiteSpace: 'nowrap' }}
          disabled={!isConnected}
        >
          Sobrecarga en llamadas
        </button>
        <button
          type="button"
          onClick={() => handleSendMessage(null, 'Tengo tensión muscular en el cuello y fatiga visual en la pantalla.')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.72rem', padding: '2px 8px', whiteSpace: 'nowrap' }}
          disabled={!isConnected}
        >
          Tensión física / cervical
        </button>
        <button
          type="button"
          onClick={() => handleSendMessage(null, '¿Podemos coordinar una pausa activa guiada o ejercicio de respiración?')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.72rem', padding: '2px 8px', whiteSpace: 'nowrap' }}
          disabled={!isConnected}
        >
          Solicitar pausa activa
        </button>
      </div>

      {/* Formulario de Entrada */}
      <form onSubmit={(e) => handleSendMessage(e)} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
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
