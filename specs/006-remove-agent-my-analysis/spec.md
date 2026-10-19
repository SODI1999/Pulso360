# [SPEC-006] Remove Agent My Analysis

Date: 2026-10-19

## 0. Fase de Clarificación y Supuestos

**Decisión confirmada por el dueño de producto (sesión 2026-10-19):** eliminar la vista "Mi análisis" (`/agente/mi-analisis`) por completo — navegación, lógica y código. No es una decisión pendiente; fue tomada tras la discusión de valor.

**Evidencia que motivó la decisión (categoría: OBSERVADO salvo indicación):**

- La página es huérfana del recorrido del agente: el panel del agente destaca "bitácora, apoyo y privacidad" y no enlaza "Mi análisis" ([AgentDashboardPage.jsx](../../frontend/src/features/agent/pages/AgentDashboardPage.jsx), línea 8, comentario del código).
- Nada en el flujo real (check-in, panel) enlaza la vista; solo el botón secundario "Ver mis análisis" en la bitácora ([JournalPage.jsx:137](../../frontend/src/features/agent/pages/JournalPage.jsx)) y la entrada de menú ([roleNavigation.jsx:28](../../frontend/src/core/auth/roleNavigation.jsx)).
- ~80% de la página (feed cronológico de entradas con fecha, contexto y snippet) duplica la lista de entradas de la bitácora ([JournalEntryList.jsx](../../frontend/src/features/agent/components/JournalEntryList.jsx)).
- El valor genuino restante (conteo de factores entre jornadas) no conecta con ninguna acción: su única salida es "Ver o editar en bitácora" ([MyAnalysisPage.jsx:221-229](../../frontend/src/features/agent/pages/MyAnalysisPage.jsx)).
- Una vista de "tus factores a lo largo del tiempo" es la superficie más cercana a auto-vigilancia en la app; las reglas de la feature agente advierten contra hacer sentir al agente calificado o monitoreado ([AGENTS.md](../../frontend/src/features/agent/AGENTS.md), sección "Not a performance dashboard") (DECLARADO).

**Supuestos registrados (INFERIDO):**

- El valor personal del consentimiento C3 vive en el momento de escritura (feedback inmediato + corrección + protocolo de crisis), no en el histórico. Este supuesto no se convierte en arquitectura nueva: solo se elimina la vista.
- El análisis longitudinal con propósito organizacional pertenece a las vistas agregadas de SST/supervisión con k-anonimato, fuera del alcance de este spec.

**Sin decisiones materiales pendientes** que bloqueen el diseño. No se requiere `/omni-clarify`.

## 1. Need and scope

**Necesidad:** la experiencia del agente no debe contener una vista de auto-análisis longitudinal que duplica la bitácora, no conduce a ninguna acción y roza el patrón de vigilancia que el producto prohíbe.

**Cambio mínimo útil:**

| Acción | Archivo | Evidencia actual |
| :--- | :--- | :--- |
| ELIMINAR | `frontend/src/features/agent/pages/MyAnalysisPage.jsx` | Página completa |
| ELIMINAR | `frontend/src/styles/analisis.css` | Hoja de estilos solo importada por esa página |
| MODIFICAR | `frontend/src/App.jsx` | Import línea 22; ruta `/agente/mi-analisis` líneas 129-136 |
| MODIFICAR | `frontend/src/core/auth/roleNavigation.jsx` | Entrada 'Mi análisis' línea 28 |
| MODIFICAR | `frontend/src/core/auth/authService.jsx` | Regla de consentimiento para `mi-analisis` línea 308 |
| MODIFICAR | `frontend/src/features/agent/pages/JournalPage.jsx` | Botón "Ver mis análisis" líneas 137-140 |
| MODIFICAR | `frontend/tests/iconography.test.mjs` | `personalTasks` incluye `/agente/mi-analisis` línea 82 |

**Se conserva deliberadamente (consumido por bitácora y otros flujos):**

- `frontend/src/features/agent/data/nlpFactorMetadata.jsx` (`FACTOR_METADATA`): usado por [NlpCorrectionModal.jsx](../../frontend/src/features/agent/components/NlpCorrectionModal.jsx) y [NlpAnalysisPanel.jsx](../../frontend/src/features/agent/components/NlpAnalysisPanel.jsx).
- `frontend/src/features/agent/services/agentQueries.jsx`: usado por `useSupportChannel`, `useMyWellbeing` y servicios de check-in/apoyo/mis-datos.
- Flujo de análisis por entrada de la bitácora (`journalService`, endpoints backend de análisis léxico, `nlpEngine`): sin cambios.
- Semántica del consentimiento C3 (análisis léxico de bitácora + solicitud de apoyo a SST) y su copy en `consentData.jsx`: sigue siendo veraz tras la eliminación porque el análisis por entrada permanece.

## 2. Acceptance Criteria and Non-Goals

**Criterios de aceptación observables:**

