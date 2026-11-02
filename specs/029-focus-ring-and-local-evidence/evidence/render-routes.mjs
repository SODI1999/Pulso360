import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const destination = fileURLToPath(new URL('.', import.meta.url));
const phase = process.argv[2] || 'after';
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const outputs = [];
assert.match(phase, /^[a-z0-9-]+$/);
const mode = ['reload', 'keyboard', 'pointer', 'skip', 'control'].includes(phase) ? phase : 'initial';

/** Renders actual application routes inside a same-origin measurement frame.
 * Requires the existing Vite server on127.0.0.1:5173; no remote debugging or personal profile.
 * Returns browser-computed viewport/focus values and a screenshot, without creating product data.
 */
async function renderRoute(path, width) {
  const profile = await mkdtemp(join(tmpdir(), 'pulso-route-render-'));
  try {
    const name = path === '/' ? 'landing' : path.slice(1);
    const filename = phase + '-' + name + '-' + width;
    const screenshot = join(destination, filename + '.png');
    const url = 'http://127.0.0.1:5173/tests/route-render.fixture.html?route=' + encodeURIComponent(path) + '&width=' + width + '&height=768&mode=' + mode;
    const startedAt = new Date().toISOString();
    const stdout = await new Promise((resolveOutput, reject) => {
      const child = spawn(chrome, [
        '--headless=new', '--no-first-run', '--no-default-browser-check',
        '--disable-background-networking', '--user-data-dir=' + profile,
        '--window-size=1400,900', '--virtual-time-budget=1800',
        '--screenshot=' + screenshot, '--dump-dom', url
      ], { windowsHide: true });
      let output = '';
      let errors = '';
      const timeout = setTimeout(() => {
        child.kill();
        reject(new Error('Chrome excedió30segundos.'));
      }, 30000);
      child.stdout.on('data', data => { output += data; });
      child.stderr.on('data', data => { errors += data; });
      child.on('error', error => { clearTimeout(timeout); reject(error); });
      child.on('exit', code => {
        clearTimeout(timeout);
        if (code === 0) resolveOutput(output);
        else reject(new Error('Chrome exit' + code + ': ' + errors.slice(-300)));
      });
    });
    const encoded = stdout.match(/data-route-render-result="([^"]+)"/)?.[1];
    assert.ok(encoded, 'El frame no terminó la medición de' + path);
    const measured = JSON.parse(decodeURIComponent(encoded));
    assert.equal(measured.viewport.width, width, 'AnchoCSS medido distinto del solicitado.');
    return { phase, startedAt, observedAt: new Date().toISOString(), ...measured, artifact: 'evidence/' + filename + '.png', exitCode: 0 };
  } finally {
    const withinTemporary = relative(resolve(tmpdir()), resolve(profile));
    assert.ok(!withinTemporary.startsWith('..') && basename(profile).startsWith('pulso-route-render-'));
    await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}

const paths = mode === 'initial' ? ['/', '/403', '/login'] : mode === 'reload' ? ['/', '/403'] : ['keyboard', 'pointer'].includes(mode) ? ['/403'] : ['/login'];
for (const path of paths) {
  for (const width of mode === 'initial' ? [320, 1366] : [1366]) outputs.push(await renderRoute(path, width));
}
await writeFile(join(destination, phase + '-render.json'), JSON.stringify(outputs, null, 2));
console.log(JSON.stringify(outputs, null, 2));
