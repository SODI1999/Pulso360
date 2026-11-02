# Verificación de la deuda027 — corrección de audit-001

Fecha:2026-11-02. Dirección visual: better-interface con sus seis disciplinas, pulso360-ui-craft y antislop. Se conserva el gate único de DESIGN.md. El usuario autorizó ciclo completo y priorizó chat SST; sin commits, despliegues, migraciones ni cambios de datos académicos.

## Resultado revisado

Correcciones implementadas y recorridos observados en Chrome 156.0.8078.74, Windows, Node 24.22.1, Vite 6.4.4 y CLI 0.8.1 (igual al manifest). El bloqueo inicial de render ya no describe esta sesión: por autorización explícita del usuario se utilizó Chrome DevTools con perfil temporal aislado y depuración en loopback. Deska volvió a informar que no tenía ventana disponible durante el último intento; eso no impidió validar por CDP. No se determinó la causa del fallo de Deska.

Sesión de observación:29682fe4-8915-43a9-a8dd-3f8fbb96e69c, render disponible registrado antes de las observaciones. [Registro incremental de39 observaciones](evidence/ui-observations.json). [Reporte visual consolidado](../../anti-slop/audit-004-2026-11-02.md).

Las pruebas de interfaz usan casos MUESTRA-UI y mensajes técnicos simulados. GET/POST y acuses Socket se interceptaron exclusivamente en el navegador de pruebas; no se enviaron mensajes reales ni se concluyeron casos reales. Esto verifica comportamiento del cliente. La suite backend comprueba por separado entrega, autorización y contratos; no se afirma un recorrido E2E entre dos cuentas reales.

## Criterio → evidencia

| Criterio | Evidencia ejecutada/inspeccionada | Resultado y límite |
|---|---|---|
| AC-01 dotación | CampaignCard/OrganizationPage y interface-remediation.test.mjs con organizaciones normalizadas de120/0 integrantes | No infiere publicación por dotación; SSR, no recorrido admin completo |
| AC-02 ámbito | supervisor-filter-loading, supervisor-late-response y supervisor-cache-scope | Selección nativa, encabezado y query coherentes; respuesta tardía no reemplaza ámbito actual |
| AC-03 selección/retorno | agent-native-keyboard y agent-state-loading/error/waiting/closed; borrador por caso | Enter/Espacio, foco al título/disparador y lista sin reselección en cinco estados |
| AC-04 accesibilidad | Árbol AX con3 botones nombrados, aria-current, foco2px; carga/reintento y fallo de envío; contraste efectivo | Teclado y estados observados; sin lector de pantalla ni certificación global |
| AC-05 agente adaptable | agent-layout-320/768/1366; reflow200; vacío, C3 inactiva y otros estados | Sin overflow de página; navegación horizontal del shell conserva su patrón existente |
| AC-06 lectura de chat | agent/sst-scroll-incoming y envíos confirmados; error/reintento | Posición conservada, aviso explícito, final tras envío confirmado; transporte local interceptado |
| AC-07 mensajes fieles | useAuditLog/AuditLogTable, AgentDashboardPage, SstDashboardPage y ambos chats; SSR | Integridad pendiente, canal abierto sin presencia, umbral real y sin garantías institucionales absolutas |
| AC-08 auditoría | auditDisplay.js + tests de Bogotá, medianocheUTC, segundos, inválidos y acciones desconocidas; tabla SSR | Fecha/código originales conservados en detalle por inspección; apertura/copia de inspector no recorrida |
| AC-09 preservación y gates | Scripts finales de tabla inferior; revisión independiente de fuentes; verificación CLI enlazada en verification.json | Alcance finito, sin afirmar ausencia universal de regresiones |
| AC-10 SST completo | Cancelar/reabrir con borrador, activación, carga/error, envío/error, cierre/error/pendiente/confirmado | Un diálogo; foco recuperado, notas retenidas y solo lectura después del acuse de muestra |
| AC-11 SST adaptable | sst-layout-320/768/1366, reflow200, contexto, historial largo, estados, contraste y movimiento | Acciones alcanzables; mediciones y capturas; sin móvil físico |
| AC-12 datos ausentes/estado | Normalizadores y SSR; sst-activate-missing-data, closed y estado C3 | Urgencia/plazo ausentes explícitos; compositor solo para sesión activa |

Las observaciones completas, fechasUTC, pasos, esperado/actual, viewport y archivos locales se vinculan por criterio en [acceptance.json](acceptance.json). Los resultados automatizados quedan vinculados al código por el CLI en verification.json después de ejecutar verify 027; complete requiere esa verificación sin cambios posteriores de fuentes o aceptación.

## Capturas finales

| Superficie | 320 CSS px | 768 CSS px | 1366 CSS px |
|---|---|---|---|
| Chat SST | [SST320](evidence/sst-final-320.png) | [SST768](evidence/sst-final-768.png) | [SST1366](evidence/sst-final-1366.png) |
| Agente | [Agente320](evidence/agent-final-320.png) | [Agente768](evidence/agent-final-768.png) | [Agente1366](evidence/agent-final-1366.png) |

