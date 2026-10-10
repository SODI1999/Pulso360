# P10 · Infrastructure / Repositories — Especificación Canónica de Acceso a Datos SQL

## 1. Identificación y Responsabilidad Arquitectónica
* **Paquete Arquitectónico**: `P10 · infrastructure/repositories`
* **Componente C4**: `C07 · Repositorios y persistencia`
* **Motor Relacional**: PostgreSQL 18, esquema canónico unificado de 31 tablas en [`schema.sql`](../../../database/schema.sql) y control estricto de migraciones en [`migrations/`](../../../database/migrations).
* **Patrón de Ejecución**: Consultas SQL nativas con valores externos parametrizados (`$1, $2, ...`) mediante el Pool de conexiones de [`../db.js`](../db.js).
* **Contrato arquitectónico**: El SQL de dominio pertenece a los repositorios. Los servicios deben consumir sus interfaces. chatPersistenceService consume chatRepository y coordina autorización y transacciones sin SQL de dominio.

---

## 2. Matriz: 19 repositorios y un auxiliar transaccional frente a 31 tablas

| Repositorio / Módulo | Tablas de `pulso360_db` Gestionadas | Salvaguarda Principal de Privacidad y Seguridad |
| :--- | :--- | :--- |
| `chatRepository.js` | `usuarios`, `solicitudes_apoyo`, `sesiones_chat_soporte`, `mensajes_chat_soporte` | Locks dentro de la transacción del servicio; DTO y permisos se resuelven en el servicio. |
| `userRepository.js` | `usuarios`, `asignaciones_usuario_equipo`, `equipos`, `campanas`, `solicitudes_habeas_data`, `notificaciones`, `sst_alertas`, `solicitudes_apoyo` | Exclusión sistemática de `contrasena_hash` en lecturas de perfil. Conteo de badges segregado por rol. |
| `userManagementRepository.js` | `usuarios`, `asignaciones_usuario_equipo`, `equipos`, `campanas`, `auditoria_logs` | Creación y actualización atómica en transacción (`BEGIN...COMMIT`) con log de auditoría encadenado. |
| `organizationManagementRepository.js` | `equipos`, `campanas`, `usuarios`, `asignaciones_usuario_equipo`, `auditoria_logs` | Creación atómica con campaña existente, supervisor activo, asignación y auditoría. No comprueba que la campaña esté activa. |
| `scopeRepository.js` | `equipos`, `campanas`, `asignaciones_usuario_equipo` | Verificación de alcance organizacional y jerárquico para supervisores sobre campañas y equipos. |
| `consentRepository.js` | `consentimientos`, `politicas_privacidad`, `auditoria_logs` | Registro inmutable de consentimientos (C1..C5) y trazabilidad atómica mediante `auditedMutation`. |
| `checkinRepository.js` | `daily_checkins`, `auditoria_logs` | Validación de unicidad diaria y registro de mutaciones auditadas para check-in diario. |
| `journalRepository.js` | `bitacoras`, `versiones_lexico`, `auditoria_logs` | Titularidad obligatoria: `usuario_id = $1` en historial y `id = $1 AND usuario_id = $2` en edición/borrado. El servicio autoriza al agente. Control de concurrencia e historial de análisis NLP. |
| `lexiconRepository.js` | `versiones_lexico`, `lexico_activaciones` | Bloqueo por asesoría PostgreSQL (`pg_advisory_xact_lock(360014)`) para activación unívoca de diccionarios. |
| `rulesRepository.js` | `reglas_alerta`, `campanas`, `equipos` | Doble control: propuesta SST (`pending_approval = true`) y aprobación por Admin (`pending_approval = false`). |
| `sstRepository.js` | `sst_alertas`, `reglas_alerta`, `campanas`, `equipos`, `usuarios`, `sst_intervenciones`, `solicitudes_apoyo`, `sesiones_chat_soporte`, `mensajes_chat_soporte`, `auditoria_logs` | Anonimización estricta (`mode = 'anonimo'` suprime solicitante). Transición atómica de alertas e intervenciones con cierre seguro de canales de soporte. |
| `alertJobRepository.js` | `alert_job_state`, `alert_job_runs`, `alert_job_evaluations`, `reglas_alerta`, `equipos`, `campanas`, `sst_alertas`, `auditoria_logs` | Exclusión mutua distribuida (`pg_try_advisory_xact_lock(360021)`), avance de cursor temporal y registro atómico de evaluaciones semanales. |
| `passwordResetRepository.js` | `password_reset_tokens`, `usuarios` | Almacenamiento exclusivo de hash SHA-256 de tokens, expiración a 30 min e incremento de `auth_version` para revocar sesiones previas. |
| `notificationsRepository.js` | `notificaciones` | Consulta y actualización de lectura de avisos in-app filtrados por usuario o rol destinatario. |
| `reportsRepository.js` | `reportes_generados` | Conserva el snapshot y hash entregados por el servicio. El hash permite comprobar integridad; no impide modificar datos por sí solo. |
| `analyticsRepository.js` | `daily_checkins`, `usuarios`, `consentimientos`, `politicas_privacidad`, `asignaciones_usuario_equipo`, `equipos`, `campanas` | **Inviolable: Cumplimiento de $k$-anonimato ($k \ge 5$)**. Verificación de consentimiento C4 activo antes de agregar métricas. |
| `supervisorRepository.js` | `sst_intervenciones`, `campanas`, `sst_alertas`, `seguimientos_intervencion`, `asignaciones_usuario_equipo`, `equipos`, `auditoria_logs` | Gestión de planes asignados a supervisores y registro de seguimientos con actualización automática de estado. |
| `adminRepository.js` | `usuarios`, `equipos`, `campanas`, `asignaciones_usuario_equipo`, `configuracion_sistema`, `politicas_privacidad`, `solicitudes_habeas_data`, `notificaciones` | Administración central: usuarios, campañas, equipos con relevo atómico de supervisión, parámetros globales y derechos ARCO. |
| `auditorRepository.js` | `auditoria_logs`, `usuarios` | Registro inmutable con encadenamiento criptográfico (`prev_hash`, `hash` SHA-256) protegido por advisory lock (`360013`) y verificación de integridad de cadena. |
| `auditedMutation.js` | `auditoria_logs` + tabla mutada | Auxiliar transaccional: ejecuta la operación de persistencia y registra el log de auditoría en la misma transacción atómica. |

