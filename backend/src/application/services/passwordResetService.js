import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import {transaction} from '../../infrastructure/db.js';
import { passwordResetRepository } from '../../infrastructure/repositories/passwordResetRepository.js';
import { mailDelivery } from '../../infrastructure/mailDelivery.js';
import { createLog } from '../../infrastructure/repositories/auditorRepository.js';
import { AppError } from '../errors/AppError.js';

const digest=token=>crypto.createHash('sha256').update(token).digest('hex');
const genericMessage='Si el correo está registrado y la entrega está disponible, recibirás un enlace de recuperación. El enlace caduca en 30 minutos.';
const validToken=token=>typeof token==='string'&&/^[a-f0-9]{64}$/.test(token);
function passwordHash(password) {
  if(typeof password!=='string'||password.length<8||password.length>72||!/[A-Z]/.test(password)||!/[a-z]/.test(password)||!/[0-9]/.test(password))
    throw new AppError('La contraseña debe tener de 8 a 72 caracteres, mayúsculas, minúsculas y números','INVALID_PASSWORD',400);
  return bcrypt.hash(password,10);
}
export const passwordResetService={
  async request({correo}) {
    mailDelivery.assertConfigured();
    if(typeof correo!=='string'||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim()))throw new AppError('Correo institucional inválido','INVALID_EMAIL',400);
    const user=await passwordResetRepository.findActiveUser(correo.trim());
    if(!user)return {message:genericMessage,expiresInMinutes:30};
    const token=crypto.randomBytes(32).toString('hex'),id=crypto.randomUUID();
    await transaction(async client=>{
      await passwordResetRepository.createToken(id, user.id, digest(token), client);
      await createLog({usuarioId:user.id,rol:user.rol_codigo,action:'SOLICITUD_RESET_PASSWORD',resource:'password_reset_tokens',resourceId:id,details:{expirationMinutes:30}},client);
    });
    let delivered=true;
    try { await mailDelivery.sendReset(user.correo_institucional,token); } catch { delivered=false; }
    await transaction(async client=>{
      await passwordResetRepository.recordDelivery(id, delivered?'DELIVERED':'FAILED', client);
      await createLog({usuarioId:user.id,rol:user.rol_codigo,action:delivered?'ENTREGA_RECUPERACION':'ENTREGA_RECUPERACION_FALLIDA',resource:'password_reset_tokens',resourceId:id,details:{delivery:delivered?'DELIVERED':'FAILED'}},client);
    });
    // La respuesta no confirma existencia de cuenta ni afirma entrega de un correo concreto.
    return {message:genericMessage,expiresInMinutes:30};
  },
  async validate({token}) {
    if(!validToken(token))return {valid:false,message:'Enlace inválido, expirado o utilizado.'};
    const email=await passwordResetRepository.findEligibleEmail(digest(token));
    return email?{valid:true,email}:{valid:false,message:'Enlace inválido, expirado o utilizado.'};
  },
  async confirm({token,contrasena}) {
    if(!validToken(token))throw new AppError('Enlace inválido, expirado o utilizado','RESET_TOKEN_INVALID',400);
    const hashed=await passwordHash(contrasena);
    return transaction(async client=>{
      const user=await passwordResetRepository.lockEligibleUser(digest(token), client);
      if(!user)throw new AppError('Enlace inválido, expirado o utilizado','RESET_TOKEN_INVALID',400);
      await passwordResetRepository.replacePassword(user.id, hashed, client);
      await createLog({usuarioId:user.id,rol:user.rol_codigo,action:'RESTABLECIMIENTO_PASSWORD',resource:'usuarios',resourceId:user.id,details:{sessionsRevoked:true}},client);
      return {message:'Contraseña actualizada. Inicia sesión con la nueva contraseña.'};
    });
  }
};
