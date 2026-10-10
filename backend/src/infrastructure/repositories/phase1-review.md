# Revisión y rectificación de fase 1 — 2026-10-09

## Dictamen y alcance

**Fase 1 revisada y corregida, con validaciones satisfactorias y límites explícitos.** La marca original «COMPLETADA (100%)» no era una descripción sustentada: omitía documentación de funciones, un error de ejecución administrativo y rutas de socket sin sesión persistida. Este cierre acredita el saneamiento/documentación del alcance inspeccionado, no la conformidad total del backend ni las fases 2–6.

Se contrastó el plan externo `backend_bottom_up_plan.md` con `backend/CODING_STANDARDS.md`, el contrato raíz y el código actual. El plan se trató como criterio de revisión, sin ejecutar sus fases posteriores ni sus instrucciones internas de aprobación. Se conservaron las modificaciones preexistentes de fase 0/1. No se modificó el archivo de Downloads, el esquema, migraciones, credenciales, contratos REST ni dependencias.

Inventario comprobado: **5 utilidades de infraestructura + 18 repositorios + 1 auxiliar transaccional = 24 módulos JavaScript**. Hay **119 funciones exportadas**, incluidos los métodos de objetos exportados. `schema.sql` define **31 tablas**; `pulso_migrations` es control adicional del migrador. El plan enumera 19 archivos en repositories aunque dice 20; `auditedMutation` es un auxiliar, no un vigésimo repositorio.

## Hallazgos y cierre

| Hallazgo | Evidencia y perjuicio | Corrección / comprobación |
| :--- | :--- | :--- |
| Variable client inexistente | `adminRepository.findUserById`: la selección de supervisor por ID podía fallar con ReferenceError. La suite previa no cubría la llamada. | Consulta con el pool; regresión con ID malicioso confirma uso de `$1` y valores separados. |
| JSDoc incompleto | 17 funciones administrativas sin parámetros/retornos; faltaban contratos de métodos SMTP y retornos void de emisores. | Documentación completada; revisión AST de las 119 funciones, sintaxis y reglas no-undef/no-unreachable sin hallazgos. |
| Inventario/SDD inexactos | Número de repositorios incorrecto, cinco utilidades no descritas, matriz sin las tablas sin consumidor y garantías absolutas no demostradas. | READMEs sincronizados; matriz inversa de las 31 tablas, auditoría delegada y SQL del chat fuera de repositorios identificados. |
| Mensajes socket sin persistencia | `support:message:send` generaba un mensaje en memoria al faltar sessionId; dependía de receiverId del payload y no comprobaba titularidad antes de guardar. | Exige sesión, rol AGENTE/SST, acceso por servicio y C3 vigente del agente. Destinatario, nombre y modo provienen de perfil/sesión, no del payload. Solo emite tras guardar. |
| JWT y cuenta en socket | El handshake verificaba firma sin consultar estado/auth_version de cuenta. | Consulta perfil vigente en handshake y antes de operar. Regresiones de revocación en ambos momentos. |
| Fallback y errores ocultos | El socket llamaba dos métodos inexistentes y retornaba un Map vacío; ocultaba fallos de envío/cierre. | Eliminados Map y llamadas inexistentes. Triage usa el catálogo existente. Errores controlados en support:error, sin texto SQL; regresión de rechazo de persistencia. |
| Umbral k reducible | `getAggregatedAverages` aceptaba minK inferior a cinco pese a su invariante documentado. | Rechaza valores no enteros o menores de cinco antes de consultar. Regresión comprueba supresión granular por personas distintas. |
| Descripciones que no reflejaban implementación | Bitácora exigía literalmente `$1`; creación de equipos decía validar campaña activa; check-in decía validar dimensiones en el repositorio. | Documenta titularidad en ambos órdenes reales, campaña existente y validación de dimensiones en dominio/servicio. No cambia esos contratos. |

## Criterios de fase 1

| Criterio | Estado | Evidencia y límite |
| :--- | :--- | :--- |
| Entradas externas parametrizadas en repositorios | VERIFICADO | Inspección de los 19 archivos SQL/auxiliar. Construcción dinámica de filtros solo con cláusulas fijas e índices internos; valores en arrays. Catálogos y control transaccional sin entradas no necesitan parámetros. |
| Bitácora restringida al titular | VERIFICADO | Historial: usuario_id=$1. Selección bloqueada, actualización y borrado: id=$1 AND usuario_id=$2. Solo journalRepository consulta bitacoras; auditoría sin contenido privado. Suite de agente conserva las pruebas de acceso ajeno. |
| Exclusión de contrasena_hash en lecturas públicas | VERIFICADO | Perfiles y administración usan columnas explícitas. La lectura de login recupera el hash internamente; crear o reemplazar contraseña escribe el hash sin devolverlo al cliente. |
| C4 vigente y k por dimensión | VERIFICADO | SQL cuenta DISTINCT usuario_id y consulta última política/consentimiento. Supresión por dimensión y mínimo no reducible; contratos y regresión focalizada. No certifica todos los DTO futuros. |
| JSDoc de funciones exportadas | VERIFICADO | Revisión AST de 119 funciones en 24 módulos: bloques con retorno y parámetros cuando hay argumentos. Revisión manual de firmas y responsabilidad. No equivale a inferencia IDE verificada. |
| Mapa de 31 tablas | VERIFICADO | Matriz inversa en README de repositorios incluye cinco tablas sin consumidor directo y la persistencia del chat aún ubicada en aplicación. No se inventan repositorios para completar el número del plan. |
| Contratos REST conservados | VERIFICADO | Suite de 123 tests, incluida validación OpenAPI y contratos con PostgreSQL técnico. Sin cambios de rutas, payloads o OpenAPI. |
| Transporte socket endurecido | VERIFICADO | WebSocket real en las ocho regresiones nuevas con dependencias controladas. No es una prueba E2E de Socket.IO + PostgreSQL + navegador. |
| Hover/inferencia en VS Code y arranque manual dev | NO VERIFICADO | No se abrió el IDE ni se dejó un servidor de desarrollo adicional. La suite inicia transporte HTTP/socket y la conexión DB se probó por script. |

