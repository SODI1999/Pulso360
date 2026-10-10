// Recorrido local contra PostgreSQL técnico. Crea únicamente fixtures propios y los
// elimina al detener este proceso; no usa la base habitual ni inicia el scheduler.
import { randomUUID, randomBytes } from 'node:crypto';
import pool from '../src/infrastructure/db.js';
import http from 'node:http';
if (process.env.NODE_ENV !== 'test' || process.env.DB_NAME_TEST !== 'pulso360_plan_test_20261005') throw new Error('Recorrido reservado a la base técnica.');
process.env.JWT_SECRET = randomBytes(48).toString('hex');
const { default: app } = await import('../src/app.js');
const { initSocketServer } = await import('../src/infrastructure/socket.js');
const suffix = randomUUID().slice(0, 8);
const ids = ['AGENTE','SST'].map(role => `fx-chat-ui-${role}-${suffix}`);
let server, io;
async function cleanup() {
  await pool.query('DELETE FROM mensajes_chat_soporte WHERE sesion_id IN (SELECT id FROM sesiones_chat_soporte WHERE agente_id=ANY($1::varchar[]))', [ids]);
  await pool.query('DELETE FROM sesiones_chat_soporte WHERE agente_id=ANY($1::varchar[])', [ids]);
  await pool.query('DELETE FROM solicitudes_apoyo WHERE owner_user_id=ANY($1::varchar[])', [ids]);
  await pool.query('DELETE FROM consentimientos WHERE usuario_id=ANY($1::varchar[])', [ids]);
  await pool.query('DELETE FROM usuarios WHERE id=ANY($1::varchar[])', [ids]);
}
try {
  for (const [index, role] of ['AGENTE','SST'].entries()) {
    await pool.query(`INSERT INTO usuarios(id,rol_codigo,correo_institucional,contrasena_hash,nombres,apellidos,estado)
      SELECT $1,$2,$3,contrasena_hash,'Fixture chat',$2,'Activo' FROM usuarios WHERE id='usr-1'`, [ids[index],role,(ids[index]+'@example.test').toLowerCase()]);
  }
  await pool.query(`INSERT INTO consentimientos(id,usuario_id,politica_id,tipo_evento,acepta_politica,acepta_aviso_privacidad,c1_checkin,c2_bitacora,c3_apoyo,c4_analitica,c5_contacto)
    SELECT $1,$2,id,'ACTUALIZACION',TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,FALSE FROM politicas_privacidad WHERE estado='PUBLICADA' AND vigente_desde<=NOW()
    ORDER BY vigente_desde DESC,created_at DESC,id DESC LIMIT 1`, [randomUUID(),ids[0]]);
  const requestId = 'ui-request-' + suffix;
  await pool.query(`INSERT INTO solicitudes_apoyo(id,code,mode,owner_user_id,request_date,reason,description,urgency,contact_preference,time_window,status)
    VALUES($1,$2,'anonimo',$3,CURRENT_DATE,'Fixture de orientación','Conversación técnica para verificar envío, fallo y privacidad.','baja','app','No aplica','Recibida')`, [requestId,'UI-CHAT-'+suffix,ids[0]]);
  server = http.createServer(app);
  io = initSocketServer(server);
  server.listen(3107, '127.0.0.1', () => {
    console.log('API técnica: http://127.0.0.1:3107');
    console.log('AGENTE: ' + (ids[0] + '@example.test').toLowerCase());
    console.log('SST: ' + (ids[1] + '@example.test').toLowerCase());
    console.log('Radicado: UI-CHAT-' + suffix);
  });
  let stopping = false;
  async function stop() {
    if (stopping) return;
    stopping = true;
    try { await new Promise(resolve => io.close(resolve)); await cleanup(); }
    finally { await pool.end(); }
  }
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  process.stdin.on('data', data => { if (data.toString().trim() === 'stop') stop().then(() => process.exit(0)); });
} catch (error) {
  await cleanup();
  await pool.end();
  throw error;
}
