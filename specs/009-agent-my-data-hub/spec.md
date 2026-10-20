# [SPEC-009] Rediseño del Centro de Datos Personales y Privacidad del Agente ("My Data Hub")

Date: 2026-10-20  
Status: IN_PROGRESS  
Type: feature  

## 0. Fase de Clarificación y Supuestos

- **Propósito confirmado**: Transformar la pantalla de datos personales del agente ([`MyDataPrivacyPage.jsx`](../../frontend/src/features/agent/pages/MyDataPrivacyPage.jsx) en `/agente/mis-datos`), superando la experiencia genérica de "formulario legal burocrático" y el "card-itis" de conteos numéricos abstractos ("8", "8", "9"), para convertirla en un **Centro de Control de Privacidad y Mis Datos del Agente** (*Personal Privacy & Data Vault*) organizado mediante **Pestañas Segmentadas Accesibles (WAI-ARIA)**.
- **Evidencia base**:
  - Diagnosticado en sesión de discusión `/omni-discuss` sobre `http://localhost:5173/agente/mis-datos` inspeccionada en runtime con Chrome DevTools.
  - Componentes existentes inspeccionados:
    - [`MyDataPrivacyPage.jsx`](../../frontend/src/features/agent/pages/MyDataPrivacyPage.jsx)
    - [`PrivacySummary.jsx`](../../frontend/src/features/agent/components/PrivacySummary.jsx)
    - [`ConsentPreferencesLink.jsx`](../../frontend/src/features/agent/components/ConsentPreferencesLink.jsx)
    - [`RectificationRequestForm.jsx`](../../frontend/src/features/agent/components/RectificationRequestForm.jsx)
    - Hook [`useMyDataPrivacy.jsx`](../../frontend/src/features/agent/hooks/useMyDataPrivacy.jsx)
    - Servicio [`myDataPrivacyService.jsx`](../../frontend/src/features/agent/services/myDataPrivacyService.jsx)
    - Contratos de consentimiento [`consentContract.jsx`](../../frontend/src/core/auth/consentContract.jsx)
- **Invariantes de Dominio y Privacidad**:
  - Aislamiento estricto del titular: las consultas solo devuelven datos asociados al usuario autenticado (`userId = currentUser.id`).
  - Cumplimiento de la Ley Estatutaria 1581 de 2012 y Decreto 1377 de 2013 de Colombia: plazos de 10 días hábiles para consultas y 15 días hábiles para reclamos/rectificaciones/supresiones.
  - Salvaguardas operativas de Pulso360 explicadas sin ambigüedad:
    - Análisis léxico de bitácora 100% local en el navegador del operador ([`nlpEngine.js`](../../frontend/src/core/nlp/nlpEngine.js)).
    - Regla de k-anonimato ($k \ge 5$) para agregaciones de check-in visibles por líderes de campaña y SST ([`privacyRules.js`](../../backend/src/domain/privacyRules.js)).
  - Persistencia y llamadas delegadas en [`agentQueries.jsx`](../../frontend/src/features/agent/services/agentQueries.jsx) y [`myDataPrivacyService.jsx`](../../frontend/src/features/agent/services/myDataPrivacyService.jsx) sin alterar contratos del backend ni añadir librerías externas.
  - Uso exclusivo de tokens del sistema ([`tokens.css`](../../frontend/src/styles/tokens.css)).

## 1. Need and scope

