import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

function memoryStorage() {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key)
  };
}

test('auditoría 001: contratos de datos y representación SSR, sin simular validación de navegador', async t => {
  const previousWindow = globalThis.window;
  globalThis.window = {
    document: {},
    localStorage: memoryStorage(),
    sessionStorage: memoryStorage(),
    dispatchEvent() {}
  };
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
    const load = path => vite.ssrLoadModule(path);
    const { env } = await load('/src/core/config/env.jsx');
    env.useMockStorage = false;
    const { apiClient, setAuthToken } = await load('/src/core/api/apiClient.jsx');
    setAuthToken('fixture-token');
    const { authService } = await load('/src/core/auth/authService.jsx');

    await t.test('dotación grande sin respuestas y equipo vacío no afirman publicación de agregados', async () => {
      apiClient.defaults.adapter = async config => ({
        config, status: 200, statusText: 'OK', headers: {},
        data: { success: true, data: { campaigns: [{ id: 'campaign', nombre: 'Muestra técnica',
          equipos: [
            { id: 'large', nombre: 'Equipo sin respuestas', n_miembros: 120 },
            { id: 'empty', nombre: 'Equipo vacío', n_miembros: 0 }
          ] }] } }
      });
      const { fetchAdminOrganization } = await load('/src/features/admin/services/adminQueries.jsx');
      const { CampaignCard } = await load('/src/features/admin/components/CampaignCard.jsx');
      const organization = await fetchAdminOrganization();
      const html = renderToStaticMarkup(createElement(CampaignCard, {
        c: organization.campaigns[0], isCampActive: true
      }));
      assert.match(html, /120 integrantes/);
      assert.match(html, /0 integrantes/);
      assert.match(html, /Dotación/);
      assert.doesNotMatch(html, /Publicable|Protegido|Quórum|anonimato/);
    });

    await t.test('el título identifica el ámbito consultado aunque la cuenta conserve otra campaña', async () => {
      const { TeamDashboardPage } = await load('/src/features/supervisor/pages/TeamDashboardPage.jsx');
      const { StaticRouter } = await load('/node_modules/react-router-dom/dist/index.mjs');
      for (const [id, campaign, team] of [['team-ret', 'Retención', 'Turno tarde'], [42, 'Ventas', 'Turno mañana']]) {
        authService.touchSession({
          id: 'fixture-supervisor', role: 'supervisor', campaign: 'Campaña anterior', campaignId: 'old',
          scopes: [{ id, campana_id: `campaign-${id}`, campana_nombre: campaign, nombre: team }]
        });
        const html = renderToStaticMarkup(createElement(StaticRouter, { location: '/supervisor/panel' }, createElement(TeamDashboardPage)));
        assert.ok(html.includes(`Panel de Supervisión · ${campaign} · ${team}`));
        assert.doesNotMatch(html, /Panel de Supervisión · Campaña anterior/);
      }
    });

    await t.test('integridad inicial pendiente y acción legible en la tabla', async () => {
      const { AuditLogTable } = await load('/src/features/auditor/components/AuditLogTable.jsx');
      const html = renderToStaticMarkup(createElement(AuditLogTable, { logs: [{
        id: 'fixture-event', date: '2026-11-02T00:15:00Z', action: 'ENVIO_MENSAJE_APOYO',
        actor: 'Muestra técnica', target: 'Solicitud de prueba', status: 'EXITO'
      }] }));
      assert.match(html, /Integridad pendiente de comprobar/);
      assert.match(html, /Envío de mensaje de apoyo/);
      assert.match(html, /19:15:00/);
      assert.match(html, /Bogotá \(UTC−5\)/);
      assert.doesNotMatch(html, /Cadena inmutable activa/);
    });

    await t.test('fechas de Bogotá atraviesan medianoche UTC, conservan segundos y manejan ausencia', async () => {
      const { formatAuditDate, formatAuditAction } = await load('/src/features/auditor/utils/auditDisplay.js');
      const exact = '2026-11-02T00:15:09Z';
      const shown = formatAuditDate(exact);
      assert.match(shown, /^01/);
      assert.match(shown, /19:15:09/);
      assert.equal(formatAuditDate('2026-11-01T19:15:09-05:00'), shown);
      assert.equal(formatAuditDate(''), 'Fecha no registrada');
      assert.equal(formatAuditDate('invalid'), 'Fecha no válida');
      assert.equal(formatAuditAction('ACTUALIZACION_EQUIPO'), 'Actualización de equipo');
      assert.equal(formatAuditAction('CODIGO_DESCONOCIDO'), 'Codigo desconocido');
      assert.equal(formatAuditAction(''), 'Operación no registrada');
    });

    await t.test('SST: urgencia registrada conserva baja/media/alta y distingue dato ausente', async () => {
      const { getSupportUrgency } = await load('/src/features/sst/utils/supportCasePresentation.js');
      assert.deepEqual(getSupportUrgency('baja'), { label: 'Baja', tone: 'baja' });
      assert.deepEqual(getSupportUrgency(' MEDIA '), { label: 'Media', tone: 'media' });
      assert.deepEqual(getSupportUrgency('alta'), { label: 'Alta', tone: 'alta' });
      for (const value of [undefined, null, '', '  ']) {
        assert.deepEqual(getSupportUrgency(value), { label: 'No registrada', tone: 'sin-dato' });
      }
      assert.deepEqual(getSupportUrgency('Valor del servicio'), { label: 'Valor del servicio', tone: 'sin-dato' });
    });

    await t.test('SST: buzón SSR distingue urgencia baja y datos ausentes sin inventar plazo', async () => {
      apiClient.defaults.adapter = async config => ({
        config, status: 200, statusText: 'OK', headers: {},
        data: { success: true, data: [
          { id: 'sst-low', code: 'MUESTRA-BAJA', mode: 'anonimo', status: 'Recibida', urgency: 'baja', reason: 'Motivo de muestra' },
          { id: 'sst-no-data', code: 'MUESTRA-SIN-DATOS', mode: 'anonimo', status: 'Recibida', reason: 'Motivo de muestra' }
        ] }
      });
      const { fetchSstSupportRequests } = await load('/src/features/sst/services/sstQueries.jsx');
      await fetchSstSupportRequests();
      const { SupportInboxPage } = await load('/src/features/sst/pages/SupportInboxPage.jsx');
      const html = renderToStaticMarkup(createElement(SupportInboxPage));
      assert.match(html, /urgency-baja[^>]*>Baja/);
      assert.match(html, /No registrada/);
      assert.equal((html.match(/Sin plazo registrado/g) || []).length, 2);
      assert.doesNotMatch(html, /24 h|24h|>Media</);
    });

    await t.test('SST: cierre SSR mantiene dos estados existentes, notas obligatorias y ninguna segunda capa modal', async () => {
      const { SstChatCloseForm } = await load('/src/features/sst/components/SstChatCloseForm.jsx');
      const html = renderToStaticMarkup(createElement(SstChatCloseForm, {
        requestCode: 'MUESTRA-001', notes: 'Acuerdo técnico de prueba.', targetStatus: 'En gestion',
        isClosing: false, error: null
      }));
      assert.equal((html.match(/<form\b/g) || []).length, 1);
      assert.doesNotMatch(html, /role="dialog"|aria-modal/);
      assert.match(html, /<fieldset/);
      assert.match(html, /<legend>¿Cómo queda el radicado\?/);
      assert.match(html, /<label[^>]*for="sstCloseNotesInput"/);
      assert.match(html.match(/<textarea\b[^>]*>/)[0], /required=""/);
      assert.match(html.match(/<input\b[^>]*value="En gestion"[^>]*>/)[0], /checked=""/);
      assert.doesNotMatch(html.match(/<input\b[^>]*value="Cerrada"[^>]*>/)[0], /checked/);
      assert.match(html, /el radicado continúa en gestión/);
      assert.match(html, /type="submit"/);
    });

    await t.test('SST: confirmación pendiente bloquea controles y el error conserva notas para reintentar', async () => {
      const { SstChatCloseForm } = await load('/src/features/sst/components/SstChatCloseForm.jsx');
      const pending = renderToStaticMarkup(createElement(SstChatCloseForm, {
        requestCode: 'MUESTRA-002', notes: 'Notas conservadas.', targetStatus: 'Cerrada',
        isClosing: true, error: null
      }));
      assert.match(pending, /aria-busy="true"/);
      for (const control of pending.match(/<(?:button|input|textarea)\b[^>]*>/g)) {
        assert.match(control, /disabled=""/);
      }
      const failed = renderToStaticMarkup(createElement(SstChatCloseForm, {
        requestCode: 'MUESTRA-002', notes: 'Notas conservadas.', targetStatus: 'Cerrada',
        isClosing: false, error: 'No se pudo guardar. Vuelve a intentarlo.'
      }));
      assert.match(failed, /Notas conservadas\./);
      assert.match(failed, /role="alert"/);
      assert.match(failed, /Vuelve a intentarlo/);
      assert.doesNotMatch(failed.match(/<button\b[^>]*type="submit"[^>]*>/)[0], /disabled/);
    });
  } finally {
    await vite.close();
    globalThis.window = previousWindow;
  }
});
