# [SPEC-015] 015 Auditor Audit Log UX & Ergonomic Craft

Date: 2026-10-26  
Type: feature (Frontend UI/UX Craft, Ergonomics & Interaction Resilience)  
Status: IN_PROGRESS  

---

## 0. Clarification and Assumptions

- **Decisión de Arquitectura UI (Inspector de Eventos)**:
  - Se selecciona el modelo **Drawer Lateral Deslizante (Side Drawer / Inspector Panel)** por sobre el modal centrado, dado que en auditoría de sistemas BPO/Contact Center el usuario necesita contrastar registros consecutivos en la tabla sin perder su scroll ni el contexto visual de la fila seleccionada.
- **Evidencia Observada (`OBSERVED`)**:
  1. [`AuditLogTable.jsx`](file:///frontend/src/features/auditor/components/AuditLogTable.jsx#L156-L177): `<div className="modal-backdrop">` carece de reglas CSS en [`auditor.css`](file:///frontend/src/styles/auditor.css), renderizándose al final del DOM bajo la fila 50 de la tabla. El usuario debe desplazarse manualmente más de 1.000px hacia abajo para inspeccionar un evento.
  2. [`AuditLogPage.jsx`](file:///frontend/src/features/auditor/pages/AuditLogPage.jsx#L54-L66): El banner de `feedback` hereda el estilo `danger` (rojo) si `integrityStatus.valid === false`. Una exportación exitosa se tiñe de rojo con icono `alertTriangle`.
  3. [`useAuditLog.jsx`](file:///frontend/src/features/auditor/hooks/useAuditLog.jsx#L42-L47): Los 129 registros de formato histórico v1 marcan `valid = false`, disparando el texto alarmista *"Discrepancias detectadas"*, a pesar de que la cadena criptográfica está 100% íntegra. Además, se inyectan 200 caracteres dentro de un `<span className="badge">` deformando el encabezado de la tarjeta.
  4. [`AuditLogPage.jsx`](file:///frontend/src/features/auditor/pages/AuditLogPage.jsx#L40-L50): Flujo arcaico en dos pasos: primero "Preparar exportación (máx. 10 000)" y luego un segundo botón verde adyacente "Exportar registro auditado".
  5. [`AuditLogTable.jsx`](file:///frontend/src/features/auditor/components/AuditLogTable.jsx#L40-L60): El input y el select se apilan forzosamente al 100% de ancho con un menú nativo azul del sistema operativo sin icono de búsqueda.

---

## 1. Need and scope

- **Necesidad**: Elevar la vista de auditoría y trazabilidad inmutable (`/auditor/auditoria`) al estándar de excelencia visual y ergonómica de Pulso360, corrigiendo la visualización del inspector de eventos, eliminando falsas alarmas de error, unificando la exportación en 1 clic y organizando la barra de filtros en una composición limpia y moderna.
- **Alcance**:
  - `frontend/src/features/auditor/components/AuditLogTable.jsx`: Reemplazar el contenedor estático por un Drawer lateral accesible (`position: fixed; right: 0; top: 0; bottom: 0; z-index: 1000`) con soporte de teclado (`Escape`), trampa de foco y fila seleccionada activa en la tabla; refactorizar la barra de filtros con búsqueda integrada e icono de lupa.
  - `frontend/src/features/auditor/pages/AuditLogPage.jsx`: Unificar la acción de exportación en un solo botón con feedback de carga y descarga directa; desacoplar los estados de notificación (`feedback` tipado) de la verificación criptográfica.
  - `frontend/src/features/auditor/hooks/useAuditLog.jsx`: Manejo semántico de verificación (cadena íntegra vs formato v1 histórico), exportación directa con trigger de descarga y notificaciones tipadas.
  - `frontend/src/styles/auditor.css`: Reglas de diseño completas para el drawer lateral, barra de herramientas de filtrado, estados de fila seleccionada y métricas de integridad.

---

## 2. Acceptance Criteria and Non-Goals

- **AC-01 [functional] (Inspector Lateral Flotante / Side Drawer Ergonómico)**:
  - Al hacer clic en "Ver" en cualquier registro, se abre inmediatamente un panel lateral flotante (`position: fixed; right: 0; top: 0; bottom: 0; width: 480px; max-width: 90vw; z-index: 1000`) con overlay translúcido.
  - El usuario puede inspeccionar el evento sin desplazarse al fondo de la página.
  - La fila seleccionada en la tabla adquiere un estado visual destacado (`.audit-table-row-selected`).
  - El drawer se puede cerrar mediante la tecla `Escape`, clic en el backdrop o botón de cierre accesible (`aria-label="Cerrar panel de inspección"`).
  - Incluye visor de hashes SHA-256 encadenados con copiado al portapapeles y visor de metadatos JSON con scroll interno acotado.

- **AC-02 [functional] (Resiliencia Semántica de Errores y Notificaciones Tipadas)**:
  - Las confirmaciones de exportación exitosa se muestran con estilo positivo/neutral (`alert-banner ok` o notificación de éxito), erradicando el banner rojo de peligro (`danger`) en flujos no destructivos.
  - La verificación de integridad diferencia entre rotura de hash (falla crítica real) y presencia de registros históricos v1. Cuando los registros v1 están presentes, se informa con badge informativo o preventivo (*"Cadena íntegra · 129 registros v1 conservados"*), no como *"Discrepancias detectadas"*.
  - El encabezado de la tarjeta utiliza un badge conciso sin desbordar el layout.

- **AC-03 [functional] (Flujo de Exportación en 1 Clic con Descarga Directa)**:
  - La cabecera dispone de un único botón de exportación: *"Exportar auditoría"* con icono de descarga (`Icon name="download"`).
  - Al pulsar, el botón entra en estado deshabilitado con spinner de carga (`busy`), obtiene los datos del backend y dispara la descarga automática del archivo `pulso360-auditoria-fecha.json`.
  - Se elimina el flujo de dos pasos y la etiqueta obsoleta `(máx. 10 000)` del botón.

- **AC-04 [functional] (Barra de Búsqueda y Filtros Compacta y Pulida)**:
  - La barra de filtros `.audit-filter-bar` alinea el input de búsqueda y el filtro de resultados en una sola fila armónica (`flex-direction: row; align-items: center; gap: var(--space-3)`).
  - El campo de búsqueda incorpora un icono de lupa (`Icon name="search"`) y botón para limpiar el texto cuando no está vacío.
  - El selector de estado tiene ancho contenido (`max-width: 220px`) y estilo visual acorde al sistema de diseño de Pulso360.
  - El texto aclaratorio sobre el filtro "No registrado" se integra de forma limpia y legible sin romper la estructura de la tarjeta.

- **AC-05 [functional] (Quality Gates y Verificación)**:
  - `npm run lint` en `frontend` pasa con 0 errores y 0 warnings.
  - `npm run build` en `frontend` compila satisfactoriamente.
  - Los tests existentes en `frontend` y `backend` pasan sin regresiones.

### Non-Goals
- Modificar el algoritmo de hash criptográfico en backend o la estructura de la tabla de PostgreSQL `audit_logs`.
- Cambiar la regla de retención de registros de auditoría o los roles RBAC de acceso al módulo de auditoría.

---

## 3. Domain applicability

| Security & Compliance Control | Required? | Technical Enforcement |
| :--- | :---: | :--- |
| **Does it touch sensitive personal data (PII)?** | YES | La auditoría registra metadatos de operaciones críticas (actor, IP, acción, timestamp) sin registrar el cuerpo privado de las bitácoras ni datos clínicos confidenciales. |
| **Does it expose cross-tenant data?** | NO | El rol de Auditor está restringido a la trazabilidad organizacional de su ámbito autorizado. |
| **Does it require audit logging?** | YES | Las acciones del auditor (verificación criptográfica y exportación de bitácoras) se registran en el sistema de auditoría. |
| **Does it access or process sensitive data?** | YES | Encriptación y encadenamiento criptográfico SHA-256 preservando la cadena histórica intacta. |

---

## 4. Experience and limits

- **Loading state**: Spinner animado contextual durante la carga inicial de registros del servidor (`AuditLogPage.jsx`) y spinner en botones durante `busy`.
- **Empty state**: Mensaje centrado con icono sobrio cuando la búsqueda o filtros no arrojan resultados.
- **Error state**: Banner de error recuperable con botón "Reintentar" ante fallos de conexión al backend.
- **Responsive behavior**: En pantallas pequeñas (< 768px), el drawer lateral ocupa el 100% del ancho como panel de pantalla completa accesible.

---

## 5. Traceability

- **AC-01** $\rightarrow$ `plan.md` (Sección 1) $\rightarrow$ `tasks.md` (Tarea T-01) $\rightarrow$ Verificación visual e interactiva del Drawer.
- **AC-02** $\rightarrow$ `plan.md` (Sección 2) $\rightarrow$ `tasks.md` (Tarea T-02) $\rightarrow$ Verificación semántica de alertas y badges.
- **AC-03** $\rightarrow$ `plan.md` (Sección 3) $\rightarrow$ `tasks.md` (Tarea T-03) $\rightarrow$ Verificación de descarga directa en 1 clic.
- **AC-04** $\rightarrow$ `plan.md` (Sección 4) $\rightarrow$ `tasks.md` (Tarea T-04) $\rightarrow$ Verificación de la toolbar y selector.
- **AC-05** $\rightarrow$ `plan.md` (Sección 5) $\rightarrow$ `tasks.md` (Tarea T-05) $\rightarrow$ `npm run lint`, `npm run build`, `npm test`.
