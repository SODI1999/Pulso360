/**
 * Runs the production frontend with real HTTP, Socket.IO and PostgreSQL test data.
 * Creates unique disposable accounts, verifies persistence, then removes only their rows.
 * Requires the existing separate DB_NAME_TEST and an installed Chrome; no migrations or mocks.
 */
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
const output = path.resolve(process.argv[2] || path.join(projectRoot, 'test-results/e2e'));
const temporary = await mkdtemp(path.join(tmpdir(), 'pulso-e2e-'));
const chrome = process.env.CHROME_BINARY || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const startedAt = new Date().toISOString();
const suffix = randomUUID().slice(0, 8);
const ids = ['agent', 'sst'].map(role => 'fx-e2e-' + role + '-' + suffix);
const fixtures = {
  agentName: 'E2E-' + suffix + ' AGENTE',
  agentEmail: ids[0] + '@example.test',
  description: 'E2E-' + suffix + ': solicitud técnica sin datos reales.',
  agentMessage: 'E2E-' + suffix + ': mensaje técnico del agente.',
  sstMessage: 'E2E-' + suffix + ': respuesta técnica SST.',
  closeNotes: 'E2E-' + suffix + ': cierre técnico de la prueba.'
};
const signals = new Map();
const waiting = new Map();
const holds = new Map();
const actorResults = {};
const network = [];
const frontendServers = [];
const children = [];
let pool, apiServer, io, fixtureReady = false;
let report = { startedAt, passed: false, isolation: {}, network };
await mkdir(output, { recursive: true });

const json = (response, data, status = 200) => {
  response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(data));
};

async function body(request) {
  let content = '';
  for await (const chunk of request) {
    content += chunk;
    if (content.length > 200000) throw new Error('Resultado de prueba demasiado grande.');
  }
  return JSON.parse(content || '{}');
}

function signal(name, value) {
  signals.set(name, value);
  for (const response of waiting.get(name) || []) json(response, value);
  waiting.delete(name);
}

const mime = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.json': 'application/json'
};

/** Serves build files and test coordination only, never product API substitutes. */
function frontendHandler(role) {
  return async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      if (url.pathname === '/__e2e/config') {
        return json(response, { ...fixtures, role, email: role === 'agent' ? fixtures.agentEmail : ids[1] + '@example.test', password: 'Pulso360#2026' });
      }
      if (url.pathname === '/__e2e/hold') {
        holds.set(role, response);
        return;
      }
      if (url.pathname === '/__e2e/wait') {
        const name = url.searchParams.get('name');
        if (signals.has(name)) return json(response, signals.get(name));
        waiting.set(name, [...(waiting.get(name) || []), response]);
        return;
      }
      if (url.pathname === '/__e2e/event') {
        const event = await body(request);
        let value = event.actual;
        if (event.name === 'request-created') {
          const rows = await pool.query('SELECT id,code FROM solicitudes_apoyo WHERE owner_user_id=$1', [ids[0]]);
          assert.equal(rows.rowCount, 1, 'Debe existir un único radicado de la cuenta técnica.');
          value = rows.rows[0];
        }
        signal(event.name, value);
        return json(response, value);
      }
      if (url.pathname === '/__e2e/done') {
        actorResults[role] = await body(request);
        if (!actorResults[role].passed) {
          for (const responses of waiting.values()) for (const pending of responses) json(pending, { error: 'Falló el otro participante' }, 500);
          waiting.clear();
        }
        json(response, { received: true });
        const hold = holds.get(role);
        if (hold) {
          hold.writeHead(200, { 'Content-Type': 'image/gif' });
          hold.end(Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', 'base64'));
        }
        return;
      }
      if (url.pathname === '/__e2e/actor.js') {
        response.writeHead(200, { 'Content-Type': 'text/javascript' });
        response.end(await readFile(path.join(projectRoot, 'frontend/tests/e2e-actor.fixture.js')));
        return;
      }
      if (url.pathname === '/__e2e/actor') {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end('<!doctype html><html><head><meta charset="utf-8"><title>E2E Pulso360</title></head><body style="margin:0"><iframe title="Aplicación real de prueba" style="border:0;width:1366px;height:768px"></iframe><img alt="" src="/__e2e/hold" style="display:none"><script type="module" src="/__e2e/actor.js"></script></body></html>');
        return;
      }
      const dist = path.join(temporary, 'dist');
      let file = path.resolve(dist, '.' + decodeURIComponent(url.pathname));
      const relative = path.relative(dist, file);
      if (relative.startsWith('..') || path.isAbsolute(relative)) return json(response, { error: 'Ruta inválida' }, 400);
      try { if (!(await stat(file)).isFile()) file = path.join(dist, 'index.html'); }
      catch (error) { if (error.code !== 'ENOENT') throw error; file = path.join(dist, 'index.html'); }
      response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      response.end(await readFile(file));
    } catch (error) {
      json(response, { error: error.message }, 500);
    }
  };
}