- **¿Quién lo necesita?**: El operador o agente de Contact Center / BPO que accede a "Mis datos".
- **¿Por qué?**: En un entorno de BPO caracterizado por alta presión operativa y monitoreo continuo, el agente siente recelo ante plataformas de bienestar. Al entrar a "Mis datos", actualmente encuentra una pantalla plana con tarjetas de conteo vacías ("Check-ins: 8", "Bitácoras: 8"), un botón rojo permanente que pide escribir "SUPRIMIR" en medio del scroll y una lista estéril de códigos de radicado, sin responder a su duda primordial: *¿Quién puede ver lo que escribo y cómo se protegen mis datos frente a mi supervisor o empresa?*.
- **Alcance**:
  - **Arquitectura de Pestañas Segmentadas (WAI-ARIA)**: Estructurar la página en 3 pestañas focales con soporte de teclado accesible:
    1. `Salvaguardas & Quién ve qué`: Matriz pedagógica de visibilidad en 4 niveles + desglose del estado de las 5 finalidades legales activas (C1 a C5).
    2. `Mi Registro de Datos`: Explorador interactivo cronológico de check-ins, bitácoras y solicitudes de apoyo con fechas, categorías y acceso directo para ver o rectificar.
    3. `Derechos y Trámites`: Portabilidad (descarga de JSON estructurado y CSV propio), radicación unificada de solicitudes de Habeas Data (rectificación y supresión con confirmación modal protegida) y línea de tiempo de radicados con cálculo de días hábiles de ley.
  - **Sustitución de Card-itis por Matriz de Visibilidad**: Reemplazar las cajas numéricas aisladas por una guía visual comprensible de los 4 niveles de acceso a la información (Local estación, Agregado $k \ge 5$, Apoyo confidencial, Corporativo WFM).
  - **Confirmación Segura y Desescalada de Supresión**: Reemplazar el input permanente de texto rojo con un flujo guiado y modal accesible de confirmación que clarifique qué registros se revisan administrativamente y cuáles conserva el radicado.
  - **Línea de Tiempo de Radicados**: Presentar las solicitudes de Habeas Data con chips de estado semánticos (*Radicada*, *En trámite*, *Respondida*), cálculo explícito de vencimiento en días hábiles conforme a la Ley 1581 y visualización de la respuesta administrativa.
- **Non-Goals**:
  - No se modifica el esquema de base de datos ni los endpoints existentes del backend (`/agent/habeas-data`, `/agent/consent`, `/agent/checkin/history`, `/agent/journal`, `/agent/support-requests`).
  - No se eliminan ni alteran las funciones de descarga ya operativas de JSON y CSV.
  - No se reemplaza la página de edición de consentimientos detallada ([`ConsentPage.jsx`](../../frontend/src/features/auth/pages/ConsentPage.jsx)); se vincula de manera armónica y contextual.

## 2. Acceptance Criteria and Non-Goals

- **AC-01 (Navegación por Pestañas Segmentadas WAI-ARIA)**: `MyDataPrivacyPage.jsx` organiza el contenido en 3 pestañas (`Salvaguardas & Quién ve qué`, `Mi Registro de Datos`, `Derechos y Trámites`). La barra de navegación implementa `role="tablist"`, `role="tab"` y `role="tabpanel"`, con soporte para navegación por teclado con flechas (`ArrowLeft` / `ArrowRight`) y foco visible.
- **AC-02 (Matriz Pedagógica de Visibilidad y Salvaguardas)**: La primera pestaña presenta una matriz visual clara que explica la distribución de la información del agente en 4 niveles de visibilidad: Nivel 1 (Exclusivo en estación / bitácoras con NLP local), Nivel 2 (Agregado para SST con umbral $k \ge 5$), Nivel 3 (Canal de apoyo confidencial para psicología/SST) y Nivel 4 (Datos corporativos de turno y campaña).
- **AC-03 (Desglose Activo de Consentimientos C1 a C5)**: La vista presenta el estado vigente de las 5 finalidades legales (C1 Check-in, C2 Bitácora, C3 Apoyo, C4 Analítica anónima, C5 Notificaciones) con chips de estado (*Autorizada* / *Revocada*) y un enlace contextual para modificar preferencias en [`ConsentPage.jsx`](../../frontend/src/features/auth/pages/ConsentPage.jsx).
- **AC-04 (Explorador Interactivo de Registros Propios)**: La segunda pestaña sustituye los conteos numéricos planos por un explorador navegable con filtro por tipo (Check-ins, Bitácoras, Solicitudes de apoyo). Cada registro muestra su fecha formateada en horario colombiano, categoría y una acción rápida contextual (ej. enlace para abrir la Bitácora o prellenar el formulario de rectificación).
- **AC-05 (Módulo de Portabilidad y Formulario Guiado de Habeas Data)**: La tercera pestaña integra la descarga de archivos estructurados (JSON y CSV) con explicación humana clara, y un formulario guiado para radicar solicitudes de rectificación o supresión. La supresión se confirma a través de un diálogo seguro que explica qué datos se revisan administrativamente sin bloquear visualmente el resto de la interfaz.
- **AC-06 (Línea de Tiempo y Trazabilidad de Radicados con Plazos de Ley)**: El seguimiento de solicitudes de Habeas Data muestra cada radicado (`HD-2026-xxx`) en una tarjeta o timeline con badge de estado (*Recibida*, *En trámite*, *Respondida*), fecha de radicación, fecha objetivo basada en días hábiles de la Ley 1581 (10 días para consultas, 15 para rectificación/supresión) y nota de respuesta administrativa cuando exista.
- **AC-07 (Quality Gates, 4 Estados y Accesibilidad WCAG AA)**: La vista implementa los 4 estados obligatorios (carga, vacío, error con reintento, protegido). `npm run lint` finaliza con 0 errores y `npm run build` compila limpiamente sin advertencias críticas de empaquetado.

