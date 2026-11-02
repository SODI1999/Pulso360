import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

test('el resumen de consentimiento no convierte ausencia o política vencida en autorización', async t => {
  const vite = await createServer({
    configFile: false,
    root: process.cwd(),
    logLevel: 'silent',
    appType: 'custom',
    esbuild: { jsx: 'automatic' },
    resolve: { alias: {
      'react-router-dom': fileURLToPath(new URL('../node_modules/react-router-dom/dist/index.mjs', import.meta.url)),
      'react-router': fileURLToPath(new URL('../node_modules/react-router/dist/development/index.mjs', import.meta.url))
    } },
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] }
  });
  try {
    const { normalizeConsent } = await vite.ssrLoadModule('/src/core/auth/consentContract.jsx');
    const { ConsentSummaryCard } = await vite.ssrLoadModule('/src/features/agent/components/ConsentSummaryCard.jsx');
    const { StaticRouter } = await vite.ssrLoadModule('/node_modules/react-router-dom/dist/index.mjs');
    const renderCount = consent => {
      const html = renderToStaticMarkup(createElement(StaticRouter, { location: '/agente/mis-datos' },
        createElement(ConsentSummaryCard, { consent, formatDate: value => value })));
      const count = html.match(/role="progressbar" aria-valuenow="(\d+)"/);
      assert.ok(count, 'el resumen expone el número de finalidades activas');
      return Number(count[1]);
    };

    await t.test('no hay finalidades activas sin un consentimiento', () => {
      assert.equal(renderCount(normalizeConsent(null)), 0);
    });
    await t.test('aceptar una política no otorga las finalidades ausentes', () => {
      assert.equal(renderCount(normalizeConsent({ active: true, acepta_politica: true })), 0);
    });
    await t.test('las preferencias guardadas no están activas bajo una política reemplazada', () => {
      const consent = normalizeConsent({ active: true, acepta_politica: true, politica_version: 'anterior',
        policy: { version: 'vigente' }, c1_checkin: true, c2_bitacora: true, c3_apoyo: true,
        c4_analitica: true, c5_contacto: true });
      assert.equal(consent.active, false);
      assert.equal(renderCount(consent), 0);
    });
    await t.test('una política vigente muestra solo las finalidades realmente autorizadas', () => {
      const consent = normalizeConsent({ active: true, acepta_politica: true, politica_version: 'vigente',
        policy: { version: 'vigente' }, c1_checkin: true, c2_bitacora: false, c3_apoyo: true,
        c4_analitica: false, c5_contacto: false });
      assert.equal(consent.active, true);
      assert.equal(renderCount(consent), 2);
    });
  } finally {
    await vite.close();
  }
});
