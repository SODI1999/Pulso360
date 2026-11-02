import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Conserva la lectura del historial y avisa de nuevas entradas fuera del final.
 * No interpreta roles, contenido ni entrega; el consumidor confirma sus envíos.
 * @param {object} options Configuración del historial visible.
 * @param {Array<{id: string}>} options.messages Mensajes reconciliados de la conversación.
 * @param {string|undefined} options.conversationId Identidad del canal, para reiniciar la lectura.
 * @param {boolean} options.enabled El contenedor está montado y tiene datos disponibles.
 * @returns {{containerRef: object, onScroll: Function, hasNewMessages: boolean, scrollToLatest: Function}}
 * Referencia, seguimiento de posición, aviso y acción explícita para ir al final.
 */
export function useChatScroll({ messages, conversationId, enabled }) {
  const containerRef = useRef(null);
  const atEndRef = useRef(true);
  const previousRef = useRef({ conversationId: null, ids: new Set(), initialized: false });
  const [hasNewMessages, setHasNewMessages] = useState(false);

  const scrollToLatest = useCallback(() => {
    const container = containerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
    atEndRef.current = true;
    setHasNewMessages(false);
  }, []);

  const onScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    atEndRef.current = container.scrollHeight - container.scrollTop - container.clientHeight <= 48;
    if (atEndRef.current) setHasNewMessages(false);
  }, []);

  useLayoutEffect(() => {
    if (!enabled || !containerRef.current) return;
    const previous = previousRef.current;
    const changedConversation = previous.conversationId !== conversationId;
    const hasNewEntries = messages.some(message => !previous.ids.has(message.id));
    if (changedConversation || !previous.initialized || atEndRef.current) {
      scrollToLatest();
    } else if (hasNewEntries) {
      setHasNewMessages(true);
    }
    previousRef.current = {
      conversationId,
      ids: new Set(messages.map(message => message.id)),
      initialized: true
    };
  }, [messages, conversationId, enabled, scrollToLatest]);

  useEffect(() => {
    const container = containerRef.current;
    if (!enabled || !container) return;
    const observer = new ResizeObserver(() => {
      if (atEndRef.current) scrollToLatest();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [enabled, scrollToLatest]);

  return { containerRef, onScroll, hasNewMessages, scrollToLatest };
}
