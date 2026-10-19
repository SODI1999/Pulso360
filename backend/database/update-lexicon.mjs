import dotenv from 'dotenv';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { canonicalJson } from '../src/domain/canonicalJson.js';

dotenv.config({ path: '.env.test' });
const { default: pool } = await import('../src/infrastructure/db.js');

try {
  const dict = JSON.parse(fs.readFileSync(new URL('./lexicon-current.json', import.meta.url), 'utf8'));
  const canonical = canonicalJson(dict);
  const hash = crypto.createHash('sha256').update(canonical).digest('hex');
  console.log('Canonical SHA-256 hash:', hash);

  const res = await pool.query(
    'UPDATE versiones_lexico SET contenido = $1::jsonb, hash_contenido = $2 WHERE id = $3 RETURNING id, codigo_version, hash_contenido',
    [canonical, hash, 'lex-v12']
  );
  console.log('Successfully updated:', res.rows);
} catch (err) {
  console.error('Update failed:', err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
