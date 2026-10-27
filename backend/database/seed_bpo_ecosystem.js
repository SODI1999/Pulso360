/**
 * @fileoverview Seeder Maestro para Ecosistema BPO Liberty / MásMóvil
 * @description Puebla PostgreSQL con 100 agentes, 5 campañas, 4 semanas de check-ins
 * y dispara orgánicamente el motor de alertas semanal (Cero alertas hardcodeadas).
 */

import pool from '../src/infrastructure/db.js';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { runAlertWeek } from '../src/application/services/weeklyAlertService.js';

const PASSWORD_PLAIN = 'Pulso360#2026';
const PASSWORD_HASH = bcrypt.hashSync(PASSWORD_PLAIN, 10);

const FIRST_NAMES = [
  'Laura', 'Andrés', 'Daniela', 'Julián', 'Valentina', 'Mateo', 'Camila', 'Santiago',
  'Mariana', 'Sebastián', 'Carolina', 'Felipe', 'Sofía', 'Alejandro', 'Paula', 'Nicolás',
  'Gabriela', 'Esteban', 'Natalia', 'David', 'Andrea', 'Diego', 'Lucía', 'Camilo',
  'Isabella', 'Cristian', 'Manuela', 'Samuel', 'Sara', 'Leonardo', 'Verónica', 'Mauricio',
  'Elena', 'Jorge', 'Tatiana', 'Gabriel', 'Juliana', 'Fernando', 'Melissa', 'Ricardo'
];

const LAST_NAMES = [
  'Gómez', 'Pérez', 'Rodríguez', 'López', 'García', 'Martínez', 'Sánchez', 'Torres',
  'Ramírez', 'Flores', 'Vargas', 'Morales', 'Castillo', 'Ríos', 'Osorio', 'Mendoza',
  'Restrepo', 'Giraldo', 'Zapata', 'Herrera', 'Jiménez', 'Castro', 'Mejía', 'Duque',
  'Cataño', 'Montoya', 'Guzmán', 'Valencia', 'Salazar', 'Berrío', 'Cardona', 'Bedoya'
];

function generateAgentNames(count) {
  const names = [];
  names.push({ id: 'usr-agente', firstName: 'Laura', lastName: 'Gomez', email: 'agente@pulso360.co' });
  
  for (let i = 2; i <= count; i++) {
    const fn = FIRST_NAMES[(i * 3 + 7) % FIRST_NAMES.length];
    const ln1 = LAST_NAMES[(i * 5 + 11) % LAST_NAMES.length];
    const ln2 = LAST_NAMES[(i * 7 + 13) % LAST_NAMES.length];
    const pad = String(i).padStart(3, '0');
    names.push({
      id: `agt-${pad}`,
      firstName: fn,
      lastName: `${ln1} ${ln2}`,
      email: `agente${pad}@pulso360.co`
    });
  }
  return names;
}

