# [SPEC-014] Frontend 5 Roles UI/UX Craft & Ergonomic Polish

Date: 2026-10-26  
Type: feature (Frontend UI Craft, Layout Alignment & Anti-Slop Eradication)  
Status: IN_PROGRESS  

---

## 0. Clarification and Assumptions

- **Origen**: Solicitud explícita para resolver los defectos visuales, desalineaciones de layout, desproporción de elementos y componentes anti-patrón (AI-slop visual y tarjetas vacías de "no disponible") detectados en la auditoría en vivo sobre los 5 roles de Pulso360.
- **Evidencia Observada (`OBSERVED`)**:
  1. **Agente (`AgentDashboardPage.jsx`)**: Saludo con espacio espurio antes de la coma (`"Buenas noches , Laura Gomez"`). Ilustración 3D estilo caricatura Pixar de IA que contradice `DESIGN.md`. Banner de desconexión laboral de altura desmedida que empuja el sintonizador de energía fuera del primer scroll del viewport.
  2. **Supervisor (`TeamDashboardPage.jsx`)**: Barra de filtros rota y asimétrica (selectores de fecha "Desde" y "Hasta" amontonados verticalmente en una columna torcida junto al selector de equipo). Tarjeta de privacidad $N < 5$ con avatar 3D caricaturesco y desproporción de espacios.
  3. **SST (`SstDashboardPage.jsx`)**: Tarjeta vacía en el centro de la pantalla que dice *"El servidor no publica una distribución agregada de NLP en esta versión"*, introduciendo ruido y sensación de prototipo roto. Banner denso de texto que obstruye la visualización de los KPIs.
  4. **Topbar Global (`AppLayout.jsx` / `layout.css`)**: Texto plano suelto sin estructura de navegación ni chips de contexto organizacional.
  5. **Auditor y Administrador (`AuditLogPage.jsx`, `OrganizationPage.jsx`)**: Tablas y tarjetas con estilos heterogéneos y falta de jerarquía visual contemporánea.
- **Invariantes Inviolables**:
  - Respetar el stack baseline (React 18, Vite, CSS nativo con tokens de `tokens.css`). No introducir Tailwind ni dependencias externas.
  - Preservar las reglas de privacidad ($k \ge 5$, aislamiento de bitácoras de agente).
  - Mantener los 187 tests automatizados passing al 100%.

---

## 1. Need and scope

- **Necesidad**: Transformar radicalmente la experiencia visual y la ergonomía de los 5 roles canónicos de Pulso360, ofreciendo interfaces limpias, proporcionadas, libres de clichés de IA y optimizadas para turnos rotativos de Contact Center.
- **Alcance**:
  - `frontend/src/features/agent/pages/AgentDashboardPage.jsx` y `frontend/src/styles/agent.css`: Corrección tipográfica de saludo, retiro de imagen cartoon 3D, rediseño de hero minimalista sobrio y banner de desconexión compacto no invasivo.
  - `frontend/src/features/supervisor/pages/TeamDashboardPage.jsx` y `frontend/src/styles/supervisor.css`: Alineación horizontal estricta de la barra de filtros, rediseño institucional de la tarjeta de privacidad $N < 5$ sin muñecos 3D.
  - `frontend/src/features/sst/pages/SstDashboardPage.jsx` y `frontend/src/styles/sst.css`: Remoción de la tarjeta vacía de NLP no disponible, compactación del banner preventivo y refinamiento de KPIs.
  - `frontend/src/core/layout/AppLayout.jsx` y `frontend/src/styles/layout.css`: Topbar estructurado con chip de campaña, indicador de turno y badges de notificación limpios.
  - `frontend/src/features/auditor/pages/AuditLogPage.jsx` y `frontend/src/features/admin/pages/OrganizationPage.jsx`: Consistencia de espaciados, tablas y tarjetas.

---

## 2. Acceptance Criteria and Non-Goals

- **AC-01 [functional] (Agente: Calma Operativa & Hero Compacto)**:
  - Eliminar el espacio espurio antes de la coma en el saludo.
  - Erradicar la ilustración 3D cartoon de IA en el hero banner, reemplazándola por una composición sobria, humana y tipográfica.
  - Rediseñar el aviso de desconexión laboral en un formato compacto horizontal que no desplace el sintonizador de energía fuera del primer scroll del viewport.
- **AC-02 [functional] (Supervisor: Alineación de Filtros & Privacidad Sobria)**:
  - Reestructurar la barra de filtros en una fila horizontal perfectamente alineada (`flex-direction: row; align-items: flex-end; gap: var(--space-4)`).
  - Reemplazar el avatar 3D cartoon de la tarjeta de privacidad $N < 5$ por iconografía sobria institucional (`shield` / `lock`) y barra de quórum limpia.
- **AC-03 [functional] (SST: Erradicación de Tarjeta Vacía & Jerarquía Limpia)**:
  - Ocultar la tarjeta de NLP cuando el servidor no publique dicha distribución en lugar de mostrar un contenedor vacío de "no disponible".
  - Compactar el banner explicativo de vigilancia epidemiológica para priorizar los KPIs de bienestar, alertas activas y tabla de dimensiones ocupacionales.
- **AC-04 [functional] (Cascarón Global & Topbar Estructurado)**:
  - Estructurar el topbar con chip de campaña/ámbito activo, indicador de turno formateado y botón de avisos con badge accesible.
- **AC-05 [functional] (Consistencia en Auditoría y Administración)**:
  - Homogeneizar tablas de auditoría y tarjetas de campaña con radios contenidos (`var(--radius-card)`), elevaciones sutiles (`var(--shadow-xs)`, `var(--shadow-sm)`) y micro-interacciones de hover fluidas.
- **AC-06 [functional] (Quality Gates & Cero Regresiones)**:
  - `npm run lint` pasa con 0 errores y 0 warnings en frontend.
  - `npm run build` compila con éxito en Vite.
  - `npm test` en frontend (55 tests) y backend (132 tests) pasan al 100%.

---

## 3. Domain applicability

| Security & Compliance Control | Required? | Technical Enforcement |
| :--- | :---: | :--- |
| **Does it touch sensitive personal data (PII)?** | YES | Bitácoras del agente se mantienen aisladas; consultas agregadas exigen $k \ge 5$ sin nombres en vistas de supervisión/SST. |
| **Does it expose cross-tenant data?** | NO | Restringido por `campaignId` y alcances `user.scopes`. |
| **Does it require audit logging?** | YES | Las consultas agregadas conservan los llamados de auditoría `pulsoStore.audit()`. |
| **Does it access or process sensitive data?** | YES | Manejo de solicitudes de acompañamiento y derechos ARCO preservando confidencialidad. |

---

## 4. Traceability

- **AC-01** → Plan Sec. 1 & Task TASK-01 (Rediseño de Hero y Desconexión en Agente)
- **AC-02** → Plan Sec. 2 & Task TASK-02 (Alineación de Filtros y Privacidad en Supervisor)
- **AC-03** → Plan Sec. 3 & Task TASK-03 (Depuración de Tarjetas y KPIs en SST)
- **AC-04** → Plan Sec. 4 & Task TASK-04 (Topbar Estructurado en AppLayout)
- **AC-05** → Plan Sec. 5 & Task TASK-05 (Estilización en Auditor y Admin)
- **AC-06** → Plan Sec. 6 & Task TASK-06 (Validación Integral y Quality Gates)