---

## 3. Catálogo Funcional Detallado de Repositorios (Interfaces y Métodos Reales)

### Bloque A: Identidad, Usuarios y Estructura Organizacional

#### 1. `userRepository.js`
* `findActiveAssignments(userId)`: Obtiene lista de asignaciones activas del usuario (`asignaciones_usuario_equipo` + `equipos`).
* `findNavigationCounts(userId, role)`: Calcula badges no leídos en navbar (`unread`, `alerts` para SST, `support` para SST, `habeas` para ADMIN).
* `findByEmail(correo)`: Obtiene credenciales y estado de autenticación (incluye `contrasena_hash` y `auth_version`).
* `findProfileById(id)`: Retorna perfil operativo completo con equipo y campaña, excluyendo de forma estricta `contrasena_hash`.
* `findAvailableScopes(userId, role)`: Retorna campañas y equipos visibles según el rol del usuario (ADMIN/SST ven todo activo; SUPERVISOR solo su ámbito asignado).
* `findSupervisors(role)`: Lista supervisores activos con arreglo de `team_ids` asignados (autorizado para ADMIN y SST).
* `registerFailedAttempt(id, maxReached)`: Incrementa `intentos_fallidos` y fija `bloqueado_hasta` a 15 minutos si se alcanza el umbral.
* `resetFailedAttempts(id)`: Restablece `intentos_fallidos = 0` y desbloquea la cuenta.
* `findActiveAssignment(userId)`: Consulta la asignación de equipo activa principal de un usuario.
* `createHabeasDataRequest({ id, userId, type, note })`: Registra solicitud de Habeas Data con plazo configurado en SQL de 15 días y log de auditoría.
* `findHabeasDataRequestsByUser(userId)`: Historial cronológico descendente de solicitudes de Habeas Data del usuario.

