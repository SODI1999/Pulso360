# [MIGRATION-024] Plan de Migración y Purga Definitiva de Mocks

## 1. Estrategia y Fronteras de Compatibilidad

### Fase 1: Re-unificación de Extensiones a `.jsx`
* Renombrar todos los archivos `.js` dentro de `frontend/src/` a `.jsx` (`core/`, `features/*/services/`, `core/nlp/`).
* Actualizar `frontend/eslint.config.js` para exigir `core/config/env.jsx`.
* Actualizar referencias en `frontend/tests/` para cargar los módulos `.jsx`.

### Fase 2: Purga Definitiva de Archivos Mock
* Eliminar físicamente:
  * `frontend/src/core/storage/seed.js`
  * `frontend/src/core/storage/pulsoStore.js`
  * `frontend/src/core/storage/migrations.js`
  * `frontend/src/core/storage/normalizeStoredData.js`
* Eliminar `useMockStorage` de `env.jsx` y suprimir bifurcaciones de mock en `authService.jsx` y servicios.
* Consolidar `authService.jsx` y los servicios de roles para que todas las consultas y mutaciones sean llamadas directas a la API REST de Express con persistencia real en PostgreSQL.

### Fase 3: Adaptación de la Suite de Pruebas
* Adaptar `frontend/tests/regressions.test.mjs` y `api-integration.test.mjs` para validar el comportamiento del cliente HTTP, la sesión y el transporte sin invocar archivos mock eliminados.

---

## 2. Verificación y Rollback

### Línea Base de Verificación
* Backend: `npm test` (132 contratos HTTP, RBAC y k-anonimato con PostgreSQL).
* Frontend: `npm test` (pruebas unitarias y de integración de frontend).
* Linter: `npm run lint` (ESLint 9 sin errores).
* Build: `npm run build` (compilación de producción Vite).
