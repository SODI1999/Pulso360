// frontend/src/core/api/chatService.jsx
/**
 * @file chatService.jsx
 * @description Servicio cliente REST para persistencia y consulta de sesiones de chat
 * de acompañamiento psicosocial con SST (RF-10, Ley 1581 / Res. 2646).
 */

import { apiClient } from './apiClient';

export const chatService = {
  /**
   * Obtiene la sesión activa para el usuario en sesión.
   * - AGENTE: Obtiene o crea la sesión activa y retorna { session, messages }.
   * - SST: Obtiene el listado de todas las sesiones activas en el centro.
   * @param {{ isAnonymous?: boolean }} params
   */
  getActiveChat: async (params = {}) => {
    const res = await apiClient.get('/chat/active', { params });
    return res.data;
  },

  /**
   * Obtiene los mensajes históricos de una sesión dada.
   * @param {string} sessionId
   */
  getSessionMessages: async (sessionId) => {
    const res = await apiClient.get(`/chat/sessions/${sessionId}/messages`);
    return res.data;
  },

  /**
   * Concluye formalmente la sesión de chat con motivo y notas opcionales.
   * @param {string} sessionId
   * @param {{ reason?: string, notes?: string }} payload
   */
  closeSession: async (sessionId, payload = {}) => {
    const res = await apiClient.post(`/chat/sessions/${sessionId}/close`, payload);
    return res.data;
  }
};