#### 2. `userManagementRepository.js`
* `createUserAtomic(data, actorId)`: Inserta usuario en `usuarios`, genera asignación operativa en `asignaciones_usuario_equipo` y emite `auditoria_logs` en una transacción atómica.
* `updateUserAtomic(id, data, actorId)`: Bloquea con `FOR UPDATE`, actualiza rol/estado, reasigna equipo si corresponde y registra log de auditoría en transacción atómica.

#### 3. `organizationManagementRepository.js`
* `createTeamAtomic(data, actorId)`: Valida campaña existente y supervisor activo con `FOR SHARE`, crea equipo en `equipos`, inserta asignación en `asignaciones_usuario_equipo` y emite log de auditoría atómico.

#### 4. `scopeRepository.js`
* `findActiveTeam(id, client = pool)`: Verifica si el equipo existe y está activo, retornando su `campana_id`.
* `campaignExists(id, client = pool)`: Comprueba si la campaña existe y está activa.
* `supervisorAssigned(userId, campanaId, equipoId, client = pool)`: Comprueba asignación activa de tipo `SUPERVISOR` y equipo activo en el ámbito indicado; el rol de la cuenta se autoriza en la capa superior.
* `findLabel(campanaId, equipoId, client = pool)`: Obtiene el nombre descriptivo del equipo o de la campaña solicitada.

---

### Bloque B: Privacidad, Consentimiento y Habeas Data

#### 5. `consentRepository.js`
* `findActiveByUserId(userId)`: Retorna el consentimiento más reciente del usuario junto con la versión de política aceptada y si está vigente.
* `findLatestPublishedPolicy()`: Obtiene la política de privacidad vigente en estado `PUBLICADA`.
* `findHistory(userId)`: Historial completo de eventos de consentimiento del usuario ordenado cronológicamente descendente.
* `createConsentEvent({ id, userId, politicaId, tipoEvento, flags, ipOrigen })`: Inserta evento en `consentimientos` con finalidades C1..C5 y emite log de auditoría atómico (`auditedMutation`).

---

### Bloque C: Bienestar y Desahogo Personal

#### 6. `checkinRepository.js`
* `create({ id, userId, asignacionId, journeyKey, checkinDate, energia, cargaEmocional, recuperacion, apoyo, distanciamiento, ineficacia })`: Inserta check-in diario en `daily_checkins` y genera log auditado.
* `update(id, { energia, cargaEmocional, recuperacion, apoyo, distanciamiento, ineficacia })`: Actualiza dimensiones del check-in y genera log de auditoría.
* `findByUserAndDate(userId, checkinDate)`: Obtiene el check-in registrado por el usuario en una fecha específica (YYYY-MM-DD).
* `findHistoryByUser(userId, limit = 30)`: Historial personal de check-ins del usuario ordenado por fecha descendente.

#### 7. `journalRepository.js` (Inviolable)
* `create({ id, userId, asignacionId, entryDate, context, content })`: Inserta entrada de bitácora privada en `bitacoras` y genera log auditado.
* `findByUserId(userId)`: Historial privado de bitácoras del usuario autenticado. **Inviolable: `WHERE usuario_id = $1`**.
* `delete(id, userId)`: Elimina entrada garantizando propiedad estricta (`WHERE id = $1 AND usuario_id = $2`) con log auditado.
* `update(id, userId, changes)`: Actualización transaccional compleja (`BEGIN...COMMIT`) con `FOR UPDATE`. Controla cambios de contenido, recálculo de hash SHA-256, versionado de análisis NLP previo en `archivedAnalyses`, y correcciones manuales del agente validadas contra `versiones_lexico`.

