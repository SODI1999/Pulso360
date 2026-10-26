# [SPEC-013] Frontend 5 Roles UX & Visual Consistency

Date: 2026-10-26  
Type: feature (Frontend UX/UI Ergonomics & 5-Roles Consistency)  
Status: IN_PROGRESS  

---

## 0. Clarification and Assumptions

- **Origen**: Solicitud explícita para auditar, unificar y perfeccionar la experiencia de usuario y visual de los 5 roles canónicos de Pulso360 (Agente, Supervisor, SST, Auditor, Administrador), abarcando todas sus pestañas, ventanas y modales.
- **Evidencia Observada (`OBSERVED`)**:
  1. En `SstDashboardPage.jsx:105`, el enlace hacia el chat de orientación apunta a `/sst/support-inbox`, mientras que la ruta canónica en `App.jsx:205` y `roleNavigation.jsx:47` es `/sst/buzon`, provocando una caída a la ruta comodín 404/redirect.
  2. En múltiples páginas de los roles Supervisor, SST, Auditor y Administrador (`ActionsPage`, `AlertsInboxPage`, `InterventionsPage`, `SupportInboxPage`, `OrganizationPage`, `UsersRolesPage`, `SystemParamsPage`, `HabeasDataPage`), los estados de carga y error emplean retornos tempranos con elementos `<p role="status">` o `<p className="alert-banner danger">` crudos que desmontan la cabecera, subnavegación y layout de la página, y carecen del botón de acción interactiva `Reintentar` exigido por los 4 estados de OmniSpec.
  3. Presencia de valores hexadecimales hardcodeados (ej. `#2563eb` en `TeamDashboardPage.jsx:183`) en lugar de variables del sistema de diseño (`tokens.css`).
  4. Los modales de administración y supervisión requieren verificación de accesibilidad WCAG 2.2 (semántica `role="dialog"`, `aria-modal="true"`, cierre por tecla `Escape` y restitución del foco).
- **Invariantes Inviolables**:
  - No modificar la lógica de k-anonimato ($k \ge 5$) ni la barrera anti-vigilancia de `privacyRules.js`.
  - No alterar el motor determinista local `nlpEngine.js`.
  - Preservar los 187 tests automatizados existentes.

---

## 1. Need and scope

- **Necesidad**: Erradicar todos los puntos de fricción visual, de navegación y de accesibilidad en los 5 roles de Pulso360, proporcionando una interfaz coherente, ergonómica para turnos de Contact Center, resiliente ante latencias de red y respetuosa de las directrices anti-cliché.
- **Alcance**:
  - **Rol 1 (Agente)**: Verificación de coherencia y modales de perfil/crisis.
  - **Rol 2 (Supervisor)**: `TeamDashboardPage.jsx`, `ActionsPage.jsx`, `ActionFollowupModal.jsx`.
  - **Rol 3 (SST)**: `SstDashboardPage.jsx`, `AlertsInboxPage.jsx`, `AlertRulesPage.jsx`, `InterventionsPage.jsx`, `SupportInboxPage.jsx`, `DismissAlertModal.jsx`.
  - **Rol 4 (Auditor)**: `AuditLogPage.jsx`, `AuditLogTable.jsx`.
  - **Rol 5 (Administrador)**: `OrganizationPage.jsx`, `UsersRolesPage.jsx`, `SystemParamsPage.jsx`, `CsvImportPage.jsx`, `HabeasDataPage.jsx`, modales de campañas, equipos, usuarios y habeas data.
  - **Vistas Compartidas**: `ReportsPage.jsx`, `NotificationsPage.jsx`.
- **Non-Goals**:
  - No reescribir contratos de backend ni esquemas de base de datos PostgreSQL.
  - No incorporar librerías externas de UI ni frameworks CSS adicionales.

---

## 2. Acceptance Criteria and Non-Goals

