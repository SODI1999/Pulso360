// frontend/src/core/socket/socketClient.jsx
/**
 * @file socketClient.jsx
 * @description Cliente WebSocket centralizado con Socket.io para comunicación en tiempo real.
 * Gestiona autenticación reactiva con JWT, salas de SST y canal de chat de apoyo confidencial.
 */

import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import { env } from '../config/env';
import { getAuthToken } from '../api/apiClient';

let socketInstance = null;

/** Una identidad nueva requiere otro handshake; cambiar auth no cambia una conexión abierta. */
export function synchronizeSocketAuthentication(socket, token) {
  if (!token) { socket.disconnect(); socket.auth = { token: null }; return; }
  if (socket.auth?.token !== token) socket.disconnect();
  socket.auth = { token };
  if (!socket.connected) socket.connect();
}

/**
 * Obtiene la URL base para la conexión de WebSockets eliminando el prefijo de la API REST.
 */
function getSocketUrl() {
  return env.apiBaseUrl.replace(/\/api\/v1\/?$/, '');
}

/**
 * Obtiene o crea la conexión singleton de Socket.io.
 * @returns {import('socket.io-client').Socket}
 */
export function getSocket() {
  const token = getAuthToken();

  if (!socketInstance) {
    socketInstance = io(getSocketUrl(), {
      auth: { token },
      autoConnect: Boolean(token),
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('pulso360-session-changed', () => {
        const nextToken = getAuthToken();
        synchronizeSocketAuthentication(socketInstance, nextToken);
      });

      window.addEventListener('pulso360-logout', () => {
        synchronizeSocketAuthentication(socketInstance, null);
      });

      window.addEventListener('pulso360-session-expired', () => {
        socketInstance.disconnect();
      });
    }
  } else {
    synchronizeSocketAuthentication(socketInstance, token);
  }

  return socketInstance;
}

/**
 * Hook de React para consumir eventos y estado de conexión en tiempo real.
 * @returns {{ socket: import('socket.io-client').Socket, isConnected: boolean }}
 */
export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socket = getSocket();

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }

    if (socket.connected) {
      setIsConnected(true);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [socket]);

  return { socket, isConnected };
}
