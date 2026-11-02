// Test-only driver. The application frame uses its production bundle and real services.
const config = await fetch('/__e2e/config').then(response => response.json());
const frame = document.querySelector('iframe');
const checks = [];
let landingResources = [];
const page = () => frame.contentWindow;
const doc = () => frame.contentDocument;
const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function waitFor(condition, description) {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    const value = condition();
    if (value) return value;
    await pause(50);
  }
  throw new Error('No se alcanzó: ' + description);
}

async function event(name, actual = {}) {
  checks.push({ name, actual, observedAt: new Date().toISOString() });
  const response = await fetch('/__e2e/event', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, actual })
  });
  if (!response.ok) throw new Error('Falló la coordinación de ' + name);
  return response.json();
}

async function waitPeer(name) {
  const response = await fetch('/__e2e/wait?name=' + encodeURIComponent(name));
  if (!response.ok) throw new Error('El otro participante no completó ' + name);
  return response.json();
}

async function navigate(path) {
  const loaded = new Promise(resolve => frame.addEventListener('load', resolve, { once: true }));
  frame.src = path;
  await loaded;
  await waitFor(() => doc().querySelector('main'), 'contenido principal');
}

async function reload() {
  const loaded = new Promise(resolve => frame.addEventListener('load', resolve, { once: true }));
  page().location.reload();
  await loaded;
  await waitFor(() => doc().querySelector('#tab-cases'), 'historial después de recargar');
}

async function fill(selector, value) {
  const element = await waitFor(() => doc().querySelector(selector), selector);
  const prototype = element.tagName === 'TEXTAREA'
    ? page().HTMLTextAreaElement.prototype : page().HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value);
  element.dispatchEvent(new (page().Event)('input', { bubbles: true }));
  await pause(50);
}

function click(selector) {
  const element = doc().querySelector(selector);
  if (!element || element.disabled) throw new Error('Control no disponible: ' + selector);
  element.click();
}

function caseButton(code) {
  return [...doc().querySelectorAll('.support-case-card')].find(button => button.textContent.includes(code));
}

async function agentJourney() {
  await navigate('/agente/apoyo');
  await waitFor(() => doc().querySelector('#tab-new-request'), 'canal de apoyo del agente');
  click('#tab-new-request');
  await fill('#supportDetails', config.description);
  if (!doc().querySelector('#modeAnonimo').checked) throw new Error('La muestra debe ser anónima');
  click('#supportForm [type="submit"]');
  await waitFor(() => doc().querySelector('.support-feedback-alert--success'), 'radicación confirmada');
  const request = await event('request-created', { confirmedInUI: true });
  click('#tab-cases');
  (await waitFor(() => caseButton(request.code), 'radicado propio en el historial')).click();
  await waitPeer('activated');
  await waitFor(() => doc().querySelector('.embedded-composer-textarea'), 'activación recibida en vivo');
  await event('agent-activation-live', { withoutReload: true });
  await fill('.embedded-composer-textarea', config.agentMessage);
  click('[aria-label="Enviar mensaje"]');
  await waitFor(() => doc().querySelector('.embedded-composer-textarea')?.value === '', 'acuse del agente');
  await event('agent-sent', { clearedAfterAck: true });
  await waitPeer('sst-sent');
  await waitFor(() => doc().querySelector('[role="log"]')?.textContent.includes(config.sstMessage), 'respuesta SST en vivo');
  await event('agent-received-live', { withoutReload: true });
  await reload();
  (await waitFor(() => caseButton(request.code), 'radicado persistido después de recargar')).click();
  await waitFor(() => {
    const text = doc().querySelector('[role="log"]')?.textContent || '';
    return text.includes(config.agentMessage) && text.includes(config.sstMessage);
  }, 'ambos mensajes persistidos después de recargar');
  await event('agent-reloaded', { bothMessagesInUI: true });
  await waitPeer('case-closed');
  await waitFor(() => doc().querySelector('.support-embedded-chat-box.is-closed'), 'cierre notificado al agente');
  if (doc().querySelector('.embedded-composer-textarea')) throw new Error('El canal cerrado no debe permitir escribir');
  await event('agent-closed-live', { readOnly: true });
  await reload();
  (await waitFor(() => caseButton(request.code), 'caso cerrado en historial')).click();
  await waitFor(() => doc().querySelector('.support-embedded-chat-box.is-closed'), 'cierre persistido');
  if (doc().querySelector('.embedded-composer-textarea')) throw new Error('El cierre persistido permite escribir');
  await event('agent-closed-persisted', { readOnly: true, noComposer: true });
}

