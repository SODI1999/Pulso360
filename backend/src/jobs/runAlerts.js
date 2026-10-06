import pool from '../infrastructure/db.js';
import { runScheduledAlerts } from '../application/services/weeklyAlertService.js';

try {
  const argument = process.argv.indexOf('--database');
  const target = argument >= 0 ? process.argv[argument + 1] : null;
  const database = (await pool.query('SELECT current_database() AS name')).rows[0].name;
  if (!target || target !== database) throw new Error('Indica --database y verifica el destino antes de ejecutar el job.');
  const result = await runScheduledAlerts();
  if (result.status === 'MIGRATION_REQUIRED') throw new Error('Aplica primero la migración 004 en el destino autorizado.');
  console.log(JSON.stringify(result));
} catch (error) {
  console.error('[Job alertas]: ejecución no completada.', error.code || 'JOB_NOT_COMPLETED');
  process.exitCode = 1;
} finally { await pool.end(); }
