# [MIGRATION-025] Plan de Sincronización Documental y Diagramas Canónicos

## 1. Estrategia y Secuencia de Cambios

La sincronización se ejecutará de forma modular y estrictamente no destructiva, siguiendo una secuencia en 4 fases:

### Fase 1: Creación del Compendio Maestro de Diagramas ([docs/DIAGRAMAS.md](../../docs/DIAGRAMAS.md))
- Redacción centralizada de los diagramas canónicos en sintaxis Mermaid estándar ejecutable:
  1. **Arquitectura C4 Nivel 2 (Contenedores):** Relación SPA React 18, Express 5 REST, Socket.io, Scheduler de Alertas y PostgreSQL 18.
  2. **Casos de Uso UML:** Mapeo de los 16 casos de uso organizados bajo los 5 roles RBAC (`Agente`, `Supervisor`, `SST`, `Auditor`, `Administrador`).
  3. **Jerarquía y Sitemap de UI:** Mapa de navegación de rutas públicas (`/`, `/contactenos`, `/login`), rutas privadas por rol y vistas transversales.
  4. **Diagramas de Flujo:**
     - Flujo del Check-in diario somático del Agente (3 pasos) y motor NLP determinista local.
     - Flujo de Detección de Alertas SST y k-anonimato ($k \ge 5$).
     - Flujo de Solicitud de Apoyo y Chat de Crisis en vivo.
  5. **Diagrama de Componentes UML:** Capas de Frontend (`src/core/`, `src/features/`) y Backend (`interfaces`, `middlewares`, `application`, `domain`, `infrastructure`, `persistence`).
  6. **Diagrama de Clases / Modelo de Dominio:** Entidades de software (`Usuario`, `DailyCheckin`, `Bitacora`, `AnalisisNLP`, `SstAlerta`, `SstIntervencion`, etc.) y sus responsabilidades.
  7. **Diagrama Entidad-Relación (ER Conceptual):** Cardinalidades lógicas entre las áreas de Identidad, Consentimiento, Bienestar, Alertas, Chat y Auditoría.
  8. **Diagrama Relacional Físico:** Esquema de base de datos relacional detallando claves primarias (PK), foráneas (FK), tipos de datos PostgreSQL e integridad referencial sobre las tablas canónicas de `backend/database/schema.sql`.
  9. **Diagramas Complementarios:**
     - Diagrama de Despliegue con Docker Compose (puertos 5173, 3000, 5432, volúmenes y red interna).
     - Diagrama de Secuencia de Autenticación RBAC y emisión de JWT.
     - Diagrama de Estados del Ciclo de Vida de una Alerta SST.

### Fase 2: Homologación y Saneamiento de READMEs
- **[README.md](../../README.md) (Raíz):**
  - Homologar versiones: Node.js 20/22 LTS, PostgreSQL 17/18, Vite 6.
  - Reemplazar referencia a scripts locales por los 4 quality gates canónicos de [CONSTITUTION.md](../../CONSTITUTION.md).
  - Agregar enlace al nuevo compendio [docs/DIAGRAMAS.md](../../docs/DIAGRAMAS.md) y miniatura/resumen de arquitectura.
- **[frontend/README.md](../../frontend/README.md):**
  - Corregir versión de empaquetador a Vite 6 (`^6.4.4`).
  - Actualizar sección de persistencia eliminando la referencia a `VITE_USE_MOCK_STORAGE` y documentando el modelo de cliente conectado contra la API REST Express 5 / PostgreSQL vía `apiClient.jsx`.
  - Enlazar a [docs/DIAGRAMAS.md](../../docs/DIAGRAMAS.md).
- **[backend/README.md](../../backend/README.md):**
  - Clarificar la compatibilidad de runtime (Node.js 20/22 LTS y PostgreSQL 17/18).
  - Enlazar a [docs/DIAGRAMAS.md](../../docs/DIAGRAMAS.md).
- **[backend/database/README.md](../../backend/database/README.md):**
  - Complementar el ERD conceptual con la referencia al Diagrama Relacional Físico completo en [docs/DIAGRAMAS.md](../../docs/DIAGRAMAS.md).

### Fase 3: Sincronización del Libro Técnico ([docs/libro-pulso360/INDICE_MAESTRO.md](../../docs/libro-pulso360/INDICE_MAESTRO.md))
- Actualizar la introducción y el mapa arquitectónico para reflejar con precisión la existencia de la API REST backend de Express 5, la base de datos PostgreSQL de 31 tablas y la comunicación vía WebSockets.
- Clarificar la regla de persistencia: la base de datos relacional es la única fuente de verdad; no hay almacenamiento dual de datos sensibles en el navegador.

### Fase 4: Verificación y Quality Gates
- Ejecución de los 4 comandos canónicos:
  1. `cd "backend" && npm test`
  2. `cd "frontend" && npm test`
  3. `cd "frontend" && npm run lint`
  4. `cd "frontend" && npm run build`
- Validación de integridad de enlaces markdown relativos y renderizado de Mermaid.

---

## 2. Verificación y Rollback

* **Estrategia de Rollback:**
  Al tratarse de cambios exclusivos en archivos de documentación markdown (`.md`), cualquier discrepancia o reversión puede ejecutarse de manera instantánea mediante `git checkout` de los archivos afectados sin riesgo para la base de datos ni los activos compilados.
* **Impacto Operativo:**
  Cero impacto en tiempo de ejecución. No altera la API ni los componentes de React.
