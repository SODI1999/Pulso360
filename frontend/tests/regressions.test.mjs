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

// Vite carga los módulos JSX reales; cada caso tiene módulos y almacenamiento nuevos.
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
    const { pulsoStore } = await server.ssrLoadModule('/src/core/storage/pulsoStore.jsx');
    const { env } = await server.ssrLoadModule('/src/core/config/env.jsx');
    await run({ pulsoStore, storage, key: env.storageKey, load: (file) => server.ssrLoadModule(file) });
  } finally {
    await server.close();
    globalThis.window = previousWindow;
  }
}

for (const raw of [null, 'not-json', 'null', '{}', '[]']) {
  test(`almacenamiento recuperable: ${JSON.stringify(raw)}`, async () => {
    await withApp(async ({ pulsoStore, storage, key }) => {
      if (raw !== null) storage.setItem(key, raw);
      const data = pulsoStore.get();
      assert.ok(Array.isArray(data.users));
      assert.ok(data.settings.policyVersion);
      pulsoStore.audit({ action: 'PRUEBA' });
      assert.equal(pulsoStore.get().auditLogs[0].action, 'PRUEBA');
    });
  });
}

test('conserva registros, campos adicionales y colecciones vacías al completar estructura', async () => {
  await withApp(async ({ pulsoStore, storage, key }) => {
    storage.setItem(
      key,
      JSON.stringify({
        journals: [{ id: 'own', userId: 'usr-1', text: 'Contenido conservado' }],
        checkins: [],
        customField: { version: 9 },
        settings: { policyVersion: 'v9' }
      })
    );
    const data = pulsoStore.get();
    assert.equal(data.journals[0].text, 'Contenido conservado');
    assert.deepEqual(data.checkins, []);
    assert.deepEqual(data.customField, { version: 9 });
    assert.equal(data.settings.policyVersion, 'v9');
    assert.equal(pulsoStore.get().journals.length, 1);
  });
});

test('migra correos antiguos sin cambiar los demás datos del usuario', async () => {
  await withApp(async ({ pulsoStore, storage, key }) => {
    const data = pulsoStore.get();
    data.users[0].email = 'agente@demo';
    data.users[0].name = 'Nombre conservado';
    storage.setItem(key, JSON.stringify(data));
    assert.equal(pulsoStore.get().users[0].email, 'agente@pulso360.co');
    assert.equal(pulsoStore.get().users[0].name, 'Nombre conservado');
  });
});

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
  await withApp(async ({ pulsoStore, load }) => {
    const data = pulsoStore.get();
    data.journals = [];
    pulsoStore.save(data);
    assert.deepEqual(pulsoStore.get().journals, []);
    const { storageStatus, localData } = await load('/src/core/storage/browserStorage.jsx');
    assert.equal(storageStatus.getSnapshot(), true);
    localData.setItem('preference', 'yes');
    assert.equal(localData.getItem('preference'), 'yes');
    localData.removeItem('preference');
    assert.equal(localData.getItem('preference'), null);
  }, blocked);
});

test('cuota agotada: no vuelve a leer una versión anterior al último cambio', async () => {
  const storage = memoryStorage();
  await withApp(async ({ pulsoStore, load }) => {
    const data = pulsoStore.get();
    storage.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    data.journals = [];
    pulsoStore.save(data);
    assert.deepEqual(pulsoStore.get().journals, []);
    const { storageStatus } = await load('/src/core/storage/browserStorage.jsx');
    assert.equal(storageStatus.getSnapshot(), true);
  }, storage);
});

for (const user of [null, { id: 'other', role: 'agente' }, { id: 'usr-1', role: 'admin' }]) {
  test(`bitácora rechaza otro titular o rol: ${JSON.stringify(user)}`, async () => {
    await withApp(async ({ pulsoStore, load }) => {
      const service = await load('/src/features/agent/services/journalService.jsx');
      const journal = pulsoStore.get().journals[0];
      const before = JSON.stringify(pulsoStore.get());
      const results = [
        service.saveJournal(journal.id, user, journal, 'test', 'Cambio no autorizado'),
        service.saveCorrection(journal.id, ['Test'], 'Cambio', user),
        service.saveJournalAnalysis(journal, { categories: [] }, user),
        service.deleteJournal(journal.id, user)
      ];
      assert.ok(results.every((result) => result.error));
      assert.equal(JSON.stringify(pulsoStore.get()), before);
    });
  });
}

