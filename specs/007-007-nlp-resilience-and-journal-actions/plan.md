# [PLAN-007] Plan Técnico: Robustez Centinela NLP (3 Rondas) y Accionabilidad de la Bitácora

## 1. Evidencia y Arquitectura Existente

### Componentes y Contratos Existentes
1. **Motor NLP Léxico (`frontend/src/core/nlp/nlpEngine.jsx`):**
   - Actualmente cuenta con pipeline de 4 capas: sanitización ortopédica (`nlpSanitizer.js`), lematización Snowball (`spanishStemmer.js`), coincidencia con tolerancia (`damerauLevenshtein.js`) y ponderación léxica.
   - **Vulnerabilidad detectada:** `isCrisisAlert` solo realiza un `.includes()` literal estricto sobre `dictionary().crisis`, y la lista omite raíces directas de autolisis como `suicid*` o `matarme`.
2. **Léxico Canónico Backend (`backend/database/lexicon-current.json` y `lexiconService.js`):**
   - La base de datos valida la integridad del catálogo léxico verificando `crypto.createHash('sha256').update(canonicalJson(content)).digest('hex') === row.hash_contenido`.
   - Cualquier adición a `crisisPhrases` requiere recalcular el hash canónico mediante `canonicalJson.js` y sincronizarlo con `versiones_lexico`.
3. **Panel de Análisis de Bitácora (`frontend/src/features/agent/components/NlpAnalysisPanel.jsx`):**
   - Muestra chips con `activeCategories` y hashtags con evidencias léxicas.
   - Carece de sugerencias activas de recuperación somática o puentes directos hacia SST cuando se detecta alta tensión emocional o sobrecarga.
4. **Contención Somática Existente (`frontend/src/features/agent/components/ZenBreathingOrb.jsx`):**
   - Implementa un orbe concéntrico animado con ciclo 4-2-6 (4s Inhala, 2s Sostén, 6s Exhala) para estabilización fisiológica y de pulso.

---

## 2. Cambios Propuestos

### Capa 1: Blindaje Centinela de Crisis (Ronda 1)
* **Archivo afectado:** `frontend/src/core/nlp/nlpEngine.jsx`
  - Ampliar `CRISIS_PHRASES` con catálogo exhaustivo de autolisis y crisis extrema:
    `'suicidarme'`, `'suicidar'`, `'suicidio'`, `'suicidarse'`, `'matarme'`, `'morirme'`, `'quitarme la vida'`, `'acabar con todo'`, `'no puedo mas'`, `'no puedo más'`, `'quiero morir'`, `'hacerme daño'`, `'hacerme dano'`, `'no quiero seguir'`, `'lastimarme'`, `'ahorcarme'`, `'cortarme'`.
  - Refactorizar la detección `isCrisisAlert`:
    1. Búsqueda por subfrase (para frases multipalabra como `'no puedo más'`, `'quitarme la vida'`).
    2. Búsqueda por tokens y raíces lematizadas con Snowball (`stemSpanish`).
    3. Búsqueda difusa (Fuzzy matching) con **Damerau-Levenshtein $\le 1$** sobre términos de crisis de $\ge 5$ caracteres (ej. `"csuicidar"` $\rightarrow$ distancia 1 con `"suicidar"`, captura inmediata del error tipográfico o temblor).
* **Archivos afectados:** `backend/database/lexicon-current.json` y `backend/database/update-lexicon.mjs`
  - Sincronizar el catálogo `crisisPhrases`.
  - Ejecutar el recálculo canónico del hash SHA-256 e impactar `versiones_lexico` (id: `'lex-v12'`).

### Capa 2: Matriz de 3 Rondas de Pruebas Automatizadas (Rondas 1, 2 y 3)
* **Archivo afectado:** `frontend/tests/nlpEngine.test.mjs`
  - **Ronda 1 (Crisis & Autolisis):** Casos para `csuicidar`, `suicidarme`, `quiero matarme`, `quitarme la vida`, verificando `isCrisisAlert: true`.
  - **Ronda 2 (Matriz Operativa BPO & NegEx):** Casos para las 8 categorías laborales, validando que `"el cliente no fue grosero"` y `"cero gritos"` anulan la tensión (NegEx), mientras `"demasiado grosero"` amplifica la confianza.
  - **Ronda 3 (Criptografía & Rendimiento):** Validación de integridad del hash SHA-256 canónico y verificación de ejecución determinista local en $< 50\text{ ms}$.