[Error de cierre con foco](evidence/sst-final-close-error.png), [borrador SST al reabrir](evidence/sst-final-draft-reopen.png), [error de envío](evidence/sst-final-send-error.png), [foco de radicado](evidence/agent-final-list-focus.png), [C3 inactiva](evidence/agent-final-protected.png), [supervisor con consulta pendiente](evidence/supervisor-final-loading.png).

El200% se comprobó como reflow equivalente: ventana1366×768 representada mediante viewportCSS683×384 y DPR 2. Se midió scrollWidth y se alcanzó Enviar con Tab. No se accionó el menú de zoom nativo. [SST](evidence/sst-final-zoom.png), [agente](evidence/agent-final-zoom.png).

## Comprobaciones finales ejecutadas directamente

| Comando | Inicio → finUTC | Exit | Evidencia |
|---|---|---|---|
| npm test (backend) | 2026-11-02T14:29:09.4656650Z → 2026-11-02T14:29:36.3374405Z | 0 | [metadatos](evidence/final-backend-test.json), [salida](evidence/final-backend-test.log) |
| npm test (frontend) | 2026-11-02T14:29:09.4686615Z → 2026-11-02T14:29:13.3881369Z | 0 | [metadatos](evidence/final-frontend-test.json), [salida](evidence/final-frontend-test.log) |
| npm run lint (frontend) | 2026-11-02T14:29:09.4796626Z → 2026-11-02T14:29:19.1136942Z | 0 | [metadatos](evidence/final-frontend-lint.json), [salida](evidence/final-frontend-lint.log) |
| npm run build (frontend) | 2026-11-02T14:29:09.5058591Z → 2026-11-02T14:29:17.4139543Z | 0 | [metadatos](evidence/final-frontend-build.json), [salida](evidence/final-frontend-build.log) |

Backend132/132 (44 suites,25983.308ms); frontend50/50 (3179.1681ms); lint sin errores; build2228 módulos, JS950.10kB/gzip265.55kB. El build conserva advertencia de chunk>500kB; no se silenció ni se interpreta como fallo. PowerShell representó stderr como NativeCommandError; exit real0 y build completado. git diff --check:exit0, advertencias de normalización LF/CRLF.

El pase CLI posterior repite los cuatro gates revisados para vincularlos a la huella de implementación y aceptación; su resultado autoritativo lo genera verification.json. No se edita ese archivo a mano.

## Contraste y accesibilidad observados

Colores efectivos calculados en navegador a partir de color y primer fondo opaco de ancestros, sin transparencias en los pares medidos:

| Aplicación | Frente / fondo | Ratio |
|---|---|---|
| Texto/compositor | #0f172a / #ffffff |17.85:1|
| Nota de privacidad | #475569 / #ffffff |7.58:1|
| Canal abierto | #0f766e / #ecfdf5 |5.20:1|
| Hora recibida | #64748b / #ffffff |4.76:1|
| Texto saliente y foco interior de Enviar | #ffffff / #0f766e |5.47:1|

Tab/Shift+Tab, Enter/Espacio, Escape, resumen nativo, trap de foco, C3 inactiva y prefers-reduced-motion observados. No se probó lector de pantalla, teclado virtual real ni otros motores de navegador. El conjunto no certifica WCAG global.

## Cambios y reutilización

- Admin: CampaignCard y OrganizationPage distinguen integrantes de publicación de métricas.
- Supervisor: TeamDashboardPage y useSupervisorMetrics usan ámbito común, caché por consulta y descarte de resultados tardíos.
- Agente: SupportChannelPage y SupportChatCard usan selección explícita, botones nativos, retorno/foco en todos los estados, borradores en RAM y compositor activo solo cuando corresponde.
- SST: SupportInboxPage, SstRequestChatDrawer, nuevo SstChatCloseForm y supportCasePresentation conservan servicios, estados de cierre y datos ausentes; un diálogo con confirmación alternativa y errores recuperables.
- Compartido: useChatScroll y support-chat.css reúnen lectura/aviso y presentación, sin dependencia entre features. useLayoutEffect evita perder el final al confirmar; ResizeObserver sostiene el final al redimensionar.
- Auditor: auditDisplay, AuditLogTable, useAuditLog y auditor.css mejoran acciones/fechas y no afirman integridad sin comprobar. AgentDashboardPage y SstDashboardPage corrigen afirmaciones.

Se reutilizaron chatService, useChatDelivery, Socket.IO, auth, consultas, useModalA11y, useBodyScrollLock, tokens e Icon. Sin dependencias nuevas, cambios de permisos, motorNLP o persistencia. Los borradores no sobreviven salir de ruta/recargar; ese alcance se conserva.

## Historia y revisión independiente

Los reportes [audit-002](../../anti-slop/audit-002-2026-11-02.md) y [audit-003](../../anti-slop/audit-003-2026-11-02.md), logs anteriores y capturas sst-cdp-* son evidencia fechada. Sus bloqueos de navegador y capturas antes de corrección no describen el estado final. Se conservan para trazabilidad.

omni-auditor revisó fuentes y coherencia sin ejecutar navegador: no encontró nuevas regresiones de privacidad o contratos; señaló foco tras fallo de envío y esperado de carga demasiado amplio. El primero se reprodujo/corrigió/revalidó en ambos chats; el segundo se acotó al resultado observado. Auditoría documental no equivale a observación visual.