- **AC-01 [functional] (Navegación e Integridad de Rutas)**:
  - Corregir el enlace en `SstDashboardPage.jsx` redirigiendo al buzón canónico `/sst/buzon`.
  - Garantizar que los enlaces secundarios "Volver al panel" o breadcrumbs en todas las páginas de los 5 roles resuelvan exactamente a las rutas base declaradas en `roleHomePaths`.
- **AC-02 [functional] (Resiliencia & 4 Estados Obligatorios)**:
  - Todas las páginas de los roles Supervisor, SST, Auditor, Administrador, Reportes y Notificaciones deben conservar la cabecera y el layout contextual cuando estén en estado de carga o error.
  - Incorporar skeletons visuales de carga estructurados ($CLS = 0$).
  - Todo estado de error de carga (`loadError` o `error`) debe incluir un botón de acción interactivo `<button type="button" className="btn btn-secondary btn-sm" onClick={retry}>Reintentar</button>`.
- **AC-03 [functional] (Consistencia Visual & Tokens Centralizados)**:
  - Erradicar colores hexadecimales o estilos inline arbitrarios reemplazándolos por tokens de `tokens.css` (`var(--c-azul-600)`, `var(--radius-md)`, etc.).
  - Mantener densidad ergonómica y jerarquía tipográfica sin "card-itis" (contenedores artificiales innecesarios) respetando `DESIGN.md`.
- **AC-04 [functional] (Accesibilidad WCAG 2.2 & Diálogos)**:
  - Verificar que todos los modales de los 5 roles implementen `role="dialog"`, `aria-modal="true"`, `aria-labelledby` y manejen el evento `keydown` (Escape) devolviendo el foco al elemento desencadenante.
  - Asegurar contraste mínimo de 4.5:1 en textos y 3:1 en componentes interactivos según `antislop-human` y `better-accessibility`.
- **AC-05 [functional] (Preservación de Privacidad & RBAC)**:
  - Mantener los bloqueos `PrivacyBlockedCard` ante muestras $N < 5$ en vistas de Supervisor, SST y Reportes.
  - Preservar el aislamiento total de la bitácora individual del agente.
- **AC-06 [functional] (Quality Gate & Cero Regresiones)**:
  - `npm run lint` pasa con 0 errores y 0 warnings en frontend.
  - `npm run build` compila con éxito en Vite.
  - `npm test` en frontend (55 tests) y backend (132 tests) pasan al 100%.

---

## 3. Domain applicability

| Security & Compliance Control | Required? | Technical Enforcement |
| :--- | :---: | :--- |
| **Does it touch sensitive personal data (PII)?** | YES | Bitácoras del agente se mantienen aisladas; consultas agregadas exigen $k \ge 5$ sin nombres en vistas de supervisión/SST. |
| **Does it expose cross-tenant data?** | NO | Operaciones restringidas por `campaignId` y alcances `user.scopes` del token JWT. |
| **Does it require audit logging?** | YES | Las consultas agregadas y exportaciones conservan los llamados de auditoría `pulsoStore.audit()`. |
| **Does it access or process sensitive data?** | YES | Manejo de solicitudes de acompañamiento y derechos ARCO preservando confidencialidad. |

---

## 4. Experience and limits

- Se cubren explícitamente los 4 estados (Carga, Vacío, Error y Protegido) en cada pantalla.
- La aplicación conserva su modo offline/demo con `pulsoStore` y sincronización con API REST cuando `useMockStorage = false`.

---

## 5. Traceability

- **AC-01** → Plan Sec. 2 & Task TASK-01 (Navegación e Integridad de Rutas)
- **AC-02** → Plan Sec. 2 & Task TASK-02 (4 Estados y Resiliencia con Reintentos)
- **AC-03** → Plan Sec. 2 & Task TASK-03 (Tokens y Erradicación de Slop Visual)
- **AC-04** → Plan Sec. 2 & Task TASK-04 (Accesibilidad WCAG 2.2 en Modales)
- **AC-05** → Plan Sec. 2 & Task TASK-05 (Invariantes de Privacidad)
- **AC-06** → Plan Sec. 2 & Task TASK-06 (Quality Gates y Pruebas)