async function listen(server) {
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  return 'http://127.0.0.1:' + server.address().port;
}

async function runBrowser(role, origin) {
  const screenshot = path.join(output, role + '.png');
  const stdout = await new Promise((resolve, reject) => {
    const child = spawn(chrome, [
      '--headless=new', '--no-first-run', '--no-default-browser-check',
      '--disable-background-networking', '--user-data-dir=' + path.join(temporary, role),
      '--window-size=1400,900', '--timeout=120000', '--screenshot=' + screenshot,
      '--dump-dom', origin + '/__e2e/actor'
    ], { windowsHide: true });
    children.push(child);
    let text = '';
    const timeout = setTimeout(() => { child.kill(); reject(new Error('Tiempo E2E agotado para ' + role)); }, 120000);
    child.stdout.on('data', data => { text += data; });
    child.stderr.resume();
    child.on('error', error => { clearTimeout(timeout); reject(error); });
    child.on('exit', code => { clearTimeout(timeout); code === 0 ? resolve(text) : reject(new Error('Chrome exit ' + code)); });
  });
  const encoded = stdout.match(/data-e2e-result="([^"]+)"/)?.[1];
  assert.ok(encoded, 'Chrome no terminó el recorrido de ' + role);
  const result = JSON.parse(decodeURIComponent(encoded));
  assert.equal(result.passed, true, role + ': ' + result.error);
  return { ...result, screenshot: path.basename(screenshot) };
}

async function cleanupFixtures() {
  if (!fixtureReady) return;
  const sessions = await pool.query('SELECT id FROM sesiones_chat_soporte WHERE agente_id=ANY($1::varchar[])', [ids]);
  const sessionIds = sessions.rows.map(row => row.id);
  await pool.query('DELETE FROM mensajes_chat_soporte WHERE sesion_id IN (SELECT id FROM sesiones_chat_soporte WHERE agente_id=ANY($1::varchar[]))', [ids]);
  await pool.query('DELETE FROM sesiones_chat_soporte WHERE agente_id=ANY($1::varchar[])', [ids]);
  await pool.query('DELETE FROM solicitudes_apoyo WHERE owner_user_id=ANY($1::varchar[])', [ids]);
  await pool.query('DELETE FROM consentimientos WHERE usuario_id=ANY($1::varchar[])', [ids]);
  await pool.query('DELETE FROM usuarios WHERE id=ANY($1::varchar[])', [ids]);
  const remaining = await pool.query(`SELECT
    (SELECT COUNT(*)::int FROM usuarios WHERE id=ANY($1::varchar[])) AS accounts,
    (SELECT COUNT(*)::int FROM solicitudes_apoyo WHERE owner_user_id=ANY($1::varchar[])) AS requests,
    (SELECT COUNT(*)::int FROM sesiones_chat_soporte WHERE agente_id=ANY($1::varchar[])) AS sessions,
    (SELECT COUNT(*)::int FROM mensajes_chat_soporte WHERE sesion_id=ANY($2::varchar[])) AS messages,
    (SELECT COUNT(*)::int FROM consentimientos WHERE usuario_id=ANY($1::varchar[])) AS consents`, [ids, sessionIds]);
  report.cleanup = { remaining: remaining.rows[0], auditPreserved: true };
  for (const count of Object.values(remaining.rows[0])) assert.equal(count, 0);
}

