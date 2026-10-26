# [TASKS-024] Purga de Mocks y Re-unificación JSX

- [x] **TASK-01:** Re-unificar todas las extensiones de `frontend/src/` a `.jsx` (`core/`, `features/`, `services/`, etc.) y actualizar `eslint.config.js`.
- [x] **TASK-02:** Eliminar físicamente los archivos mock (`seed.js`, `pulsoStore.js`, `migrations.js`, `normalizeStoredData.js`) y remover `useMockStorage` de `env.jsx`.
- [x] **TASK-03:** Consolidar `authService.jsx` y servicios de roles para conexión 100% canónica con la API REST de Express y PostgreSQL.
- [x] **TASK-04:** Adaptar la suite de pruebas de frontend en `frontend/tests/` para ejecutar sobre los módulos `.jsx` y contratos reales sin dependencias de almacenamiento mock.
- [x] **TASK-05:** Ejecutar y validar la suite completa de Quality Gates (`npm test` backend, `npm test` frontend, `npm run lint`, `npm run build`).
