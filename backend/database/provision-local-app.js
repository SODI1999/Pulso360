// Operación explícita local: no se ejecuta al iniciar la API ni en una migración.
import dotenv from 'dotenv';
import pg from 'pg';
import { randomBytes } from 'node:crypto';
import { readFile, writeFile, rm } from 'node:fs/promises';

dotenv.config();
dotenv.config({ path:'.env.maintenance' });
dotenv.config({ path:'.env.test' });
const target = process.argv[process.argv.indexOf('--database') + 1];
if (!process.argv.includes('--database') || target !== process.env.DB_NAME ||
    !['127.0.0.1', 'localhost', '::1'].includes(process.env.DB_HOST)) {
  throw new Error('Indica la base local configurada con --database NOMBRE.');
}
const role = 'pulso360_app';
const maintenanceUser = process.env.DB_MIGRATION_USER || process.env.DB_USER;
const maintenancePassword = process.env.DB_MIGRATION_PASSWORD || process.env.DB_PASSWORD;
const client = new pg.Client({ host:process.env.DB_HOST, port:Number(process.env.DB_PORT),
  database:target, user:maintenanceUser, password:maintenancePassword });
const password = randomBytes(48).toString('hex');
const secret = randomBytes(48).toString('hex');
const configFiles = ['.env', '.env.maintenance', '.env.test'].map(name => new URL('../'+name,import.meta.url));
const originalFiles = [];
let filesTouched = false;
try {
  await client.connect();
  // No reasignar un rol existente: podría pertenecer a otra instalación.
  const existing = await client.query('SELECT 1 FROM pg_roles WHERE rolname=$1',[role]);
  if (existing.rowCount) throw new Error('El rol pulso360_app ya existe; revisa la instalación antes de repetir.');
  for (const file of configFiles) {
    try { originalFiles.push(await readFile(file)); }
    catch (error) { if (error.code !== 'ENOENT') throw error; originalFiles.push(null); }
  }
  await client.query('BEGIN');
  // Nombre constante y contraseña hex generada; no interpolar entradas de usuario.
  await client.query(`CREATE ROLE pulso360_app LOGIN PASSWORD '${password}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION`);
  await client.query('GRANT USAGE ON SCHEMA public TO pulso360_app');
  const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename<>'pulso_migrations'");
  for (const { tablename } of tables.rows) {
    const identifier = '"'+tablename.replaceAll('"','""')+'"';
    await client.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.${identifier} TO pulso360_app`);
  }
  await client.query('GRANT SELECT ON public.pulso_migrations TO pulso360_app');
  await client.query('GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO pulso360_app');
  // La API no necesita crear tablas. PUBLIC puede conceder CREATE en instalaciones antiguas.
  const publicCreate = await client.query("SELECT has_schema_privilege('pulso360_app','public','CREATE') AS allowed");
  if (publicCreate.rows[0].allowed) throw new Error('PUBLIC permite CREATE en el esquema; revisa sus permisos antes de provisionar.');
  const url = configFiles[0];
  if (!originalFiles[0]) throw new Error('Se requiere el archivo .env local antes de provisionar.');
  let content = originalFiles[0].toString('utf8');
  const values = { DB_USER:role, DB_PASSWORD:password, JWT_SECRET:secret };
  for (const [key,value] of Object.entries(values)) {
    const line = `${key}=${value}`;
    const pattern = new RegExp(`^${key}=.*$`,'m');
    content = pattern.test(content) ? content.replace(pattern,()=>line) : content+'\n'+line+'\n';
  }
  content = content.replace(/^DB_(MIGRATION|TEST)_(USER|PASSWORD)=.*\r?\n?/gm,'');
  filesTouched = true;
  await writeFile(configFiles[1],`DB_MIGRATION_USER=${maintenanceUser}\nDB_MIGRATION_PASSWORD=${maintenancePassword}\n`);
  await writeFile(configFiles[2],`DB_TEST_USER=${process.env.DB_TEST_USER || maintenanceUser}\nDB_TEST_PASSWORD=${process.env.DB_TEST_PASSWORD || maintenancePassword}\n`);
  await writeFile(url,content);
  await client.query('COMMIT');
  console.log('Rol API sin DDL creado y configuración local actualizada. Reinicia la API para usar las nuevas credenciales y revocar tokens previos.');
} catch (error) {
  await client.query('ROLLBACK').catch(()=>{});
  // Si una escritura o el commit falla, no dejar credenciales apuntando a un rol revertido.
  if (filesTouched) {
    for (let index = 0; index < configFiles.length; index++) {
      if (originalFiles[index] === null) await rm(configFiles[index], { force:true });
      else await writeFile(configFiles[index], originalFiles[index]);
    }
  }
  throw error;
} finally { await client.end(); }