- **AC-01:** La ruta `/agente/mi-analisis` y el import de `MyAnalysisPage` desaparecen de `App.jsx`. Un agente autenticado que navegue a esa URL cae en el catch-all existente (`App.jsx:306`, `path="*" → /`) y aterriza en la home de su rol. Un `grep` de `mi-analisis|MyAnalysis` en `frontend/src` retorna cero resultados.
- **AC-02:** `roleMenus.agente` ya no contiene la entrada 'Mi análisis'; las demás entradas del menú del agente permanecen idénticas.
- **AC-03:** `authService.jsx` ya no contiene la regla de gating específica para `mi-analisis` (línea 308 actual); el gating C2 de bitácora se conserva intacto.
- **AC-04:** `JournalPage.jsx` no muestra el botón "Ver mis análisis" y su encabezado queda coherente (título + subtítulo, sin huecos ni enlaces muertos) en desktop y móvil.
- **AC-05:** El análisis NLP por entrada de la bitácora funciona igual que antes: `NlpAnalysisPanel`, `NlpCorrectionModal`, `NlpHistoryModal` y el protocolo de crisis no se modifican.
- **AC-06:** Los archivos `MyAnalysisPage.jsx` y `analisis.css` se eliminan del repositorio y ningún import de `analisis.css` permanece en `frontend/src`.
- **AC-07:** `iconography.test.mjs` actualizado (lista `personalTasks` sin `/agente/mi-analisis`, aserción de iconos distintos ajustada) y la suite `frontend npm test` pasa.
- **AC-08:** Gates de calidad: `cd "frontend" && npm test`, `npm run lint` y `npm run build` pasan. El gate `cd "backend" && npm test` se ejecuta o queda registrado como NOT_RUN con su razón; este spec no modifica ningún archivo de backend.

**Non-Goals (fuera de alcance):**

- No alterar el motor NLP determinista ni crear implementaciones paralelas.
- No cambiar la semántica ni el copy del consentimiento C3.
- No eliminar `FACTOR_METADATA`, `agentQueries`, `journalService` ni endpoints backend de análisis: siguen sirviendo a la bitácora.
- No tocar vistas agregadas de SST/supervisión (k-anonimato).
- No refactorizar la bitácora más allá de quitar el botón ni "mejorar" la vista antes de eliminarla.

## 3. Domain applicability

| Security & Compliance Control | Required? | Technical Enforcement |
| :--- | :---: | :--- |
| **Does it touch sensitive personal data (PII)?** | SÍ (reduce exposición) | La página eliminada mostraba texto y factores de bitácora (sensible) solo a su dueño: filtro `j.userId === currentUser?.id` ([MyAnalysisPage.jsx:37-38](../../frontend/src/features/agent/pages/MyAnalysisPage.jsx), OBSERVADO). La eliminación no cambia almacenamiento ni añade procesamiento; desaparece una superficie de visualización. Sin nuevos requisitos de cifrado: N/A para cambio. |
| **Does it expose cross-tenant data?** | N/A | No existe multi-tenancy en el producto; el filtro por dueño se elimina junto con la página. |
| **Does it require audit logging?** | N/A | No se añaden eventos ni mutaciones. El auditor existente de mutaciones de bitácora (backend) no cambia. |
| **¿Accede o procesa datos sensibles?** | N/A (eliminación) | El análisis léxico por entrada permanece local y determinista (DECLARADO: AGENTS.md, sección NLP); este spec no introduce acceso nuevo a datos. |

## 4. Experiencia y límites

- **Ruta retirada:** `/agente/mi-analisis` → catch-all `path="*"` existente redirige a `/` → home del rol (OBSERVADO [App.jsx:306](../../frontend/src/App.jsx)). No se crea página de error nueva.
- **Bitácora tras el cambio:** pierde el botón "Ver mis análisis"; el encabezado conserva título y subtítulo. Verificar reflow del encabezado en 360px–1920px (requisito DECLARADO en [AGENTS.md](../../frontend/src/AGENTS.md), sección responsive).
- **Sin estados nuevos:** no se introducen estados de carga/vacío/error/privacidad; los de la bitácora (carga, error, C2 desactivado) permanecen intactos.
- **Veracidad de copy tras el cambio:** el copy de C3 ("Autoriza el análisis léxico de tu bitácora y la solicitud de apoyo a SST") sigue siendo cierto porque el análisis por entrada permanece. El copy C2 no menciona la vista eliminada. Ninguna pantalla queda prometiendo una vista inexistente.
- **Afinidad afectada:** usuarios que conocían la entrada la dejan de ver; no se deja enlace muerto en ninguna pantalla.

## 5. Traceability

| AC | Plan (sección) | Task | Verificación prevista |
| :--- | :--- | :--- | :--- |
| AC-01 | Remoción de ruta | T-01 | grep en `frontend/src` + build |
| AC-02 | Remoción de navegación | T-02 | suite `iconography.test.mjs` actualizada |
| AC-03 | Remoción de gating | T-03 | grep + `npm test` (gating C2 bitácora) |
| AC-04 | Bitácora sin botón | T-04 | lint + build + inspección de reflow del encabezado |
| AC-05 | No-regresión bitácora | T-04 | `npm test` (`regressions.test.mjs`, `api-integration.test.mjs`) |
| AC-06 | Eliminación de archivos | T-05 | grep de imports + `git status` |
| AC-07 | Suite actualizada | T-06 | `cd "frontend" && npm test` |
| AC-08 | Gates de calidad | T-06 | ejecución de los 4 gates o registro NOT_RUN con razón |
