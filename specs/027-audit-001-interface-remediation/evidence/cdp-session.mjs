import { createRequire } from 'node:module';
import { writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const require = createRequire(new URL('../../../frontend/package.json', import.meta.url));
const WebSocket = require('ws');
const evidenceDirectory = fileURLToPath(new URL('.', import.meta.url));

/**
 * Conecta únicamente con el Chrome aislado de pruebas y una página local de Pulso360.
 * No guarda headers, credenciales ni cuerpos de solicitudes reales.
 * @returns {Promise<object>} Cliente CDP acotado con operaciones de UI y evidencia incremental.
 */
export async function connectCDP() {
  const pages = await (await fetch('http://127.0.0.1:9222/json/list')).json();
  const page = pages.find(item => item.type === 'page' && (/^http:\/\/(localhost|127\.0\.0\.1):5173\//.test(item.url) || item.url === 'about:blank'));
  if (!page) throw new Error('No hay página local Pulso360 en el Chrome de pruebas.');
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.once('open', resolve); socket.once('error', reject); });
  let sequence = 0;
  const pending = new Map();
  const client = { events: [], fixture: null, observations: [] };
  socket.on('message', data => {
    const message = JSON.parse(data.toString());
    if (message.id) {
      const request = pending.get(message.id);
      if (!request) return;
      pending.delete(message.id);
      if (message.error) request.reject(new Error(JSON.stringify(message.error)));
      else request.resolve(message.result);
    } else if (message.method === 'Fetch.requestPaused') {
      if (!client.fixture) client.call('Fetch.continueRequest', { requestId: message.params.requestId });
      else client.fixture.handle(message.params).catch(error => client.fixture.errors.push(error.message));
    } else if (message.method === 'Network.requestWillBeSent') {
      const url = new URL(message.params.request.url);
      if (url.hostname === 'localhost' && url.port === '3000') client.events.push({ method: message.params.request.method, path: url.pathname, query: url.search });
    } else if (message.method === 'Runtime.exceptionThrown') {
      client.events.push({ exception: message.params.exceptionDetails.text });
    }
  });
  client.call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  client.evaluate = async expression => {
    const result = await client.call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  client.wait = async condition => {
    const passed = await client.evaluate(`(async()=>{const end=Date.now()+7000;while(Date.now()<end){if(${condition})return true;await new Promise(r=>setTimeout(r,50));}return false})()`);
    if (!passed) throw new Error(`Condición de UI no alcanzada: ${condition}`);
  };
  client.settle = () => client.evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
  client.click = async selector => {
    await client.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Control no encontrado');e.scrollIntoView({block:'center',behavior:'instant'})})()`);
    await client.settle();
    const point = await client.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;const hit=document.elementFromPoint(x,y);if(!e.contains(hit))throw Error('Control tapado o fuera de vista: '+${JSON.stringify(selector)});return{x,y}})()`);
    await client.call('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
    await client.call('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
    await client.settle();
  };
  client.key = async (key, code = key, keyCode = 0, modifiers = 0) => {
    const text = key === 'Enter' ? '\r' : key === ' ' ? ' ' : undefined;
    await client.call('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: keyCode, modifiers, ...(text ? { text, unmodifiedText: text } : {}) });
    await client.call('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: keyCode, modifiers });
    await client.settle();
  };
  client.resize = async (width, height, deviceScaleFactor = 1) => {
    await client.call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor, mobile: false });
    await client.settle();
  };
  client.screenshot = async name => {
    const result = await client.call('Page.captureScreenshot', { format: 'png' });
    const bytes = Buffer.from(result.data, 'base64');
    await writeFile(`${evidenceDirectory}/${name}.png`, bytes);
    return bytes;
  };
  client.record = async (name, steps, expected, actual, imageName, viewport) => {
    const observation = { name, actor: 'agent', observer: 'Codex / better-interface con Chrome DevTools', sessionId: '29682fe4-8915-43a9-a8dd-3f8fbb96e69c', surface: await client.evaluate('location.pathname'), environment: 'Windows, Chrome156 headless, Vite local; datos técnicos de muestra y transporte interceptado cuando se indica', steps, expected, actual: typeof actual === 'string' ? actual : JSON.stringify(actual), result: 'passed', observedAt: new Date().toISOString(), artifact: `evidence/${imageName}.png`, ...(viewport ? { viewport } : {}) };
    client.observations = client.observations.filter(item => item.name !== name);
    client.observations.push(observation);
    await writeFile(`${evidenceDirectory}/ui-observations.json`, JSON.stringify(client.observations, null, 2));
    return observation;
  };
  client.fulfill = (requestId, status, body) => client.call('Fetch.fulfillRequest', { requestId, responseCode: status, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }, { name: 'Access-Control-Allow-Origin', value: 'http://localhost:5173' }, { name: 'Access-Control-Allow-Credentials', value: 'true' }, { name: 'Access-Control-Allow-Headers', value: 'authorization,content-type' }, { name: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' }], body: Buffer.from(JSON.stringify(body)).toString('base64') });
  client.installSocketFixture = async role => client.evaluate(`(async()=>{const {getSocket}=await import('/src/core/socket/socketClient.jsx');const socket=getSocket();socket.disconnect();socket.connected=true;window.__uiSocket=socket;window.__uiSendMode='success';window.__uiSendCount=0;socket.emit=function(name,payload,ack){if(name==='support:message:send'&&payload.sessionId==='ui-session'){window.__uiSendCount++;const message={id:'ui-own-'+window.__uiSendCount,sessionId:'ui-session',clientMsgId:payload.clientMsgId,senderRole:${JSON.stringify(role)},text:payload.text,timestamp:new Date().toISOString()};setTimeout(()=>window.__uiSendMode==='error'?ack({success:false,error:{message:'Muestra técnica: envío no confirmado. Reintenta.'}}):ack({success:true,data:message}),40);}return this;};return{localTransport:true}})()`);
  await client.call('Page.enable');
  await client.call('Runtime.enable');
  await client.call('Network.enable');
  await client.call('Fetch.disable');
  const saved = await readFile(`${evidenceDirectory}/ui-observations.json`, 'utf8').catch(error => { if (error.code === 'ENOENT') return '[]'; throw error; });
  client.observations = JSON.parse(saved);
  return client;
}
