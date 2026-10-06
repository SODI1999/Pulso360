// Fixtures identificables para el recorrido UI. Nunca opera sobre la base habitual.
import crypto from 'node:crypto';
import pool from '../src/infrastructure/db.js';
import { currentJourney } from '../src/domain/journey.js';

const prefix = 'fx-browser-';
const ids = ['agente','supervisor','sst','admin','auditor','cohort-1','cohort-2','cohort-3','cohort-4'].map(name => prefix + name);
if (process.env.NODE_ENV !== 'test' || process.env.DB_NAME_TEST !== 'pulso360_plan_test_20261005') throw new Error('Base de fixtures no autorizada.');
const mode = process.argv[2];
if (!['prepare','cleanup'].includes(mode)) throw new Error('Usa prepare o cleanup.');
try {
  if (mode === 'prepare') {
    for (const id of ids) {
      const name = id.slice(prefix.length);
      const role = ['supervisor','sst','admin','auditor'].includes(name) ? name.toUpperCase() : 'AGENTE';
      await pool.query(`INSERT INTO usuarios(id,rol_codigo,correo_institucional,contrasena_hash,nombres,apellidos,estado)
        SELECT $1,$2,$3,contrasena_hash,'Fixture navegador',$4,'Activo' FROM usuarios WHERE id='usr-1' ON CONFLICT(id) DO NOTHING`,[id,role,id+'@example.test',name]);
      if (['AGENTE','SUPERVISOR'].includes(role)) await pool.query(`INSERT INTO asignaciones_usuario_equipo(id,usuario_id,equipo_id,tipo_asignacion,fecha_inicio,activa)
        VALUES($1,$2,'team-alpha-1',$3,CURRENT_DATE,TRUE) ON CONFLICT(id) DO NOTHING`,[id+'-assignment',id,role]);
      if (role === 'AGENTE') {
        // El titular principal aceptará en UI; los cuatro restantes son el grupo técnico de reportes.
        if (name !== 'agente') await pool.query(`INSERT INTO consentimientos(id,usuario_id,politica_id,tipo_evento,acepta_politica,acepta_aviso_privacidad,c1_checkin,c2_bitacora,c3_apoyo,c4_analitica,c5_contacto)
          SELECT $1,$2,id,'ACTUALIZACION',TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,FALSE FROM politicas_privacidad WHERE estado='PUBLICADA' AND vigente_desde<=NOW()
          ORDER BY vigente_desde DESC,created_at DESC,id DESC LIMIT 1`,[crypto.randomUUID(),id]);
        await pool.query(`INSERT INTO daily_checkins(id,usuario_id,asignacion_id,journey_key,checkin_date,energia,carga_emocional,recuperacion,apoyo,distanciamiento,ineficacia)
          VALUES($1,$2,$3,'START_SHIFT','2026-08-18',4,3,4,5,2,1) ON CONFLICT(id) DO NOTHING`,[id+'-report',id,id+'-assignment']);
        if (name !== 'agente') await pool.query(`INSERT INTO daily_checkins(id,usuario_id,asignacion_id,journey_key,checkin_date,energia,carga_emocional,recuperacion,apoyo,distanciamiento,ineficacia)
          VALUES($1,$2,$3,'START_SHIFT',$4,4,3,4,5,2,1) ON CONFLICT(id) DO NOTHING`,[id+'-current',id,id+'-assignment',currentJourney(8)]);
      }
    }
    console.log('Fixtures de navegador preparados en la base separada.');
  } else {
    await pool.query('DELETE FROM reportes_generados WHERE autor_id=ANY($1::varchar[])',[ids]);
    await pool.query('DELETE FROM seguimientos_intervencion WHERE autor_id=ANY($1::varchar[]) OR intervencion_id IN (SELECT id FROM sst_intervenciones WHERE creator_id=ANY($1::varchar[]))',[ids]);
    await pool.query('DELETE FROM sst_intervenciones WHERE creator_id=ANY($1::varchar[])',[ids]);
    await pool.query('DELETE FROM solicitudes_apoyo WHERE owner_user_id=ANY($1::varchar[])',[ids]);
    await pool.query('DELETE FROM solicitudes_habeas_data WHERE usuario_id=ANY($1::varchar[])',[ids]);
    await pool.query('DELETE FROM bitacoras WHERE usuario_id=ANY($1::varchar[])',[ids]);
    await pool.query('DELETE FROM daily_checkins WHERE usuario_id=ANY($1::varchar[])',[ids]);
    await pool.query('DELETE FROM consentimientos WHERE usuario_id=ANY($1::varchar[])',[ids]);
    await pool.query('DELETE FROM asignaciones_usuario_equipo WHERE usuario_id=ANY($1::varchar[])',[ids]);
    await pool.query('DELETE FROM reglas_alerta WHERE propuesta_por_id=ANY($1::varchar[])',[ids]);
    await pool.query('DELETE FROM usuarios WHERE id=ANY($1::varchar[])',[ids]);
    console.log('Solo fixtures de navegador eliminados; auditoría conservada.');
  }
} finally { await pool.end(); }