async function sstJourney() {
  const request = await waitPeer('request-created');
  await navigate('/sst/buzon');
  const row = await waitFor(() => [...doc().querySelectorAll('tbody tr')].find(item => item.textContent.includes(request.code)), 'caso de prueba en buzón SST');
  if (row.textContent.includes(config.agentName) || row.textContent.includes(config.agentEmail)) {
    throw new Error('El caso anónimo expone la identidad de la cuenta de prueba');
  }
  await event('sst-anonymous-case', { identityAbsentInRow: true });
  row.querySelector('.btn-primary').click();
  const activate = await waitFor(() => doc().querySelector('.sst-activate-big-btn'), 'acción de activación');
  activate.click();
  await waitFor(() => doc().querySelector('#sst-chat-message'), 'compositor SST activo');
  await event('activated', { activeComposer: true });
  await waitPeer('agent-sent');
  await waitFor(() => doc().querySelector('[role="log"]')?.textContent.includes(config.agentMessage), 'mensaje del agente en vivo');
  const chatText = doc().querySelector('[role="dialog"]').textContent;
  if (chatText.includes(config.agentName) || chatText.includes(config.agentEmail)) throw new Error('El chat anónimo expone identidad');
  await event('sst-received-live', { withoutReload: true, anonymousIdentityAbsent: true });
  await fill('#sst-chat-message', config.sstMessage);
  click('[aria-label="Enviar respuesta"]');
  await waitFor(() => doc().querySelector('#sst-chat-message')?.value === '', 'acuse SST');
  await event('sst-sent', { clearedAfterAck: true });
  await waitPeer('agent-reloaded');
  click('.sst-btn-conclude');
  await fill('#sstCloseNotesInput', config.closeNotes);
  click('.sst-close-panel [type="submit"]');
  await waitFor(() => doc().querySelector('.sst-drawer-closed-banner'), 'cierre confirmado a SST');
  if (doc().querySelector('#sst-chat-message')) throw new Error('El canal SST cerrado permite escribir');
  await event('case-closed', { closedInUI: true, noComposer: true });
  await waitPeer('agent-closed-persisted');
}

let result;
try {
  await navigate('/');
  await waitFor(() => doc().querySelector('h1') && !doc().querySelector('[data-page-boundary]'), 'landing cargada en frío');
  landingResources = page().performance.getEntriesByType('resource')
    .filter(resource => /\/assets\/.+\.(js|css)$/.test(resource.name))
    .map(resource => ({ file: new URL(resource.name).pathname, bytes: resource.encodedBodySize, transferBytes: resource.transferSize }));
  if (landingResources.some(resource => /(?:AppLayout|SupportInboxPage|SupportChannelPage|UsersRolesPage|AuditLogPage)-/.test(resource.file))) {
    throw new Error('La landing descargó páginas privadas no visitadas');
  }
  await event(config.role + '-landing-cold', { resources: landingResources.length });
  await navigate('/login');
  await fill('#loginEmailInput', config.email);
  await fill('#loginPasswordInput', config.password);
  click('.submit-action-btn');
  await waitFor(() => page().location.pathname.startsWith(config.role === 'agent' ? '/agente/' : '/sst/'), 'login de ' + config.role);
  await event(config.role + '-logged-in', { path: page().location.pathname });
  if (config.role === 'agent') await agentJourney();
  else await sstJourney();
  result = {
    role: config.role, passed: true, checks, landingResources,
    viewport: { width: page().innerWidth, height: page().innerHeight },
    resources: page().performance.getEntriesByType('resource')
      .filter(resource => /\/assets\/.+\.(js|css)$/.test(resource.name))
      .map(resource => ({ file: new URL(resource.name).pathname, bytes: resource.encodedBodySize, transferBytes: resource.transferSize }))
  };
} catch (error) {
  result = { role: config.role, passed: false, error: error.message, checks, path: page()?.location.pathname };
} finally {
  document.body.dataset.e2eResult = encodeURIComponent(JSON.stringify(result));
  await fetch('/__e2e/done', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(result)
  });
}
