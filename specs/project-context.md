# Project context

Contexto de ingeniería y estado de reconocimiento de Pulso360 generado mediante `/omni-init`.

## 1. Onboarding state and scope
- Estado: CONTEXT_RECORDED
- Validación de aplicación: APPLICATION_NOT_VALIDATED
- Fecha de inspección: 2026-10-18T14:10:00-05:00
- Alcance y límites de cobertura: Reconocimiento estático, heurístico y documental de la estructura monorepo en [backend/package.json](../backend/package.json) y [frontend/package.json](../frontend/package.json). Se inspeccionaron manifiestos de dependencias, archivos de configuración, CI/CD, esquemas Docker y documentación técnica. No se ejecutaron scripts de aplicación, compilaciones, suites de pruebas ni servicios de base de datos durante esta inicialización. Git fue inspeccionado en modo de solo lectura.

## 2. Evidence map
- Tipo de proyecto observado: brownfield (Monorepo con separación de responsabilidades cliente/servidor).
- Módulos observados y puntos de entrada:
  - **Backend**: Directorio `backend/` definido en [backend/package.json](../backend/package.json), con punto de entrada principal en [backend/src/index.js](../backend/src/index.js). Framework Express 5 (`^5.2.1`), persistencia PostgreSQL con pool nativo parametrizado vía `pg` (`^8.23.0`).
  - **Frontend**: Directorio `frontend/` definido en [frontend/package.json](../frontend/package.json), con puntos de entrada en [frontend/index.html](../frontend/index.html) y [frontend/src/main.jsx](../frontend/src/main.jsx). SPA desarrollada en React 18 (`^18.3.1`), enrutamiento con React Router 7 (`^7.18.3`), empaquetador Vite (`^6.4.4`).
