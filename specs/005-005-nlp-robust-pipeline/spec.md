# [SPEC-005] 005 Nlp Robust Pipeline

Date: 2026-10-19  
Author: Antigravity  
Status: IN_PROGRESS  
Branch: feat/005-005-nlp-robust-pipeline  

---

## 0. Fase de Clarificación y Supuestos

### Contexto y Evidencia Previa
- **[OBSERVADO]** en [`nlpEngine.jsx`](../../frontend/src/core/nlp/nlpEngine.jsx): El motor léxico actual opera mediante búsqueda estricta de subcadenas (`text.includes(term)`), normalización básica (`toLowerCase` y colapso de espacios) y un diccionario estático en [`lexicon-current.json`](../../backend/database/lexicon-current.json).
- **[EJECUTADO]**: Al someter el caso real del usuario (*"Una señora m,e grito toda grosera uqe pere<za"*), el motor arrojó 0 coincidencias (`categories: []`, mostrando *"Ninguna aplica"*), debido a:
  1. Caracteres parásitos de teclado ISO (`<` junto a la Z en `pere<za`) y comas pegadas (`m,e`).
  2. Inflexibilidad morfológica: el diccionario solo contenía el sustantivo plural `'gritos'`, pero no la forma verbal singular `'grito'` ni `'gritó'`.
  3. Brecha de vocabulario BPO: ausencia de `'grosera'`, `'grosero'`, `'groserías'` y `'pereza'`.
- **Invariante Constitucional ([AGENTS.md](../../AGENTS.md))**: El procesamiento debe permanecer **100% determinista, explicable, auditable y ejecutado en el dispositivo del usuario**. No se permite el uso de LLMs externos ni el envío de notas privadas a APIs remotas de terceros.

---

## 1. Need and scope

### Necesidad del Usuario
Los agentes de BPO / Contact Center redactan sus vivencias en la bitácora laboral (`/agente/bitacora`) bajo estados de fatiga cognitiva, aceleración o estrés post-llamada. Su redacción incluye errores tipográficos involuntarios (*fat-finger*), omisión de tildes, comas unidas a palabras, elongaciones expresivas de alivio/ira (*"demasiaaado"*, *"noooo"*) y conjugaciones verbales en primera persona (*"me gritó"*, *"estuvo insultando"*). El sistema debe ser capaz de interpretar adecuadamente estas notas sin perder la privacidad ni la rigurosidad determinista.

### Alcance Estructurado en 3 Iteraciones Progresivas
1. **Iteración 1: Normalización Robusta y Tolerancia Tipográfica**
   - Sanitización de puntuación pegada (`m,e` -> `m e`) y eliminación de parásitos de teclado (`<`, `>`, `/`, `_`).
   - Colapso de elongaciones emocionales repetidas $\ge 3$ caracteres (`"noooo"` -> `"no"`, `"horriiiible"` -> `"horrible"`).
   - Desacentuación diacrítica simétrica (Unicode NFD) para que acentos no impidan la coincidencia.
   - Algoritmo de distancia de edición Damerau-Levenshtein para tolerar transposiciones de teclas adyacentes y omisiones leves en palabras clave ($\text{distancia} \le 1$).
2. **Iteración 2: Lematización Determinista de Raíces (Stemming Snowball en Español)**
   - Algoritmo de raíces puro en JavaScript (~80 líneas, $\sim 2\text{ KB}$, $< 2\text{ ms}$ de cómputo) que reduce verbos conjugados, gerundios y flexiones de género/número a su raíz léxica común (`grit-`, `insult-`, `groser-`, `perez-`, `cansan-`, `agot-`).
   - Mapeo de evidencias para mantener estricta compatibilidad con la validación criptográfica de backend en [`lexiconService.js`](../../backend/src/application/services/lexiconService.js).
3. **Iteración 3: Diccionario BPO Enriquecido (v1.3.0) y Detección de Negación Contextual (NegEx en Español)**
   - Creación de la versión oficial de léxico `v1.3.0` registrada en base de datos (`versiones_lexico`), incorporando vocabulario de quejas operativas BPO, hostilidad de clientes y estados de fatiga.
   - Algoritmo contextual de negación determinista inspirado en NegEx en español con ventana deslizante de 3 tokens y disparadores compuestos (*"no"*, *"nunca"*, *"jamás"*, *"sin"*, *"cero"*, *"en ningún momento"*).
   - Ponderación de intensificadores (*"demasiado"*, *"muy"*, *"totalmente"*, *"súper"*).

---

## 2. Acceptance Criteria and Non-Goals

