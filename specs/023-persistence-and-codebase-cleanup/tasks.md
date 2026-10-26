# [TASKS-023] Saneamiento de Persistencia y Estructura de Código

- [x] **TASK-01:** Normalizar extensiones de módulos lógicos en `src/core/` de `.jsx` a `.js` (`env`, `apiClient`, `interventionContract`, `authService`, `avatarPool`, `consentContract`, `roleNavigation`, `nlpEngine`, `calendarDate`, `browserStorage`, `preferences`, `migrations`, `seed`, `pulsoStore`).
- [x] **TASK-02:** Normalizar extensiones de servicios y helpers en `src/features/*/services/` de `.jsx` a `.js` (`agentQueries`, `agentDashboardHelpers`, `supervisorQueries`, `sstQueries`, `auditorQueries`, `adminQueries`).
- [x] **TASK-03:** Desacoplar componentes React y hooks de `pulsoStore`, asegurando que la UI consuma exclusivamente la capa de servicios asíncronos.
- [x] **TASK-04:** Consolidar el adaptador de persistencia en los servicios para comunicación canónica con la API REST de Express/PostgreSQL y compatibilidad con las pruebas unitarias.
- [x] **TASK-05:** Ejecutar y validar los quality gates del proyecto (`npm test` backend, `npm test` frontend, `npm run lint`, `npm run build`).
