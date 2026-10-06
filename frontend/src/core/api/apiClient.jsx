// src/core/api/apiClient.jsx
/**
 * @file apiClient.jsx
 * @description Cliente HTTP desacoplado para la integración con la API REST de Pulso360.
 * Este módulo maneja la configuración base de Axios, la inyección del token JWT en cada
 * petición y la intercepción de errores de autorización de manera transparente para la UI.
 */
import axios from 'axios';
import { env } from '../config/env';
import { sessionData } from '../storage/browserStorage';

const AUTH_TOKEN_KEY = 'pulso360_auth_token';

/**
 * Guarda el token de autorización en el almacenamiento de sesión.
 * Almacenamiento de sesión requerido para la mitigación de persistencia
 * residual en estaciones de trabajo compartidas (hot-desking),
 * típicas de centros de contacto BPO.
 * @param {string} token - Token JWT emitido por el backend.
 */
export const setAuthToken = (token) => {
  sessionData.setItem(AUTH_TOKEN_KEY, token);
};

/**
 * Recupera el token de autorización almacenado.
 * @returns {string|null} El token JWT o null si no existe.
 */
export const getAuthToken = () => {
  return sessionData.getItem(AUTH_TOKEN_KEY);
};

/**
 * Elimina el token de autorización del almacenamiento.
 */
export const removeAuthToken = () => {
  sessionData.removeItem(AUTH_TOKEN_KEY);
};

// Instancia base de Axios
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 8000 // Timeout prudente de 8 segundos
});

// Interceptor de Solicitud: Inyección del Token
/**
 * Interceptor de solicitud para la inyección centralizada del token
 * Bearer bajo el principio DRY.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Respuesta: Manejo Global de Errores
/**
 * Interceptor de respuesta que implementa la captura unificada de
 * errores 401 para la revocación de credenciales a nivel de transporte.
 */
apiClient.interceptors.response.use(
  (response) => {
    if (response.data?.success === false) {
      const error = new Error(response.data.error?.message || 'La operación no se completó.');
      error.code = response.data.error?.code;
      error.response = response;
      return Promise.reject(error);
    }
    if (typeof window !== 'undefined' && ['post','put','patch','delete'].includes(response.config?.method)
        && !response.config.url?.startsWith('/auth/') && response.config.url !== '/agent/consent') {
      window.dispatchEvent(new Event('pulso360-api-mutation'));
    }
    return response.data;
  },
  (error) => {
    // Si la respuesta es 401 (No autorizado), limpiamos el token y sesión.
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('pulso360-session-expired'));
      removeAuthToken();
      sessionData.removeItem('pulso360_current_session');
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('pulso360-session-changed'));
    }
    return Promise.reject(error);
  }
);
