# [PLAN-006] Technical plan

## Evidence and existing architecture

**Comportamiento existente (OBSERVADO):**

- Ruta `/agente/mi-analisis` declarada en [App.jsx:129-136](../../frontend/src/App.jsx) con import en línea 22; catch-all `path="*"` redirige a `/` en [App.jsx:306](../../frontend/src/App.jsx).
- Entrada de menú 'Mi análisis' (grupo "Tu bienestar") en [roleNavigation.jsx:28](../../frontend/src/core/auth/roleNavigation.jsx). El grupo conserva dos entradas tras la remoción: 'Mi bienestar' (línea 29) y 'Acompañamiento' (línea 30) — no queda grupo vacío.
- Regla de gating por href en [authService.jsx:305-311](../../frontend/src/core/auth/authService.jsx): `mi-analisis` → C2+C3 (línea 308). Las reglas de `checkin` (C1), `bitacora` (C2) y `apoyo` (C3) son independientes línea a línea; remover la línea 308 no las afecta.
- Botón "Ver mis análisis" en el encabezado de [JournalPage.jsx:137-140](../../frontend/src/features/agent/pages/JournalPage.jsx). El encabezado con solo título+subtítulo **ya existe como estado** en la misma página cuando C2 está desactivado (líneas 74-79): el layout resultante no es un estado nuevo.
- [analisis.css](../../frontend/src/styles/analisis.css) solo es importado por `MyAnalysisPage.jsx` (grep: única referencia).
- `FACTOR_METADATA` ([nlpFactorMetadata.jsx](../../frontend/src/features/agent/data/nlpFactorMetadata.jsx)) tiene otros consumidores vivos: `NlpCorrectionModal.jsx` y `NlpAnalysisPanel.jsx` (grep OBSERVADO).
- `agentQueries.jsx` tiene otros consumidores vivos: `useSupportChannel`, `useMyWellbeing`, `journalService`, `checkinWizardService`, `myDataPrivacyService`, `supportChannelService`.
- Test que toca la ruta: [iconography.test.mjs:79-86](../../frontend/tests/iconography.test.mjs) — `personalTasks = ['/agente/checkin', '/agente/mi-analisis', '/agente/mi-bienestar']` con aserción de 3 iconos distintos, más aserciones supervisor/sst/admin que no dependen de la vista eliminada.
- Tests de bitácora que deben seguir pasando sin cambios: `regressions.test.mjs` (análisis por entrada, corrección), `api-integration.test.mjs` (hash de análisis, corrección por API).

**Restricciones declaradas (DECLARADO):**

- Gates oficiales: 4 comandos en [CONSTITUTION.md](../../CONSTITUTION.md) §4. El gate backend requiere PostgreSQL en ejecución con `DB_NAME_TEST` ([project-context.md §4](../project-context.md)); este spec no modifica archivos de backend.
- Cambio quirúrgico mínimo, sin tocar código adyacente ([CONSTITUTION.md](../../CONSTITUTION.md) §1.4).

## Proposed change

Eliminación directa, sin sustitutos ni rediseño. El valor personal del análisis (momento de escritura) permanece en la bitácora; el análisis longitudinal queda como responsabilidad de las vistas agregadas con k-anonimato, fuera de alcance.

**Secuencia de ediciones:**

