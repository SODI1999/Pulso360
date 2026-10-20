# [PLAN-009] Technical Plan: Rediseño del Centro de Datos Personales y Privacidad del Agente ("My Data Hub")

## Evidence and existing architecture

- **Página principal**: [`frontend/src/features/agent/pages/MyDataPrivacyPage.jsx`](../../frontend/src/features/agent/pages/MyDataPrivacyPage.jsx) orquesta la vista mediante [`useMyDataPrivacy.jsx`](../../frontend/src/features/agent/hooks/useMyDataPrivacy.jsx), renderizando actualmente una columna única con:
  1. Subnavegación secundaria con botón de retorno (`agent-back-btn`).
  2. Encabezado editorial con título legal de la Ley 1581 de 2012.
  3. [`PrivacySummary.jsx`](../../frontend/src/features/agent/components/PrivacySummary.jsx) con 4 tarjetas KPI que solo muestran conteos numéricos crudos ("8", "8", "9", "Vigente").
  4. Malla de dos columnas: [`ConsentPreferencesLink.jsx`](../../frontend/src/features/agent/components/ConsentPreferencesLink.jsx) (botón que redirige a `/consentimiento`) y [`RectificationRequestForm.jsx`](../../frontend/src/features/agent/components/RectificationRequestForm.jsx) (área de texto libre sin contexto de los datos a corregir).
  5. Tarjeta de portabilidad con enlaces Blob de descarga para JSON y CSV.
  6. Tarjeta con borde rojo invasivo para solicitud de supresión exigiendo escribir "SUPRIMIR".
  7. Lista plana de radicados de Habeas Data con texto concatenado.
- **Hook de soporte**: [`frontend/src/features/agent/hooks/useMyDataPrivacy.jsx`](../../frontend/src/features/agent/hooks/useMyDataPrivacy.jsx) consulta `fetchAgentRecords` / `getAgentRecords` y maneja estados de texto para rectificación y confirmación de supresión, respaldado por `useExpiredFormDraft`.
- **Servicios de persistencia y consulta**:
  - [`frontend/src/features/agent/services/myDataPrivacyService.jsx`](../../frontend/src/features/agent/services/myDataPrivacyService.jsx) genera IDs de radicado (`HD-YYYY-XXX`), calcula plazos en días hábiles (10 días para consultas, 15 para rectificación/supresión) y audita mediante `pulsoStore.audit()`.
  - [`frontend/src/features/agent/services/agentQueries.jsx`](../../frontend/src/features/agent/services/agentQueries.jsx) centraliza la obtención de `checkins`, `journals`, `supportRequests`, `habeasRequests` y `consents`.
  - [`frontend/src/core/auth/consentContract.jsx`](../../frontend/src/core/auth/consentContract.jsx) normaliza las finalidades C1 a C5 (`c1_checkin`, `c2_bitacora`, `c3_apoyo`, `c4_analitica`, `c5_contacto`).
- **Sistema visual e iconografía**:
  - Tokens oficiales en [`frontend/src/styles/tokens.css`](../../frontend/src/styles/tokens.css).
  - Catálogo de iconos en [`frontend/src/core/components/Icon.jsx`](../../frontend/src/core/components/Icon.jsx): soporta `shield`, `shieldCheck`, `database`, `download`, `edit_note`, `arrowLeft`, `clock`, `alertTriangle`, `checkCircle2`, `fileText`, `lock`, `helpCircle`.

## Proposed change

La solución transforma la pantalla de un formulario plano de cumplimiento burocrático a un **Centro de Control de Privacidad y Mis Datos del Agente** estructurado en **3 Pestañas Segmentadas Accesibles (WAI-ARIA)**:

