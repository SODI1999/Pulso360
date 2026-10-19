# [PLAN-005] Technical plan — Pipeline Robusto de NLP Determinista

## Evidence and existing architecture

### Evidencia de Código Existente
- **[OBSERVADO]** en [`frontend/src/core/nlp/nlpEngine.jsx`](../../frontend/src/core/nlp/nlpEngine.jsx):
  - Normalización elemental: `normalize = (text = '') => text.toLowerCase().replace(/\s+/g, ' ').trim()`.
  - Comparación rígida: `text.includes(term)`.
  - Ventana de negación básica de 3 palabras previas sobre `NEGATORS = ['no', 'nunca', 'jamás', 'jamas', 'sin']`.
- **[OBSERVADO]** en [`backend/database/lexicon-current.json`](../../backend/database/lexicon-current.json):
  - Diccionario versión `1.2.0` con vocabulario centrado en sustantivos (`gritos`, `insultos`) y frases nominales específicas (`cliente agresivo`), sin formas verbales conjugadas (`grito`, `gritó`, `gritando`) ni términos de quejas comunes (`grosera`, `grosero`, `pereza`).
- **[OBSERVADO]** en [`backend/src/application/services/lexiconService.js`](../../backend/src/application/services/lexiconService.js#L38-L43):
  - Regla de validación estricta en backend:
    `category.evidence.some(term => !active.dictionary.categories[category.name].includes(term))`
    Todo término devuelto en el array `evidence` DEBE existir exactamente dentro de la lista de términos de la categoría en el diccionario activo registrado en base de datos.
- **Invariante Constitucional ([CONSTITUTION.md](../../CONSTITUTION.md) y [AGENTS.md](../../AGENTS.md))**:
  - Procesamiento 100% determinista y local en el navegador (cero llamadas a LLMs remotos ni APIs externas).
  - Privacidad estricta: los diarios personales no se envían a terceros y son inaccesibles para supervisores.

---

## Proposed change

Diseñamos una arquitectura modular en 3 etapas en `frontend/src/core/nlp/` acompañada de la actualización oficial del léxico en backend:

```
frontend/src/core/nlp/
├── nlpSanitizer.js        <-- [NUEVO] Sanitización ortopédica, desacentuación y colapso de elongaciones
├── damerauLevenshtein.js  <-- [NUEVO] Cálculo de distancia de edición para fat-finger typos y transposiciones
├── spanishStemmer.js      <-- [NUEVO] Lematizador de raíces Snowball para español (puro JS, ~80 líneas, <2ms)
└── nlpEngine.jsx          <-- [ACTUALIZADO] Orquestador determinista que integra el pipeline de 4 capas

backend/database/
├── lexicon-current.json   <-- [ACTUALIZADO] Versión v1.3.0 con vocabulario BPO enriquecido
└── migrations/
    └── 008_lexicon_v1_3.js <-- [NUEVO] Migración de activación formal de v1.3.0 con hash SHA-256
```

### Detalle de las 3 Fases de Implementación:
1. **Fase 1: Higiene Tipográfica y Tolerancia a Errores de Teclado**
   - `nlpSanitizer.js`:
     * Colapso de letras consecutivas $\ge 3$ (`/([a-záéíóúñ])\1{2,}/gi` $\rightarrow$ `$1`).
     * Limpieza de parásitos de teclado (`<`, `>`, `/`, `_`, `\`) reemplazándolos por espacios o eliminándolos si parten una palabra.
     * Separación de signos de puntuación pegados a letras (`m,e` $\rightarrow$ `m e`).
     * Desacentuación simétrica con `normalize('NFD').replace(/[\u0300-\u036f]/g, '')`.
   - `damerauLevenshtein.js`:
     * Algoritmo de distancia con soporte para transposiciones inmediatas (`uqe` $\rightarrow$ `que`).
2. **Fase 2: Lematización Snowball de Raíces para Español**
   - `spanishStemmer.js`:
     * Implementación determinista del algoritmo de Martin Porter para español: remoción de pronombres enclíticos (`-me`, `-te`, `-se`), sufijos flexivos verbales (`-ió`, `-aba`, `-aban`, `-ando`, `-ieron`, `-aron`) y marcas de género/número (`-os`, `-as`, `-es`).
     * Permite que formas como `gritó`, `grito`, `gritando`, `gritos` converjan a la raíz canónica `grit`.
3. **Fase 3: Léxico BPO v1.3.0 y Negación Contextual NegEx**
   - Actualización de `lexicon-current.json` y base de datos con la versión `v1.3.0`:
     * Incorporación de familias léxicas de tensión en contact centers (`groser*`, `grit*`, `insult*`, `perez*`, `desgan*`, `back-to-back`, `cola interminable`).
     * Inclusión de disparadores de negación compuestos (*"no"*, *"nunca"*, *"jamás"*, *"sin"*, *"cero"*, *"en ningún momento"*, *"tampoco"*, *"para nada"*).
     * Mapeo de retorno: al coincidir una raíz o término difuso, el motor emite como `evidence` el término canónico registrado en el diccionario para preservar la integridad del contrato de validación en backend.

---

## Contracts and compatibility

### 1. Firma de Entrada y Salida de `nlpEngine.analyze(rawText)`
Se mantiene 100% idéntica e intercambiable con la interfaz actual:
```javascript
{
  version: "1.3.0",
  categories: [
    {
      name: "Exigencia emocional",
      confidence: 0.70,
      evidence: ["grito", "grosera"]
    },
    {
      name: "Recuperación insuficiente",
      confidence: 0.55,
      evidence: ["pereza"]
    }
  ],
  requiresReview: false,
  isCrisisAlert: false
}
```

### 2. Compatibilidad Estricta con Backend ([`lexiconService.js`](../../backend/src/application/services/lexiconService.js))
- Cada elemento en `category.evidence` pertenece inequívocamente al array `active.dictionary.categories[category.name]`.
- El hash SHA-256 del diccionario `v1.3.0` generado con `canonicalJson` coincide exactamente con el registrado en `versiones_lexico.hash_contenido`.

---

## Verification

| Criterio | Método de Verificación | Comando / Ubicación |
| :--- | :--- | :--- |
| **AC-01** (Frase testigo del usuario) | Test automatizado unitario e integración | `cd frontend && npm test` (`tests/nlpEngine.test.mjs`) |
| **AC-02** (Sanitización y elongaciones) | Suite unitaria de sanitizador | `cd frontend && npm test` (`tests/nlpSanitizer.test.mjs`) |
| **AC-03** (Stemming Snowball) | Suite morfológica de verbos y sufijos | `cd frontend && npm test` (`tests/spanishStemmer.test.mjs`) |
| **AC-04** (Damerau-Levenshtein) | Suite de distancia de edición | `cd frontend && npm test` (`tests/damerauLevenshtein.test.mjs`) |
| **AC-05** (Negación contextual NegEx) | Suite de pruebas de falsos positivos | `cd frontend && npm test` (`tests/nlpEngine.test.mjs`) |
| **AC-06** (Quality gates del monorepo) | Ejecución de los 4 gates de entrega | `backend: npm test`, `frontend: npm test`, `frontend: npm run lint`, `frontend: npm run build` |

---

## Rollback / recovery

1. Si la versión `v1.3.0` presentara alguna inconsistencia, el sistema cuenta con el mecanismo nativo de reversión en [`lexiconService.js#L48-L64`](../../backend/src/application/services/lexiconService.js#L48-L64) (`activateLexicon(previousId, actor, true)`), el cual reactiva `v1.2.0` de forma atómica registrando auditoría `REVERSION_LEXICO_NLP`.
2. Los componentes del pipeline en frontend son funciones puras sin efectos secundarios en almacenamiento ni mutación de estado global.
