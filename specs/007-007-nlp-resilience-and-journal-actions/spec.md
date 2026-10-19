# [SPEC-007] Robustez Centinela NLP (3 Rondas) y Accionabilidad Trascendente de la Bitácora

**Fecha:** 2026-10-19  
**Estado:** Activo  
**Tipo:** Feature Specification  

---

## 0. Fase de Clarificación y Supuestos

### Decisiones de Diseño Confirmadas (2026-10-19)
1. **Experiencia de Alivio Somático:**
   - **Decisión:** Modal in-situ (`SomaticBreathingModal`). Se abre un modal flotante dentro de la misma pantalla de la bitácora reutilizando la lógica del orbe de respiración `ZenBreathingOrb` para que el agente realice su pausa de 60 segundos y retome su nota sin perder contexto ni navegar a otra ruta.
2. **Activación de Acciones de Alivio:**
   - **Decisión:** Basada en categorías de tensión somática y operativa. Se despliega el bloque de acción de alivio somático cuando el NLP identifique al menos una de las categorías críticas: `Exigencia emocional`, `Sobrecarga percibida` o `Recuperación insuficiente`.
3. **Protocolo ante Detección de Crisis:**
   - **Decisión:** Guardado protegido en segundo plano y contención inmediata. La nota se persiste de forma segura en la bitácora privada (bajo consentimiento C2) y de inmediato se interrumpe la navegación ordinaria abriendo en primer plano el modal centinela de crisis (`CrisisSupportModal`), con acceso a las líneas 24/7 (Línea 106, Línea 192) y canal prioritario de SST.

### Evidencia Observada y Hallazgos
1. **Fallo Crítico en Centinela de Crisis (OBSERVED en `frontend/src/core/nlp/nlpEngine.jsx` y `backend/database/lexicon-current.json`):**
   - El catálogo de `crisisPhrases` contenía únicamente 9 frases literales (`'no puedo más'`, `'quiero morir'`, `'hacerme daño'`, etc.), omitiendo raíces de autolisis como `suicid*` (`suicidar`, `suicidarme`, `suicidio`), `matarme`, `morirme`.
   - La evaluación de `isCrisisAlert` se ejecutaba mediante un `.includes()` literal estricto sin tolerancia a erratas (Damerau-Levenshtein) ni lematización (Stemmer). Una errata común por digitación apresurada o temblor como `"csuicidar"` no activaba la alerta de crisis ni las categorías operativas, retornando falsamente `categories: []` ("Ninguna aplica").
2. **Vacío de Trascendencia en la Bitácora (OBSERVED en `frontend/src/features/agent/components/NlpAnalysisPanel.jsx`):**
   - Tras procesar el texto con NLP, el sistema se limitaba a mostrar etiquetas pasivas (`#grito`, `Exigencia emocional`).
   - El asesor de Contact Center percibía la bitácora como una carga burocrática ("llenar más cosas") porque no recibía ninguna acción proactiva o alivio inmediato tras registrar una llamada difícil.
3. **Invariantes de Privacidad y Arquitectura (DECLARED en `AGENTS.md` y `specs/project-context.md`):**
   - El motor NLP debe mantenerse 100% determinista y ejecutarse en el cliente (sin LLMs externos ni APIs de terceros).
   - Las notas privadas de la bitácora (finalidad C2) jamás deben transferirse ni exponerse al supervisor ni a vistas colectivas.
   - Todo puente hacia SST o pausas somáticas debe ser voluntario y no punitivo.

---

## 1. Need and scope

### ¿Quién lo necesita y por qué?
* **El Operador / Asesor de Contact Center:**
  - Necesita que la red de seguridad centinela del sistema responda infaliblemente ante cualquier manifestación de colapso emocional o ideación suicida, incluso si comete errores tipográficos por alteración o rapidez en el teclado (`csuicidar`, `suicidarm`, etc.).
  - Necesita que escribir en su bitácora tenga una **trascendencia real e inmediata**: que tras volcar el estrés de una llamada dura reciba una herramienta de alivio concreto (pausa somática asistida de respiración en puesto) o un canal directo hacia SST, en lugar de etiquetas estáticas.