## 3. Domain applicability

| Security & Compliance Control | Required? | Technical Enforcement |
| :--- | :---: | :--- |
| **Does it touch sensitive personal data (PII)?** | SÍ | Registros de salud ocupacional, fatiga y notas de desahogo. Se garantiza el aislamiento estricto por `currentUser.id`. |
| **Does it expose cross-tenant data?** | NO | Cada agente solo accede a sus propios radicados y registros almacenados. |
| **Does it require audit logging?** | SÍ | Las descargas de portabilidad y la radicación de solicitudes de Habeas Data generan eventos de auditoría mediante `pulsoStore.audit()`. |
| **¿Accede o procesa datos sensibles?** | SÍ | Las notas de bitácora y clasificaciones de fatiga son datos de salud y privacidad protegidos por la Ley 1581 de 2012 y normas de SG-SST. |

## 4. Experiencia y límites

- **Estado principal (Con datos)**: Pestañas interactivas, matriz de visibilidad explicativa, explorador navegable de registros y panel de trámites con radicados.
- **Estado vacío**: En el explorador de datos y en la línea de tiempo de radicados, se presentan empty states amables explicando que no hay registros aún, con invitación serena a registrar check-in o informando que no existen solicitudes legales en curso.
- **Estado de carga**: Spinner o indicador textual accesible con `role="status"` ("Cargando tus registros personales...").
- **Estado de error**: Banner accesible con `role="alert"` y botón para reintentar la carga sin desconfigurar la navegación.
- **Accesibilidad**: Navegación por teclado completa entre pestañas, modales con captura de foco y cierre con `Escape`, pares de contraste compatibles con WCAG AA en tokens de color institucional.

## 5. Traceability

| Criterio | Componentes / Funcionalidad | Archivos Afectados | Verificación |
| :--- | :--- | :--- | :--- |
| **AC-01** | Pestañas Segmentadas WAI-ARIA | `MyDataPrivacyPage.jsx`, `agent.css` | Navegación con teclado (`ArrowLeft`/`ArrowRight`), atributos ARIA |
| **AC-02** | Matriz de Visibilidad (4 niveles) | `PrivacyVisibilityMatrix.jsx`, `agent.css` | Render de los 4 niveles de privacidad y salvaguardas $k \ge 5$ |
| **AC-03** | Desglose de Consentimientos C1-C5 | `ConsentSummaryCard.jsx`, `consentContract.jsx` | Verificación de estados C1–C5 y enlace a `/consentimiento` |
| **AC-04** | Explorador de Registros Propios | `AgentRecordsExplorer.jsx`, `useMyDataPrivacy.jsx` | Filtro por tipo de registro y visualización de fechas colombianas |
| **AC-05** | Portabilidad y Trámites Guiados | `HabeasDataActionCenter.jsx`, `SuppressionConfirmModal.jsx` | Descargas JSON/CSV y diálogo de confirmación de supresión |
| **AC-06** | Línea de Tiempo de Radicados | `HabeasRequestsTimeline.jsx`, `myDataPrivacyService.jsx` | Render de radicados, badges semánticos y plazos de días hábiles |
| **AC-07** | Quality Gates y Estados | Monorepo frontend | `npm run lint`, `npm run build` |
