/**
 * @fileoverview Runner transaccional de migraciones incrementales para Pulso360.
 *
 * Aplica de forma secuencial y atómica los scripts DDL/DML bajo database/migrations/.
 * Garantiza la inmutabilidad de la base de datos validando el checksum SHA-256 de
 * cada migración frente a la tabla de control 'pulso_migrations'.
 *
 * Utiliza un candado transaccional consultivo (pg_advisory_xact_lock 360000) para
 * prevenir ejecuciones concurrentes y asegurar atomicidad por corrida.
 *
 * Uso CLI:
 *   node database/migrate.js --database <NOMBRE_BD>
 *   npm run db:migrate -- --database <NOMBRE_BD>
 *
 * @module database/migrate
 */

import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { canonicalJson } from '../src/domain/canonicalJson.js';

dotenv.config();

// El mantenimiento usa credenciales independientes de la API sin ampliar sus permisos.
if (process.env.NODE_ENV !== 'test') {
  dotenv.config({ path: '.env.maintenance' });
  if (process.env.DB_MIGRATION_USER) process.env.DB_USER = process.env.DB_MIGRATION_USER;
  if (process.env.DB_MIGRATION_PASSWORD) process.env.DB_PASSWORD = process.env.DB_MIGRATION_PASSWORD;
}

const { default: pool, transaction } = await import('../src/infrastructure/db.js');

const target = process.argv[process.argv.indexOf('--database') + 1];
try {
  if (!process.argv.includes('--database') || !target) throw new Error('Indica explícitamente --database NOMBRE. No se aplica al iniciar la API.');
  const { rows } = await pool.query('SELECT current_database() AS name');
  if (rows[0].name !== target) throw new Error('El destino indicado no coincide con la conexión configurada.');
  const sql = await fs.readFile(new URL('./migrations/001_integration_contracts.sql',import.meta.url),'utf8');
  const followupSql = await fs.readFile(new URL('./migrations/003_followup_action.sql',import.meta.url),'utf8');
  const alertJobSql = await fs.readFile(new URL('./migrations/004_weekly_alert_job.sql',import.meta.url),'utf8');
  const chatSql = await fs.readFile(new URL('./migrations/005_support_chat_persistence.sql',import.meta.url),'utf8');
  const triageSql = await fs.readFile(new URL('./migrations/006_chat_triage_and_history.sql',import.meta.url),'utf8');
  const linkedChatSql = await fs.readFile(new URL('./migrations/007_chat_linked_to_support_requests.sql',import.meta.url),'utf8');
  const dictionary = JSON.parse(await fs.readFile(new URL('./lexicon-current.json',import.meta.url),'utf8'));
  const content = canonicalJson(dictionary),hash = crypto.createHash('sha256').update(content).digest('hex');
  await transaction(async client => {
    await client.query('SELECT pg_advisory_xact_lock(360000)');
    await client.query(`CREATE TABLE IF NOT EXISTS pulso_migrations (id VARCHAR(80) PRIMARY KEY, checksum VARCHAR(64) NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
    for (const migration of [
      { id:'001_integration_contracts',checksum:crypto.createHash('sha256').update(sql).digest('hex'),run:()=>client.query(sql) },
      { id:'002_current_lexicon',checksum:hash,run:()=>client.query(`INSERT INTO versiones_lexico (id,codigo_version,descripcion,estado,hash_contenido,contenido)
          VALUES ('lex-v12','lexico-v1.2','Diccionario existente del motor determinista','ACTIVA',$1,$2)
          ON CONFLICT (codigo_version) DO UPDATE SET contenido=EXCLUDED.contenido,hash_contenido=EXCLUDED.hash_contenido
          WHERE versiones_lexico.contenido IS NULL`,[hash,content]) },
      { id:'003_followup_action',checksum:crypto.createHash('sha256').update(followupSql).digest('hex'),run:()=>client.query(followupSql) },
      { id:'004_weekly_alert_job',checksum:crypto.createHash('sha256').update(alertJobSql).digest('hex'),run:()=>client.query(alertJobSql) },
      { id:'005_support_chat_persistence',checksum:crypto.createHash('sha256').update(chatSql).digest('hex'),run:()=>client.query(chatSql) },
      { id:'006_chat_triage_and_history',checksum:crypto.createHash('sha256').update(triageSql).digest('hex'),run:()=>client.query(triageSql) },
      { id:'007_chat_linked_to_support_requests',checksum:crypto.createHash('sha256').update(linkedChatSql).digest('hex'),run:()=>client.query(linkedChatSql) }
    ]) {
      const applied = await client.query('SELECT checksum FROM pulso_migrations WHERE id=$1',[migration.id]);
      if (applied.rowCount) {
        if (applied.rows[0].checksum !== migration.checksum) throw new Error('Cambió el contenido de una migración ya aplicada: '+migration.id);
        continue;
      }
      await migration.run();
      await client.query('INSERT INTO pulso_migrations (id,checksum) VALUES ($1,$2)',[migration.id,migration.checksum]);
    }
  });
  console.log('Migraciones incrementales verificadas en '+target);
} finally { await pool.end(); }