* **El Equipo de SST y la Organización:**
  - Garantiza el cumplimiento de las Resoluciones 2646/2008 y 2764/2022 de Colombia respecto a la vigilancia preventiva del riesgo psicosocial sin incurrir en vigilancia laboral invasiva ni diagnósticos clínicos no autorizados.

### Marco de Análisis en 3 Rondas para el NLP
1. **Ronda 1: Centinela de Crisis e Ideación Autolítica (Fuzzy & Stemmed Crisis Guard):**
   - Tolerancia cero a falsos negativos en situaciones de ideación suicida o colapso severo.
   - Extender la tolerancia tipográfica Damerau-Levenshtein ($\le 1$) y lematización Snowball a las raíces críticas de autolisis (`suicid*`, `matar*`, `morir*`, `quitarme la vida`, `acabar con todo`, `no doy mas`, `no puedo mas`).
   - Si se detecta una señal de crisis, se activa inmediatamente `isCrisisAlert: true`, interrumpiendo el flujo ordinario para desplegar el modal de apoyo prioritario con líneas oficiales 24/7.
2. **Ronda 2: Matriz Léxica BPO, NegEx e Intensificadores (8 Categorías Operativas):**
   - Cobertura de las realidades cotidianas de un Contact Center (AHT, back-to-back, caída de CRM, cliente agresivo/grosero, falta de apoyo de líder, desmotivación).
   - Validación semántica con patrón de negación NegEx (evitar falsos positivos como *"el cliente no fue grosero"*) y ponderación con intensificadores (*"demasiado grosero"*).
3. **Ronda 3: Integridad Criptográfica, Rendimiento Local y No Diagnóstico:**
   - Hash SHA-256 canónico sincronizado entre el archivo léxico (`lexicon-current.json`) y la base de datos PostgreSQL, ejecución determinista local en $< 50\text{ ms}$ en el cliente.
   - Orientación pedagógica para la autorreflexión, evitando terminología diagnóstica médica.

### La Ruta de Trascendencia: ¿Qué sucede después de registrar la Bitácora?
El registro de la bitácora deja de ser un trámite burocrático para convertirse en un ciclo de soporte activo:
1. **Alivio Somático en Puesto:** Si el NLP detecta `Exigencia emocional`, `Sobrecarga percibida` o `Recuperación insuficiente`, el panel ofrece una tarjeta de recuperación activa sugerida con 1 clic hacia la pausa somática de respiración guiada (4-2-6) en `SomaticBreathingModal`.
2. **Puente Voluntario con SST:** Ofrece un acceso directo al canal de acompañamiento de SST (`/agente/apoyo`) sin transferir la nota privada.
3. **Trascendencia Personal:** La nota alimenta el histórico confidencial del asesor para identificar patrones de agotamiento por tipo de turno en "Mi bienestar".

---

## 2. Acceptance Criteria and Non-Goals

### Acceptance Criteria
- **AC-01 (Crisis Fuzzy Guard):** El motor NLP intercepta ideación suicida y autolisis con tolerancia a erratas de distancia Damerau-Levenshtein $\le 1$ (ej. `csuicidar`, `suicidarm`) y flexiones verbales (`suicidarme`, `matarme`, `morirme`), disparando `isCrisisAlert: true`.
- **AC-02 (Crisis Protocol Trigger):** Al dispararse `isCrisisAlert: true`, la interfaz interrumpe el flujo habitual y despliega inmediatamente el modal de contención y líneas 24/7 (`CrisisSupportModal`), auditando la acción sin exponer el texto privado.
- **AC-03 (3-Round NLP Linguistic Robustness):** Validación de las 8 categorías del léxico BPO con soporte a lematización, negaciones contextuales (NegEx) e intensificadores, garantizando cero falsos positivos por negación ("no me grito") y correcta captura de variantes operativas.
- **AC-04 (Cryptographic Lexicon Integrity):** El archivo `lexicon-current.json` y la base de datos coinciden en su hash SHA-256 canónico, y el servicio `validateDictionary` valida la versión sin errores de integridad.
- **AC-05 (Actionable Somatic Relief in Journal):** Tras guardar y analizar una entrada con alta tensión (`Exigencia emocional` o `Sobrecarga percibida`), el panel `NlpAnalysisPanel` ofrece una tarjeta de recuperación activa sugerida con 1 clic hacia la pausa somática de respiración guiada.
- **AC-06 (Voluntary SST Bridge):** El panel de análisis ofrece un acceso directo y voluntario al canal de orientación con SST (`/agente/apoyo`) sin transferir ni exponer el texto privado de la bitácora.

