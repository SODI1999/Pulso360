import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

import { sanitizeInputText, stripDiacritics, collapseElongations } from '../src/core/nlp/nlpSanitizer.js';
import { damerauLevenshtein, matchWithTolerance } from '../src/core/nlp/damerauLevenshtein.js';
import { stemSpanish } from '../src/core/nlp/spanishStemmer.js';

// Test 1: Sanitización ortopédica y elongaciones (AC-02)
test('nlpSanitizer: colapsa elongaciones y limpia parásitos de teclado sin alterar la letra ñ', () => {
  // Elongaciones emocionales
  assert.equal(collapseElongations('demasiaaaado'), 'demasiado');
  assert.equal(collapseElongations('nooooo'), 'no');
  assert.equal(collapseElongations('horriiiible'), 'horrible');

  // Separación de signos pegados y parásitos incrustados
  const sanitized = sanitizeInputText('Una señora m,e grito toda grosera uqe pere<za');
  assert.equal(sanitized, 'una señora m e grito toda grosera uqe pereza');

  // Desacentuación simétrica preservando la 'ñ'
  assert.equal(stripDiacritics('señora gritó presión estrés'), 'señora grito presion estres');
  assert.equal(stripDiacritics('daño'), 'daño');
});

// Test 2: Tolerancia tipográfica Damerau-Levenshtein (AC-04)
test('damerauLevenshtein: detecta transposiciones inmediatas y fat-finger typos de distancia <= 1', () => {
  assert.equal(damerauLevenshtein('uqe', 'que'), 1);
  assert.equal(damerauLevenshtein('groserra', 'grosera'), 1);
  assert.equal(damerauLevenshtein('canancio', 'cansancio'), 1);
  assert.equal(damerauLevenshtein('pereza', 'pereza'), 0);

  // Coincidencia con tolerancia
  assert.equal(matchWithTolerance('groserra', ['grosera', 'gritos'], 1), 'grosera');
  assert.equal(matchWithTolerance('uqe', ['que'], 1), null); // palabras < 4 letras requieren coincidencia exacta
  assert.equal(matchWithTolerance('perez', ['perez'], 1), 'perez');
});

// Test 3: Lematización de raíces Snowball en español (AC-03)
test('spanishStemmer: reduce formas verbales y flexiones de género/número a raíces canónicas', () => {
  const gritForms = ['grito', 'gritos', 'gritó', 'gritaron', 'gritando', 'gritaba'];
  gritForms.forEach((word) => {
    assert.equal(stemSpanish(word), 'grit', `Fallo en forma verbal: ${word}`);
  });

  const insultForms = ['insulto', 'insultos', 'insultó', 'insultaron', 'insultando'];
  insultForms.forEach((word) => {
    assert.equal(stemSpanish(word), 'insult', `Fallo en forma de insulto: ${word}`);
  });

  const groserForms = ['grosero', 'grosera', 'groseros', 'groseras'];
  groserForms.forEach((word) => {
    assert.equal(stemSpanish(word), 'groser', `Fallo en forma de grosero: ${word}`);
  });

  const perezForms = ['pereza', 'perezoso', 'perezosa'];
  perezForms.forEach((word) => {
    assert.equal(stemSpanish(word), 'perez', `Fallo en forma de pereza: ${word}`);
  });

  const agotForms = ['agotado', 'agotada', 'agotados', 'agotadas', 'agotamiento'];
  agotForms.forEach((word) => {
    assert.equal(stemSpanish(word), 'agot', `Fallo en forma de agotamiento: ${word}`);
  });
});

// Test 4: Integración del motor nlpEngine (AC-01, AC-05, AC-06)
async function withViteApp(run) {
  const server = await createServer({
    configFile: false,
    root: process.cwd(),
    logLevel: 'silent',
    appType: 'custom',
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] }
  });
  try {
    const { nlpEngine } = await server.ssrLoadModule('/src/core/nlp/nlpEngine.jsx');
    const { env } = await server.ssrLoadModule('/src/core/config/env.jsx');
    env.useMockStorage = true;
    await run({ nlpEngine });
  } finally {
    await server.close();
  }
}

test('nlpEngine: procesa exitosamente la frase testigo del operador (AC-01)', async () => {
  await withViteApp(async ({ nlpEngine }) => {
    const input = 'Una señora m,e grito toda grosera uqe pere<za';
    const analysis = nlpEngine.analyze(input);

    assert.ok(Array.isArray(analysis.categories), 'Debe retornar un array de categorías');
    assert.ok(analysis.categories.length >= 2, 'Debe identificar al menos 2 categorías');

    const catNames = analysis.categories.map((c) => c.name);
    assert.ok(catNames.includes('Exigencia emocional'), 'Debe detectar Exigencia emocional');
    assert.ok(catNames.includes('Recuperación insuficiente'), 'Debe detectar Recuperación insuficiente');

    // Comprobar evidencias
    const emocional = analysis.categories.find((c) => c.name === 'Exigencia emocional');
    assert.ok(emocional.evidence.length >= 2, 'Debe identificar evidencias de agresión');

    const recuperacion = analysis.categories.find((c) => c.name === 'Recuperación insuficiente');
    assert.ok(recuperacion.evidence.includes('pereza'), 'Debe identificar pereza como evidencia');

    assert.equal(analysis.isCrisisAlert, false, 'No debe disparar alerta de crisis');
  });
});

test('nlpEngine: negación contextual estilo NegEx anula la tensión (AC-05)', async () => {
  await withViteApp(async ({ nlpEngine }) => {
    const input = 'La señora no me grito, para nada grosera';
    const analysis = nlpEngine.analyze(input);

    const emocional = analysis.categories.find((c) => c.name === 'Exigencia emocional');
    assert.equal(emocional, undefined, 'No debe identificar Exigencia emocional cuando hay negación explícita');
  });
});

test('nlpEngine: detección de alertas de crisis preventiva', async () => {
  await withViteApp(async ({ nlpEngine }) => {
    const inputCrisis = 'Siento que ya no puedo más con este turno';
    const analysis = nlpEngine.analyze(inputCrisis);
    assert.equal(analysis.isCrisisAlert, true, 'Debe detectar la frase centinela de crisis');
  });
});
