import nodemailer from 'nodemailer';
import { AppError } from '../application/errors/AppError.js';

let testTransport;
export function setMailTransportForTests(transport) {
  if (process.env.NODE_ENV !== 'test') throw new Error('Transporte controlado reservado a pruebas.');
  testTransport=transport;
}
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
  assertConfigured: configuration,
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