try {
  await access(chrome);
  const origins = [];
  for (const role of ['agent', 'sst']) {
    const server = http.createServer(frontendHandler(role));
    frontendServers.push(server);
    origins.push(await listen(server));
  }
  process.env.NODE_ENV = 'test';
  process.env.ALERT_JOB_ENABLED = 'false';
  process.env.CORS_ORIGIN = origins.join(',');
  process.env.JWT_SECRET = randomBytes(48).toString('hex');
  ({ default: pool } = await import('../src/infrastructure/db.js'));
  assert.equal(process.env.DB_NAME_TEST, 'pulso360_plan_test_20261005', 'Solo la base técnica existente está autorizada.');
  const database = await pool.query('SELECT current_database() AS name');
  assert.equal(database.rows[0].name, process.env.DB_NAME_TEST);
  assert.notEqual(database.rows[0].name, process.env.DB_NAME);
  report.isolation = { separateTestDatabase: true, uniqueFixtureAccounts: 2, schedulerDisabled: true, interceptedProductRequests: 0 };
  fixtureReady = true;
  for (const [index, role] of ['AGENTE', 'SST'].entries()) {
    const user = await pool.query(`INSERT INTO usuarios(id,rol_codigo,correo_institucional,contrasena_hash,nombres,apellidos,estado)
      SELECT $1,$2,$3,contrasena_hash,$4,$2,'Activo' FROM usuarios WHERE id='usr-1'`,
    [ids[index], role, ids[index] + '@example.test', 'E2E-' + suffix]);
    assert.equal(user.rowCount, 1, 'Se requiere la semilla técnica existente.');
  }
  const consent = await pool.query(`INSERT INTO consentimientos(id,usuario_id,politica_id,tipo_evento,acepta_politica,acepta_aviso_privacidad,c1_checkin,c2_bitacora,c3_apoyo,c4_analitica,c5_contacto)
    SELECT $1,$2,id,'ACTUALIZACION',TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,FALSE FROM politicas_privacidad
    WHERE estado='PUBLICADA' AND vigente_desde<=NOW() ORDER BY vigente_desde DESC,created_at DESC,id DESC LIMIT 1`, [randomUUID(), ids[0]]);
  assert.equal(consent.rowCount, 1, 'Se requiere una política técnica publicada.');
  const { default: app } = await import('../src/app.js');
  const { initSocketServer } = await import('../src/infrastructure/socket.js');
  apiServer = http.createServer((request, response) => {
    const began = Date.now();
    const requestPath = request.url.split('?')[0];
    response.on('finish', () => {
      if (requestPath.startsWith('/api/v1')) network.push({ method: request.method, path: requestPath, status: response.statusCode, durationMs: Date.now() - began });
    });
    app(request, response);
  });
  io = initSocketServer(apiServer);
  report.socket = { connections: 0, messageSendEvents: 0 };
  io.on('connection', socket => {
    report.socket.connections++;
    // Record event counts only: no token, message content or personal payload.
    socket.on('support:message:send', () => { report.socket.messageSendEvents++; });
  });
  const apiOrigin = await listen(apiServer);
  report.environment = { frontend: 'production build', backendOrigin: apiOrigin, frontendOrigins: origins };
  const { build } = await import('../../frontend/node_modules/vite/dist/node/index.js');
  const frontendRoot = path.join(projectRoot, 'frontend');
  assert.equal(path.relative(temporary, path.join(temporary, 'dist')), 'dist');
  // Vite must compile production React while the already-created API pool stays on test DB.
  process.env.NODE_ENV = 'production';
  try {
    await build({ root: frontendRoot, configFile: path.join(frontendRoot, 'vite.config.js'), logLevel: 'error',
      mode: 'production',
      define: { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiOrigin + '/api/v1') },
      build: { outDir: path.join(temporary, 'dist'), emptyOutDir: true } });
  } finally {
    process.env.NODE_ENV = 'test';
  }
  report.actors = await Promise.all([runBrowser('agent', origins[0]), runBrowser('sst', origins[1])]);
  const request = signals.get('request-created');
  const persisted = await pool.query(`SELECT r.status,s.estado,s.es_anonimo,
    (SELECT COUNT(*)::int FROM mensajes_chat_soporte m WHERE m.sesion_id=s.id AND m.texto=$2) AS agent_messages,
    (SELECT COUNT(*)::int FROM mensajes_chat_soporte m WHERE m.sesion_id=s.id AND m.texto=$3) AS sst_messages
    FROM solicitudes_apoyo r JOIN sesiones_chat_soporte s ON s.solicitud_id=r.id WHERE r.id=$1`, [request.id, fixtures.agentMessage, fixtures.sstMessage]);
  assert.equal(persisted.rowCount, 1);
  assert.equal(persisted.rows[0].status, 'Cerrada');
  assert.equal(persisted.rows[0].estado, 'cerrada');
  assert.equal(persisted.rows[0].es_anonimo, true);
  assert.equal(persisted.rows[0].agent_messages, 1);
  assert.equal(persisted.rows[0].sst_messages, 1);
  report.persistence = persisted.rows[0];
  assert.ok(report.socket.connections >= 2, 'Ambos clientes deben usar el servidor Socket.IO real.');
  assert.equal(report.socket.messageSendEvents, 2, 'Debe existir un envío Socket por cada participante.');
  report.passed = true;
} catch (error) {
  report.error = error.message;
  process.exitCode = 1;
} finally {
  for (const child of children) if (child.exitCode === null) child.kill();
  for (const responses of waiting.values()) for (const response of responses) response.destroy();
  for (const response of holds.values()) if (!response.writableEnded) response.destroy();
  if (io) await new Promise(resolve => io.close(resolve));
  for (const server of frontendServers) {
    const closing = new Promise(resolve => server.close(resolve));
    server.closeAllConnections();
    await closing;
  }
  try { await cleanupFixtures(); }
  catch (error) { report.passed = false; report.cleanupError = error.message; process.exitCode = 1; }
  if (pool) await pool.end();
  const relative = path.relative(path.resolve(tmpdir()), path.resolve(temporary));
  assert.ok(!relative.startsWith('..') && path.basename(temporary).startsWith('pulso-e2e-'));
  await rm(temporary, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  report.completedAt = new Date().toISOString();
  report.actorOutcomes = actorResults;
  await writeFile(path.join(output, 'e2e-result.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ passed: report.passed, error: report.error, cleanup: report.cleanup,
    actors: report.actors?.map(actor => ({ role: actor.role, checks: actor.checks.length })), persistence: report.persistence }, null, 2));
}
