import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Espera confirmación de persistencia por evento o acknowledgement Socket.IO.
 * Nunca almacena texto ni envía mensajes mientras la conexión está caída.
 */
export function confirmChatMessage(socket, payload, { signal, timeoutMs = 10000 } = {}) {
  if (!socket.connected) return Promise.reject(new Error('Sin conexión al chat. Tu texto se conserva; vuelve a enviar cuando se restablezca.'));
  return new Promise((resolve, reject) => {
    let settled = false;
    let timer;
    function finish(error, message) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.off('support:message:received', received);
      socket.off('support:error', failed);
      socket.off('disconnect', disconnected);
      signal?.removeEventListener('abort', cancelled);
      if (error) reject(error); else resolve(message);
    }
    function received(message) {
      if (message.sessionId === payload.sessionId && message.clientMsgId === payload.clientMsgId) finish(null, message);
    }
    function failed(result) {
      if (result.clientMsgId === payload.clientMsgId) finish(new Error(result.error?.message || 'No se pudo enviar. Tu texto se conserva para reintentar.'));
    }
    function disconnected() { finish(new Error('Se perdió la conexión antes de confirmar el envío. Tu texto se conserva para reintentar.')); }
    function cancelled() { finish(new DOMException('Se cerró la conversación.', 'AbortError')); }
    socket.on('support:message:received', received);
    socket.on('support:error', failed);
    socket.on('disconnect', disconnected);
    signal?.addEventListener('abort', cancelled, { once: true });
    if (signal?.aborted) return cancelled();
    timer = setTimeout(() => finish(new Error('No recibimos confirmación del envío. Tu texto se conserva; puedes reintentar sin duplicar este intento.')), timeoutMs);
    try { socket.emit('support:message:send', payload, result => {
      if (result?.success && result.data?.sessionId === payload.sessionId) finish(null, result.data);
      else if (result?.success === false) finish(new Error(result.error?.message || 'No se pudo confirmar el envío.'));
    }); } catch (error) { finish(error); }
  });
}

/** Coordina una entrega pendiente por conversación y conserva la clave del reintento en RAM. */
export function useChatDelivery(socket, sessionId) {
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const contextRef = useRef(null);
  const attemptRef = useRef(null);

  useEffect(() => {
    const context = { controller: new AbortController(), sending: false };
    contextRef.current = context;
    attemptRef.current = null;
    setIsSending(false);
    setSendError(null);
    return () => context.controller.abort();
  }, [socket, sessionId]);

  const sendMessage = useCallback(async text => {
    const context = contextRef.current;
    if (!context || context.sending || !sessionId || context.controller.signal.aborted) return null;
    context.sending = true;
    setIsSending(true);
    setSendError(null);
    const previous = attemptRef.current;
    const attempt = previous?.sessionId === sessionId && previous.text === text ? previous
      : { sessionId, text, clientMsgId: 'cmsg-' + crypto.randomUUID() };
    attemptRef.current = attempt;
    try {
      const confirmed = await confirmChatMessage(socket, attempt, { signal: context.controller.signal });
      if (context.controller.signal.aborted) return null;
      attemptRef.current = null;
      return confirmed;
    } catch (error) {
      if (!context.controller.signal.aborted) setSendError(error.message);
      return null;
    } finally {
      context.sending = false;
      if (contextRef.current === context && !context.controller.signal.aborted) setIsSending(false);
    }
  }, [socket, sessionId]);

  return { isSending, sendError, sendMessage };
}
