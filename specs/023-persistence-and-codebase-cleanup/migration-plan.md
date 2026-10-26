# [MIGRATION-023] Plan de Migración y Transición de Persistencia

## 1. Estrategia y Fronteras de Compatibilidad

La transición se ejecutará en 3 etapas secuenciales para garantizar cero regresiones y verificación continua:

### Etapa 1: Normalización de Extensiones (Cirugía Estática)
* Renombrado de archivos `.jsx` a `.js` en módulos no-UI:
  * `core/config/env.jsx` → `core/config/env.js`
  * `core/api/apiClient.jsx` → `core/api/apiClient.js`
  * `core/api/interventionContract.jsx` → `core/api/interventionContract.js`
  * `core/auth/authService.jsx` → `core/auth/authService.js`
  * `core/auth/avatarPool.jsx` → `core/auth/avatarPool.js`
  * `core/auth/consentContract.jsx` → `core/auth/consentContract.js`
  * `core/auth/roleNavigation.jsx` → `core/auth/roleNavigation.js`
  * `core/nlp/nlpEngine.jsx` → `core/nlp/nlpEngine.js`
  * `core/time/calendarDate.jsx` → `core/time/calendarDate.js`
  * `core/storage/browserStorage.jsx` → `core/storage/browserStorage.js`
  * `core/storage/preferences.jsx` → `core/storage/preferences.js`
  * `core/storage/migrations.jsx` → `core/storage/migrations.js`
  * `core/storage/seed.jsx` → `core/storage/seed.js`
  * `core/storage/pulsoStore.jsx` → `core/storage/pulsoStore.js`
  * Servicios: `agentQueries.jsx` → `agentQueries.js`, `agentDashboardHelpers.jsx` → `agentDashboardHelpers.js`, `supervisorQueries.jsx` → `supervisorQueries.js`, `sstQueries.jsx` → `sstQueries.js`, `auditorQueries.jsx` → `auditorQueries.js`, `adminQueries.jsx` → `adminQueries.js`.
* Verificación intermedia: `npm run lint` y `npm run build` para validar que todos los módulos resuelvan correctamente.

### Etapa 2: Aislamiento del Almacenamiento y Capa de Repositorio
* Los servicios (`*Queries.js`) asumen la responsabilidad de entregar datos consumiendo `apiClient.js` de forma asíncrona hacia la API REST (`/api/v1/...`).
* Si `env.useMockStorage` está activo o si el backend no está disponible en entornos de prueba en memoria, el servicio o un adaptador encapsulado resuelve los datos de forma transparente sin exponer `pulsoStore` al componente de presentación.
* Eliminación de importaciones directas de `pulsoStore` en páginas (`TeamDashboardPage`, `AgentDashboardPage`, etc.) y hooks.

### Etapa 3: Normalización de Contratos y Manejo de Errores
* Los servicios mapean los contratos canónicos de backend (`snake_case`) a las propiedades esperadas por la UI, asegurando que `loading`, `empty`, `error` y `protected` se gestionen limpiamente.
* Se preserva el k-anonimato ($k \ge 5$) evaluado en el backend y respetado en el frontend con la tarjeta `PrivacyBlockedCard`.

---

## 2. Verificación y Rollback

### Línea Base de Verificación
* Backend: `npm test` (110 contratos HTTP, RBAC y k-anonimato).
* Frontend: `npm test` (31 pruebas unitarias y de regresión en memoria).
* Linter: `npm run lint` (ESLint 9 sin advertencias críticas).
* Build: `npm run build` (Compilación de producción con Vite).

### Estrategia de Rollback
* Los cambios se introducen de manera incremental y atómica.
* En caso de discrepancia o fallo inesperado, Git permite revertir a nivel de commit individual sin pérdida de datos.
