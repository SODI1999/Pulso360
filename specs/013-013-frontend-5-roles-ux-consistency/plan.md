# [PLAN-013] Technical Plan: Frontend 5 Roles UX & Visual Consistency

## Evidence and existing architecture

- El frontend está construido en React 18, Vite 6 y React Router 7 bajo la arquitectura monorepo `frontend/src/`.
- Rutas maestras y layout centralizados en `frontend/src/App.jsx` y `frontend/src/core/layout/AppLayout.jsx`.
- Roles RBAC configurados en `frontend/src/core/auth/roleNavigation.jsx`.
- Sistema de diseño y tokens unificados en `frontend/src/styles/tokens.css` y archivos CSS modulares por feature.
- En Spec 012 se resolvió la resiliencia y JSDoc en el rol de Agente (`features/agent/`). Los roles restantes (`supervisor`, `sst`, `auditor`, `admin`, `reports`, `notifications`) presentan deudas en el manejo uniforme de estados de carga/error (retornos tempranos descontextualizados) y un enlace roto en `SstDashboardPage.jsx:105`.

---

## Proposed change

1. **Corrección de Enlaces y Navegación**:
   - Actualizar el enlace en `SstDashboardPage.jsx:105` de `/sst/support-inbox` a `/sst/buzon`.
   - Verificar la consistencia de todos los links de navegación secundaria (`supervisor-back-btn`, `agent-back-btn`).
2. **Estandarización de los 4 Estados Obligatorios**:
   - Reemplazar retornos tempranos descontextualizados en:
     - `supervisor`: `ActionsPage.jsx`, `TeamDashboardPage.jsx`
     - `sst`: `AlertsInboxPage.jsx`, `InterventionsPage.jsx`, `SupportInboxPage.jsx`, `SstDashboardPage.jsx`
     - `admin`: `OrganizationPage.jsx`, `UsersRolesPage.jsx`, `SystemParamsPage.jsx`, `HabeasDataPage.jsx`, `CsvImportPage.jsx`
     - `auditor`: `AuditLogPage.jsx`
     - `shared`: `ReportsPage.jsx`, `NotificationsPage.jsx`
   - Incorporar contenedor formal con título, subtítulo, skeleton o spinner contextual de carga, y alert-banner con botón interactivo de reintento (`Reintentar`) en caso de error.
3. **Consistencia Visual con Tokens Centralizados**:
   - Reemplazar colores hexadecimales hardcodeados (como `#2563eb`) por variables de `tokens.css`.
   - Revisar radios de bordes, espaciados y jerarquía de títulos (`h1`, `h2`, `h3`) para mantener sobriedad BPO y evitar card-itis.
4. **Accesibilidad y Manejo de Modales**:
   - Asegurar que todos los modales de administración y supervisión implementen atributos de accesibilidad (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`), soporte de tecla `Escape` y enfoque controlado.

---

## Contracts and compatibility

- Se mantienen todos los contratos y firmas de hooks existentes (`useActions`, `useOrganization`, `useUsersRoles`, `useSystemParams`, `useHabeasData`, `useAlertsInbox`, `useSupportInbox`, `useAuditLog`, `useReports`, `useNotifications`).
- No se alteran payloads de API REST ni eventos de Socket.IO.

---

## Technology, setup and documentation decisions

- **Stack**: React 18, Vite 6, ESLint 9, tokens CSS nativos.
- **Documentación**: JSDoc descriptivo en cualquier helper o componente ajustado.
- **Convención de Commits**: Conventional Commits (`feat(ui): ...`, `fix(navigation): ...`).

---

## UI & Interaction Design

- **Habilidades aplicadas**:
  - `better-interface`: Evaluación de extremo a extremo de pantallas y navegación.
  - `better-accessibility` (`antislop-human`): Verificación de navegación por teclado, focus visible, diálogo accesible y contraste WCAG AA.
  - `better-ui`: Erradicación de hex hardcodeados, pulido de bordes y alineación.
  - `better-writing` (`antislop-copywriting`): Microcopy conciso, respetuoso y empático para turnos de Contact Center.
  - `state-machine`: Verificación de los 4 estados (Loading, Empty, Error, Protected) en cada vista.

---

## Verification

- **Automated**:
  - `cd frontend && npm run lint` (0 errores, 0 warnings).
  - `cd frontend && npm run build` (compilación exitosa en Vite).
  - `cd frontend && npm test` (55 tests pasando).
  - `cd backend && npm test` (132 tests pasando).
- **Manual/Inspection**:
  - Inspección del renderizado y navegación de los 5 roles.
  - Verificación del comportamiento del botón `Reintentar` y cierre de modales con Escape.

---

## Rollback / recovery

- Cambios confinados al directorio `frontend/src/`. Si se presentase alguna regresión visual, se puede revertir quirúrgicamente vía `git checkout` en los componentes afectados sin comprometer datos ni backend.