1. `frontend/src/App.jsx` — remover import de `MyAnalysisPage` (línea 22) y el bloque `<Route path="/agente/mi-analisis">` (líneas 129-136).
2. `frontend/src/core/auth/roleNavigation.jsx` — remover la entrada 'Mi análisis' (línea 28). Sin cambios en los comentarios del catálogo.
3. `frontend/src/core/auth/authService.jsx` — remover la línea 308 (`if (item.href.includes('mi-analisis')) ...`). El comentario de cabecera (línea 298) sigue siendo veraz: C1, C2 y C3 siguen filtrando menús.
4. `frontend/src/features/agent/pages/JournalPage.jsx` — remover el bloque `<Link to="/agente/mi-analisis">` (líneas 137-140). El resto del encabezado no se toca.
5. Eliminar archivos: `frontend/src/features/agent/pages/MyAnalysisPage.jsx` y `frontend/src/styles/analisis.css`.
6. `frontend/tests/iconography.test.mjs` — `personalTasks` sin `/agente/mi-analisis`; aserción `size === 3` → `size === 2`; título del subtest actualizado de "diferencia registrar, reflexionar y consultar historia" a "diferencia registrar y consultar historia" (la vista que representaba "reflexionar" desaparece del producto). Las aserciones de iconos compartidos entre roles (líneas 84-85) se conservan intactas.
7. Sin cambios en: `nlpFactorMetadata.jsx`, `agentQueries.jsx`, `journalService.jsx`, `NlpAnalysisPanel.jsx`, `NlpCorrectionModal.jsx`, `NlpHistoryModal.jsx`, backend completo.

**Archivos afectados:** 5 modificados, 2 eliminados. **Interfaces nuevas:** ninguna.

## Contracts and compatibility

- `roleMenus` (`roleNavigation.jsx`): misma forma; una entrada menos del array. Consumidores conocidos (`getMenuItems` en authService, sidebar/menú, `iconography.test.mjs`) operan por búsqueda de `href`/índice — ninguna otra entrada cambia de posición semántica.
- `getMenuItems` (`authService.jsx`): mismo contrato (array filtrado por consentimientos); una regla menos. Las pruebas de gating existentes siguen aplicando a checkin/bitácora/apoyo.
- Datos: el store conserva journals con `analysis`/`correctedCategories` — no se toca persistencia ni forma de datos; desaparece un consumidor de solo lectura.
- API/backend: N/A — ningún endpoint es exclusivo de esta vista (la página consumía los mismos records del agente que bitácora/apoyo).
- Modos de fallo: enlace muerto o import huérfano si algo queda referenciando la ruta — cubierto por AC-01/AC-06 (grep de cero referencias) y por el gate de build (Vite falla con imports rotos).

## Verification

| AC | Método | Comando / observación | Directorio |
| :--- | :--- | :--- | :--- |
| AC-01 | grep + build | `grep "mi-analisis\|MyAnalysis" frontend/src` → 0; `npm run build` sin imports rotos | `frontend` |
| AC-02 | test automatizado | `npm test` con `iconography.test.mjs` actualizado (navegación sin la entrada) | `frontend` |
| AC-03 | grep + test | `grep "mi-analisis" frontend/src/core/auth` → 0; gating C1/C2/C3 intacto en suite | `frontend` |
| AC-04 | build + inspección de encabezado | Estado título-only ya existe en la misma página (líneas 74-79 OBSERVADO); verificar reflow si hay runtime disponible, si no, registrar NO VERIFICADO con razón | `frontend` |
| AC-05 | test de no-regresión | `npm test` completo (`regressions.test.mjs`, `api-integration.test.mjs`, `iconography.test.mjs` factor/corrección) | `frontend` |
| AC-06 | grep + git status | `grep "analisis.css" frontend/src` → 0; archivos marcados como eliminados | raíz |
| AC-07 | ejecución de suite | `npm test` exit 0 | `frontend` |
| AC-08 | gates | `npm test`, `npm run lint`, `npm run build` exit 0; backend `npm test` ejecutado o NOT_RUN con razón (requiere PostgreSQL) | `frontend` / `backend` |

Cada resultado se registra con estado real (exit code y salida), no como afirmación.

## Rollback / recovery

- Sin migraciones de datos ni cambios de persistencia: N/A para recuperación de BD.
- Recuperación de código: `git revert` del commit de este spec restaura ruta, página y estilos tal cual estaban. El historial Git conserva la implementación completa si el producto algún día quiere recuperar la vista (DECLARADO: política de ramas sugerida `feat/006-remove-agent-my-analysis`, no creada sin solicitud).