```
+-------------------------------------------------------------------------------------------------+
|  <- Volver al panel                                                                             |
|                                                                                                 |
|  Centro de Datos y Privacidad del Agente                                [ ID Titular: AG-0842 ] |
|  Transparencia total sobre tu información, quién tiene acceso y tus derechos bajo la Ley 1581.  |
+-------------------------------------------------------------------------------------------------+
|  BARRA DE PESTAÑAS (WAI-ARIA: tablist con flechas de dirección)                                 |
|  [ (Shield) Salvaguardas & Quién ve qué ]   [ (Folder) Mis Registros ]   [ (File) Derechos & Trámites ] |
+-------------------------------------------------------------------------------------------------+
|                                                                                                 |
|  SI PESTAÑA 1: SALVAGUARDAS & QUIÉN VE QUÉ                                                      |
|  +-------------------------------------------------------------------------------------------+  |
|  | Matriz de Transparencia de Pulso360 (4 Niveles de Visibilidad)                             |  |
|  | +-----------------------------+ +-----------------------------+                          |  |
|  | | Nivel 1: Privado en tu PC   | | Nivel 2: Agregado k >= 5    |                          |  |
|  | | Bitácoras y notas privadas. | | Fatiga de check-in grupal.  |                          |  |
|  | | NLP local. Cero supervisión | | Tendencias SST sin nombres. |                          |  |
|  | +-----------------------------+ +-----------------------------+                          |  |
|  | +-----------------------------+ +-----------------------------+                          |  |
|  | | Nivel 3: Apoyo Confidencial | | Nivel 4: Datos Operativos   |                          |  |
|  | | Solo el psicólogo de turno. | | Turno, sede y campaña WFM.  |                          |  |
|  | +-----------------------------+ +-----------------------------+                          |  |
|  +-------------------------------------------------------------------------------------------+  |
|  | Estado de tus Consentimientos Activos (Finalidades C1 a C5)      [ Ajustar preferencias ] |  |
|  | [x] C1 Check-in  [x] C2 Bitácora  [x] C3 Apoyo  [x] C4 Analítica k>=5  [x] C5 Avisos      |  |
|  +-------------------------------------------------------------------------------------------+  |
|                                                                                                 |
|  SI PESTAÑA 2: MI REGISTRO DE DATOS (EXPLORADOR CRONOLÓGICO)                                    |
|  +-------------------------------------------------------------------------------------------+  |
|  | Filtros: [ Todos (25) ]  [ Check-ins (8) ]  [ Bitácoras (8) ]  [ Solicitudes Apoyo (9) ]    |  |
|  | +---------------------------------------------------------------------------------------+ |  |
|  | | [Check-in] 19/10/2026 16:02 · Turno Tarde · Energía 3/5 · Fatiga 4/5   [Rectificar]  | |  |
|  | | [Bitácora] 18/10/2026 15:45 · Reflexión privada de desahogo            [Ver Bitácora] | |  |
|  | | [Apoyo]    15/10/2026 11:20 · Acompañamiento psicosocial · Atendido    [Detalles]     | |  |
|  | +---------------------------------------------------------------------------------------+ |  |
|  +-------------------------------------------------------------------------------------------+  |
|                                                                                                 |
|  SI PESTAÑA 3: DERECHOS & TRÁMITES HABEAS DATA                                                  |
|  +-------------------------------------------------------------------------------------------+  |
|  | Portabilidad de Datos Propios (Descarga en tu equipo)                                     |  |
|  | [ Descargar JSON estructurado ]      [ Descargar CSV propio ]                             |  |
|  +-------------------------------------------------------------------------------------------+  |
|  | Gestión de Solicitudes (Ley 1581 de 2012 / Dec. 1377 de 2013)                              |  |
|  | - Rectificar un dato: [ Campo guiado para describir corrección ] [ Radicar rectificación ] |  |
|  | - Solicitar supresión: [ Botón sereno: Solicitar supresión de datos... ]                  |  |
|  |   -> Abre Modal accesible de confirmación segura con explicación de alcance                |  |
|  +-------------------------------------------------------------------------------------------+  |
|  | Seguimiento de Solicitudes Radicadas                                                      |  |
|  | +---------------------------------------------------------------------------------------+ |  |
|  | | HD-2026-7C8 · Supresión · [Respondida] · Radicada 07/10 · Plazo legal 15 días hábiles | |  |
|  | | Nota oficial: "Solicitud tramitada conforme a las directrices de SG-SST."             | |  |
|  | +---------------------------------------------------------------------------------------+ |  |
|  +-------------------------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------------------------+
```

### Componentes y Archivos Afectados