---

### Bloque D: Motor Léxico y NLP

#### 8. `lexiconRepository.js`
* `findActive(client = pool, lock = false)`: Retorna la versión activa del léxico en `versiones_lexico` (con opción `FOR UPDATE`).
* `list()`: Lista todas las versiones registradas con metadatos de estado y presencia de contenido.
* `lockActivation(client)`: Adquiere el bloqueo por asesoría PostgreSQL `pg_advisory_xact_lock(360014)` para exclusión mutua de activación.
* `findPreviousId(client)`: Obtiene el identificador de la versión previamente activa desde `lexico_activaciones`.
* `findForUpdate(id, client)`: Bloquea una versión de léxico para actualización.
* `activate(id, previousId, actorId, client)`: Marca la versión previa como `OBSOLETA`, activa la nueva (`ESTADO = 'ACTIVA'`) y registra trazabilidad en `lexico_activaciones`.

---

### Bloque E: Prevención, Alertas Tempranas e Intervenciones SST

#### 9. `rulesRepository.js`
* `list()`: Consulta el catálogo completo de reglas de alerta en `reglas_alerta`.
* `scopeExists(scope, client)`: Valida la existencia y estado activo de la campaña o equipo referenciado en el alcance.
* `createProposal({ id, metric, operator, value, persistence, unit, scope, severity, actorId }, client)`: Inserta regla con `pending_approval = TRUE` y `activa = FALSE`.
* `findForUpdate(id, client)`: Bloquea regla con `FOR UPDATE` para proceso de aprobación.
* `approve(id, actorId, client)`: Aprueba regla fijando `pending_approval = FALSE`, `activa = TRUE`, registrando el administrador y fecha.

#### 10. `sstRepository.js`
* `findAlerts(filters = {})`: Consulta alertas en `sst_alertas`. Si `respondents < 5`, protege evidencia y descripción para preservar confidencialidad ($k$-anonimato).
* `findInterventions(filters = {})`: Lista intervenciones SST con seguimientos embebidos en JSON y nombres de responsables.
* `createIntervention(data)`: Inserta un nuevo plan de intervención en `sst_intervenciones`.
* `createInterventionWithAlertTransition(data)`: Transacción atómica: valida ámbitos con `FOR SHARE`, inserta la intervención, transiciona la alerta asociada a `INTERVENIDA` y emite log de auditoría.
* `findSupportRequests()`: Lista solicitudes de apoyo. **Privacidad estricta: Si `mode = 'anonimo'`, el campo solicitante es `NULL`**.
* `findSupportRequestsByUser(userId)`: Historial de solicitudes de apoyo creadas por el usuario autenticado.
* `createSupportRequest(data)`: Registra solicitud en `solicitudes_apoyo` con log de auditoría atómico.
* `updateAlertStatus(alertId, { status, dismissReason }, actorId)`: Actualiza estado de alerta (incluyendo motivo de descarte) y emite log de auditoría.
* `updateSupportRequestStatus(requestId, status, actorId)`: Actualiza estado de radicado. Si pasa a `Cerrada` o `Atendida`, cierra automáticamente cualquier sesión activa en `sesiones_chat_soporte` insertando mensaje final del sistema.

#### 11. `alertJobRepository.js`
* `ready(client = pool)`: Verifica que la tabla `alert_job_state` esté presente en la base de datos.
* `lock(client)`: Intenta adquirir bloqueo por asesoría no bloqueante `pg_try_advisory_xact_lock(360021)`.
* `initializeCursor(periodEnd)`: Inserta estado inicial para `weekly-alerts` si no existe.
* `cursor(client = pool)`: Retorna la fecha de corte del último período evaluado (`last_period_end`).
* `advanceCursor(periodEnd, client)`: Actualiza el cursor `last_period_end` al valor máximo alcanzado.
* `approvedRules(client)`: Consulta reglas activas y aprobadas con bloqueo `FOR SHARE`.
* `scopes(rule, client)`: Resuelve los ámbitos (campañas y equipos activos) aplicables a una regla según su alcance configurado.
* `createRun(id, periodEnd, client)`: Registra inicio de corrida en `alert_job_runs`.
* `recordEvaluation(runId, ruleId, scope, outcome, client)`: Registra resultado de evaluación individual en `alert_job_evaluations`.
* `createAlert({ rule, scope, periodEnd, respondents, values, metadata, description }, client)`: Inserta alerta semanal en `sst_alertas` y emite log de auditoría atómico.
* `completeRun(id, summary, client)`: Actualiza resumen de ejecución y emite log de auditoría.
* `failedRun(id, periodEnd)`: Registra corrida fallida con código de error sin persistir datos sensibles o trazas SQL.

