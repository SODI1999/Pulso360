import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
}

async function withApp(run, storage = memoryStorage()) {
  const previousWindow = globalThis.window;
  globalThis.window = { localStorage: storage, sessionStorage: memoryStorage() };
  const server = await createServer({
    configFile: false,
    root: process.cwd(),
    logLevel: 'silent',
    appType: 'custom',
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] }
  });
  try {
    await run({ storage, load: (file) => server.ssrLoadModule(file) });
  } finally {
    await server.close();
    globalThis.window = previousWindow;
  }
}

test('almacenamiento bloqueado: conserva cambios en memoria y comunica modo temporal', async () => {
  const blocked = {
    getItem() {
      throw new Error('SecurityError');
    },
    setItem() {
      throw new Error('SecurityError');
    },
    removeItem() {
      throw new Error('SecurityError');
    }
  };
  await withApp(async ({ load }) => {
    const { storageStatus, localData } = await load('/src/core/storage/browserStorage.jsx');
    localData.setItem('preference', 'yes');
    assert.equal(storageStatus.getSnapshot(), true);
    assert.equal(localData.getItem('preference'), 'yes');
    localData.removeItem('preference');
    assert.equal(localData.getItem('preference'), null);
  }, blocked);
});

test('cuota agotada: no lanza excepción y conmuta a memoria resiliente', async () => {
  const storage = memoryStorage();
  await withApp(async ({ load }) => {
    storage.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    const { storageStatus, localData } = await load('/src/core/storage/browserStorage.jsx');
    localData.setItem('test_key', 'test_val');
    assert.equal(storageStatus.getSnapshot(), true);
  }, storage);
});

test('nlpEngine analiza intensificadores, negaciones y límites de ventana', async () => {
  await withApp(async ({ load }) => {
    const nlpMod = await load('/src/core/nlp/nlpEngine.jsx');
    const { nlpEngine } = nlpMod;
    nlpEngine.setLexicon({
      version: 'lexico-v1.2',
      dictionary: {
        categories: nlpMod.NLP_CATEGORIES,
        crisisPhrases: nlpMod.CRISIS_PHRASES,
        negators: nlpMod.NEGATORS,
        intensifiers: nlpMod.INTENSIFIERS
      }
    });

    const r1 = nlpEngine.analyze('agotado');
    assert.ok(r1.categories.length > 0);

    const r2 = nlpEngine.analyze('muy agotado');
    assert.ok(r2.categories[0].confidence >= 0.62);

    const r3 = nlpEngine.analyze('no estoy agotado');
    assert.equal(
      r3.categories.some((c) => c.name === 'Recuperación insuficiente'),
      false
    );

    const r4 = nlpEngine.analyze('hoy no llamé a nadie y me siento agotado');
    assert.ok(r4.categories.some((c) => c.name === 'Recuperación insuficiente'));
  });
});