1. **[`frontend/src/features/agent/components/PrivacyVisibilityMatrix.jsx`](../../frontend/src/features/agent/components/PrivacyVisibilityMatrix.jsx)** (Nuevo):
   - Renderiza la matriz pedagógica de los 4 niveles de visibilidad: Nivel 1 (Estación/Local), Nivel 2 (Agregado $k \ge 5$), Nivel 3 (Apoyo confidencial), Nivel 4 (Datos institucionales de campaña).
   - Elimina la frialdad técnica mediante tarjetas estructuradas con microcopy claro sobre la protección frente a supervisores.
2. **[`frontend/src/features/agent/components/ConsentSummaryCard.jsx`](../../frontend/src/features/agent/components/ConsentSummaryCard.jsx)** (Nuevo):
   - Muestra el estado de vigencia general del consentimiento (`policyAccepted`), la fecha de actualización y una cuadrícula amigable con el estado de las 5 finalidades C1 a C5 (`c1_checkin`, `c2_bitacora`, `c3_apoyo`, `c4_analitica`, `c5_contacto`).
   - Botón contextual para ir a [`ConsentPage.jsx`](../../frontend/src/features/auth/pages/ConsentPage.jsx) a editar preferencias.
3. **[`frontend/src/features/agent/components/AgentRecordsExplorer.jsx`](../../frontend/src/features/agent/components/AgentRecordsExplorer.jsx)** (Nuevo):
   - Sustituye a `PrivacySummary.jsx` (los 4 contadores crudos).
   - Recibe `summary` (checkins, journals, support) y ofrece filtros por píldora: *Todos*, *Check-ins*, *Bitácoras*, *Solicitudes de apoyo*.
   - Presenta tarjetas de registro legibles con fecha colombiana, badge de tipo, resumen descriptivo y enlace rápido para ver la bitácora o preseleccionar el registro para rectificación.
4. **[`frontend/src/features/agent/components/HabeasDataActionCenter.jsx`](../../frontend/src/features/agent/components/HabeasDataActionCenter.jsx)** (Nuevo):
   - Unifica la portabilidad (descargas JSON/CSV) y el formulario guiado de rectificación.
   - Provee el botón para abrir el modal de solicitud de supresión de datos, desescalando la agresiva caja roja fija.
5. **[`frontend/src/features/agent/components/SuppressionConfirmModal.jsx`](../../frontend/src/features/agent/components/SuppressionConfirmModal.jsx)** (Nuevo):
   - Diálogo modal accesible con trampa de foco, cierre con tecla `Escape` y backdrop clicable.
   - Explica pedagógicamente qué información entra a revisión administrativa y qué conserva el radicado por requerimientos legales de SG-SST.
   - Campo para escribir "SUPRIMIR" y botón de acción con confirmación auditada.
6. **[`frontend/src/features/agent/components/HabeasRequestsTimeline.jsx`](../../frontend/src/features/agent/components/HabeasRequestsTimeline.jsx)** (Nuevo):
   - Renderiza las solicitudes de Habeas Data con badges semánticos (*Recibida*, *En trámite*, *Respondida*).
   - Muestra la fecha de radicación, fecha objetivo calculada (10 o 15 días hábiles de ley) y la respuesta del oficial de privacidad si fue registrada.
   - Incluye empty state amable cuando no hay solicitudes.
7. **[`frontend/src/features/agent/hooks/useMyDataPrivacy.jsx`](../../frontend/src/features/agent/hooks/useMyDataPrivacy.jsx)**:
   - Añadir gestión de pestaña activa (`activeTab`, `setActiveTab`) con valores `'safeguards'`, `'records'`, `'habeas'`.
   - Soporte para navegación accesible por teclado en el tablist (`handleTabKeyDown` con `ArrowLeft`, `ArrowRight`, `Home`, `End`).
   - Estado para el modal de supresión (`isSuppressionModalOpen`, `setIsSuppressionModalOpen`).
   - Acción `handleSelectForRectification(record)` para transicionar automáticamente a la pestaña de trámites y precargar el detalle del registro en el formulario.
8. **[`frontend/src/features/agent/pages/MyDataPrivacyPage.jsx`](../../frontend/src/features/agent/pages/MyDataPrivacyPage.jsx)**:
   - Orquesta la barra de pestañas WAI-ARIA y los 3 paneles correspondientes.
   - Integra el banner de reintento ante errores de carga y el modal de supresión.
