# Verification evidence: SPEC-005 Pipeline Robusto de NLP Determinista

Fecha de verificación: 2026-10-19  
Estado: VERIFIED  

## Criterios de Aceptación y Evidencia

| Criterio | Estado | Método de Verificación | Evidencia Observada / Ejecutada |
| :--- | :---: | :--- | :--- |
| **AC-01** (Frase testigo del operador procesada con éxito) | **PASSED** | Test automatizado (`frontend/tests/nlpEngine.test.mjs`) | La frase `"Una señora m,e grito toda grosera uqe pere<za"` es analizada con éxito detectando las categorías `Exigencia emocional` (evidencias canónicas: `gritos`, `grosero`) y `Recuperación insuficiente` (evidencia: `pereza`), sin fallas ni excepciones. |
| **AC-02** (Sanitización ortopédica y elongaciones) | **PASSED** | Test automatizado (`frontend/tests/nlpEngine.test.mjs`) | En `nlpSanitizer.js`, `collapseElongations` colapsa repeticiones $\ge 3$ (`demasiaaaado` $\rightarrow$ `demasiado`, `noooo` $\rightarrow$ `no`, `horriiiible` $\rightarrow$ `horrible`). `sanitizeInputText` limpia parásitos de teclado (`pere<za` $\rightarrow$ `pereza`) y separa puntuación pegada (`m,e` $\rightarrow$ `m e`) sin alterar la letra `ñ` ni acentos. |
| **AC-03** (Lematizador Snowball en español) | **PASSED** | Test automatizado (`frontend/tests/nlpEngine.test.mjs`) | En `spanishStemmer.js`, las formas verbales conjugadas (`grito`, `gritos`, `gritó`, `gritaron`, `gritando`, `gritaba`) convergen unívocamente a la raíz canónica `grit`. Formas de insulto convergen a `insult`, hostilidad a `groser` y fatiga a `perez` y `agot`. |
| **AC-04** (Tolerancia tipográfica Damerau-Levenshtein) | **PASSED** | Test automatizado (`frontend/tests/nlpEngine.test.mjs`) | En `damerauLevenshtein.js`, transposiciones de teclas adyacentes (`uqe` $\rightarrow$ `que`) y fat-finger typos (`groserra` $\rightarrow$ `grosera`, `canancio` $\rightarrow$ `cansancio`) computan distancia 1 y coinciden con tolerancia. |
| **AC-05** (Negación contextual determinista NegEx) | **PASSED** | Test automatizado (`frontend/tests/nlpEngine.test.mjs`) | Frases con negadores explícitos próximos (ej: `"La señora no me grito, para nada grosera"`) son neutralizadas en la ventana de 3 palabras, evitando falsos positivos y arrojando 0 categorías en `Exigencia emocional`. |
| **AC-06** (Privacidad, Criptografía y Quality Gates) | **PASSED** | Comandos de entrega del monorepo | - Ejecución 100% local en cliente sin llamadas a LLMs ni APIs externas de terceros.<br>- Diccionario registrado con hash SHA-256 en PostgreSQL (`versiones_lexico`).<br>- `npm test` en `backend/`: 132/132 tests pasados.<br>- `npm test` en `frontend/`: 54/54 tests pasados.<br>- `npm run lint` en `frontend/`: 0 errores, 0 advertencias.<br>- `npm run build` en `frontend/`: Compilación de producción exitosa en 8.74s. |

## Limitaciones y Notas Finales
- Todo el procesamiento se realiza localmente en el dispositivo del usuario en menos de 2 ms, garantizando el secreto profesional y la Ley 1581 / SG-SST.
- El contrato criptográfico con el backend se mantiene intacto mediante la emisión de evidencias canónicas reconocidas en el diccionario activo.
