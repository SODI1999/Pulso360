# Verification evidence: SPEC-007 Robustez Centinela NLP (3 Rondas) y Accionabilidad Trascendente de la Bitácora

Fecha de verificación: 2026-10-19  
Estado: VERIFIED  

## Criterios de Aceptación y Evidencia

| Criterio | Estado | Método de Verificación | Evidencia Observada / Ejecutada |
| :--- | :---: | :--- | :--- |
| **AC-01** (Crisis Fuzzy Guard) | **PASSED** | Test automatizado (`frontend/tests/nlpEngine.test.mjs`) | `isCrisisAlert` evalúa frases compuestas y tokens individuales con distancia Damerau-Levenshtein ($\le 2$ para términos $\ge 7$ letras como `suicidare`, y $\le 1$ para términos $\ge 5$ letras como `suicidar`) y lematización Snowball (`stemSpanish`) con despojo de pronombres enclíticos reflexivos (`matarme` $\rightarrow$ `mat`, `morirme` $\rightarrow$ `mor`). Casos reales probados y aprobados: `"me quiero matar"`, `"me quiero csuicidar"`, `"pienso en suicidarm"`, `"me voy a morir"`, `"que rabia tengo mucha ira me suciadare"`. |
| **AC-02** (Crisis Protocol Trigger) | **PASSED** | Inspección y contratos de UI (`useJournal.jsx`, `CrisisSupportModal.jsx`) | Ante `isCrisisAlert: true`, `useJournal` persiste la nota privada de manera segura e interrumpe la navegación habitual para desplegar en primer plano `CrisisSupportModal` con las líneas oficiales 24/7 (Línea 106, Línea 192), auditando el evento `RUTA_APOYO_MOSTRADA` sin transferir el texto confidencial. |
| **AC-03** (3-Round NLP Linguistic Robustness) | **PASSED** | Test automatizado (`frontend/tests/nlpEngine.test.mjs`) | Batería integral de 3 rondas ejecutada con 55/55 pruebas aprobadas:<br>1. *Ronda 1:* Erratas en autolisis (`csuicidar`, `suciadare`, `matarme`, `matar`, `morir`) y lematización de crisis.<br>2. *Ronda 2:* Las 8 categorías operativas BPO con NegEx (frases como `"no me grito"` neutralizan la categoría), intensificadores y términos operativos de afectación emocional (`rabia`, `ira`, `enojo`, `frustración`, `impotencia`).<br>3. *Ronda 3:* Integridad criptográfica SHA-256 y latencia de análisis local determinista en ~9.7 ms ($< 50\text{ ms}$). |
| **AC-04** (Cryptographic Lexicon Integrity) | **PASSED** | Test automatizado en Backend (`backend/test/`) y migración DB | Léxico sincronizado en `backend/database/lexicon-current.json` y registrado en PostgreSQL con hash SHA-256 `fe34f6ccecae1197aebdcb78eb802eb952f17acb3edefe03d68a8af306edb536` (`lex-v12`). La suite de 132 contratos de backend ejecutó y aprobó al 100% (132/132). |
| **AC-05** (Actionable Somatic Relief in Journal) | **PASSED** | Inspección y prueba de componentes (`NlpAnalysisPanel.jsx`, `SomaticBreathingModal.jsx`) | Cuando se detecta tensión operativa (`Exigencia emocional`, `Sobrecarga percibida`, `Recuperación insuficiente`), el panel `NlpAnalysisPanel` despliega `.analysis-relief-card` con el botón de 1 clic para abrir `SomaticBreathingModal` in-situ, permitiendo la pausa de respiración guiada 4-2-6 sin perder el contexto de la bitácora. |
| **AC-06** (Voluntary SST Bridge) | **PASSED** | Inspección de componentes y rutas (`NlpAnalysisPanel.jsx`) | La tarjeta de alivio incluye un enlace/botón voluntario y directo hacia el canal de apoyo confidencial de SST (`/agente/apoyo`), sin filtrar ni exponer el texto privado del agente (cumpliendo Ley 1581/2012 y resoluciones SST). |

## Ajustes Adicionales de Resiliencia en UI y Sincronización
- **Normalización de Payload en `journalService.jsx`:** Se corrigió la extracción de `res.data?.data` en `saveJournal` y `saveJournalAnalysis`, asegurando que `currentJournalId` se mantenga sincronizado tras guardar, eliminando la duplicación accidental de notas y garantizando que el análisis retorne y se almacene en la base de datos PostgreSQL.
- **Ergonomía Visual y Corrección de Colisión en Lista Lateral (`JournalEntryList.jsx`, `bitacora.css`):** 
  - Se desacopló `.journal-row` de las clases `.btn.btn-ghost` que imponían restricciones de altura (`min-height: 38px`), `line-height: 1.2` y flexbox de botón.
  - Se estructuró cada entrada en tres áreas semánticas: cabecera (`.journal-row-header`), cuerpo con truncamiento a 2 líneas (`.journal-row-preview`) y pie (`.journal-row-footer`).
  - Se erradicó el solapamiento de la insignia de turno (`.journal-row-context` con icono `clock`) que previamente se desbordaba sobre el borde inferior y chocaba con la tarjeta contigua, encapsulándola 100% dentro del marco de la tarjeta con espaciado vertical uniforme (`gap: var(--space-3, 10px)` en `.journal-sidebar-list`).
  - Se dotó a la tarjeta activa de estilos consistentes con realce en tonos teal (`var(--c-primario-suave)` y borde `var(--c-primario)`).

## Quality Gates Ejecutados

1. **Backend Contract Tests:**
   ```bash
   cd backend && npm test
   ```
   - Resultado: 132 tests pasados, 0 fallos.
2. **Frontend Unit Tests:**
   ```bash
   cd frontend && npm test
   ```
   - Resultado: 55 tests pasados (55/55), 0 fallos.
3. **Frontend Linter:**
   ```bash
   cd frontend && npm run lint
   ```
   - Resultado: 0 errores, 0 advertencias.
4. **Frontend Production Build:**
   ```bash
   cd frontend && npm run build
   ```
   - Resultado: Compilación con Vite exitosa en 6.22s.