9. **[`frontend/src/styles/agent.css`](../../frontend/src/styles/agent.css)**:
   - Clases para la barra de pestañas accesible (`.agent-privacy-tabs`, `.agent-privacy-tab`, `.agent-privacy-tab--active`).
   - Clases para la matriz de visibilidad de 4 niveles (`.visibility-matrix-grid`, `.visibility-card`, `.visibility-badge`).
   - Clases para el explorador de registros (`.records-explorer-header`, `.records-filter-pills`, `.record-item-card`).
   - Clases para la línea de tiempo de radicados (`.habeas-timeline-list`, `.habeas-card`, `.habeas-badge`).
   - Clases para el modal de supresión (`.privacy-modal-backdrop`, `.privacy-modal-dialog`).

## Contracts and compatibility

- **Contratos de datos persistentes**:
  - Se respetan íntegramente las estructuras de datos de `pulsoStore.js` y `agentQueries.jsx`:
    - `checkins`: `{ id, userId, journeyKey, date, energia, cargaEmocional, ... }`
    - `journals`: `{ id, userId, date, content, nlp, ... }`
    - `supportRequests`: `{ id, ownerUserId, date, channel, status, ... }`
    - `habeasRequests`: `{ id, userId, type, createdAt, status, deadline, note }`
    - `consents`: `{ policyAccepted, updatedAt, c1_checkin, c2_bitacora, c3_apoyo, c4_analitica, c5_contacto }`
- **Interfaces y props de componentes**:
  - `PrivacyVisibilityMatrix`: no requiere props externas (muestra las salvaguardas universales del sistema).
  - `ConsentSummaryCard`: recibe `{ consent, formatDate }`.
  - `AgentRecordsExplorer`: recibe `{ summary, formatDate, onSelectForRectification }`.
  - `HabeasDataActionCenter`: recibe `{ rectificationText, setRectificationText, handleRectificationSubmit, rectificationFeedback, onOpenSuppressionModal, portabilityFiles, handleDownloadPortability }`.
  - `SuppressionConfirmModal`: recibe `{ isOpen, onClose, suppressionConfirmText, setSuppressionConfirmText, handleSuppressionSubmit, suppressionFeedback, isSuppressionConfirmed }`.
  - `HabeasRequestsTimeline`: recibe `{ requests, formatDate }`.

## Verification

| Criterio | Método de Verificación | Directorio de Trabajo | Evidencia Requerida |
| :--- | :--- | :--- | :--- |
| **AC-01** | Manual (navegación por teclado `ArrowLeft`/`ArrowRight`, foco visible y atributos WAI-ARIA) | `frontend/` | Interacción en browser y snapshot de atributos `role="tab"`, `aria-selected` |
| **AC-02** | Manual (inspección visual de matriz de 4 niveles y textos de salvaguardas) | `frontend/` | Render en pestaña `Salvaguardas & Quién ve qué` con screenshot |
| **AC-03** | Manual (verificación de chips de estado C1–C5 y navegación a `/consentimiento`) | `frontend/` | Render en tarjeta de consentimientos y prueba de enlace |
| **AC-04** | Manual (filtrado por tipo de registro en el explorador cronológico y acción rápida) | `frontend/` | Alternar filtros y click en acción contextual |
| **AC-05** | Manual (descargas JSON/CSV y apertura/cierre de modal de confirmación de supresión con `Escape`) | `frontend/` | Descarga de archivo y modal interactivo con campo "SUPRIMIR" |
| **AC-06** | Manual (inspección de tarjetas de radicado, plazos legales y badges semánticos) | `frontend/` | Render de lista de radicados con fechas y notas |
| **AC-07** | Automatizado (`npm run lint`, `npm run build`, `npm test`) | `frontend/` | Ejecución limpia de scripts de package.json sin errores |

## Rollback / recovery

- En caso de regresión o fallo imprevisto, se puede restaurar la versión anterior de `MyDataPrivacyPage.jsx` y `useMyDataPrivacy.jsx` manteniendo los componentes históricos (`PrivacySummary.jsx`, `ConsentPreferencesLink.jsx`, `RectificationRequestForm.jsx`). No se realizan cambios en la base de datos ni migraciones destructivas que impidan el retorno seguro.
