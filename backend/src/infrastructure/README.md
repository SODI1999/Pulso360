# P10 · Infrastructure — Acceso a datos y servicios de apoyo

Esta capa contiene cinco módulos de infraestructura, 19 repositorios SQL y un auxiliar transaccional. Usa JavaScript ESM y las dependencias existentes; sus retornos JSDoc reflejan el comportamiento real, incluidos booleanos, conteos y funciones síncronas.

## Componentes y contratos

| Módulo | Responsabilidad y contrato |
| :--- | :--- |
| `db.js` | Pool PostgreSQL, `query(text, params)`, `transaction(operation)` y `testConnection()`. La transacción adquiere cliente dedicado, confirma o revierte y libera el cliente. |
| `jwtConfig.js` | `getJwtSecret()` devuelve el secreto validado: al menos 32 caracteres, rechaza ejemplos públicos y placeholders reconocidos. No genera ni registra secretos. |
| `mailDelivery.js` | `mailDelivery.assertConfigured()` valida SMTP/URL pública; `sendReset(email, token)` espera aceptación del transporte. El transporte inyectado está limitado a NODE_ENV=test. |
| `alertJobConfig.js` | `alertJobEnabled()` habilita únicamente con ALERT_JOB_ENABLED=true. No arranca el scheduler ni acredita migraciones aplicadas. |
| `socket.js` | Handshake HS256 con perfil activo y auth_version vigente. Salas por usuario/rol obtenido de BD. Operaciones de apoyo restringidas a AGENTE/SST y revalidadas en cada evento. |
| `repositories/` | Persistencia SQL y auditoría atómica según [catálogo y mapa de tablas](repositories/README.md). |

## Configuración y operación

Ejecutar desde `backend/`: dotenv carga `.env`; en NODE_ENV=test también `.env.test`. La base de pruebas requiere DB_NAME_TEST distinta de DB_NAME. El runner de contratos además exige un nombre que contenga `test`; varias pruebas requieren la base técnica `pulso360_plan_test_20261005`. No ejecutar fixtures en la base habitual.

El pool usa DB_HOST, DB_PORT, DB_NAME, DB_USER y DB_PASSWORD; en pruebas selecciona DB_NAME_TEST y credenciales DB_TEST_USER/DB_TEST_PASSWORD cuando están configuradas. DB_POOL_MAX, DB_IDLE_TIMEOUT y DB_CONNECTION_TIMEOUT controlan límites. DB_SSL=true habilita TLS; DB_SSL_REJECT_UNAUTHORIZED=false desactiva la validación de certificado y no debe utilizarse como configuración segura de producción. El usuario de API no debe tener privilegios administrativos. Las migraciones no se ejecutan al iniciar el pool.

SMTP usa puerto 465 para TLS directo; los demás requieren STARTTLS, certificado válido y TLS 1.2 como mínimo. El token viaja en el mensaje y nunca debe registrarse. La aceptación SMTP no confirma lectura ni entrega al buzón. Las pruebas utilizan transporte local; no envían correo externo.

## SQL, errores y privacidad

Todos los valores externos en los repositorios se envían mediante parámetros posicionales. Componer una cláusula fija o un índice interno de marcador no equivale a interpolar una entrada. Los catálogos sin filtros y las sentencias de control transaccional no necesitan valores artificiales.

Las lecturas de perfiles no devuelven hashes de contraseña; login sí los necesita internamente. Las consultas de bitácora están restringidas por titular. La analítica aplica C4 vigente y al menos cinco personas distintas por dimensión. Estas reglas se complementan con autorización en servicios y rutas; no convierten todo el sistema en anónimo.

Los errores de consultas se propagan a las capas que formatean respuestas. No registrar desahogos, mensajes de apoyo, tokens ni contraseñas. `testConnection` captura un fallo y devuelve false para el diagnóstico CLI. Socket.IO emite `support:error` con código/mensaje controlado; no entrega errores SQL al cliente.

## Transporte de apoyo

`support:message:send` requiere `sessionId` y texto. Consulta la sesión autorizada, verifica C3 vigente para el agente, persiste y después emite `support:message:received` al titular de BD y a SST. Ignora receiverId, senderName e isAnonymous del payload; conserva clientMsgId para reconciliación. Ante fallo no crea mensajes en memoria ni emite confirmación de guardado.

`support:chat:close` delega la autorización y cierre al servicio y utiliza el titular persistido para emitir `support:chat:ended`. `support:chats:get` publica el catálogo implementado de radicados mediante `support:triage:list`; se eliminaron llamadas a métodos inexistentes y el fallback a un Map vacío. No hay un contrato persistido de marcado de lectura de chats. Los consumidores actuales envían mensajes con sesión y usan los eventos de mensaje/cierre; no consumen el antiguo listado en memoria.

Las cuentas/roles/versiones se comprueban en handshake y antes de operar. No hay un mecanismo de expulsión inmediata de conexiones o salas al revocar una cuenta desde otra petición. El servicio de chat ya usa chatRepository y transacciones. Los DTO anónimos ocultan nombre e ID de cuenta del agente; PostgreSQL conserva el vínculo y el texto puede identificar a su autor. El frontend espera confirmación y conserva el borrador ante error. Ver [contrato y evidencia de chat](repositories/chat-review.md).

## Verificación de fase 1

Desde `backend/` ejecutar `npm run test:db` y `npm test`. No existen scripts lint/build en este package.json. Revisar sintaxis de los módulos y cobertura JSDoc por separado. Las pruebas Socket.IO nuevas usan transporte WebSocket real con servicios/repositorios controlados; los contratos REST usan PostgreSQL técnico. Ver [informe y evidencia](repositories/phase1-review.md) para resultados y límites.
