import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from '@babel/parser';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (key === 'loc') continue;
    if (Array.isArray(value)) value.forEach((child) => walk(child, visit));
    else if (value && typeof value === 'object') walk(value, visit);
  }
}

// Recoger los resultados posibles, sin confundir textos de condiciones con nombres de iconos.
function iconNames(node) {
  if (!node) return [];
  if (node.type === 'StringLiteral') return [node.value];
  if (node.type === 'JSXExpressionContainer') return iconNames(node.expression);
  if (node.type === 'ConditionalExpression') {
    return [...iconNames(node.consequent), ...iconNames(node.alternate)];
  }
  if (node.type === 'LogicalExpression') {
    return [...iconNames(node.left), ...iconNames(node.right)];
  }
  return [];
}

async function collectIconUsages(directory, usages = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await collectIconUsages(file, usages);
    else if (file.endsWith('.jsx') && entry.name !== 'Icon.jsx') {
      const source = await readFile(file, 'utf8');
      const ast = parse(source, { sourceType: 'module', plugins: ['jsx'] });
      walk(ast, (node) => {
        let names = [];
        if (node.type === 'JSXOpeningElement' && node.name.name === 'Icon') {
          names = iconNames(node.attributes.find((attr) => attr.name?.name === 'name')?.value);
        } else if (node.type === 'ObjectProperty' && ['icon', 'iconName'].includes(node.key.name || node.key.value)) {
          names = iconNames(node.value);
        } else if (node.type === 'VariableDeclarator' && node.id.name?.endsWith('_ICONS') && node.init?.type === 'ObjectExpression') {
          names = node.init.properties.flatMap((property) => iconNames(property.value));
        }
        names.forEach((name) => usages.push({ name, file, line: node.loc.start.line }));
      });
    }
  }
  return usages;
}

