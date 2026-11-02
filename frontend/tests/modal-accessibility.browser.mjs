import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { access, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

// Comprobación DOM real opcional: requiere Chrome local; no instala navegador ni paquetes.
const executable = process.env.CHROME_BINARY || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
await access(executable);
const temporary = await mkdtemp(join(tmpdir(), 'pulso360-modal-check-'));
const server = await createServer({
  configFile: false,
  root: fileURLToPath(new URL('..', import.meta.url)),
  cacheDir: join(temporary, 'vite-cache'),
  appType: 'mpa',
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 0 },
  optimizeDeps: { include: ['react', 'react-dom/client', 'react/jsx-runtime'] },
  logLevel: 'error'
});

try {
  await server.listen();
  const port = server.httpServer.address().port;
  const args = ['--headless=new', '--no-first-run', '--no-default-browser-check',
    '--disable-background-networking', '--dump-dom', '--virtual-time-budget=3000',
    `--user-data-dir=${join(temporary, 'chrome')}`,
    `http://127.0.0.1:${port}/tests/modal-accessibility.fixture.html`];
  const html = await new Promise((resolveOutput, reject) => {
    const browser = spawn(executable, args, { windowsHide: true });
    let output = '';
    let errors = '';
    const timeout = setTimeout(() => {
      browser.kill();
      reject(new Error('Chrome no terminó la comprobación DOM en 30 segundos.'));
    }, 30000);
    browser.stdout.on('data', data => { output += data; });
    browser.stderr.on('data', data => { errors += data; });
    browser.on('error', error => { clearTimeout(timeout); reject(error); });
    browser.on('exit', code => {
      clearTimeout(timeout);
      if (code !== 0) reject(new Error(`Chrome terminó con exit${code}: ${errors.slice(-1000)}`));
      else resolveOutput(output);
    });
  });
  const encoded = html.match(/data-modal-test-result="([^"]+)"/)?.[1];
  assert.ok(encoded, 'La página de prueba no terminó: revisar importación/render del fixture.');
  const result = JSON.parse(decodeURIComponent(encoded));
  assert.equal(result.passed, true, result.error);
  console.log(JSON.stringify({ passed: true, checks: result.checks }, null, 2));
} finally {
  await server.close();
  // Solo se elimina el directorio temporal creado por esta ejecución, nunca rutas del proyecto.
  const taskRelative = relative(resolve(tmpdir()), resolve(temporary));
  assert.ok(!taskRelative.startsWith('..') && basename(temporary).startsWith('pulso360-modal-check-'));
  await rm(temporary, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
