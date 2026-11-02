# [MIGRATION-027] Corrección incremental de interfaz

## Estrategia y contratos

1. Corregir representación de dotación, ámbito del supervisor, mensajes comprobables, umbral SST y lectura de auditoría.
2. Corregir selección/retorno y semántica antes de modificar composición. Selección explícita por radicado; ninguna activación de chat debe arrebatar la selección actual. Retorno visible incluso sin sesión. Mantener borradores separados por radicado en memoria de la página mientras está montada; no hay persistencia entre rutas y se conserva la limpieza por desmontaje al salir.
3. Acompañamiento local: escritorio con lista y conversación; móvil con una superficie principal por vez. Mantener SST como panel lateral. Simplificar cabecera que retrasa la tarea; conservar solicitud, historial y acceso a apoyo inmediato.
4. Controlar scroll mediante posición del lector y último mensaje; envío propio confirmado lleva al final, recepción fuera del final ofrece aviso. Reutilizar un hook de core si representa la misma responsabilidad en ambos chats; no mover reglas de rol a ese hook.
5. SST prioritario: conservar el panel lateral de trabajo por caso y sus servicios. Cambiar confirmación anidada por una vista alternativa dentro del mismo diálogo, manteniendo conversación montada/oculta para conservar lectura. Reutilizar useModalA11y en la superficie activa y useBodyScrollLock. Extraer el formulario de cierre a SstChatCloseForm para semántica nativa y revisión independiente. La confirmación mantiene los dos estados de dominio existentes; no cierra el radicado al cerrar el panel. Contexto completo con wrapping y metadatos ausentes explícitos; carga/error/sin canal y lectura cerrada tienen acciones precisas. Compositor con etiqueta visible y protección contra envío durante composición IME. Borradores SST por id en memoria del buzón; error de refresco no desmonta la conversación ya cargada.

Dirección better: herramienta de apoyo sobria, jerarquía por tarea y espacio, tipografía/tokens existentes, controles nativos, foco visible y ninguna animación nueva. Se conserva identidad; no se agregan fuentes, radios ni paletas. Referencias: DESIGN.md, conversación y drawer SST existentes; auditoría histórica como evidencia limitada.

Archivos: CampaignCard y consumidor OrganizationPage; TeamDashboardPage y useSupervisorMetrics (evitar resultados retenidos bajo el nuevo ámbito); SupportChannelPage, SupportChatCard, apoyo.css; SstRequestChatDrawer y su CSS; useChatScroll y support-chat.css como responsabilidad compartida; useAuditLog, AuditLogTable y auditDisplay; AgentDashboardPage; SstDashboardPage; tests focalizados. APIs/backend y persistencia: sin cambios. Recovery/latencia/errores existentes se conservan.

Estados: lista vacía conserva crear solicitud; carga/error permiten volver/reintentar; espera identifica radicado y no promete presencia; chat cerrado conserva historial y bloquea envío; historial largo mantiene lectura; protección colectiva continúa en paneles. No se añade spinner a lectura síncrona.

## Verificación y recuperación

Checks configurados: backend npm test; frontend npm test, npm run lint y npm run build. Pruebas focalizadas de lógica y render SSR para representación de datos y ramas de interfaz; no equivalen a navegador. El render real, teclado, foco, 320/768/1366, zoom, contraste efectivo, movimiento reducido y chat activo se registrarán solo si se pueden observar.

El bloqueo inicial de navegador fue resuelto mediante Chrome DevTools autorizado por el usuario. Se ejecutó render/interacción real con datos técnicos de muestra, sin sustituirlo por SSR. Las observaciones y límites se registran en verification.md; complete requiere verify y todos los criterios respaldados.

Recuperación: revertir únicamente los cambios de esta spec; sin migración ni alteración de datos. Observabilidad: errores de carga/envío ya visibles; aviso de mensajes nuevos para lectura (AC-06); sin logs sensibles ni nueva telemetría.
