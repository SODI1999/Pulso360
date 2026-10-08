// frontend/src/core/api/chatService.jsx
/**
 * @file chatService.jsx
 * @description Servicio cliente REST para sesiones de chat preventivo vinculadas a Radicados de Apoyo SST (RF-10).
 * Modelo preventivo de SG-SST (Ley 1581 / Res. 2646). No es servicio clínico ni diagnóstico.
 */

import { apiClient } from './apiClient';

export const chatService = {
  /**
   * Activa el canal de chat interactivo para un radicado formal de apoyo (SST).
   * @param {string} requestId - Identificador del radicado (ej. 'sup-uuid')
   */
  activateChatForRequest: async (requestId) => {
    const res = await apiClient.post(`/chat/requests/${requestId}/activate`);
    return res.data;
  },

  /**
   * Obtiene la sesión de chat (activa o cerrada) y mensajes vinculados a un radicado formal.
   * Accesible tanto para el Agente propietario como para especialistas SST.
   * @param {string} requestId - Identificador del radicado
   */
  getChatByRequest: async (requestId) => {
    const res = await apiClient.get(`/chat/requests/${requestId}`);
    return res.data;
  },

  /**
   * Obtiene el mapa de radicados con chat activo o histórico para el agente autenticado.
   */
  getAgentActiveChatsMap: async () => {
    const res = await apiClient.get('/chat/agent-active-map');
    return res.data;
  },

  /**
   * Concluye formalmente la sesión de chat con notas preventivas y la pasa a solo lectura.
   * @param {string} sessionId
   * @param {{ reason?: string, notes?: string }} payload
   */
  closeSession: async (sessionId, payload = {}) => {
    const res = await apiClient.post(`/chat/sessions/${sessionId}/close`, payload);
    return res.data;
  },

  /**
   * Obtiene el historial inmutable de mensajes de una sesión dada.
   * @param {string} sessionId
   */
  getSessionMessages: async (sessionId) => {
    const res = await apiClient.get(`/chat/sessions/${sessionId}/messages`);
    return res.data;
  }
};
