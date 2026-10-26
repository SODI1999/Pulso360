# [PLAN-014] Frontend 5 Roles UI/UX Craft & Ergonomic Polish

Date: 2026-10-26  
Spec: [SPEC-014](spec.md)  
Status: IN_PROGRESS  

---

## 1. Architecture and Component Scope

- `frontend/src/features/agent/pages/AgentDashboardPage.jsx`:
  - Corregir el formateo del saludo: `greeting ? `${greeting.trim()}, ` : ''`.
  - Reemplazar el contenedor `.calm-hero-media` y su imagen `bpo-agent-calm-pause.jpg` por un acento decorativo sobrio con icono institucional o tipografía de respiro.
  - Rediseñar `.calm-disconnect` a `.calm-disconnect-compact` para que sea una barra sutil y no desplace el check-in.
- `frontend/src/features/supervisor/pages/TeamDashboardPage.jsx`:
  - Reestructurar `.supervisor-filter-bar` con una rejilla/flex horizontal unificada para selector de ámbito y fechas Desde/Hasta.
  - Limpiar la tarjeta de privacidad en `PrivacyBlockedCard.jsx` o en `TeamDashboardPage` retirando cualquier referencia a ilustraciones tipo cartoon y sustituyéndola por un isotipo sobrio de seguridad.
- `frontend/src/features/sst/pages/SstDashboardPage.jsx`:
  - Condicionar el render de la tarjeta de categorías NLP: si `!env.useMockStorage` y el servidor no publica la distribución, omitir el contenedor completo para evitar ruido.
  - Compactar el banner preventivo de SST.
- `frontend/src/core/layout/AppLayout.jsx` y `frontend/src/styles/layout.css`:
  - Transformar el topbar en un contenedor estructurado con chip de campaña, indicador de turno formateado y botón de avisos con badge accesible.
- `frontend/src/styles/tokens.css` y hojas temáticas:
  - Preservar la cascada y tokens existentes sin añadir librerías adicionales.

---

## 2. Data and API Contracts

- **Data Contracts**: **N/A**. Esta especificación es estrictamente cosmética, ergonómica y de refinamiento de layout frontend. No se alteran esquemas de base de datos PostgreSQL, DTOs de transporte ni contratos de API REST.
- **API Contracts**: **N/A**. Los endpoints HTTP (`/api/v1/*`) y los eventos de WebSocket (`alert:new`, `support:message:received`) permanecen intactos.

---

## 3. Rollback & Migration Strategy

- **Database Migrations**: **N/A**. No se aplican migraciones de base de datos ni modificaciones de tablas.
- **Rollback Strategy**: En caso de regresión visual o falla en los tests, se revierte de forma atómica mediante `git checkout` de los componentes afectados sin impacto en datos persistidos ni en el backend.

---

## 4. Risk Mitigation

- **Riesgo 1**: Romper selectores que busquen elementos específicos en pruebas de Vitest.
  - *Mitigación*: Preservar roles de accesibilidad (`role="status"`, `role="group"`, `aria-label`, etc.) y textos canónicos que los tests esperan.
- **Riesgo 2**: Inconsistencias en responsive design (móvil y escritorio).
  - *Mitigación*: Probar los breakpoints con `flex-wrap: wrap` y consultas de medios existentes en `tokens.css` y `layout.css`.

---

## 5. Step-by-Step Execution Sequence

1. **TASK-01**: Refinamiento estético y corrección de saludo en `AgentDashboardPage.jsx` y `agent.css`.
2. **TASK-02**: Alineación horizontal de filtros y estilización de privacidad en `TeamDashboardPage.jsx` y `supervisor.css`.
3. **TASK-03**: Eliminación de tarjetas muertas y jerarquía en `SstDashboardPage.jsx` y `sst.css`.
4. **TASK-04**: Rediseño del Topbar en `AppLayout.jsx` y `layout.css`.
5. **TASK-05**: Pulido de tablas y tarjetas en Auditor (`AuditLogPage.jsx`) y Admin (`OrganizationPage.jsx`).
6. **TASK-06**: Verificación en vivo en el navegador mediante DevTools y ejecución completa de quality gates (`npm run lint`, `npm run build`, `npm test`).
