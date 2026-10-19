# [TASKS-006] Scope-derived work

Tareas derivadas del [plan.md](plan.md) para [SPEC-006](spec.md). Orden de dependencia: primero el código, luego la suite, al final los gates. No marcar tareas sin ejecutarlas.

- [x] TASK-01 / AC-01, AC-06 — Remover ruta e import de `MyAnalysisPage` en `frontend/src/App.jsx` y eliminar `frontend/src/features/agent/pages/MyAnalysisPage.jsx` y `frontend/src/styles/analisis.css`. Verificado: grep `mi-analisis|MyAnalysis|analisis.css` en `frontend/src` → 0 resultados.
- [x] TASK-02 / AC-02 — Entrada 'Mi análisis' removida de `roleMenus.agente` en `frontend/src/core/auth/roleNavigation.jsx`. Demás entradas intactas. Verificado en runtime (sidebar) y suite.
- [x] TASK-03 / AC-03 — Regla de gating `mi-analisis` removida de `frontend/src/core/auth/authService.jsx`. Reglas C1/C2/C3 de checkin/bitácora/apoyo intactas. Verificado: grep 0 + suite.
- [x] TASK-04 / AC-04 — Botón "Ver mis análisis" removido del encabezado de `frontend/src/features/agent/pages/JournalPage.jsx`. Verificado en runtime: header con título+subtítulo, 0 enlaces, editor funcional.
- [x] TASK-05 / AC-02, AC-07 — `frontend/tests/iconography.test.mjs` actualizado: `personalTasks` sin `/agente/mi-analisis`, `size === 2`, título sin "reflexionar"; aserciones de roles conservadas. `cd "frontend" && npm test` → 48/48.
- [x] TASK-06 / AC-01, AC-05, AC-07, AC-08 — Gates ejecutados: frontend `npm test` (48/48), `npm run lint` (exit 0), `npm run build` (exit 0); backend `npm test` (132/132, PostgreSQL operativo). Exit codes y salidas registrados en `verification.md`.
- [x] TASK-07 / AC-01–AC-08 — Cierre: `verification.md` con mapeo criterio→evidencia real, `acceptance.json` con los 8 criterios passed y evidencia. Sin criterios pendientes.

**Ediciones adicionales dentro del alcance (comentarios que documentaban la vista eliminada):**
- `frontend/src/features/agent/pages/AgentDashboardPage.jsx` y `frontend/src/styles/agent/dashboard.css`: comentarios "Mi bienestar / Mi análisis" corregidos a solo "Mi bienestar" (verificado que esa página sí contiene la analítica personal: "Mi tendencia personal de bienestar").