---

### Bloque F: Recuperación, Notificaciones, Reportes y Auditoría

#### 12. `passwordResetRepository.js`
* `findActiveUser(email)`: Busca usuario activo por correo institucional insensible a mayúsculas.
* `createToken(id, userId, tokenHash, client)`: Bloquea usuario con `FOR UPDATE`, invalida tokens previos no consumidos e inserta nuevo token con expiración a 30 minutos.
* `recordDelivery(id, status, client)`: Actualiza estado de entrega del correo (`DELIVERED` o `FAILED`).
* `findEligibleEmail(tokenHash)`: Valida token entregado, no consumido y vigente, retornando correo del usuario activo.
* `lockEligibleUser(tokenHash, client)`: Bloquea secuencialmente al usuario y al token con `FOR UPDATE` para consumo seguro.
* `replacePassword(userId, passwordHash, client)`: Actualiza `contrasena_hash`, incrementa `auth_version`, restablece intentos fallidos y consume el token de recuperación.

#### 13. `notificationsRepository.js`
* `findByUserAndRole(userId, rolCodigo)`: Consulta las 50 notificaciones más recientes para el usuario o su rol institucional.
* `markRead(notificationId, userId, rolCodigo)`: Marca una notificación como leída (`is_read = TRUE`).
* `markAllRead(userId, rolCodigo)`: Marca como leídas todas las notificaciones pendientes del usuario o su rol.

#### 14. `reportsRepository.js`
* `findAll(autorId)`: Lista reportes generados por un autor ordenados por fecha descendente.
* `create({ id, tipoReporte, autorId, campanaId, equipoId, fechaCorte, hashIntegridad, parametrosFiltro, rutaArchivo }, client = pool)`: Registra nuevo reporte con su hash criptográfico SHA-256.
* `findById(id)`: Consulta detalle de un reporte generado por su identificador único.

#### 15. `auditorRepository.js`
* `getLatestId()`: Retorna el identificador máximo actual en `auditoria_logs`.
* `findLogs({ limit, offset, rol, action, startDate, endDate, entidadAfectada, maxId })`: Búsqueda paginada y filtrada con unión a `usuarios`.
* `countLogs({ rol, action, startDate, endDate, entidadAfectada, maxId })`: Conteo total de registros para paginación de auditoría.
* `createLog(event, client)`: Inserta registro inmutable adquiriendo bloqueo `pg_advisory_xact_lock(360013)` y calculando hash SHA-256 encadenado a `prev_hash` (formato versión 2).
* `verifyIntegrity()`: Recorre la cadena completa de auditoría verificando enlaces (`prev_hash`) y coherencia de contenido (`hash`), reportando integridad y discrepancias.

#### 16. `auditedMutation.js`
* `auditedMutation(operation, event)`: Ejecutor transaccional de orden superior: ejecuta la función `operation(client)` y, si produce resultado, registra el log de auditoría mediante `createLog` en la misma transacción (`client`).

---

### Bloque G: Analítica Organizacional ($k$-Anonimato) y Supervisión

