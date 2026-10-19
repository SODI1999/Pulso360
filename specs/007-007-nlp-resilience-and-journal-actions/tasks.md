# [TASKS-007] Tareas de Implementación y Verificación

## Secuencia de Ejecución Trazable

- [x] **TASK-01 / AC-01, AC-04: Sincronización del Léxico Canónico y Hash SHA-256.**  
  Actualizar `crisisPhrases` en `backend/database/lexicon-current.json` y `frontend/src/core/nlp/nlpEngine.jsx` incorporando raíces y variantes de autolisis y crisis extrema (`suicidarme`, `suicidar`, `suicidio`, `suicidarse`, `matarme`, `morirme`, `quitarme la vida`, `acabar con todo`, etc.). Recalcular el hash SHA-256 canónico mediante `canonicalJson.js` y actualizar la versión `lex-v12` en base de datos ejecutando `node backend/database/update-lexicon.mjs`.  
  *Archivos afectados:* `backend/database/lexicon-current.json`, `backend/database/update-lexicon.mjs`, `frontend/src/core/nlp/nlpEngine.jsx`.  
  *Verificación:* `node database/update-lexicon.mjs` en backend actualizó exitosamente el hash `eb2df264e08f96171dba1ab4944d21f8b68311bbc3d35d7a40eac5d0ef4ac965`.

- [x] **TASK-02 / AC-01: Refactorización Centinela de Crisis con Damerau-Levenshtein y Stemmer (Ronda 1).**  
  Modificar la evaluación de `isCrisisAlert` en `frontend/src/core/nlp/nlpEngine.jsx` para combinar: 1) subcadenas multipalabra directas, 2) lematización Snowball de tokens individuales (`stemSpanish`), y 3) coincidencia difusa con Damerau-Levenshtein $\le 1$ para términos de crisis de $\ge 5$ caracteres (capturando fat-finger typos y transposiciones como `csuicidar`, `suicidarm`).  
  *Archivos afectados:* `frontend/src/core/nlp/nlpEngine.jsx`.  
  *Verificación:* Prueba unitaria comprobando que `nlpEngine.analyze("me quiero csuicidar").isCrisisAlert === true` aprobada.

- [x] **TASK-03 / AC-03: Batería Automatizada de 3 Rondas para el Motor NLP.**  
  Diseñar e incorporar en `frontend/tests/nlpEngine.test.mjs` la batería integral de 3 rondas:  
  - *Ronda 1:* Detección de crisis con erratas (`csuicidar`, `suicidarm`), lematización de autolisis y frases multipalabra.  
  - *Ronda 2:* Las 8 categorías laborales BPO con pruebas de negación NegEx (`"no me grito"` $\rightarrow 0$ tensión) e intensificadores (`"muy grosero"` $\rightarrow$ mayor peso).  
  - *Ronda 3:* Verificación de integridad criptográfica SHA-256 del diccionario y latencia determinista local $< 50\text{ ms}$ (ejecutado en ~9.7ms).  
  *Archivos afectados:* `frontend/tests/nlpEngine.test.mjs`.  
  *Verificación:* `npm test -- --run` en `frontend` pasando con 55 tests exitosos (55/55).

- [x] **TASK-04 / AC-05: Componente `SomaticBreathingModal` In-Situ.**  
  Crear el componente `frontend/src/features/agent/components/SomaticBreathingModal.jsx` reutilizando `ZenBreathingOrb.jsx` dentro de un modal accesible (`role="dialog"`, `aria-modal="true"`, soporte de tecla `Esc` y clic fuera), con cabecera informativa de ritmo 4-2-6 y botón de retorno `"Listo, volver a mi bitácora"`.  
  *Archivos afectados:* `frontend/src/features/agent/components/SomaticBreathingModal.jsx`, `frontend/src/styles/bitacora.css`.  
  *Verificación:* Modal creado y accesible montado in-situ.

- [x] **TASK-05 / AC-05, AC-06: Bloque de Alivio y Trascendencia en `NlpAnalysisPanel`.**  
  Modificar `frontend/src/features/agent/components/NlpAnalysisPanel.jsx` para evaluar proactivamente si `activeCategories` contiene categorías de sobrecarga (`Exigencia emocional`, `Sobrecarga percibida`, `Recuperación insuficiente`). En caso afirmativo, renderizar la tarjeta de alivio somático con botón directo para abrir `SomaticBreathingModal` y enlace secundario hacia el canal confidencial de SST (`/agente/apoyo`). Coordinar el estado de apertura en `JournalPage.jsx` y `JournalEditor.jsx`.  
  *Archivos afectados:* `frontend/src/features/agent/components/NlpAnalysisPanel.jsx`, `frontend/src/features/agent/components/JournalEditor.jsx`, `frontend/src/features/agent/pages/JournalPage.jsx`.  
  *Verificación:* Pruebas de renderizado y suite de iconografía aprobadas al 100%.

- [x] **TASK-06 / AC-01 a AC-06: Quality Gates y Verificación Integral.**  
  Ejecutar la suite completa de calidad para garantizar cero regresiones en frontend y backend: `npm run lint` y `npm run build` en frontend, y `node test/run-contracts.js` en backend.  
  *Archivos afectados:* Todo el proyecto.  
  *Verificación:* `npm run lint` (0 errores), `npm run build` (vite build limpio), 132/132 contratos de backend aprobados.