### Non-Goals
1. **No LLMs ni llamadas de red:** El motor sigue siendo 100% determinista, léxico y ejecutado en el dispositivo del cliente.
2. **No diagnósticos clínicos:** Ninguna salida califica como trastorno mental, patología o incapacidad médica.
3. **No exposición al supervisor:** El contenido textual y el resultado individual jamás se comparten con supervisión ni RRHH.
4. **No gamificación vacía:** Cero medallas, puntos o felicitaciones infantiles; lenguaje sobrio, digno y profesional enfocado en ergonomía y calma.

---

## 3. Domain applicability

| Security & Compliance Control | Required? | Technical Enforcement |
| :--- | :---: | :--- |
| **¿Accede o procesa datos sensibles?** | **SÍ** | El texto del desahogo contiene percepciones emocionales. Se procesa en memoria local; solo se persiste en almacenamiento bajo consentimiento explícito C2, aislado de supervisión. |
| **¿Expone datos cross-tenant o entre roles?** | **NO** | Las bitácoras son estrictamente individuales. Ningún supervisor ni auditor tiene permiso de lectura sobre el texto. |
| **¿Requiere registro de auditoría?** | **SÍ** | La activación de rutas de crisis se audita como evento institucional (`RUTA_APOYO_MOSTRADA`) sin registrar el texto íntimo ni los datos confidenciales del usuario. |
| **¿Cumplimiento normativo Colombia?** | **SÍ** | Conforme a la Ley 1581/2012 (Habeas Data), Ley 1010/2006 (Acoso Laboral) y Resoluciones 2646/2008 y 2764/2022 (Factores de Riesgo Psicosocial). |

---

## 4. Experiencia y límites

* **Estado Crisis:** Se interrumpe la navegación estándar y se despliega `CrisisSupportModal` con prioridad visual, ofreciendo Línea 106, Línea 192 y contención inmediata.
* **Estado Tensión Operativa:** En el panel `NlpAnalysisPanel`, debajo de los factores, se muestra el bloque de **Acción Inmediata Sugerida** con botones claros: "Hacer pausa de respiración (1 min)" y "Orientación confidencial con SST".
* **Estado Normal / Sin Tensión:** Si no se detectan factores de tensión, el panel valida la jornada con un mensaje sereno y sobrio de descanso de turno.
* **Estado Sin Consentimiento C3:** Si el usuario no tiene activo C3, la entrada se guarda normalmente sin ejecutar el análisis NLP, respetando su autonomía.

---

## 5. Traceability

| Criterio | Plan | Tarea | Verificación |
| :--- | :--- | :--- | :--- |
| **AC-01** | Sección 2 (Capa 1) | TASK-01, TASK-02 | `frontend/tests/nlpEngine.test.mjs` |
| **AC-02** | Sección 2 (Capa 1) | TASK-02 | `useJournal.jsx` / `CrisisSupportModal.jsx` |
| **AC-03** | Sección 2 (Capa 2) | TASK-03 | `frontend/tests/nlpEngine.test.mjs` (3 Rondas) |
| **AC-04** | Sección 2 (Capa 1) | TASK-01 | `update-lexicon.mjs` & `backend/test/run-contracts.js` |
| **AC-05** | Sección 2 (Capa 3) | TASK-04, TASK-05 | `NlpAnalysisPanel.jsx` & `SomaticBreathingModal.jsx` |
| **AC-06** | Sección 2 (Capa 3) | TASK-05 | Enlace a `/agente/apoyo` |