- Objetivos de runtime configurados y restricciones declaradas:
  - **Node.js**:
    - Declarado en [README.md](../README.md#L54): v20.0 o superior (exigido por React Router 7 y runtime ESM moderno).
    - Declarado en [backend/README.md](../backend/README.md#L21): Node.js 22.19 o posterior de la rama 22 (con soporte de `--test-force-exit` y `node --watch`).
    - Configurado en CI [.github/workflows/ci.yml](../.github/workflows/ci.yml#L33-L36): Node.js 20 LTS (`node-version: 20`).
    - Configurado en contenedores [backend/Dockerfile](../backend/Dockerfile#L2) y [frontend/Dockerfile](../frontend/Dockerfile#L4): `node:20-alpine`.
    - Versión instalada en entorno local y compatibilidad mínima: UNKNOWN (requiere verificación de compatibilidad entre Node 20 y 22).
  - **PostgreSQL**:
    - Declarado en [README.md](../README.md#L56): PostgreSQL 16 o superior.
    - Declarado en [backend/README.md](../backend/README.md#L3): PostgreSQL 18.
    - Configurado en orquestación y CI [docker-compose.yml](../docker-compose.yml#L8) y [.github/workflows/ci.yml](../.github/workflows/ci.yml#L16): `postgres:17-alpine`.
- Dependencias clave observadas:
  - Backend: `express` (^5.2.1), `pg` (^8.23.0), `jsonwebtoken` (^9.0.3), `bcryptjs` (^3.0.3), `helmet` (^8.3.0), `cors` (^2.8.6), `express-rate-limit` (^8.7.1), `nodemailer` (^10.0.15), `socket.io` (^4.8.4). Dependencia dev: `supertest` (^7.3.1).
  - Frontend: `react` (^18.3.1), `react-dom` (^18.3.1), `react-router-dom` (^7.18.3), `axios` (^1.7.9), `lucide-react` (^1.48.0), `socket.io-client` (^4.8.4). Dependencias dev: `vite` (^6.4.4), `eslint` (^9.13.0).
- Convención documental declarada: JSDoc en [CONSTITUTION.md](../CONSTITUTION.md#L35).

## 3. Goals and decisions
- Propósito confirmado: Plataforma de bienestar laboral y gestión psicosocial para operaciones de BPO y Contact Centers ([README.md](../README.md#L3)).
- Roles RBAC definidos: Cinco roles con experiencias diferenciadas: Agente, Supervisor, SST, Auditor y Administrador ([README.md](../README.md#L3), [frontend/README.md](../frontend/README.md#L3)).
- Invariantes de dominio y privacidad:
  - No vigilancia individual ni rankings punitivos de empleados ([README.md](../README.md#L97), [AGENTS.md](../AGENTS.md#L201-L208)).
  - Privacidad por diseño mediante k-anonimato (umbral k >= 5) para métricas colectivas mostradas a supervisores y SST ([README.md](../README.md#L98), [backend/src/domain/privacyRules.js](../backend/src/domain/privacyRules.js)).
  - Bitácora de bienestar con procesamiento léxico determinista local sin envío de datos a LLMs remotos ni generación de diagnósticos clínicos no autorizados ([README.md](../README.md#L99), [AGENTS.md](../AGENTS.md#L189-L199)).
- Incógnitas materiales y decisiones abiertas:
  - Homologación de versiones mínimas de runtime entre documentación (Node 22 vs 20; Postgres 16 vs 17 vs 18) y CI.
  - Alcance oficial de quality gates automatizados (si se mantienen los 4 de [CONSTITUTION.md](../CONSTITUTION.md#L44-L48) o se incorporan comprobaciones adicionales de CI como `npm run test:db` y verificación de OpenAPI).

## 4. Command matrix (not executed)
| Command | Working directory | Source / basis | Prerequisites | Gate selection / reason | Execution |
| --- | --- | --- | --- | --- | --- |
| `npm test` | `backend` | [backend/package.json](../backend/package.json) (declared-script: `node test/run-contracts.js`) | Node.js (con soporte de flags `--experimental-websocket`, `--test`), PostgreSQL en ejecución, base de datos `DB_NAME_TEST` migrada e independiente, variables `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME_TEST`, `JWT_SECRET`. | REVIEW_REQUIRED / Configurado en [manifest.json](manifest.json) y [CONSTITUTION.md](../CONSTITUTION.md#L44). | NOT_RUN |
| `npm run test:db` | `backend` | [backend/package.json](../backend/package.json) (declared-script) | Instancia PostgreSQL accesible con credenciales de conexión válidas en `.env` (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`). | CANDIDATE / Presente en CI ([ci.yml](../.github/workflows/ci.yml#L89)) y [README.md](../README.md#L128); no incluido en manifest.json. | NOT_RUN |
| `npm run db:migrate` | `backend` | [backend/package.json](../backend/package.json) (declared-script: `node database/migrate.js`) | PostgreSQL en ejecución con rol de mantenimiento (`DB_MIGRATION_USER`, `DB_MIGRATION_PASSWORD`) configurado en `.env.maintenance`. | CANDIDATE / Tarea de migración y DDL; no corresponde a gate de entrega rutinario. | NOT_RUN |
| `npm test` | `frontend` | [frontend/package.json](../frontend/package.json) (declared-script: `node --test tests/*.test.mjs`) | Node.js (v20+ con `node:test`), dependencias de `frontend/node_modules` instaladas. Pruebas ejecutan con mocks y simulación Vite SSR en memoria. | REVIEW_REQUIRED / Configurado en [manifest.json](manifest.json) y [CONSTITUTION.md](../CONSTITUTION.md#L45). | NOT_RUN |
| `npm run lint` | `frontend` | [frontend/package.json](../frontend/package.json) (declared-script: `eslint .`) | Node.js, `frontend/node_modules` instalado con configuración ESLint 9. | REVIEW_REQUIRED / Configurado en [manifest.json](manifest.json), [CONSTITUTION.md](../CONSTITUTION.md#L46) y [AGENTS.md](../AGENTS.md#L126). | NOT_RUN |
| `npm run build` | `frontend` | [frontend/package.json](../frontend/package.json) (declared-script: `vite build`) | Node.js, `frontend/node_modules` instalado con Vite. | REVIEW_REQUIRED / Configurado en [manifest.json](manifest.json), [CONSTITUTION.md](../CONSTITUTION.md#L47) y [AGENTS.md](../AGENTS.md#L127). | NOT_RUN |

Nota de seguridad: Los nombres de variables de entorno requeridas fueron identificados exclusivamente en plantillas públicas ([backend/.env.example](../backend/.env.example) y [frontend/.env.example](../frontend/.env.example)); ningún archivo de secretos ni valores reales fueron incorporados en este contexto.

## 5. Quality baseline and requirements
- Evidencia de ejecución: Ninguna prueba ni script de compilación fue ejecutado durante esta inicialización. Estado general de salud de la aplicación: APPLICATION_NOT_VALIDATED. Cero fallos reproducidos (la ausencia de ejecución no garantiza ausencia de defectos).
- Requisitos declarados de seguridad y privacidad:
  - Aislamiento estricto de bitácoras individuales y políticas de consentimiento ([AGENTS.md](../AGENTS.md#L182-L187)).
  - Umbral k >= 5 para agregaciones y consultas analíticas ([backend/src/domain/privacyRules.js](../backend/src/domain/privacyRules.js)).
  - Autenticación JWT y control de acceso basado en roles (RBAC) en endpoints protegidos ([backend/README.md](../backend/README.md#L47-L49)).
  - Estado de implementación de seguridad/privacidad: NOT_ASSESSED (declarado en documentación y código fuente; no verificado dinámicamente en esta sesión).
- Requisitos declarados de interfaz de usuario y accesibilidad:
  - Sistema de diseño sobrio orientado a BPO, erradicando plantillas genéricas ("AI Slop") ([DESIGN.md](../DESIGN.md#L5-L18)).
  - Cuatro estados obligatorios en interfaces: carga, vacío, error y protegido/restringido ([CONSTITUTION.md](../CONSTITUTION.md#L55)).
  - Accesibilidad básica: navegación completa por teclado y contraste compatible con WCAG AA ([CONSTITUTION.md](../CONSTITUTION.md#L56)).
  - Estado de cumplimiento de accesibilidad y UI: NOT_ASSESSED.

## 6. Existing work, risks and pending validation
- Línea base de Git: Inspeccionada mediante `git rev-parse --show-toplevel` y `git status --short -- .`. El repositorio raíz abarca el proyecto completo. No se observan modificaciones en archivos rastreados; existen dos rutas sin seguimiento previas (`CONSTITUTION.md` y `specs/`).
- Riesgos operativos y dependencias no validadas:
  - La suite de pruebas de backend requiere una base de datos PostgreSQL activa y un usuario con permisos de prueba en `DB_NAME_TEST`.
  - La sincronización entre contratos de OpenAPI y controladores backend requiere validación explícita.

### Source conflicts
<!-- omni:source-conflicts -->
| Tema / Módulo | Fuente A y declaración | Fuente B y declaración | Consecuencia | Estado | Próxima evidencia requerida |
| --- | --- | --- | --- | --- | --- |
| Runtime Node.js | [README.md](../README.md#L54): "Node.js: v20.0 o superior" | [backend/README.md](../backend/README.md#L21): "Node.js 22.19 o posterior de la rama 22" | Ambigüedad en la versión mínima de Node requerida para ejecutar el backend vs frontend y CI ([ci.yml](../.github/workflows/ci.yml#L36) fija v20). | UNRESOLVED | Comprobar si backend funciona bajo Node 20 LTS o si CI debe actualizarse a Node 22. |
| Versión PostgreSQL | [README.md](../README.md#L56): "PostgreSQL: 16 o superior" | [backend/README.md](../backend/README.md#L3): "PostgreSQL 18" vs [docker-compose.yml](../docker-compose.yml#L8): `postgres:17-alpine` | Declaraciones heterogéneas de versión entre documentación, entorno local y contenedores/CI ([ci.yml](../.github/workflows/ci.yml#L16)). | UNRESOLVED | Confirmar versión mínima compatible con las funciones SQL y extensiones utilizadas. |
| Versión Vite (Frontend) | [frontend/README.md](../frontend/README.md#L11): "Empaquetador y Dev Server: Vite 5" | [frontend/package.json](../frontend/package.json#L31): `"vite": "^6.4.4"` | Desfase documental entre el README del frontend y las dependencias declaradas en el manifest. | UNRESOLVED | Actualizar la documentación de frontend para reflejar Vite 6. |
| Quality Gates oficiales | [CONSTITUTION.md](../CONSTITUTION.md#L44-L48) / [manifest.json](manifest.json): 4 comandos (test backend, test frontend, lint frontend, build frontend) | [README.md](../README.md#L109-L131) y [.github/workflows/ci.yml](../.github/workflows/ci.yml): Incluyen además `test:db` y validación de OpenAPI | Diferencia en el alcance de verificación entre la constitución del repo y el flujo de integración continua. | UNRESOLVED | Confirmar con el equipo si `test:db` y validación OpenAPI deben integrarse a los gates oficiales. |

- Pendiente: Confirmación de decisiones de homologación de runtime y autorización expresa antes de ejecutar suites de prueba o cambios de código.

## 7. Next action
El contexto ha quedado registrado (`CONTEXT_RECORDED`). Las siguientes acciones disponibles son:
- Para explorar opciones de diseño, discutir la resolución de conflictos de fuentes o analizar decisiones de arquitectura sin modificar código: `/omni-discuss`.
- Para iniciar la especificación estructurada de un cambio, funcionalidad o corrección concreta: `/omni-specify`.
