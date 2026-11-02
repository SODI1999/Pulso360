const auditDateFormatter = new Intl.DateTimeFormat('es-CO', {
  timeZone: 'America/Bogota',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23'
});

/**
 * Localiza el instante del evento en la zona de la operación sin modificar su valor original.
 * @param {string} value Fecha recibida del servicio de auditoría.
 * @returns {string} Fecha legible con zona explícita, o aviso si falta/no es válida.
 */
export function formatAuditDate(value) {
  if (!value) return 'Fecha no registrada';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Fecha no válida'
    : `${auditDateFormatter.format(date)} · Bogotá (UTC−5)`;
}

const actionLabels = {
  CREACION_CAMPANA: 'Creación de campaña',
  ACTUALIZACION_CAMPANA: 'Actualización de campaña',
  CREACION_EQUIPO: 'Creación de equipo',
  ACTUALIZACION_EQUIPO: 'Actualización de equipo',
  CREACION_USUARIO: 'Creación de usuario',
  ACTUALIZACION_USUARIO: 'Actualización de usuario',
  PUBLICACION_POLITICA: 'Publicación de política',
  SOLICITUD_HABEAS_DATA: 'Solicitud de Habeas Data',
  RESPUESTA_HABEAS_DATA: 'Respuesta a Habeas Data',
  ACTUALIZACION_CONSENTIMIENTO: 'Actualización de consentimiento',
  REVOCACION_CONSENTIMIENTO: 'Revocación de consentimiento',
  REGISTRO_CHECKIN: 'Registro de check-in',
  EDICION_CHECKIN: 'Edición de check-in',
  CREACION_BITACORA: 'Creación de entrada en bitácora',
  EDICION_BITACORA: 'Edición de entrada en bitácora',
  ELIMINACION_BITACORA: 'Eliminación de entrada en bitácora',
  CORRECCION_NLP: 'Corrección del análisis léxico',
  SOLICITUD_APOYO: 'Solicitud de acompañamiento',
  ACTIVACION_CHAT_APOYO: 'Apertura de conversación de apoyo',
  ENVIO_MENSAJE_APOYO: 'Envío de mensaje de apoyo',
  CIERRE_CHAT_APOYO: 'Cierre de conversación de apoyo',
  ACTUALIZACION_APOYO: 'Actualización de solicitud de apoyo',
  EXPORTACION_AUDITORIA: 'Exportación de auditoría',
  GENERACION_REPORTE: 'Generación de reporte',
  EXPORTACION_REPORTE: 'Exportación de reporte',
  SOLICITUD_RESET_PASSWORD: 'Solicitud de recuperación de contraseña',
  RESTABLECIMIENTO_PASSWORD: 'Restablecimiento de contraseña'
};

/**
 * Presenta códigos conocidos sin alterar el código conservado en el detalle del evento.
 * @param {string} code Código de acción emitido por el backend.
 * @returns {string} Etiqueta de acción; los códigos desconocidos conservan sus palabras.
 */
export function formatAuditAction(code) {
  if (!code) return 'Operación no registrada';
  if (actionLabels[code]) return actionLabels[code];
  const words = code.replaceAll('_', ' ').toLocaleLowerCase('es-CO');
  return words.charAt(0).toLocaleUpperCase('es-CO') + words.slice(1);
}