test('iconografía compartida: nombres de todas las vistas, semántica y tamaños', async (t) => {
  const server = await createServer({
    configFile: false,
    root: process.cwd(),
    logLevel: 'silent',
    appType: 'custom',
    esbuild: { jsx: 'automatic' },
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] }
  });
  try {
    const { Icon } = await server.ssrLoadModule('/src/core/components/Icon.jsx');
    const render = (name, props = {}) => renderToStaticMarkup(createElement(Icon, { name, ...props }));

    await t.test('cada nombre estático y catálogo utilizado resuelve a un símbolo real', async () => {
      const usages = await collectIconUsages(path.resolve('src'));
      assert.ok(usages.length > 0);
      for (const { name, file, line } of usages) {
        assert.doesNotMatch(render(name), /data-icon-missing/, `${file}:${line} solicita "${name}" sin registrar`);
      }
    });

    await t.test('la navegación diferencia registrar, reflexionar y consultar historia; los planes conservan significado entre roles', async () => {
      const { roleMenus } = await server.ssrLoadModule('/src/core/auth/roleNavigation.jsx');
      const iconAt = (role, href) => render(roleMenus[role].find((item) => item.href === href).icon);
      const personalTasks = ['/agente/checkin', '/agente/mi-analisis', '/agente/mi-bienestar'];
      assert.equal(new Set(personalTasks.map((href) => iconAt('agente', href))).size, 3);
      assert.equal(iconAt('supervisor', '/supervisor/acciones'), iconAt('sst', '/sst/intervenciones'));
      assert.equal(iconAt('admin', '/reportes'), iconAt('sst', '/reportes'));
    });

    await t.test('los accesos de chat en ambos roles usan conversación y el envío no usa navegación', async () => {
      const usages = await collectIconUsages(path.resolve('src'));
      for (const file of ['SupportChatCard.jsx', 'SupportChannelPage.jsx', 'SstRequestChatDrawer.jsx', 'SupportInboxPage.jsx']) {
        const names = usages.filter((usage) => path.basename(usage.file) === file).map((usage) => usage.name);
        assert.ok(names.some((name) => /lucide-messages-square/.test(render(name))), `${file}: falta símbolo de conversación`);
        assert.ok(names.every((name) => !/lucide-headphones/.test(render(name))), `${file}: audífonos confunden conversación con rol BPO`);
      }
      for (const file of ['SupportChatCard.jsx', 'SstRequestChatDrawer.jsx']) {
        assert.ok(usages.some((usage) => path.basename(usage.file) === file && /lucide-send/.test(render(usage.name))));
      }
    });

    await t.test('corregir un factor conserva su símbolo y expresa el ajuste con texto', async () => {
      const { NlpAnalysisPanel } = await server.ssrLoadModule('/src/features/agent/components/NlpAnalysisPanel.jsx');
      const journal = { analysis: { version: '1', categories: [{ name: 'Distanciamiento laboral', evidence: [] }] } };
      const original = renderToStaticMarkup(createElement(NlpAnalysisPanel, { journal }));
      const corrected = renderToStaticMarkup(createElement(NlpAnalysisPanel, {
        journal: { ...journal, correctedCategories: ['Distanciamiento laboral'] }
      }));
      assert.match(original, /lucide-unplug/);
      assert.match(corrected, /lucide-unplug/);
      assert.match(corrected, /Ajustado/);
      assert.doesNotMatch(corrected, /lucide-eye-off/);
    });

    await t.test('indicadores sin tendencia no sugieren mejora ni alarma mediante el icono', async () => {
      const { TeamKpiGrid } = await server.ssrLoadModule('/src/features/supervisor/components/TeamKpiGrid.jsx');
      const markup = renderToStaticMarkup(createElement(TeamKpiGrid));
      assert.match(markup, /N\/D/);
      assert.doesNotMatch(markup, /lucide-trending-up|lucide-triangle-alert/);
    });

    await t.test('un aviso destinado a SST no se presenta como alerta sólo por su destinatario', async () => {
      const { NotificationItem } = await server.ssrLoadModule('/src/features/notifications/components/NotificationItem.jsx');
      const markup = renderToStaticMarkup(createElement(NotificationItem, {
        notification: { role: 'sst', title: 'Configuración actualizada', href: '/sst/reglas-alertas' }
      }));
      assert.match(markup, /Aviso del Sistema/);
      assert.doesNotMatch(markup, /Alerta Operativa|lucide-triangle-alert/);
      const alert = renderToStaticMarkup(createElement(NotificationItem, {
        notification: { role: 'sst', title: 'Alerta preventiva', href: '/sst/alertas' }
      }));
      assert.match(alert, /Alerta Operativa/);
    });

    await t.test('archivo protegido, alta de usuario, escritura y tendencia tienen símbolos específicos', () => {
      assert.match(render('fileShield'), /lucide-file-lock/);
      assert.match(render('userPlus'), /lucide-user-plus/);
      assert.match(render('edit_note'), /lucide-notebook-pen/);
      assert.match(render('monitoring'), /lucide-chart-line/);
      assert.match(render('touchApp'), /lucide-hand/);
    });

    await t.test('Lucide y SVG propios conservan tamaño, trazo y estilos adicionales', () => {
      for (const name of ['headphones', 'kAnonymityShield']) {
        const markup = render(name, { size: 36, strokeWidth: 2.5, style: { marginTop: 2 } });
        assert.match(markup, /width="36"/);
        assert.match(markup, /height="36"/);
        assert.match(markup, /stroke-width="2.5"/);
        assert.match(markup, /margin-top:2px/);
        assert.match(markup, /aria-hidden="true"/);
      }
    });

    await t.test('un nombre desconocido produce un marcador detectable en lugar de un punto', () => {
      const markup = render('test-missing-icon');
      assert.match(markup, /data-icon-missing="true"/);
      assert.match(markup, /lucide-circle-(help|question-mark)/);
      assert.doesNotMatch(markup, /r="3"/);
    });
  } finally {
    await server.close();
  }
});