### Acceptance Criteria
- **AC-01**: **Caso testigo del operador resuelto**: La frase `"Una señora m,e grito toda grosera uqe pere<za"` es analizada con éxito identificando las categorías `Exigencia emocional` (evidencia: `grito`, `grosera`) y `Recuperación insuficiente` (evidencia: `pereza`), sin fallas ni errores.
- **AC-02**: **Sanitización y Elongaciones**: Se sanean caracteres parásitos (`<`, `>`, `_`), se separan signos de puntuación pegados (`m,e` -> `m e`) y se colapsan elongaciones de 3 o más letras idénticas (`"demasiaaado"` -> `"demasiado"`).
- **AC-03**: **Lematización Snowball en Español**: Formas verbales conjugadas en pasado, presente, gerundio o copretérito (*"me gritó"*, *"estuvo gritando"*, *"gritaban"*, *"nos insultaron"*) coinciden con la raíz léxica correspondiente sin requerir listados exhaustivos manuales.
- **AC-04**: **Tolerancia a Errores de Tipeo (Damerau-Levenshtein)**: Coincidencias con distancia de edición $\le 1$ en palabras clave mayores a 4 caracteres son reconocidas adecuadamente.
- **AC-05**: **Negación Contextual Determinista (NegEx)**: Expresiones con negadores explícitos próximos (ej. *"el cliente no fue grosero"*, *"sin gritos"*) anulan la puntuación del factor evitando falsos positivos.
- **AC-06**: **Privacidad, Criptografía y Quality Gates**: El motor corre 100% en cliente sin llamadas a servicios remotos externos, la versión `v1.3.0` registra su hash SHA-256 en backend y pasan limpiamente todas las pruebas de calidad (`backend/npm test`, `frontend/npm test`, `frontend/npm run lint`, `frontend/npm run build`).

### Non-Goals
- No se utilizan modelos de lenguaje generativos externos ni APIs de terceros (OpenAI, Gemini, Hugging Face, etc.).
- No se emiten diagnósticos médicos ni valoraciones psiquiátricas del trabajador.
- No se exponen notas individuales de bitácora a supervisores ni a SST; se mantiene el secreto inviolable de la bitácora personal.

---

## 3. Domain applicability

| Security & Compliance Control | Required? | Technical Enforcement |
| :--- | :---: | :--- |
| **¿Toca datos personales sensibles (PII)?** | **SÍ** | La bitácora contiene desahogos confidenciales protegidos bajo la Ley 1581/2012 y el SG-SST. El análisis léxico se realiza estrictamente en el navegador local (`frontend/src/core/nlp/nlpEngine.jsx`), garantizando que el texto crudo no sale a servicios de inferencia externos. |
| **¿Expone datos cross-tenant o entre roles?** | **NO** | Las bitácoras solo son accesibles por su titular (`usuario_id = $1`). Las vistas de supervisor y SST únicamente acceden a métricas colectivas con umbral $k \ge 5$; no tienen acceso a notas individuales ni a análisis de bitácora. |
| **¿Requiere registro de auditoría?** | **SÍ** | Se registran eventos de auditoría mediante `pulsoStore.audit` y `auditorRepository` para activaciones de versiones de léxico (`ACTIVACION_LEXICO_NLP`) y ejecuciones locales sin almacenar secretos. |
| **¿Criptografía e integridad de versiones?** | **SÍ** | El diccionario se firma y valida con SHA-256 (`canonicalJson(contenido) === hash_contenido`) en [`lexiconService.js`](../../backend/src/application/services/lexiconService.js). |

---

## 4. Experiencia y límites

1. **Estado Normal (Coincidencia Identificada)**: Muestra en [`NlpAnalysisPanel.jsx`](../../frontend/src/features/agent/components/NlpAnalysisPanel.jsx) los factores detectados con sus respectivos iconos de dominio (`heartPulse`, `coffee`, `batteryCharging`), las evidencias léxicas destacadas y la versión activa `v1.3.0 local`.
2. **Estado Vacío ("Ninguna aplica")**: Si el texto es completamente neutral o describe actividades cotidianas sin tensión, mantiene de forma sobria el badge neutral `Ninguna aplica` con la explicación pedagógica sin cajas alarmistas.
3. **Alerta Centinela de Crisis**: Si se detectan frases de ideación suicida o autolesión (`CRISIS_PHRASES`), se activa de inmediato el protocolo de apoyo prioritario y el modal de contención de crisis.
4. **Corrección Humana (Human-in-the-loop)**: El agente conserva en todo momento la potestad de corregir o anular las etiquetas identificadas mediante el modal de corrección (`NlpCorrectionModal.jsx`), guardando el historial de revisión.

---

## 5. Traceability

| Criterio de Aceptación | Componente / Servicio | Tarea / Verificación |
| :--- | :--- | :--- |
| **AC-01** | `nlpEngine.jsx`, `nlpSanitizer.js` | Test unitario con frase testigo y verificación E2E de guardado. |
| **AC-02** | `nlpSanitizer.js` | Suite de tests para elongaciones, puntuación pegada y símbolos. |
| **AC-03** | `spanishStemmer.js` | Suite de tests morfológicos con verbos conjugados y participios. |
| **AC-04** | `damerauLevenshtein.js` | Suite de tests de distancia de edición para transposiciones y omisiones. |
| **AC-05** | `nlpEngine.jsx` (reglas NegEx) | Suite de tests de negación contextual y ventana deslizante. |
| **AC-06** | `lexicon-current.json`, `migration 008` | Monorepo Quality Gates: 4 comandos de entrega limpios. |