export async function seedBpoEcosystem() {
  const client = await pool.connect();
  console.log('[Seeder BPO]: Iniciando reconstrucción controlada del ecosistema Liberty / MásMóvil...');

  try {
    await client.query('BEGIN');

    // 1. Limpieza de tablas transaccionales (respetando claves foráneas)
    console.log('[Seeder BPO]: Limpiando tablas transaccionales...');
    await client.query(`
      DELETE FROM seguimientos_intervencion;
      DELETE FROM sst_intervenciones;
      DELETE FROM sst_alertas;
      DELETE FROM alert_job_evaluations;
      DELETE FROM alert_job_runs;
      DELETE FROM mensajes_chat_soporte;
      DELETE FROM sesiones_chat_soporte;
      DELETE FROM seguimientos_apoyo;
      DELETE FROM solicitudes_apoyo;
      DELETE FROM solicitudes_habeas_data;
      DELETE FROM revisiones_nlp;
      DELETE FROM analisis_nlp;
      DELETE FROM bitacoras;
      DELETE FROM daily_checkins;
      DELETE FROM consentimientos;
      DELETE FROM asignaciones_usuario_equipo;
      DELETE FROM password_reset_tokens;
      DELETE FROM notificaciones;
      DELETE FROM reportes_generados;
      DELETE FROM usuarios;
      DELETE FROM equipos;
      DELETE FROM campanas;
    `);

    // 2. Política de Privacidad Vigente
    console.log('[Seeder BPO]: Sembrando política de privacidad legal (v3.003)...');
    await client.query("UPDATE politicas_privacidad SET estado = 'ARCHIVADA';");

    const policyId = 'pol-v3003';
    const policyText = 'Política marco de tratamiento de datos de bienestar laboral y salud ocupacional para la operación Contact Center Liberty / MásMóvil conforme a la Ley 1581 de 2012 y Resolución 2764 de 2022.';
    const noticeText = 'Aviso de privacidad y voluntariedad para check-ins diarios de bienestar en agentes de contact center.';
    const policyHash = crypto.createHash('sha256').update(policyText + noticeText).digest('hex');

    const polRes = await client.query(`
      INSERT INTO politicas_privacidad (
        id, version, titulo, texto_politica, texto_aviso_privacidad,
        hash_contenido, estado, vigente_desde, publicado_en, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'PUBLICADA', $7, $8, NOW())
      ON CONFLICT (version) DO UPDATE SET
        estado = 'PUBLICADA',
        titulo = EXCLUDED.titulo,
        texto_politica = EXCLUDED.texto_politica,
        texto_aviso_privacidad = EXCLUDED.texto_aviso_privacidad,
        vigente_desde = EXCLUDED.vigente_desde,
        created_at = NOW()
      RETURNING id;
    `, [
      policyId, 'v3.003',
      'Política de Tratamiento y Privacidad de Datos de Bienestar BPO Liberty',
      policyText, noticeText, policyHash,
      '2026-09-01T00:00:00Z', '2026-09-01T00:00:00Z'
    ]);
    const activePolicyId = polRes.rows[0].id;

    // 3. Campañas y Equipos Reales de BPO Liberty / MásMóvil
    console.log('[Seeder BPO]: Sembrando campañas y equipos de operación BPO...');
    const campaigns = [
      { id: 'camp-retencion', codigo: 'RET-MM', nombre: 'Campaña Retención & Bajas MásMóvil', desc: 'Gestión y fidelización de clientes postpago y corporativos.' },
      { id: 'camp-cobranzas', codigo: 'COB-MM', nombre: 'Campaña Cobranzas & Cartera MásMóvil', desc: 'Gestión de cartera morosa de alta fricción.' },
      { id: 'camp-sac', codigo: 'SAC-MM', nombre: 'Campaña SAC Care (Servicio al Cliente)', desc: 'Atención de consultas masivas y PQR de usuarios.' },
      { id: 'camp-tech', codigo: 'TECH-MM', nombre: 'Campaña Soporte Técnico Fibra & Móvil', desc: 'Diagnóstico técnico y soporte de averías de conectividad.' },
      { id: 'camp-ventas', codigo: 'VTA-MM', nombre: 'Campaña Ventas Outbound & Portabilidad', desc: 'Prospección comercial y migración de líneas móviles.' }
    ];

    for (const c of campaigns) {
      await client.query(`
        INSERT INTO campanas (id, codigo, nombre, descripcion, activa, created_at)
        VALUES ($1, $2, $3, $4, true, NOW())
      `, [c.id, c.codigo, c.nombre, c.desc]);
    }

    const teams = [
      { id: 'team-retencion-vip', campana_id: 'camp-retencion', codigo: 'RET-VIP', nombre: 'Equipo Retención VIP', supervisor: 'Carlos Mendoza', n: 25 },
      { id: 'team-cobranzas-mora', campana_id: 'camp-cobranzas', codigo: 'COB-MORA', nombre: 'Equipo Cobranzas Mora Crítica', supervisor: 'Javier Herrera', n: 20 },
      { id: 'team-sac-care', campana_id: 'camp-sac', codigo: 'SAC-GEN', nombre: 'Equipo SAC Atención General', supervisor: 'Marcela Ríos', n: 26 },
      { id: 'team-tech-support', campana_id: 'camp-tech', codigo: 'TECH-N2', nombre: 'Equipo Soporte Nivel 2', supervisor: 'Diego Castro', n: 26 },
      { id: 'team-ventas-portabilidad', campana_id: 'camp-ventas', codigo: 'VTA-PILOTO', nombre: 'Equipo Portabilidad Piloto', supervisor: 'Andrés Morales', n: 3 }
    ];

    for (const t of teams) {
      await client.query(`
        INSERT INTO equipos (id, campana_id, codigo, nombre, descripcion, n_miembros, supervisor_nombre, activo, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW())
      `, [t.id, t.campana_id, t.codigo, t.nombre, t.nombre, t.n, t.supervisor]);
    }

    // 4. Roles Maestros y Usuarios
    console.log('[Seeder BPO]: Sembrando roles maestros y 100 agentes...');
    const masterUsers = [
      { id: 'usr-admin', rol: 'ADMIN', email: 'admin@pulso360.co', nombres: 'Admin', apellidos: 'General' },
      { id: 'usr-sst', rol: 'SST', email: 'sst@pulso360.co', nombres: 'Patricia', apellidos: 'Silva' },
      { id: 'usr-auditor', rol: 'AUDITOR', email: 'auditor@pulso360.co', nombres: 'Marcos', apellidos: 'Restrepo' },
      { id: 'usr-supervisor', rol: 'SUPERVISOR', email: 'supervisor@pulso360.co', nombres: 'Carlos', apellidos: 'Mendoza' }
    ];

    for (const u of masterUsers) {
      await client.query(`
        INSERT INTO usuarios (id, rol_codigo, correo_institucional, contrasena_hash, nombres, apellidos, shift_start_hour, estado, auth_version, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, 8, 'Activo', 0, NOW(), NOW())
      `, [u.id, u.rol, u.email, PASSWORD_HASH, u.nombres, u.apellidos]);
    }

    // Asignación de Carlos Mendoza a Retención VIP
    await client.query(`
      INSERT INTO asignaciones_usuario_equipo (id, usuario_id, equipo_id, tipo_asignacion, hora_inicio_turno, fecha_inicio, activa, created_at)
      VALUES ($1, $2, $3, 'SUPERVISOR', '08:00', '2026-09-01', true, NOW())
    `, ['asig-sup-retencion', 'usr-supervisor', 'team-retencion-vip']);

    // Generar 100 Agentes
    const agentProfiles = generateAgentNames(100);
    const teamAssignmentMap = [
      { teamId: 'team-retencion-vip', count: 25 },
      { teamId: 'team-cobranzas-mora', count: 20 },
      { teamId: 'team-sac-care', count: 26 },
      { teamId: 'team-tech-support', count: 26 },
      { teamId: 'team-ventas-portabilidad', count: 3 }
    ];

    let agentIdx = 0;
    const agentRecords = [];

    for (const assign of teamAssignmentMap) {
      for (let j = 0; j < assign.count; j++) {
        const agt = agentProfiles[agentIdx++];
        agentRecords.push({ ...agt, teamId: assign.teamId });

        await client.query(`
          INSERT INTO usuarios (id, rol_codigo, correo_institucional, contrasena_hash, nombres, apellidos, shift_start_hour, estado, auth_version, created_at, updated_at)
          VALUES ($1, 'AGENTE', $2, $3, $4, $5, 8, 'Activo', 0, NOW(), NOW())
        `, [agt.id, agt.email, PASSWORD_HASH, agt.firstName, agt.lastName]);

        await client.query(`
          INSERT INTO asignaciones_usuario_equipo (id, usuario_id, equipo_id, tipo_asignacion, hora_inicio_turno, fecha_inicio, activa, created_at)
          VALUES ($1, $2, $3, 'AGENTE', '08:00', '2026-09-01', true, NOW())
        `, [`asig-${agt.id}`, agt.id, assign.teamId]);

        // Consentimientos C1-C5
        await client.query(`
          INSERT INTO consentimientos (id, usuario_id, politica_id, tipo_evento, acepta_politica, acepta_aviso_privacidad, c1_checkin, c2_bitacora, c3_apoyo, c4_analitica, c5_contacto, ip_origen, registrado_en)
          VALUES ($1, $2, $3, 'INICIAL', true, true, true, true, true, true, true, '192.168.10.15', '2026-09-01T08:05:00Z')
        `, [`con-${agt.id}`, agt.id, activePolicyId]);
      }
    }

    // 5. Generación de Check-ins de 4 Semanas (Lunes a Viernes)
    console.log('[Seeder BPO]: Generando más de 1.800 check-ins para 4 semanas de operación...');

    const weeks = [
      { start: '2026-09-28', endSunday: '2026-10-04', weekNum: 1 },
      { start: '2026-10-05', endSunday: '2026-10-11', weekNum: 2 },
      { start: '2026-10-12', endSunday: '2026-10-18', weekNum: 3 },
      { start: '2026-10-19', endSunday: '2026-10-25', weekNum: 4 }
    ];

    let totalCheckins = 0;

    for (const w of weeks) {
      const startDate = new Date(w.start + 'T12:00:00Z');
      for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
        const currentDate = new Date(startDate);
        currentDate.setUTCDate(startDate.getUTCDate() + dayOffset);
        const dateStr = currentDate.toISOString().slice(0, 10);

        for (const agt of agentRecords) {
          let dims = { energia: 3, carga: 3, recup: 3, apoyo: 3, dist: 3, inef: 3 };

          if (agt.teamId === 'team-cobranzas-mora') {
            // Carga emocional persistentemente alta (promedio 4.2 / 5 -> ~84/100)
            dims = {
              energia: (agt.id.charCodeAt(agt.id.length - 1) % 2) + 2, // 2-3
              carga: 4 + (agt.id.charCodeAt(agt.id.length - 1) % 2),   // 4-5
              recup: 1 + (agt.id.charCodeAt(agt.id.length - 1) % 2),   // 1-2
              apoyo: 3,
              dist: 4,
              inef: 3
            };
          } else if (agt.teamId === 'team-retencion-vip') {
            // Caída progresiva de recuperación semana a semana:
            // W1: recup=4 (~80%), W2: recup=3 (~60%), W3: recup=2 (~40%), W4: recup=1 (~20%)
            const recupVal = Math.max(1, 5 - w.weekNum);
            dims = {
              energia: Math.max(1, 4 - Math.floor(w.weekNum / 2)),
              carga: 4,
              recup: recupVal,
              apoyo: 3,
              dist: 3,
              inef: 2
            };
          } else if (agt.teamId === 'team-sac-care' || agt.teamId === 'team-tech-support') {
            // Estado balanceado y saludable
            dims = {
              energia: 3 + (agt.id.charCodeAt(agt.id.length - 1) % 2), // 3-4
              carga: 2 + (agt.id.charCodeAt(agt.id.length - 1) % 2),   // 2-3
              recup: 3 + (agt.id.charCodeAt(agt.id.length - 1) % 2),   // 3-4
              apoyo: 4,
              dist: 2,
              inef: 2
            };
          } else if (agt.teamId === 'team-ventas-portabilidad') {
            // Ventas: Solo los 3 agentes
            dims = { energia: 4, carga: 3, recup: 3, apoyo: 3, dist: 2, inef: 2 };
          }

          const chkId = `chk-${agt.id}-${dateStr}`;
          await client.query(`
            INSERT INTO daily_checkins (
              id, usuario_id, asignacion_id, journey_key, checkin_date, submitted_at,
              energia, carga_emocional, recuperacion, apoyo, distanciamiento, ineficacia
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          `, [
            chkId, agt.id, `asig-${agt.id}`, dateStr, dateStr, `${dateStr}T16:05:00Z`,
            dims.energia, dims.carga, dims.recup, dims.apoyo, dims.dist, dims.inef
          ]);
          totalCheckins++;
        }
      }
    }

    console.log(`[Seeder BPO]: ${totalCheckins} check-ins insertados exitosamente.`);

    // 6. Asegurar reglas activas de alerta
    console.log('[Seeder BPO]: Verificando reglas de alerta aprobadas...');
    await client.query(`
      INSERT INTO reglas_alerta (id, nombre, metrica, operador, valor_umbral, persistencia_periodos, unidad_tiempo, alcance, severidad, activa, pending_approval, created_at)
      VALUES
        ('rule-1', 'Caida sostenida de recuperacion', 'Recuperacion agregada', 'baje mas de', 15.00, 3, 'semanas', 'cualquier equipo', 'Alta', true, false, '2026-09-01T00:00:00Z'),
        ('rule-2', 'Carga emocional elevada', 'Carga emocional agregada', 'supere', 65.00, 2, 'semanas', 'cualquier equipo', 'Media', true, false, '2026-09-01T00:00:00Z')
      ON CONFLICT (id) DO UPDATE SET activa = true, pending_approval = false;
    `);

    // Resetear cursor de alertas para que el job evalúe las semanas
    await client.query(`
      INSERT INTO alert_job_state (job_name, last_period_end) VALUES ('weekly_alerts', '2026-09-20')
      ON CONFLICT (job_name) DO UPDATE SET last_period_end = '2026-09-20';
    `);

    await client.query('COMMIT');
    console.log('[Seeder BPO]: Transacción de base de datos confirmada exitosamente.');

    // 7. Disparo Orgánico de Alertas mediante weeklyAlertService
    console.log('[Seeder BPO]: Ejecutando motor de alertas semanal sobre las semanas cerradas...');
    for (const w of weeks) {
      console.log(`[Seeder BPO]: Evaluando corte de domingo ${w.endSunday}...`);
      const alertResult = await runAlertWeek({
        periodEnd: w.endSunday,
        now: new Date('2026-10-27T12:00:00Z'),
        advanceCursor: true
      });
      console.log(`[Seeder BPO]: Resultado corte ${w.endSunday}:`, JSON.stringify(alertResult));
    }

    const generatedAlerts = await pool.query('SELECT id, severity, status, campana_id, equipo_id, description FROM sst_alertas');
    console.log(`[Seeder BPO]: ¡Alertas orgánicas generadas por el motor!: ${generatedAlerts.rows.length}`);
    for (const a of generatedAlerts.rows) {
      console.log(`  -> [${a.severity}] en ${a.equipo_id}: ${a.description}`);
    }

    // 8. Vinculación Orgánica de Intervención para el Supervisor (Carlos Mendoza)
    const retencionAlert = generatedAlerts.rows.find(a => a.equipo_id === 'team-retencion-vip' && a.severity === 'Alta') 
      || generatedAlerts.rows.find(a => a.equipo_id === 'team-retencion-vip');

    if (retencionAlert) {
      console.log(`[Seeder BPO]: Vinculando plan de intervención a la alerta ${retencionAlert.id} de Retención VIP...`);
      await pool.query(`
        INSERT INTO sst_intervenciones (
          id, alerta_id, title, type, campana_id, equipo_id,
          creator_id, assigned_to, status, start_date, end_date,
          indicator, baseline, after_val, progress, target_desc, external_action, created_at
        ) VALUES (
          'int-retencion-01', $1, 'Plan de Pausas Cognitivas y Gestión de Objeciones',
          'Pausas cognitivas', 'camp-retencion', 'team-retencion-vip',
          'usr-sst', 'usr-supervisor', 'Activa', '2026-10-19', '2026-11-06',
          'Recuperación promedio de turno', 35.00, NULL, 40,
          'Implementación de pausas activas de 7 minutos cada 90 minutos de gestión telefónica para mitigar fatiga cognitiva y desescalar clientes conflictivos.',
          false, '2026-10-19T10:00:00Z'
        ) ON CONFLICT (id) DO UPDATE SET alerta_id = EXCLUDED.alerta_id, progress = 40;
      `, [retencionAlert.id]);

      await pool.query(`
        INSERT INTO seguimientos_intervencion (
          id, intervencion_id, autor_id, fecha, progreso_reportado, nota_avance, tipo_accion, created_at
        ) VALUES (
          'seg-retencion-01', 'int-retencion-01', 'usr-supervisor', '2026-10-23', 40,
          'Se coordinó con la jefatura de operaciones el escalonamiento de descansos y la primera ronda de pausas cognitivas en el turno de la tarde.',
          'Ajuste operativo', '2026-10-23T15:30:00Z'
        ) ON CONFLICT (id) DO NOTHING;
      `);
      console.log('[Seeder BPO]: Intervención y seguimiento inicial vinculados exitosamente para Carlos Mendoza.');
    }

    console.log('[Seeder BPO]: Reconstrucción del ecosistema BPO completada con éxito.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Seeder BPO Error]:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed_bpo_ecosystem.js')) {
  seedBpoEcosystem().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