### Capa 3: Modal de Alivio Somático In-Situ y Accionabilidad en Bitácora
* **Nuevo componente:** `frontend/src/features/agent/components/SomaticBreathingModal.jsx`
  - Modal flotante accesible (`role="dialog"`, `aria-modal="true"`) que aloja `ZenBreathingOrb`.
  - Proporciona cabecera con botón de cierre accesible (`Esc` y clic en fondo), contador de ciclo 4-2-6 y botón claro: `"Listo, volver a mi bitácora"`.
* **Componente modificado:** `frontend/src/features/agent/components/NlpAnalysisPanel.jsx`
  - Inyectar el bloque de **Acción Inmediata Sugerida (Somatic Relief Block)** cuando `activeCategories` contenga `'Exigencia emocional'`, `'Sobrecarga percibida'` o `'Recuperación insuficiente'`.
  - Incluye:
    1. Botón primario: `<Icon name="respiro" /> Iniciar pausa somática (1 min)` (dispara `onOpenSomaticModal`).
    2. Botón secundario: `<Icon name="support_agent" /> Orientación confidencial con SST` (enlace voluntario hacia `/agente/apoyo`).
* **Vistas coordinadas:** `frontend/src/features/agent/pages/JournalPage.jsx` y `frontend/src/features/agent/components/JournalEditor.jsx`
  - Estado `showSomaticModal` para apertura/cierre sin alterar la entrada de texto ni perder contexto.
* **Estilos:** `frontend/src/styles/bitacora.css`
  - Reglas visuales sobrias y ergonómicas para `.analysis-relief-card` y `.somatic-modal`, respetando la paleta Pulso Calma (`#0D9488`, `#0F766E`, `#F8FAFC`).

---

## 3. Contratos de Datos y Compatibilidad

### Contrato del Motor NLP (`nlpEngine.analyze`)
```typescript
interface NlpAnalysisResult {
  version: string;
  categories: Array<{
    name: string;
    confidence: number;
    evidence: string[];
  }>;
  isCrisisAlert: boolean; // TRUE ante ideación autolítica o crisis extrema (incluyendo erratas de distancia <= 1)
  requiresReview: boolean;
}
```

### Contrato de Props para `NlpAnalysisPanel`
```typescript
interface NlpAnalysisPanelProps {
  journal: JournalEntry | null;
  onOpenCorrection: () => void;
  onOpenHistory: () => void;
  onOpenSomaticModal: () => void; // Nueva prop para abrir la pausa somática in-situ
}
```

### Contrato de Props para `SomaticBreathingModal`
```typescript
interface SomaticBreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

---

## 4. Verificación y Mapeo de Criterios

| Criterio | Descripción | Método de Verificación | Archivo de Prueba / Comprobación |
| :--- | :--- | :---: | :--- |
| **AC-01** | Crisis Fuzzy Guard (erratas y autolisis) | Automatizado | `frontend/tests/nlpEngine.test.mjs` (`csuicidar` $\rightarrow$ `isCrisisAlert: true`) |
| **AC-02** | Disparo de protocolo de crisis | Automatizado | `frontend/tests/agentJournal.test.mjs` (Verificación de `showCrisisModal`) |
| **AC-03** | Matriz de 3 Rondas (8 categorías, NegEx e intensificadores) | Automatizado | `frontend/tests/nlpEngine.test.mjs` (Batería integral de regresión) |
| **AC-04** | Integridad criptográfica SHA-256 | Automatizado | `node backend/database/update-lexicon.mjs` & `npm run test:contracts` en backend |
| **AC-05** | Acción de alivio somático en panel | Manual / E2E | Inspección visual en navegador de `NlpAnalysisPanel` y `SomaticBreathingModal` |
| **AC-06** | Enlace voluntario hacia SST | Manual / E2E | Verificación de redirección a `/agente/apoyo` sin filtración de datos de bitácora |

---

## 5. Rollback y Recuperación

* Si la actualización del léxico genera discrepancia de hash en producción, la tabla `lexico_activaciones` y la función `activateLexicon(revert=true)` en `backend/src/application/services/lexiconService.js` permiten restaurar la versión canónica anterior de manera transaccional.
* En el frontend, las modificaciones en `NlpAnalysisPanel` y `SomaticBreathingModal` son puramente aditivas y reutilizan `ZenBreathingOrb`, sin alterar las invariantes de persistencia de `pulsoStore.js`.
