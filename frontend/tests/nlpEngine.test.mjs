import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

let sharedServer;
let sanitizeInputText, stripDiacritics, collapseElongations;
let damerauLevenshtein, matchWithTolerance;
let stemSpanish;

before(async () => {
  sharedServer = await createServer({
    configFile: false,
    root: process.cwd(),
    logLevel: 'silent',
    appType: 'custom',
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] }
  });
  ({ sanitizeInputText, stripDiacritics, collapseElongations } = await sharedServer.ssrLoadModule('/src/core/nlp/nlpSanitizer.jsx'));
  ({ damerauLevenshtein, matchWithTolerance } = await sharedServer.ssrLoadModule('/src/core/nlp/damerauLevenshtein.jsx'));
  ({ stemSpanish } = await sharedServer.ssrLoadModule('/src/core/nlp/spanishStemmer.jsx'));
});

after(async () => {
  await sharedServer?.close();
});

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

  // Verbos reflexivos con pronombres enclíticos
  assert.equal(stemSpanish('matarme'), 'mat');
  assert.equal(stemSpanish('morirme'), 'mor');
  assert.equal(stemSpanish('suicidarse'), 'suicid');
  assert.equal(stemSpanish('lastimarme'), 'lastim');
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
    const { nlpEngine, NLP_CATEGORIES, CRISIS_PHRASES, NEGATORS, INTENSIFIERS } = await server.ssrLoadModule('/src/core/nlp/nlpEngine.jsx');
    nlpEngine.setLexicon({
      version: 'lexico-v1.2',
      dictionary: {
        categories: NLP_CATEGORIES,
        crisisPhrases: CRISIS_PHRASES,
        negators: NEGATORS,
        intensifiers: INTENSIFIERS
      }
    });
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

test('nlpEngine (Ronda 1 - Centinela de Crisis): detección de alertas de crisis preventiva y tolerancia a erratas (AC-01)', async () => {
  await withViteApp(async ({ nlpEngine }) => {
    // Frase centinela multipalabra clásica
    const r1 = nlpEngine.analyze('Siento que ya no puedo más con este turno');
    assert.equal(r1.isCrisisAlert, true, 'Debe detectar frase de crisis tradicional');

    // Caso testigo del usuario: errata de teclado (inserción de 'c' en 'csuicidar')
    const r2 = nlpEngine.analyze('me quiero csuicidar');
    assert.equal(r2.isCrisisAlert, true, 'Debe detectar errata crítica csuicidar con Damerau-Levenshtein <= 1');

    // Raíz directa de autolisis
    const r3 = nlpEngine.analyze('quiero suicidarme no doy más');
    assert.equal(r3.isCrisisAlert, true, 'Debe detectar suicidarme');

    // Variante de autolisis con fat-finger typo
    const r4 = nlpEngine.analyze('estoy pensando en matarme');
    assert.equal(r4.isCrisisAlert, true, 'Debe detectar matarme');

    // Casos reales reportados por el usuario
    const r5 = nlpEngine.analyze('me quiero matar');
    assert.equal(r5.isCrisisAlert, true, 'Debe detectar me quiero matar infaliblemente');

    const r6 = nlpEngine.analyze('que rabia tengo mucha ira me suciadare');
    assert.equal(r6.isCrisisAlert, true, 'Debe detectar errata suciadare como alerta de crisis');
    const em6 = r6.categories.find((c) => c.name === 'Exigencia emocional');
    assert.ok(em6, 'Debe detectar Exigencia emocional para rabia e ira');
    assert.ok(em6.evidence.includes('rabia'), 'Debe incluir rabia en la evidencia');
    assert.ok(em6.evidence.includes('ira'), 'Debe incluir ira en la evidencia');

    const r7 = nlpEngine.analyze('me voy a morir');
    assert.equal(r7.isCrisisAlert, true, 'Debe detectar me voy a morir');

    // Texto no crítico sin crisis
    const rNormal = nlpEngine.analyze('Turno tranquilo atendiendo clientes con normalidad');
    assert.equal(rNormal.isCrisisAlert, false, 'No debe disparar crisis falsamente');
  });
});

test('nlpEngine (Ronda 3 - Desempeño y Cero LLM): latencia local determinista < 50ms', async () => {
  await withViteApp(async ({ nlpEngine }) => {
    const text = 'Una señora m,e grito toda grosera uqe pere<za y me quiero csuicidar del estres';
    const start = performance.now();
    for (let i = 0; i < 20; i++) {
      nlpEngine.analyze(text);
    }
    const end = performance.now();
    const avgDuration = (end - start) / 20;
    assert.ok(avgDuration < 50, `El análisis debe tomar menos de 50ms en promedio, tomó ${avgDuration.toFixed(2)}ms`);
  });
});