test('el titular puede crear, editar, analizar, corregir y eliminar sin confiar en metadatos de la UI', async () => {
  await withApp(async ({ pulsoStore, load }) => {
    const service = await load('/src/features/agent/services/journalService.jsx');
    const data = pulsoStore.get();
    const user = data.users[0];
    data.consents[user.id] = {
      ...data.consents[user.id],
      policyAccepted: true,
      policyVersion: data.settings.policyVersion,
      c2: true,
      c3: true
    };
    pulsoStore.save(data);
    const { journalPayload } = service.saveJournal(null, user, null, 'turno', 'Entrada de prueba');
    const updated = service.saveJournal(
      journalPayload.id,
      user,
      { ...journalPayload, date: '1900-01-01' },
      'turno',
      'Editada'
    );
    assert.equal(updated.journalPayload.date, journalPayload.date);
    assert.ok(!service.saveJournalAnalysis(journalPayload, { categories: [] }, user).error);
    assert.ok(!service.saveCorrection(journalPayload.id, ['Test'], 'Nota', user).error);
    assert.equal(pulsoStore.get().journals[0].correctionNote, 'Nota');
    assert.ok(!service.deleteJournal(journalPayload.id, user).error);
    assert.ok(!pulsoStore.get().journals.some((item) => item.id === journalPayload.id));
    assert.ok(service.deleteJournal(journalPayload.id, user).error);
  });
});

test('la sesión aplica cambios de rol y suspensión sin esperar un nuevo login', async () => {
  await withApp(async ({ pulsoStore, load }) => {
    const { authService } = await load('/src/core/auth/authService.jsx');
    assert.equal((await authService.login('supervisor', 'Pulso360#2026')).success, true);
    assert.equal(authService.getCurrentUser().role, 'supervisor');
    const data = pulsoStore.get();
    const user = data.users.find((item) => item.role === 'supervisor');
    user.role = 'auditor';
    pulsoStore.save(data);
    assert.equal(authService.getCurrentUser().role, 'auditor');
    user.status = 'Suspendido';
    pulsoStore.save(data);
    assert.equal(authService.getCurrentUser(), null);
    assert.equal(authService.getCurrentUser(), null);
  });
});

test('bitácora aplica C2 al guardar y C3 al procesar incluso después de guardar', async () => {
  await withApp(async ({ pulsoStore, load }) => {
    const service = await load('/src/features/agent/services/journalService.jsx');
    const user = pulsoStore.get().users[0];
    const journal = pulsoStore.get().journals.find((item) => item.userId === user.id);
    const before = JSON.stringify(pulsoStore.get());
    assert.ok(service.saveJournal(null, user, null, 'turno', 'Rechazado').error);
    assert.equal(JSON.stringify(pulsoStore.get()), before);
    const data = pulsoStore.get();
    data.consents[user.id] = {
      ...data.consents[user.id],
      policyAccepted: true,
      policyVersion: data.settings.policyVersion,
      c2: true,
      c3: true
    };
    pulsoStore.save(data);
    assert.ok(!service.saveJournal(journal.id, user, journal, 'turno', 'Permitido').error);
    const changed = pulsoStore.get();
    changed.consents[user.id].c3 = false;
    pulsoStore.save(changed);
    const noAnalysis = JSON.stringify(pulsoStore.get());
    assert.ok(service.saveJournalAnalysis(journal, { categories: [] }, user).error);
    assert.equal(JSON.stringify(pulsoStore.get()), noAnalysis);
    changed.consents[user.id].c2 = false;
    pulsoStore.save(changed);
    assert.ok(service.saveJournal(journal.id, user, journal, 'turno', 'Rechazado').error);
    assert.ok(service.saveCorrection(journal.id, ['Test'], 'Rechazado', user).error);
    assert.ok(!service.deleteJournal(journal.id, user).error);
  });
});

test('descarta elementos dañados de listas sin perder registros válidos', async () => {
  await withApp(async ({ pulsoStore, storage, key, load }) => {
    const data = pulsoStore.get();
    const validUser = data.users[0];
    const validJournal = data.journals[0];
    data.users = [null, {}, validUser];
    data.journals = [null, { id: 'incompleta' }, validJournal];
    data.checkins = [null, ...data.checkins];
    storage.setItem(key, JSON.stringify(data));
    const repaired = pulsoStore.get();
    assert.equal(repaired.users.length, 1);
    assert.equal(repaired.journals.length, 1);
    assert.ok(repaired.checkins.every(Boolean));
    assert.equal(repaired.journals[0].id, validJournal.id);
    const { getAgentRecords } = await load('/src/features/agent/services/agentQueries.jsx');
    assert.ok(getAgentRecords(validUser.id).journals.length > 0);
    const { authService } = await load('/src/core/auth/authService.jsx');
    assert.equal((await authService.login(validUser.email, 'Pulso360#2026')).success, true);
  });
});
