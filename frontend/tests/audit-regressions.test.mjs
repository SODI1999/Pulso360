import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

test('CSV: estructura permitida sin garantías falsas ni pérdida silenciosa de filas', async () => {
  const server = await createServer({configFile:false,root:process.cwd(),logLevel:'silent',appType:'custom',
    server:{middlewareMode:true,hmr:false,watch:null},optimizeDeps:{noDiscovery:true,include:[]}});
  try {
    const { validateCsvContent, parseCsv } = await server.ssrLoadModule('/src/features/admin/services/csvValidation.jsx');
    const { CSV_TEMPLATE } = await server.ssrLoadModule('/src/features/admin/data/csvImportData.jsx');
    assert.equal(validateCsvContent(CSV_TEMPLATE).rows.length,3);
    assert.equal(validateCsvContent('campana_id,semana,telefono_contacto\ncamp-1,2026-W40,0000000000').valid,false);
    assert.equal(validateCsvContent('campana_id,semana,semana\ncamp-1,2026-W40,2026-W40').valid,false);
    assert.equal(validateCsvContent('campana_id,semana\ncamp-1,2026-W40\ncamp-2').valid,false);
    assert.equal(validateCsvContent('campana_id,semana,tasa_ausentismo_pct\ncamp-1,2026-W40,101').valid,false);
    assert.equal(validateCsvContent('campana_id,semana\ncamp-1,2026-W00').valid,false);
    assert.equal(validateCsvContent('campana_id,semana\n"camp-1","2026-W40"').valid,true);
    assert.deepEqual(parseCsv('a,b\n"un campo, citado","comillas ""dobles"""'),[['a','b'],['un campo, citado','comillas "dobles"']]);
    assert.equal(validateCsvContent('campana_id,semana\n"camp-1,2026-W40').valid,false);
  } finally { await server.close(); }
});
