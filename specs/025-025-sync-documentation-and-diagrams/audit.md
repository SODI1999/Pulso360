# [DEBT-025] Sincronización Integral de Documentación, READMEs y Diagramas Canónicos

## 1. Evidencia y Costo Actual (OBSERVED / DECLARED)

1. **Desfase en Versiones de Runtime y Empaquetadores:**
   - [frontend/README.md#L11](../../frontend/README.md#L11) declara `"Empaquetador y Dev Server: Vite 5"`, pero [frontend/package.json](../../frontend/package.json) tiene `"vite": "^6.4.4"` (`OBSERVED`).
   - [README.md#L54-L56](../../README.md#L54-L56) declara Node.js v20.0+ y PostgreSQL 16+, mientras que [backend/README.md#L21-L23](../../backend/README.md#L21-L23) exige Node.js 22.19+ y PostgreSQL 18, y [docker-compose.yml](../../docker-compose.yml) fija `postgres:17-alpine` y `node:20-alpine` (`OBSERVED`).
   - [README.md#L109](../../README.md#L109) hace referencia al script local `.agents/skills/pre-flight-audit/scripts/run-all-gates.mjs`, cuando los quality gates oficiales están definidos en [CONSTITUTION.md#L44-L48](../../CONSTITUTION.md#L44-L48) (`OBSERVED`).

2. **Persistencia Desfasada en Documentación de Frontend:**
   - [frontend/README.md#L129](../../frontend/README.md#L129) mantiene la sección descriptiva de `VITE_USE_MOCK_STORAGE` y modos duales, la cual quedó obsoleta tras las specs 023 y 024 donde se erradicó el mock storage y se unificó la aplicación como cliente conectado a la API REST de Express 5 y PostgreSQL (`OBSERVED`).

3. **Incompletitud en Modelado Relacional y de Base de Datos:**
   - [backend/database/README.md#L27](../../backend/database/README.md#L27) contiene un diagrama conceptual simplificado de 13 relaciones que no cubre el modelo físico de las 31 tablas canónicas (26 tablas base en [backend/database/schema.sql](../../backend/database/schema.sql) más 5 técnicas/migraciones) ni sus tipos de datos nativos, PKs y FKs (`OBSERVED`).

4. **Desconexión Arquitectónica en el Libro Técnico:**
   - Los 12 capítulos de [docs/libro-pulso360/INDICE_MAESTRO.md](../../docs/libro-pulso360/INDICE_MAESTRO.md) describen el proyecto como una aplicación puramente cliente con persistencia simulada en `localStorage` (`browserStorage.jsx`), omitiendo la arquitectura monorepo real integrada con backend en Express 5, PostgreSQL y WebSockets para soporte en crisis (`OBSERVED`).

5. **Carencia de Diagramas Canónicos de Ingeniería (PPI):**
   - El proyecto carece de un compendio visual consolidado que incluya todos los diagramas de ingeniería de software requeridos para la evaluación del Proyecto Pedagógico Integrador (PPI) y la documentación de diseño: Arquitectura C4, Casos de Uso UML por rol, Jerarquía y Sitemap de UI, Flujos de Negocio, Componentes UML, Clases de Dominio, Modelo ER y Modelo Relacional Físico (`DECLARED`).

---

## 2. Alcance, Criterios de Aceptación y Non-Goals

### Alcance
* Homologar las versiones de runtime (Node.js 20/22, PostgreSQL 17/18, Vite 6) y comandos de prueba en [README.md](../../README.md), [frontend/README.md](../../frontend/README.md) y [backend/README.md](../../backend/README.md).
* Actualizar [frontend/README.md](../../frontend/README.md) para reflejar la arquitectura de cliente conectado contra la API REST Express 5 y PostgreSQL, retirando la narrativa obsoleta de `VITE_USE_MOCK_STORAGE`.
* Crear el compendio maestro [docs/DIAGRAMAS.md](../../docs/DIAGRAMAS.md) con los 8 diagramas requeridos (Arquitectura, Casos de Uso, UI/Sitemap, Flujos, Componentes, Clases, ER, Relacional) más diagramas complementarios (Despliegue Docker, Secuencia Auth y Estados Alertas) en sintaxis Mermaid estándar.
* Enlazar el compendio de diagramas mediante enlaces relativos portables desde [README.md](../../README.md), [frontend/README.md](../../frontend/README.md), [backend/README.md](../../backend/README.md), [backend/database/README.md](../../backend/database/README.md) y [docs/libro-pulso360/INDICE_MAESTRO.md](../../docs/libro-pulso360/INDICE_MAESTRO.md).
* Actualizar [docs/libro-pulso360/INDICE_MAESTRO.md](../../docs/libro-pulso360/INDICE_MAESTRO.md) clarificando la arquitectura monorepo real cliente-servidor.

### Criterios de Aceptación (Atomic Criteria)
* **AC-01 [functional]:** Sincronización y Homologación de READMEs: [README.md](../../README.md), [frontend/README.md](../../frontend/README.md) y [backend/README.md](../../backend/README.md) reflejan de manera armónica las versiones reales de runtime (Node.js 20/22 LTS, PostgreSQL 17/18, Vite 6), eliminan referencias obsoletas a `VITE_USE_MOCK_STORAGE` y documentan los 4 quality gates canónicos vigentes.
* **AC-02 [functional]:** Compendio Maestro de Diagramas de Ingeniería: Creación de [docs/DIAGRAMAS.md](../../docs/DIAGRAMAS.md) conteniendo los 8 diagramas solicitados (ER, UI, Flujo, Arquitectura, Casos de Uso, Clases, Componentes, Relacional) y complementarios (Despliegue Docker Compose, Secuencia RBAC y Estados Alertas) en sintaxis Mermaid 100% válida y alineada al código.
* **AC-03 [functional]:** Enlaces Relativos y Trazabilidad Documental: Todos los puntos de entrada documentales del proyecto ([README.md](../../README.md), [frontend/README.md](../../frontend/README.md), [backend/README.md](../../backend/README.md), [backend/database/README.md](../../backend/database/README.md) y [docs/libro-pulso360/INDICE_MAESTRO.md](../../docs/libro-pulso360/INDICE_MAESTRO.md)) integran enlaces relativos portables al compendio de diagramas.
* **AC-04 [functional]:** Sincronización Arquitectónica del Libro Técnico: [docs/libro-pulso360/INDICE_MAESTRO.md](../../docs/libro-pulso360/INDICE_MAESTRO.md) incorpora en su introducción y mapa conceptual la arquitectura monorepo real (React 18 + Express 5 + PostgreSQL 18 + Sockets), explicando la transición de la persistencia simulada a la API relacional.
* **AC-05 [automated]:** Verificación de Quality Gates del Monorepo: Los 4 gates oficiales de entrega (`cd backend && npm test`, `cd frontend && npm test`, `cd frontend && npm run lint`, `cd frontend && npm run build`) pasan limpiamente sin regresiones.

### Non-Goals
* No modificar código fuente ejecutable en `frontend/src/` ni en `backend/src/`.
* No alterar tablas, índices ni sentencias DDL en `backend/database/`.
* No introducir dependencias npm de visualización ni empaquetadores de diagramas externos.
* No realizar una reescritura total de los 12 capítulos de `docs/libro-pulso360/`, concentrando la actualización en su índice maestro y enlaces rectores.
