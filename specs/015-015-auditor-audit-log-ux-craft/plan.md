# [PLAN-015] 015 Auditor Audit Log UX & Ergonomic Craft

Date: 2026-10-26  
Spec: [SPEC-015](spec.md)  
Status: IN_PROGRESS  

---

## 1. Evidence and existing architecture

- **Componente de Página (`AuditLogPage.jsx`)**:
  - Centraliza acciones de cabecera (`handleVerifyIntegrity`, `handleExportCrypto`), alertas de estado (`feedback`, `error`), estado de carga y paginación.
  - Actualmente mezcla el estado de la verificación de integridad (`integrityStatus`) con la alerta de exportación (`feedback`), provocando que exportaciones exitosas se pinten de rojo (`alert-banner danger`).
  - Utiliza un flujo de exportación en 2 pasos: primero un botón que prepara los datos en memoria y luego un componente `<DownloadLink>` que renderiza un segundo botón adyacente.
- **Componente de Tabla e Inspector (`AuditLogTable.jsx`)**:
  - Renderiza la cabecera con un `badge` que recibe mensajes largos de más de 200 caracteres, rompiendo la alineación de la tarjeta.
  - Renderiza una barra de filtros `.audit-filter-bar` donde `.form-input` y `.form-select` se apilan verticalmente ocupando el 100% del ancho.
  - El modal de inspección `<div className="modal-backdrop">` carece de reglas CSS en [`auditor.css`](file:///frontend/src/styles/auditor.css), renderizándose en el flujo DOM normal al pie de la tabla tras 50 filas.
- **Hook de Estado (`useAuditLog.jsx`)**:
  - Administra el ciclo de vida de los logs (`logs`, `filteredLogs`, `pagination`, `loadMore`).
  - `handleVerifyIntegrity` evalúa `valid = chainValid && contentValid`. Al encontrar registros históricos v1 (`legacyUnverifiable > 0`), clasifica la verificación como falsa y emite el texto alarmista *"Discrepancias detectadas"*, a pesar de que los enlaces criptográficos están íntegros.
  - `handleExportCrypto` delega la descarga en un segundo estado `exportContent` en lugar de disparar la descarga directa en el navegador.

---

## 2. Proposed change

### A. Inspector Lateral Flotante (Side Drawer)
- Reemplazar el contenedor modal estático por un **Drawer lateral deslizante accesible**:
  - Contenedor con overlay: `.audit-drawer-overlay` (`position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45); backdrop-filter: blur(2px); z-index: 1000`).
  - Panel deslizante: `.audit-drawer-panel` (`position: fixed; right: 0; top: 0; bottom: 0; width: 500px; max-width: 90vw; background: var(--c-superficie); box-shadow: var(--shadow-lg);`).
  - Accesibilidad de interacción: Cierre al presionar tecla `Escape`, clic en el backdrop o botón de cierre con `aria-label="Cerrar panel de inspección"`.
  - Resaltado de fila activa en la tabla (`.audit-table-row-selected`) para que el auditor no pierda la referencia del evento que está inspeccionando.
  - Bloques de código con fuente monoespaciada para `hash` y `prev_hash`, con botón de copiado interactivo y visor JSON con scroll acotado para `rawDetails`.

### B. Sistema de Notificaciones y Diagnóstico Criptográfico Limpio
- Reestructurar el feedback en `useAuditLog.jsx` para tipar las alertas:
  - `notification: { type: 'ok' | 'danger' | 'info' | 'warning', message: string }`.
  - Las acciones exitosas (como preparar o exportar) generan `notification.type = 'ok'` (`alert-banner ok`).
- Refactorizar el reporte de integridad criptográfica:
  - Distinguir entre falla de enlace en la cadena (rotura de hash) y conservación de registros de formato histórico v1.
  - Para registros históricos v1: emitir badge informativo conciso en el header (`"Cadena íntegra (v1 conservada)"`) y un desglose estructurado de métricas en la tarjeta:
    - *Cadena de hashes:* 100% íntegra.
    - *Formato v2 verificable:* 154 eventos.
    - *Formato v1 histórico:* 129 registros preservados.
  - Eliminar el término alarmista *"Discrepancias detectadas"* cuando no existe manipulación ni alteración de datos.

### C. Exportación Directa en 1 Clic
- Unificar la exportación en un solo botón moderno en `AuditLogPage.jsx`:
  ```jsx
  <button
    type="button"
    className="btn btn-secondary"
    onClick={handleExportCrypto}
    disabled={busy}
    title="Descargar archivo JSON con cobertura criptográfica"
  >
    <Icon name={busy ? "refresh" : "download"} size={16} className={busy ? "icon-spin" : ""} />
    <span>{busy ? "Exportando auditoría…" : "Exportar auditoría"}</span>
  </button>
  ```
- En `useAuditLog.jsx`, `handleExportCrypto` obtiene los datos de `exportAudit({ limit: 10000 })`, crea un objeto Blob `application/json`, dispara la descarga programática con enlace temporal en el navegador y notifica el éxito mediante un banner informativo positivo.
- Eliminar el botón secundario duplicado `<DownloadLink>` y la etiqueta técnica anticuada `(máx. 10 000)` del texto principal.

### D. Barra de Filtros y Búsqueda Compacta
- Reorganizar `.audit-filter-bar` en una sola fila horizontal (`display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap`):
  - Caja de búsqueda con icono de lupa (`Icon name="search"`) a la izquierda y botón de borrado (`✕`) visible cuando hay texto.
  - Selector de estado compacto con ancho acotado (`max-width: 200px`) y estilo visual pulido acorde a los tokens de Pulso360.
  - El hint sobre eventos "No registrados" se integra como nota sutil debajo de los controles sin ocupar espacio excesivo.

---

## 3. Contracts and compatibility

- **Data Contracts**: **N/A**. Se preserva la estructura de los datos devueltos por `auditorQueries.jsx` (`fetchAuditPage`, `verifyAudit`, `exportAudit`) y el esquema de base de datos PostgreSQL `audit_logs`.
- **API Contracts**: **N/A**. No se modifican los contratos de los endpoints HTTP ni los parámetros de solicitud (`limit`, `offset`, `maxId`).
- **Compatibilidad**: Compatible con navegadores modernos; en pantallas táctiles o móviles (< 768px), el drawer lateral se expande al 100% del ancho como panel de pantalla completa accesible.

---

## 4. Technology, setup and documentation decisions

- **Stack**: React 18, Vite, CSS nativo con tokens de `src/styles/tokens.css`.
- **Convención documental**: JSDoc estricto en funciones y componentes exportados de `AuditLogPage.jsx`, `AuditLogTable.jsx` y `useAuditLog.jsx`.
- **Iconografía**: Reutilización exclusiva del catálogo oficial `Icon.jsx` (`download`, `shieldCheck`, `checkCircle`, `alertTriangle`, `search`, `copy`, `check`, `refresh`, `close`).

---

## 5. UI & Interaction Design

- **Identidad de Rol**: Auditor de Cumplimiento y Seguridad (BPO / Contact Center). Requiere densidad informativa, precisión en hashes criptográficos y confirmaciones claras sin falsas alarmas.
- **Paleta y Tokens**:
  - Primario / Teal: `var(--c-primario)` (#0f766e).
  - Éxito / Verificado: `var(--c-exito)` / `var(--c-exito-bg)`.
  - Advertencia / Histórico: `var(--c-advertencia)` / `var(--c-advertencia-bg)`.
  - Superficie y Bordes: `var(--c-superficie)`, `var(--c-borde-suave)`.
  - Sombras y Animaciones: `var(--shadow-lg)`, transición suave de entrada lateral (`transform: translateX(0)`).
- **Estados Canónicos**:
  1. *Normal*: Tabla de eventos con barra de filtros horizontal y badges concisos.
  2. *Inspector Activo (Drawer)*: Fila seleccionada con fondo destacado, panel lateral abierto con foco inicial en el botón de cierre.
  3. *Loading*: Spinner animado `icon-spin` en el botón de exportación durante `busy` y en la tabla durante la carga inicial.
  4. *Empty*: Fila con mensaje centrado cuando ningún registro coincide con la búsqueda.
  5. *Error*: Banner con botón "Reintentar" ante fallos de red.

---

## 6. Verification Plan

| Criterio | Método de Verificación | Comando / Acción |
| :--- | :--- | :--- |
| **AC-01 (Side Drawer)** | Interacción UI y A11y | Clic en "Ver", verificar despliegue de panel lateral a la derecha, tecla `Escape`, clic exterior y copiado de hashes. |
| **AC-02 (Semántica Errores)** | Inspección funcional | Verificar que la exportación muestra banner verde (`ok`) y la integridad muestra aviso informativo en lugar de rojo alarmista. |
| **AC-03 (Export 1 Clic)** | Interacción funcional | Clic en "Exportar auditoría", verificar estado `busy` y descarga directa del archivo JSON `pulso360-auditoria-*.json`. |
| **AC-04 (Toolbar Filtros)** | Inspección visual y responsive | Comprobar alineación horizontal en escritorio y adaptación fluida en viewport estrecho (375px - 768px). |
| **AC-05 (Quality Gates)** | Ejecución automatizada | `cd frontend && npm run lint` (0 errores) y `npm run build` (éxito). `npm test` en frontend y backend. |

---

## 7. Rollback / recovery

En caso de cualquier anomalía o regresión, los cambios se revierten de forma inmediata y limpia mediante `git checkout` de los 4 archivos modificados (`AuditLogPage.jsx`, `AuditLogTable.jsx`, `useAuditLog.jsx`, `auditor.css`), sin afectar la base de datos ni los servicios de backend.
