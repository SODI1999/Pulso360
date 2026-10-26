# [DEBT-024] Erradicación Total de Mocks y Re-unificación Uniforme a JSX

## 1. Evidencia y Costo Actual (OBSERVED / DECLARED)

1. **Regla Académica del Docente sobre Extensiones:**
   * El requerimiento explícito para el proyecto evaluado en Construcción de Software 3 (Tecnológico de Antioquia) exige que todos los archivos dentro del módulo cliente `frontend/` utilicen la extensión `.jsx`. La existencia de archivos `.js` sueltos en el cliente rompe la uniformidad visual y la convención exigida por la cátedra.
2. **Existencia Residual de Archivos Mock y Almacenamiento Simulado:**
   * Archivos como `frontend/src/core/storage/seed.js` (con 367 líneas de registros ficticios), `pulsoStore.js`, `migrations.js` y `normalizeStoredData.js` aún residen en el repositorio.
   * El usuario ha ordenado la erradicación completa de cualquier vestigio de datos mock: **"todo debe vivir en back y bd, nada de mock para nada"**.

---

## 2. Alcance, Criterios de Aceptación y Non-Goals

### Alcance
* Re-unificación de todas las extensiones dentro de `frontend/src/` a `.jsx` (`core/`, `features/`, `services/`, etc.).
* Actualización de la configuración de ESLint (`frontend/eslint.config.js`) para validar `core/config/env.jsx`.
* Eliminación definitiva de los archivos de mock: `seed.js`, `pulsoStore.js`, `migrations.js` y `normalizeStoredData.js`.
* Conexión exclusiva a la API REST de Express 5 y base de datos PostgreSQL.
* Actualización de la suite de pruebas de frontend para validar contratos reales sin depender de `seed.js`.

### Criterios de Aceptación (Atomic Criteria)
* **AC-01 [functional]:** Re-unificación a `.jsx`: todos los módulos dentro de `frontend/src/` tienen extensión `.jsx`, logrando un proyecto React 100% uniforme según el estándar del docente.
* **AC-02 [functional]:** Erradicación total de mocks: se eliminan físicamente `seed.js`, `pulsoStore.js`, `migrations.js` y `normalizeStoredData.js`. Ningún archivo de datos ficticios permanece en el frontend.
* **AC-03 [functional]:** Persistencia exclusiva en Backend y PostgreSQL: todos los servicios consultan canónicamente la API REST de Express 5 (`/api/v1/...`) con JWT.
* **AC-04 [functional]:** Integridad de Dominio y Privacidad: se preservan sin alteraciones los controles de k-anonimato ($k \ge 5$), autenticación RBAC (5 roles), zona horaria Bogotá y motor léxico determinista de NLP.
* **AC-05 [automated]:** Superación de Quality Gates: ejecución sin errores de `npm test` en backend, `npm test` en frontend, `npm run lint` en frontend y `npm run build` en frontend.

### Non-Goals
* No se alteran los endpoints ni modelos de PostgreSQL en `backend/`.
* No se agregan librerías de estado externas redundantes (Zustand, Redux).