#### 17. `analyticsRepository.js`
* `countDistinctParticipants({ campanaId, equipoId, desde, hasta }, client = pool)`: Cuenta participantes únicos reales (`COUNT(DISTINCT d.usuario_id)`) con consentimiento C4 activo sobre la política vigente.
* `getSnapshot(params, client = pool)`: Invoca `getAggregatedAverages` con `includeCohort = true`.
* `getAggregatedAverages({ campanaId, equipoId, desde, hasta, minK = 5, includeCohort = false, activeOnly = false }, client = pool)`: Calcula promedios grupales de las 6 dimensiones operativas aplicando **supresión granular por dimensión si el conteo de personas distintas por dimensión es menor que `minK` (entero mínimo 5)**.

#### 18. `supervisorRepository.js`
* `findAuthorizedIntervention(intervencionId, supervisorId)`: Valida si una intervención pertenece al ámbito asignado al supervisor.
* `findAssignedInterventions(supervisorId)`: Lista intervenciones asignadas al supervisor o pertenecientes a sus equipos y campañas a cargo, agregando seguimientos en JSON.
* `createFollowup({ id, intervencionId, autorId, fecha, progresoReportado, notaAvance, tipoAccion })`: Transacción atómica: inserta seguimiento en `seguimientos_intervencion`, actualiza `progress` y estado en `sst_intervenciones`, y emite log de auditoría.

---

### Bloque H: Administración General

#### 19. `adminRepository.js`
* `findAllUsers()`: Lista general de usuarios con datos de campaña, equipo y asignaciones activas embebidas en JSON.
* `findByEmail(correo)`: Búsqueda de usuario por correo insensible a mayúsculas.
* `findUserByFullName(fullName)`: Búsqueda de usuario por nombre completo.
* `findUserById(id)`: Consulta básica de usuario por identificador.
* `createUser({ id, rolCodigo, correo, contrasenaHash, nombres, apellidos, shiftStartHour })`: Inserta usuario en estado activo.
* `assignUserToTeam({ id, usuarioId, equipoId, tipoAsignacion, fechaInicio })`: Desactiva asignación previa e inserta nueva asignación en transacción atómica.
* `updateUserStatus(id, estado)`: Actualiza estado de cuenta de usuario.
* `findAllCampaignsWithTeams()`: Consulta de campañas con arreglo de equipos y supervisores embebidos en JSON.
* `createCampaign({ id, codigo, nombre, descripcion, activa }, client = pool)`: Inserta nueva campaña.
* `updateCampaign(id, { nombre, activa }, client = pool)`: Actualiza nombre o estado de campaña.
* `createTeam({ id, campanaId, codigo, nombre, descripcion, supervisorNombre, nMiembros })`: Inserta nuevo equipo.
* `updateTeam(id, { nombre, activo, supervisorNombre, nMiembros }, client = pool)`: Actualiza datos y supervisor asignado en equipo.
* `updateTeamWithSupervisorHandover(teamId, { nombre, activo, nMiembros }, supervisorId, supervisorNombre, nuevaAsignacionId, externalClient)`: Transacción atómica: actualiza equipo, desactiva la asignación del supervisor anterior e inserta la asignación para el nuevo supervisor.
* `findSystemParams()`: Consulta claves y valores de `configuracion_sistema`.
* `updateSystemParam(clave, valorJson)`: Actualiza valor de configuración del sistema.
* `findPolicies()`: Lista políticas de privacidad ordenadas por vigencia.
* `createPolicy({ id, version, titulo, textoPolitica, textoAviso, creadoPorId }, client = pool)`: Inserta política calculando hash SHA-256 de contenido y estado `PUBLICADA`.
* `createPolicyNotification(id, version, client)`: Despacha notificación a todos los usuarios con rol `AGENTE` ante nueva política.
* `findHabeasDataRequests()`: Consulta solicitudes ARCO con datos del solicitante y correo.
* `updateHabeasDataStatus(id, status, note, client = pool)`: Actualiza estado y nota de solicitud Habeas Data, fijando fecha de resolución si concluye.
* `findHabeasForUpdate(id, client)`: Bloquea solicitud Habeas Data con `FOR UPDATE`.

