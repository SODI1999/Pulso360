# Rectificación de chat posterior a la revisión de fase 1

La revisión inicial detectó SQL en el servicio, operaciones sin una transacción común, identidad de cuenta en DTO anónimos y mensajes optimistas sin error visible. El usuario autorizó corregir este recorrido antes de continuar la documentación de fases posteriores. Esta rectificación no declara completo todo el backend.

## Implementación y contratos

- chatRepository concentra las consultas parametrizadas y acepta el cliente de transacción existente. El servicio bloquea primero el radicado y luego la sesión. La activación simultánea reutiliza una sesión activa.
- Activación, envío y cierre confirman datos y auditoría juntos. Un fallo revierte ambos. La auditoría registra identificadores y acción, sin copiar los mensajes.
- El servicio consulta el rol real y estado activo de la cuenta. El agente opera únicamente sobre sus radicados. SST conserva el alcance institucional implementado. Activar y enviar como agente requieren C3 de la política vigente; la lectura histórica autorizada continúa después de revocarlo.
- Una sesión cerrada no admite nuevos mensajes. Un reintento con el mismo clientMsgId y texto devuelve el mensaje existente sin duplicarlo; reutilizar la clave con otro texto produce conflicto. Esta garantía requiere conservar la clave: el frontend lo hace en RAM durante la conversación, no después de recargar la página.
- En modo anónimo los DTO HTTP/socket ocultan nombre e identificador de cuenta del agente, incluidos mensajes históricos y cierre. recipientId se usa internamente para enrutar y se retira antes de emitir/responder. PostgreSQL conserva el vínculo con la cuenta; el contenido puede identificar al autor. No se promete anonimato absoluto.
- El agente solo puede cerrar su radicado; SST puede concluir la sesión dejando el radicado En gestion. Repetir el cierre conserva las notas originales.
- Ambos clientes esperan confirmación por evento o acknowledgement. Ante error, desconexión o timeout mantienen el texto y muestran el fallo. No agregan una entrada optimista ni escriben en mock storage. Reintentar el mismo texto conserva la clave mientras siga montada la conversación.
- El singleton socket se desconecta al logout y repite handshake al cambiar token. La prueba de navegador detectó una conexión SST retenida al entrar como agente; se corrigió este cambio de identidad y se añadió regresión.

Se reutilizaron transaction, AppError, consentRepository, createLog, apiClient, chatService, socketClient y useModalA11y. No se añadieron dependencias, tablas, migraciones, roles ni persistencia alternativa.

## Evidencia automatizada

Backend: npm test, 132 pruebas aprobadas. Los contratos nuevos usan PostgreSQL técnico para concurrencia, titularidad, rol, C3, anonimización, idempotencia, cierre y rollback con fallos inyectados. Las regresiones de transporte usan WebSocket real con servicios controlados.

Frontend: npm test ejecutado dos veces, 48 pruebas aprobadas en ambas después de corregir el cambio de identidad. Prueban confirmación, correlación, error, desconexión, timeout, cancelación y nuevo handshake. npm run lint y npm run build aprobados. La advertencia de tamaño de chunk existente no se interpreta como fallo funcional. Backend: npm test repetido tras actualizar OpenAPI, 132 aprobadas nuevamente. node --check aprobó repositorio, servicio, controlador y socket. git diff --check focalizado no encontró whitespace en los archivos de chat.

## Delivery Gate de DESIGN.md aplicado al chat

| Criterio | Estado y evidencia |
|---|---|
| Tarea y composición | VERIFICADO: agente escribe/consulta su radicado; SST activa, responde y concluye. Se reutilizaron tarjeta y drawer existentes. |
| Proporción y responsive | VERIFICADO: renders a 360, 768 y 1366 px. El encabezado SST comprimido a 360 px se corrigió con wrap; la captura final confirma título, mensajes y controles dentro del panel. |
| Funcionamiento y estados | VERIFICADO: navegador con API, WebSocket y PostgreSQL técnico; activación desde vacío, envío SST/agente, denegación C3 con texto retenido, reintento confirmado, cancelación del modal y cierre de solo lectura. Timeout/desconexión/cancelación de entrega cubiertos por pruebas; carga y deshabilitado inspeccionados. |
| Privacidad, roles y evidencia | VERIFICADO en este alcance: contratos reales comprueban titularidad/rol/C3 y DTO; navegador confirma nombre genérico del agente en SST. El aviso explica el vínculo interno y el riesgo de identificación por texto. |
| Accesibilidad | VERIFICADO parcialmente: nombres accesibles, alert/status y foco; Escape del modal vuelve a Concluir caso. Contraste calculado: texto de privacidad #475569 sobre blanco 7,58:1; error #dc2626 sobre blanco 4,83:1. Se retiró el fondo rojo claro del error porque daba 4,41:1. Reflow estrecho y regla de movimiento reducido revisados. NO VERIFICADO: lector de pantalla, zoom manual y dispositivo físico. |
| Integración técnica | VERIFICADO: pruebas, lint y build indicados arriba. No hay doble persistencia ni mensajes optimistas; el cambio de identidad fuerza nuevo handshake. |

Los fixtures técnicos estaban identificados como Fixture chat y UI-CHAT; su contenido fue inventado exclusivamente para la prueba y no representa datos de bienestar de personas. La captura final del panel cerrado acompaña la entrega. Este gate tiene los límites señalados y no certifica accesibilidad global.

## Límites y siguiente paso

La revocación de cuenta/auth_version en otra petición aún no expulsa inmediatamente las conexiones existentes de sus salas: requiere trabajo específico del ciclo de vida socket en fase 6. La autenticación se revalida en handshake y antes de operar. Los textos libres pueden revelar identidad. No se probó SMTP externo, lector de pantalla ni dispositivo físico.

La documentación de fase 2 puede continuar desde estos contratos y sus pruebas. Mantener la invalidación inmediata de sockets como pendiente explícito y no convertir esta corrección acotada en una certificación del backend completo.

Los servidores de QA se detuvieron y se eliminaron exclusivamente sus fixtures de PostgreSQL técnico. La comprobación final encontró cero cuentas propias restantes. Los registros de auditoría se conservaron. El historial mantiene el límite existente de los últimos 100 mensajes; no se agregó paginación.
