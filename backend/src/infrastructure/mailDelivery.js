/**
 * @fileoverview Servicio de infraestructura para entrega de correos electrónicos transaccionales.
 * Capa: P10 · infrastructure
 *
 * Configura transporte SMTP seguro con Nodemailer (STARTTLS / TLS 1.2+ obligatorio)
 * para despacho de enlaces de recuperación de contraseña temporal.
 *
 * @module infrastructure/mailDelivery
 */

import nodemailer from 'nodemailer';
import { AppError } from '../application/errors/AppError.js';

let testTransport;

/**
 * Inyecta un transporte simulado para pruebas automatizadas.
 * Exclusivo para entorno de test (NODE_ENV === 'test').
 *
 * @param {Object|null} transport - Transporte controlado con sendMail asíncrono; null restaura SMTP.
 * @returns {void}
 * @throws {Error} Si se intenta invocar fuera del entorno de test.
 */
export function setMailTransportForTests(transport) {
  if (process.env.NODE_ENV !== 'test') throw new Error('Transporte controlado reservado a pruebas.');
  testTransport = transport;
}
/**
 * Valida la configuración SMTP y la URL pública sin devolver credenciales.
 * @returns {{port: number, from: string, frontend: URL}} Configuración de entrega.
 * @throws {AppError} PASSWORD_RESET_UNAVAILABLE si falta configuración válida.
 */
function configuration() {
  const port=Number(process.env.SMTP_PORT||587);
  const from=process.env.SMTP_FROM;
  let frontend;
  try { frontend=new URL(process.env.PUBLIC_FRONTEND_URL); } catch { /* Validación común abajo. */ }
  if (!frontend || !['http:','https:'].includes(frontend.protocol) || (!testTransport && (!process.env.SMTP_HOST || !from || !Number.isInteger(port) || port<1 || port>65535)))
    throw new AppError('La recuperación por correo no está configurada','PASSWORD_RESET_UNAVAILABLE',503);
  return {port,from:from||'fixture@example.test',frontend};
}
export const mailDelivery={
  /**
   * Comprueba la configuración antes de crear un token de recuperación.
   * @returns {{port: number, from: string, frontend: URL}} Configuración validada.
   * @throws {AppError} PASSWORD_RESET_UNAVAILABLE si el correo no está configurado.
   */
  assertConfigured: configuration,
  /**
   * Envía el enlace por SMTP con TLS; el token no se registra en logs.
   * La aceptación del relay no acredita recepción en el buzón del destinatario.
   * @param {string} email - Correo del titular.
   * @param {string} token - Token temporal plano usado únicamente en el mensaje.
   * @returns {Promise<void>}
   * @throws {AppError|Error} Configuración inválida o fallo de entrega.
   */
  async sendReset(email,token) {
    const config=configuration();
    const transport=testTransport||nodemailer.createTransport({host:process.env.SMTP_HOST,port:config.port,
      secure:config.port===465,requireTLS:config.port!==465,
      auth:process.env.SMTP_USER?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}:undefined,
      tls:{rejectUnauthorized:true,minVersion:'TLSv1.2'},connectionTimeout:6000,greetingTimeout:6000,socketTimeout:6000,
      disableFileAccess:true,disableUrlAccess:true,logger:false,debug:false});
    const url=new URL('/nueva-clave',config.frontend);url.searchParams.set('token',token);
    const info=await transport.sendMail({from:config.from,to:email,subject:'Recuperación de acceso a Pulso360',
      text:`Solicitaste recuperar tu acceso. Abre este enlace dentro de los próximos 30 minutos: ${url.href}\nSi no lo solicitaste, puedes ignorar este correo.`});
    if(info.rejected?.length || (Array.isArray(info.accepted)&&!info.accepted.length)) throw new Error('Entrega rechazada.');
  }
};