## Validación ejecutada

- `npm test` inicial: **115 tests aprobados** con el estado recibido; demuestra la falta de cobertura del fallo administrativo y del transporte socket.
- `npm test` después de agregar regresiones: **123 tests aprobados**, cero fallos/cancelados/omitidos. Repetido tras la última corrección del socket para el cierre.
- `npm run test:db`: conexión de solo lectura satisfactoria a la base local habitual; la suite de escritura utiliza únicamente la base técnica configurada por el runner.
- Inspección AST con Espree y comprobación ESLint focalizada (`no-undef`, `no-unreachable`) usando herramientas ya instaladas: **24 módulos, 119 funciones exportadas, cero hallazgos**. Esto no es un script npm lint del backend ni una comprobación TypeScript.
- `git diff --check`: detectó whitespace preexistente en `backend/database/README.md:59`, fuera de este alcance. Los archivos de este trabajo se comprueban por separado.
  La comprobación focalizada de infraestructura, README global y regresiones terminó sin errores de whitespace.

El sandbox bloqueó inicialmente conexiones a localhost con EACCES; los scripts se reejecutaron con autorización de ejecución local. Esa primera ejecución fallida no se contó como validación aprobada. No se aplicaron migraciones ni se restauraron semillas. El backend no ofrece scripts npm lint/build; no se declararon como ejecutados. No hubo cambios frontend, por lo que no se ejecutó su gate visual.

## Archivos de esta rectificación y reutilización

- `adminRepository.js`: fallo de pool y 17 contratos JSDoc.
- `analyticsRepository.js`: parámetro client documentado, IDs de ámbito string y mínimo de privacidad protegido.
- `checkinRepository.js`, `journalRepository.js`, `auditorRepository.js`: descripción/retornos corregidos y comentarios duplicados eliminados.
- `mailDelivery.js`: contratos completos de comprobación/envío/transporte de pruebas.
- `socket.js`: autentica con perfil, delega acceso/persistencia y elimina mensajes sin sesión/fallback en memoria.
- `test/contracts/infrastructure-phase1.test.js`: ocho regresiones de infraestructura/transporte.
- READMEs de infraestructura/repositorios, este informe y enlace en `backend/README.md`.

Se reutilizaron pool, userRepository, consentRepository, sstRepository, chatPersistenceService, AppError y la suite de contratos. No se añadió una segunda persistencia, un repositorio ficticio, una biblioteca o una nueva arquitectura. Las comprobaciones de configuración JWT/SMTP y la persistencia/auditoría existente se conservaron.

## Pendientes para fases posteriores

1. **Fase 3 — chatPersistenceService**: contiene SQL fuera de repositorios; saveMessage no comprueba por sí mismo rol/titularidad, y operaciones de activación/envío/cierre usan varias consultas sin una única transacción. El socket ahora comprueba acceso antes de invocarlo, pero eso no sanea el servicio ni sus otros consumidores. Revisar carreras y autorización al migrarlo.
2. **Privacidad del chat**: DTO y mensajes actuales conservan IDs internos aun cuando mode es anonimo. No prometer anonimato de identidad por ocultar el nombre en la lista SST. Resolver el contrato completo con sus consumidores en una tarea autorizada de chat; esta revisión no certifica anonimato extremo a extremo.
3. **Frontend**: las tarjetas actuales no manejan support:error; los fallos no producen confirmación de guardado, pero una entrada optimista podría continuar visible. Integrar el estado fallido/reintento en el trabajo de esa interacción.
4. **Ciclo de vida socket (fase 6)**: los cambios de cuenta se detectan en handshake/operaciones, sin expulsión inmediata de salas al revocar la cuenta desde otra petición. Revisar invalidación de conexiones y cierre ordenado al completar esa fase.
5. **Evidencia externa**: quedan sin comprobar SMTP real, inferencia de IDE, arranque manual dev y recorridos navegador. No se requieren para interpretar las pruebas automatizadas como satisfactorias, pero limitan la afirmación de «100%» del plan.

No se ejecutaron fases posteriores. Estos pendientes deben permanecer visibles al actualizar el plan externo; la fase 1 no autoriza declarar completo o seguro el backend en su conjunto.

## Seguimiento posterior autorizado

Los pendientes 1–3 describen el estado de la revisión inicial. Fueron abordados posteriormente en la [rectificación de chat](chat-review.md), con evidencia independiente. La invalidación inmediata de sockets continúa abierta; no se declaran completas las fases posteriores.
