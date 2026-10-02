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
 * ¿POR QUÉ sessionStorage (a través de browserStorage)?
 * En entornos de BPO los puestos suelen ser compartidos (hot-desking).
 * Guardar el token en sessionStorage garantiza que al cerrar la pestaña
 * o el navegador, la sesión se invalide automáticamente, mitigando riesgos
 * de acceso no autorizado por el siguiente agente que use la máquina.
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
 * ¿POR QUÉ un interceptor de solicitud?
 * Permite inyectar dinámicamente el token Bearer en los headers de cada
 * petición saliente, evitando tener que agregarlo manualmente en cada servicio,
 * manteniendo el código limpio y centralizado (DRY).
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
 * ¿POR QUÉ un interceptor de respuesta?
 * Para interceptar respuestas de la API antes de que lleguen a los servicios de la UI.
 * Si el backend responde con un 401 (Token Inválido o Expirado), podemos limpiar la
 * sesión de inmediato a nivel de infraestructura, sin que cada componente visual
 * tenga que programar esta lógica de protección.
 */
apiClient.interceptors.response.use(
  (response) => {
    // Axios retorna un objeto de respuesta, normalmente los datos de negocio vienen en response.data
    // Simplificamos la vida de los servicios retornando la data directamente.
    return response.data;
  },
  (error) => {
    // Si la respuesta es 401 (No autorizado), limpiamos el token de seguridad.
    if (error.response && error.response.status === 401) {
      removeAuthToken();
    }
    return Promise.reject(error);
  }
);
