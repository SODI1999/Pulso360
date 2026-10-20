# [TASKS-010] Tareas de Implementación: Rediseño del Canal de Acompañamiento y Chat SST

Fecha: 2026-10-20
Especificación: [`specs/010-010-agent-support-channel-redesign/spec.md`](spec.md)
Plan: [`specs/010-010-agent-support-channel-redesign/plan.md`](plan.md)

---

### Tareas en Orden de Dependencia

- [x] **TASK-01 / AC-05: Generación del nuevo activo fotográfico documental del avatar**
  - **Archivos afectados**: `frontend/public/assets/fotos/bpo-agent-support-dialogue.jpg`, `frontend/public/assets/fotos/bpo-agent-support-dialogue.webp`.
  - **Descripción**: Generado mediante el subagente de diseño fotográfico (`bpo-asset-designer`) una nueva imagen inédita que sitúa a Laura Gómez en una escena auténtica de diálogo preventivo y bienestar en Contact Center con la especialista de SST, sin reutilizar fotos de pausas ni perfil.
  - **Verificación**: Inspección visual del archivo en disco y renderizado sin distorsiones en la cabecera.

- [x] **TASK-02 / AC-01, AC-07: Estructura de navegación por pestañas WAI-ARIA en SupportChannelPage**
  - **Archivos afectados**: [`frontend/src/features/agent/pages/SupportChannelPage.jsx`](../../frontend/src/features/agent/pages/SupportChannelPage.jsx).
  - **Descripción**: Implementada navegación por pestañas accesibles (`role="tablist"`, `role="tab"`, `role="tabpanel"`) para "Mis Casos & Chat SST" y "Nueva Solicitud", con soporte de teclado (`ArrowLeft`, `ArrowRight`, `Home`, `End`), selección inteligente de radicado activo y preservación de la compuerta de consentimiento C3.
  - **Verificación**: Navegación por pestañas y confirmación de estados mediante Chrome DevTools.

- [x] **TASK-03 / AC-03: Componente de trazabilidad institucional SupportTimelineBadge**
  - **Archivos afectados**: `frontend/src/features/agent/components/SupportTimelineBadge.jsx`, [`frontend/src/features/agent/pages/SupportChannelPage.jsx`](../../frontend/src/features/agent/pages/SupportChannelPage.jsx).
  - **Descripción**: Creado componente sobrio que representa las 4 fases del radicado bajo la Resolución 2646 / SG-SST (Radicado emitido → Revisión SST → Orientación activa → Cierre preventivo), erradicando badges flotantes genéricos.
  - **Verificación**: Comprobado renderizado correcto para radicados en gestión, con chat habilitado y cerrados.

- [x] **TASK-04 / AC-02: Desacople y elevación ergonómica de la sala de chat SupportChatCard**
  - **Archivos afectados**: [`frontend/src/features/agent/components/SupportChatCard.jsx`](../../frontend/src/features/agent/components/SupportChatCard.jsx), [`frontend/src/features/agent/pages/SupportChannelPage.jsx`](../../frontend/src/features/agent/pages/SupportChannelPage.jsx).
  - **Descripción**: Desacoplado el chat del acordeón de lista y posicionado en un contenedor de diálogo amplio y dedicado (layout maestro-detalle en escritorio), agregando cabecera con especialista asignado, atajos de teclado (`Enter` / `Shift+Enter`), scroll reactivo e indicadores sutiles de WebSocket.
  - **Verificación**: Envío y recepción de mensajes con atajos de teclado y verificación de entrega.

- [x] **TASK-05 / AC-04: Rediseño ergonómico del formulario SupportRequestForm**
  - **Archivos afectados**: [`frontend/src/features/agent/components/SupportRequestForm.jsx`](../../frontend/src/features/agent/components/SupportRequestForm.jsx).
  - **Descripción**: Reorganizado el formulario con tarjetas de modalidad (Anónima con código de radicado vs. Confidencial con identificación), motivos de consulta BPO en tarjetas seleccionables, tiempos de respuesta estimados y alcance legal frente al CCL (Ley 1010 de 2006).
  - **Verificación**: Radicación de solicitud anónima y confidencial con retroalimentación inmediata.

- [x] **TASK-06 / AC-06: Puente a ruta inmediata de crisis y descompresión somática**
  - **Archivos afectados**: [`frontend/src/features/agent/pages/SupportChannelPage.jsx`](../../frontend/src/features/agent/pages/SupportChannelPage.jsx).
  - **Descripción**: Integrado acceso directo a la Línea 106 de Bogotá y botón interactivo para abrir `SomaticBreathingModal` (respiración 4-2-6) ante situaciones agudas en turno.
  - **Verificación**: Apertura y cierre interactivo del modal de respiración y enlace a `/apoyo-crisis`.

- [x] **TASK-07 / AC-01..AC-07: Estilos de diseño, layout maestro-detalle y responsive**
  - **Archivos afectados**: [`frontend/src/styles/apoyo.css`](../../frontend/src/styles/apoyo.css).
  - **Descripción**: Implementados estilos limpios basados en `tokens.css`, layout maestro-detalle para escritorio, reflow fluido para tablet y móvil, estados de foco y contraste accesible.
  - **Verificación**: Inspección visual en viewport de 1440px y 768px.

- [x] **TASK-08 / AC-07: Ejecución de quality gates y auditoría Delivery Gate**
  - **Archivos afectados**: Repositorio integral.
  - **Descripción**: Ejecutado `npm run lint` (0 errores), `npm run build` (código 0), 55 tests de frontend y 132 tests de backend aprobados, y auditado el resultado frente a los criterios del Delivery Gate de `DESIGN.md`.
  - **Verificación**: Reporte de salida de comandos con código 0 y evaluación del gate visual.
