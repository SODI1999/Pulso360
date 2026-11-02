import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { build } from '../../../frontend/node_modules/vite/dist/node/index.js';

const root = fileURLToPath(new URL('../../../frontend/', import.meta.url));
const phase = process.argv[2] || 'baseline';
const normalizedRoot = root.replaceAll('\\', '/');
const repository = fileURLToPath(new URL('../../../', import.meta.url));
const baselineCommit = '58eb868d6f4ec6ce9190110f038bfcedc9760d84';
const baselineSources = new Map();
if (phase === 'baseline') {
  for (const file of ['src/App.jsx', 'src/core/layout/AppLayout.jsx', 'src/core/components/RouteAccessibility.jsx']) {
    baselineSources.set(normalizedRoot + file, execFileSync('git', ['show', baselineCommit + ':frontend/' + file], { cwd: repository, encoding: 'utf8' }));
  }
}
const chunks = [];
const assets = [];
const startedAt = new Date().toISOString();
const output = await build({
  root, configFile: root + 'vite.config.js', logLevel: 'error',
  build: { write: false },
  plugins: [{ name: 'pulso-baseline-source', enforce: 'pre',
    load(id) { return baselineSources.get(id.replaceAll('\\', '/')); }
  }]
});
// Inspect the final Rollup output after Vite has inserted preload dependencies.
for (const bundle of (Array.isArray(output) ? output : [output])) {
      for (const item of bundle.output) {
        if (item.type === 'chunk') chunks.push({
          file: item.fileName, entry: item.isEntry, dynamicEntry: item.isDynamicEntry,
          facade: item.facadeModuleId?.replace(normalizedRoot, ''),
          bytes: Buffer.byteLength(item.code), gzipBytes: gzipSync(item.code, { level: 9 }).length,
          imports: item.imports, dynamicImports: item.dynamicImports,
          modules: Object.entries(item.modules).map(([id, sizes]) => ({
            id: id.replace(normalizedRoot, ''), renderedLength: sizes.renderedLength
          })).sort((a, b) => b.renderedLength - a.renderedLength)
        });
        else assets.push({ file: item.fileName, bytes: Buffer.byteLength(item.source) });
      }
}
const result = { phase, baselineCommit: phase === 'baseline' ? baselineCommit : undefined, startedAt, completedAt: new Date().toISOString(), chunks, assets };
await writeFile(new URL(phase + '-bundle.json', import.meta.url), JSON.stringify(result, null, 2));
console.log(JSON.stringify({ phase, entry: chunks.filter(chunk => chunk.entry).map(({modules, ...chunk}) => chunk), chunks: chunks.length, assets: assets.length }, null, 2));
