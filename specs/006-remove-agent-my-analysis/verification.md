# Verification evidence — SPEC-006 Remove Agent My Analysis

Fecha de verificación: 2026-10-19. Todas las ejecuciones son reales (categoría EXECUTADO); se listan comando, directorio y resultado. El entorno local: Windows, Node disponible, PostgreSQL operativo (el gate backend lo requirió y pasó).

## Gates de calidad (EXECUTADO)

| Comando | Directorio | Resultado |
| :--- | :--- | :--- |
| `npm test` | `frontend` | exit 0 — 48/48 tests pasan (`pass 48, fail 0`), incluye iconografía actualizada y suite de bitácora |
| `npm run lint` | `frontend` | exit 0 — sin hallazgos |
| `npm run build` | `frontend` | exit 0 — `vite build` exitoso (2214 módulos, 4.88s); aviso preexistente de chunk >500 kB, no relacionado |
| `npm test` | `backend` | exit 0 — 132/132 tests pasan (`pass 132, fail 0`); este spec no modifica backend |

## Mapeo criterio → evidencia

**AC-01 — Ruta e import removidos; URL cae al catch-all. PASSED (automated + inspección en runtime)**
- grep en `frontend/src` + `frontend/tests` de `mi-analisis|MyAnalysis|analisis.css|Mi análisis` → 0 resultados (EXECUTADO, PowerShell Select-String).
- Runtime (EXECUTADO, navegador sobre `npm run dev` con mock storage, localhost:5174): navegación directa a `/agente/mi-analisis` termina en `/` (landing autenticado con enlace "Ir a mi Panel"). Control de equivalencia: `/agente/ruta-que-nunca-existio` también termina en `/` — la ruta eliminada se comporta idéntica a una ruta inexistente; sin pantalla muerta ni error.

**AC-02 — Navegación sin la entrada. PASSED (inspección en runtime + test)**
- Runtime (EXECUTADO): links del sidebar del agente: Mi panel, Mi bienestar, Mis datos, Apoyo inmediato (+ marca). Sin "Mi análisis". El grupo "Tu bienestar" conserva 'Mi bienestar' y 'Acompañamiento'.
- `frontend npm test` → subtest "la navegación diferencia registrar y consultar historia; los planes conservan significado entre roles" pasa (aserciones entre roles intactas).

**AC-03 — Gating removido, reglas vecinas intactas. PASSED (inspección + tests)**
- grep `mi-analisis` en `frontend/src/core/auth` → 0 resultados (EXECUTADO).
- Reglas C1/C2/C3 de checkin/bitácora/apoyo visibles en `authService.jsx` tras la remoción (OBSERVADO post-cambio).
- Test de suite: "bitácora aplica C2 al guardar y C3 al procesar incluso después de guardar" pasa — el consentimiento por finalidad sigue operativo en el flujo de bitácora.

**AC-04 — Encabezado de bitácora coherente sin el botón. PASSED (inspección en runtime)**
- Runtime (EXECUTADO, DOM medido en localhost:5174/agente/bitacora): `.page-header` renderiza flex 694×63 px con título "Mi bitácora laboral" + subtítulo; **0 enlaces** dentro del header; 0 elementos con texto "Ver mis análisis"; 0 enlaces a `/agente/mi-analisis` en toda la página.
- La página completa funciona: `#journalArea` presente, textarea del editor presente, `#journalsList` presente.
- Limitación registrada: la captura de pantalla (PNG) no fue posible (la herramienta requiere ventana de escritorio visible, no disponible en esta sesión). La evidencia es de árbol de accesibilidad + medición DOM, no visual-píxel.

**AC-05 — Análisis NLP por entrada sin regresión. PASSED (automated)**
- `frontend npm test` incluye y pasa: "el titular puede crear, editar, analizar, corregir y eliminar sin confiar en metadatos de la UI", "bitácora aplica C2 al guardar y C3 al procesar", "API real: análisis/corrección esperan respuesta, conservan hash y jamás escriben mock", "corregir un factor conserva su símbolo y expresa el ajuste con texto" (panel de corrección).
- `backend npm test` incluye y pasa: "análisis, revisión e historial persisten; editar invalida y rechaza respuesta atrasada" (ok 32), "C3 y aceptación se verifican por HTTP" (ok 33).
- `FACTOR_METADATA`, `NlpAnalysisPanel`, `NlpCorrectionModal` no se modificaron (0 cambios en esos archivos).

**AC-06 — Archivos eliminados sin imports huérfanos. PASSED (automated + inspección)**
- `frontend/src/features/agent/pages/MyAnalysisPage.jsx` y `frontend/src/styles/analisis.css` eliminados (EXECUTADO, Remove-Item; confirmados ausentes por el grep de referencias en 0 y por el build exitoso — Vite fallaría con un import roto).

**AC-07 — Suite actualizada y pasando. PASSED (automated)**
- `frontend/tests/iconography.test.mjs`: `personalTasks` reducido a checkin + mi-bienestar, aserción de 2 iconos distintos, título del subtest sin "reflexionar"; aserciones de roles conservadas. `npm test` exit 0 con ese archivo incluido (EXECUTADO).

**AC-08 — Gates ejecutados. PASSED (automated)**
- Los 4 gates oficiales ejecutados con exit 0 (tabla superior). Ningún archivo de backend fue modificado por este spec.

## Hallazgos y limitaciones

- **Errores de consola preexistentes**: durante la inspección de runtime aparecen errores CORS/Network hacia `http://localhost:3000/api/v1` (backend no levantado en esa sesión de inspección). Se reprodujeron también en el primer login del preview antes de cualquier verificación del cambio; son comportamiento del arranque de la app sin backend, no una regresión de este spec. En modo mock la UI funciona y el motor NLP usa el léxico local integrado.
- **Captura visual**: no realizada por limitación de entorno (ventana de escritorio no disponible); AC-04 quedó soportado en evidencia de DOM/accesibilidad medidos en runtime.
- **Cobertura**: la suite no cubre todos los navegadores ni escenarios; no se afirma cero regresiones más allá de los gates ejecutados y las verificaciones de runtime listadas.
- **Sin cambios de persistencia ni backend**: el store conserva journals con análisis; solo desapareció un consumidor de solo lectura.
