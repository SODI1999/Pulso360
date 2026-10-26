# [DEBT-023] Saneamiento Estructural y Consolidación de Persistencia Canónica

## 1. Evidencia y Costo Actual (OBSERVED / DECLARED)

1. **Dualidad de Persistencia y Bifurcación en UI:**
   * Archivos de frontend como `frontend/src/features/agent/hooks/useAgentDashboard.jsx` y `frontend/src/features/supervisor/pages/TeamDashboardPage.jsx` contienen bifurcaciones condicionales duras `if (env.useMockStorage) { ... pulsoStore ... } else { ... apiClient ... }`.
   * El estado del almacén local en `frontend/src/core/storage/pulsoStore.jsx` (367 líneas de semilla estática en `seed.jsx`) opera con un modelo de datos `camelCase` (`userId`, `cargaEmocional`, `submittedAt`), mientras que la base de datos PostgreSQL del backend opera con contratos canónicos `snake_case` (`usuario_id`, `carga_emocional`, `created_at`).
   * Esto genera una "doble realidad" donde los desarrolladores y usuarios no tienen certeza de si una acción impacta la base de datos PostgreSQL o solo muta un JSON volátil en `localStorage`.

2. **Inconsistencia de Extensiones en Módulos No-UI:**
   * Módulos estrictamente lógicos, matemáticos, de almacenamiento y de configuración usan extensión `.jsx` a pesar de no exportar componentes React ni contener sintaxis JSX:
     * `frontend/src/core/config/env.jsx`
     * `frontend/src/core/api/apiClient.jsx`
     * `frontend/src/core/api/interventionContract.jsx`
     * `frontend/src/core/auth/authService.jsx`
     * `frontend/src/core/auth/avatarPool.jsx`
     * `frontend/src/core/auth/consentContract.jsx`
     * `frontend/src/core/auth/roleNavigation.jsx`
     * `frontend/src/core/nlp/nlpEngine.jsx` (420 líneas de análisis léxico Snowball/Levenshtein)
     * `frontend/src/core/time/calendarDate.jsx`
     * `frontend/src/core/storage/browserStorage.jsx`
     * `frontend/src/core/storage/preferences.jsx`
     * `frontend/src/core/storage/migrations.jsx`
     * `frontend/src/core/storage/seed.jsx`
     * `frontend/src/core/storage/pulsoStore.jsx`
     * `frontend/src/features/*/services/*Queries.jsx`
   * Al mismo tiempo, otros módulos adyacentes (`nlpSanitizer.js`, `spanishStemmer.js`) usan `.js`, lo que genera inconsistencia en herramientas de análisis estático y bundlers.

---

## 2. Alcance, Criterios de Aceptación y Non-Goals

### Alcance
* Normalización de extensiones a `.js` para todos los módulos que no contienen componentes React ni marcado JSX.
* Desacoplamiento de componentes UI: los componentes de presentación y hooks dejan de consultar `pulsoStore` directamente.
* Consolidación de la capa de servicios (`agentQueries.js`, `supervisorQueries.js`, `sstQueries.js`, `auditorQueries.js`, `adminQueries.js`) para interactuar canónicamente con la API REST (`apiClient.js`).
* Encapsulación de cualquier fallback/mock de desarrollo dentro de la capa de transporte/adapter, sin contaminar la UI.

### Criterios de Aceptación (Atomic Criteria)
* **AC-01 [functional]:** Normalización de extensiones: todos los módulos utilitarios, servicios, configuración, almacenamiento y motores algorítmicos en `core/` y `services/` tienen extensión `.js`. Ningún archivo conserva `.jsx` sin contener JSX.
* **AC-02 [functional]:** Desacoplamiento de UI: las páginas y componentes React de los 5 roles (`agent`, `supervisor`, `sst`, `auditor`, `admin`) no importan ni mutan `pulsoStore` directamente; consumen funciones asíncronas de la capa de servicios.
* **AC-03 [functional]:** Contratos canónicos de API REST: los servicios frontend consumen la API REST (`/api/v1/...`) con inyección transparente de JWT y tipado JSDoc de respuestas.
* **AC-04 [functional]:** Integridad de Dominio y Privacidad: se preservan sin alteraciones los controles de k-anonimato ($k \ge 5$), autenticación RBAC (5 roles), zona horaria Bogotá y motor léxico determinista de NLP.
* **AC-05 [automated]:** Superación de Quality Gates: ejecución sin errores de `npm test` en backend, `npm test` en frontend, `npm run lint` en frontend y `npm run build` en frontend.

### Non-Goals
* No se agregan nuevas bibliotecas externas ni manejadores de estado globales (como Redux, Zustand o React Query) que violen YAGNI.
* No se modifican los contratos de endpoints existentes en el backend Express ni el esquema de base de datos PostgreSQL.
* No se alteran los estilos visuales, paleta de colores ni tokens de diseño aprobados.
