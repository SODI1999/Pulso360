import dotenv from 'dotenv';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { randomBytes } from 'node:crypto';
dotenv.config();
dotenv.config({ path:'.env.test' });
const database = process.env.DB_NAME_TEST;
if (!database || database === process.env.DB_NAME || !database.includes('test')) {
  throw new Error('Configura DB_NAME_TEST con una base de prueba distinta. La suite no modifica la base principal.');
}
const files = fs.readdirSync(new URL('./contracts/',import.meta.url)).filter(name=>name.endsWith('.test.js'))
  .sort().map(name=>'test/contracts/'+name);
const result = spawnSync(process.execPath,['--experimental-websocket','--test','--test-concurrency=1','--test-force-exit',...files],
  {stdio:'inherit',env:{...process.env,NODE_ENV:'test',JWT_SECRET:randomBytes(48).toString('hex')}});
process.exitCode = result.status ?? 1;