---

## 4. Reglas Estrictas de Implementación y Gobernanza en Repositorios
1. **Asincronía Total**: Todas las operaciones de repositorio deben retornar una Promesa (`async/await`).
2. **Consultas Parametrizadas**: Todas las entradas externas van en el array de valores `$1, $2, ...`. Las cláusulas fijas y los índices numéricos internos de marcadores pueden componerse; no se interpolan valores ni identificadores externos. Consultas sin entradas (catálogos, locks o `BEGIN`) no requieren marcadores.
3. **Mapeo Limpio y Predecible**: Conservar los contratos vigentes: búsquedas devuelven una fila o `null`/`undefined` según método; colecciones devuelven arrays. También hay métodos booleanos, conteos y `Promise<void>`. No cambiar un retorno solo para uniformar JSDoc.
4. **Protección de Credenciales**: Excluir sistemáticamente `contrasena_hash` salvo en los métodos explícitos de login (`findByEmail`) o cambio de contraseña (`replacePassword`).
5. **Transaccionalidad Atómica**: La operación auditada debe compartir cliente con `createLog`. Los métodos de bajo nivel con `client` delegan commit/rollback al llamador; no todos escriben auditoría por sí solos. Mutaciones que afecten más de una tabla o que requieran log deben ejecutarse bajo un cliente de transacción (`transaction(async client => ...)` o `client.query('BEGIN')...COMMIT/ROLLBACK`).
6. **Invariante de Bitácora**: Jamás construir una consulta sobre `bitacoras` que carezca de la restricción parametrizada de titularidad (`usuario_id = $1` o `id = $1 AND usuario_id = $2`, según operación).
7. **Invariante de $k$-Anonimato**: En métricas y analítica grupal, no emitir agregaciones ni detalles individuales si el número de participantes es menor a 5 ($k < 5$).


## 5. Cobertura de las 31 tablas del esquema

La matriz siguiente distingue acceso SQL directo de auditoría delegada. `createLog` escribe `auditoria_logs` desde las transacciones de otros módulos. `pulso_migrations` es una tabla adicional de control creada por el migrador, fuera de las 31 de `schema.sql`.

| Tabla | Acceso directo actual |
| :--- | :--- |
| `roles` | Catálogo referenciado por FK; ningún repositorio lo consulta directamente. |
| `campanas` | `adminRepository.js`, `alertJobRepository.js`, `analyticsRepository.js`, `organizationManagementRepository.js`, `rulesRepository.js`, `scopeRepository.js`, `sstRepository.js`, `supervisorRepository.js`, `userManagementRepository.js`, `userRepository.js` |
| `equipos` | `adminRepository.js`, `alertJobRepository.js`, `analyticsRepository.js`, `organizationManagementRepository.js`, `rulesRepository.js`, `scopeRepository.js`, `sstRepository.js`, `supervisorRepository.js`, `userManagementRepository.js`, `userRepository.js` |
| `usuarios` | `chatRepository.js`, `adminRepository.js`, `analyticsRepository.js`, `auditorRepository.js`, `organizationManagementRepository.js`, `passwordResetRepository.js`, `sstRepository.js`, `userManagementRepository.js`, `userRepository.js` |
| `asignaciones_usuario_equipo` | `adminRepository.js`, `analyticsRepository.js`, `organizationManagementRepository.js`, `scopeRepository.js`, `sstRepository.js`, `supervisorRepository.js`, `userManagementRepository.js`, `userRepository.js` |
| `politicas_privacidad` | `adminRepository.js`, `analyticsRepository.js`, `consentRepository.js` |
| `consentimientos` | `analyticsRepository.js`, `consentRepository.js` |
| `daily_checkins` | `analyticsRepository.js`, `checkinRepository.js` |
| `bitacoras` | `journalRepository.js` |
| `versiones_lexico` | `journalRepository.js`, `lexiconRepository.js` |
| `categorias_nlp` | Sin consumidor SQL en los repositorios; el léxico vigente usa contenido JSON. |
| `analisis_nlp` | Sin consumidor SQL en los repositorios; el historial actual usa bitacoras.analysis_json. |
| `revisiones_nlp` | Sin consumidor SQL en los repositorios; correcciones en bitacoras.analysis_json. |
| `reglas_alerta` | `alertJobRepository.js`, `rulesRepository.js`, `sstRepository.js` |
| `sst_alertas` | `alertJobRepository.js`, `sstRepository.js`, `supervisorRepository.js`, `userRepository.js` |
| `sst_intervenciones` | `sstRepository.js`, `supervisorRepository.js` |
| `seguimientos_intervencion` | `sstRepository.js`, `supervisorRepository.js` |
| `solicitudes_apoyo` | `sstRepository.js`, `userRepository.js`, `chatRepository.js`. |
| `seguimientos_apoyo` | Sin consumidor SQL en los repositorios actuales. |
| `solicitudes_habeas_data` | `adminRepository.js`, `userRepository.js` |
| `reportes_generados` | `reportsRepository.js` |
| `notificaciones` | `adminRepository.js`, `notificationsRepository.js`, `userRepository.js` |
| `auditoria_logs` | `auditorRepository.js` |
| `configuracion_sistema` | `adminRepository.js` |
| `sesiones_chat_soporte` | `sstRepository.js`, `chatRepository.js`. |
| `mensajes_chat_soporte` | `sstRepository.js`, `chatRepository.js`. |
| `password_reset_tokens` | `passwordResetRepository.js` |
| `lexico_activaciones` | `lexiconRepository.js` |
| `alert_job_state` | `alertJobRepository.js` |
| `alert_job_runs` | `alertJobRepository.js` |
| `alert_job_evaluations` | `alertJobRepository.js` |

## 6. Límites comprobados de fase 1

- Solo `userRepository.findByEmail` recupera `contrasena_hash` para login; las lecturas de perfil y administración lo excluyen. Escribir un hash en creación/restablecimiento no constituye exposición de credenciales.
- El único repositorio que consulta `bitacoras` es `journalRepository`. Editar y borrar requieren ID y titular; la auditoría registra acción e ID, sin copiar el desahogo.
- La analítica cuenta personas distintas con C4 vigente y suprime por dimensión. Los conteos de `getSnapshot` son metadatos internos; los servicios construyen el DTO público. El repositorio rechaza `minK` inferior a cinco o no entero.
- El modo anónimo de `sstRepository.findSupportRequests` oculta nombre e identidad del solicitante. Los DTO del chat ocultan la identidad de cuenta del agente. Esto no elimina el vínculo en BD ni evita identificación por el texto. Ver [rectificación de chat](chat-review.md).
- La parametrización evita insertar entradas como SQL; no acredita por sí sola autorización ni privacidad. Estas también dependen de servicios, middleware y transporte.
- Evidencia, comandos y pendientes: [revisión de fase 1](phase1-review.md).

## 7. Contrato de chatRepository

Lecturas de actor, radicado, sesión e historial; locks de radicado y sesión; creación de sesión/mensaje; actualización de actividad y estado; cierre y mapa del agente. Los métodos aceptan el cliente de transacción. El servicio usa el orden radicado → sesión y registra auditoría con el mismo cliente. clientMsgId permite confirmar un reintento sin duplicar el mensaje.

Métodos de chat (todos reciben client): findActor(id), lockRequest(id), findReference(id), lockSession(id), findByRequest(requestId, activeOnly), createSession(data), markInProgress(requestId, sstId), findMessages(sessionId), findMessage(id), createMessage(data), touchSession(id), closeSession(data), setRequestStatus(id, status), findAgentMap(agentId). Las búsquedas individuales devuelven fila o undefined, las listas arrays y las actualizaciones sin RETURNING Promise<void>. findMessages limita a los últimos 100 mensajes en orden cronológico; no se incorporó paginación del historial completo.
