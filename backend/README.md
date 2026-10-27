# Pulso360 — Backend (API REST & Persistencia PostgreSQL)

Servicio de backend para la plataforma Pulso360, desarrollado en **Node.js (v20 LTS / v22), Express 5 y PostgreSQL 17/18**. Implementa una arquitectura en capas limpia alineada con los requisitos funcionales del **Proyecto Pedagógico Integrador (PPI)** y los diagramas C4/Paquetes de la materia de **Diseño de Sistemas**.

> **Diagramas de Ingeniería:** Para consultar los diagramas de Arquitectura C4, Clases, Componentes, Flujos, Casos de Uso y Modelo Relacional Físico, consulta el [Compendio Maestro de Diagramas](../docs/DIAGRAMAS.md).

> **Metodología**: Spec-Driven Development (SDD). Cada paquete y capa cuenta con su contrato `.md` predefinido antes de su implementación en código.

---

## 1. Stack Tecnológico Oficial

### Configuración segura local

`JWT_SECRET` debe ser una clave aleatoria exclusiva de al menos 32 caracteres; el ejemplo queda vacío y no se admite el antiguo valor público. Se puede generar con `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` y guardar solo en `.env` ignorado. Rotar la clave y reiniciar la API invalida las firmas de sesiones previas. No publicar la salida del generador ni credenciales.

La API carga únicamente `.env` con `DB_USER`/`DB_PASSWORD` sin superusuario ni DDL. Migraciones cargan además `.env.maintenance` con `DB_MIGRATION_USER`/`DB_MIGRATION_PASSWORD`; las pruebas cargan `.env.test` con `DB_TEST_USER`/`DB_TEST_PASSWORD` exclusivamente en `DB_NAME_TEST`. Ambos archivos están ignorados y no deben copiarse a la configuración de ejecución de la API. La suite genera un secreto JWT efímero y necesita un propietario técnico del esquema para sus disparadores de rollback.

En una instalación local ya migrada que todavía utiliza un usuario privilegiado, `node database/provision-local-app.js --database NOMBRE` crea el rol nuevo `pulso360_app`, otorga CRUD en tablas de dominio y lectura de migraciones, rota JWT y actualiza el `.env` local conservando credenciales de mantenimiento/prueba. Exige localhost, nombre coincidente y ausencia de ese rol; no se ejecuta automáticamente ni reinicializa datos. Después reiniciar la API. No repetirlo sobre un rol existente ni utilizarlo en un servidor remoto. Tablas nuevas de migraciones requieren otorgar permisos de dominio al usuario API con la cuenta de mantenimiento.

El 2026-10-06 esta operación se ejecutó sobre `pulso360_db` local como parte de las correcciones autorizadas. No aplica a otros destinos. Las credenciales de mantenimiento siguen siendo sensibles y no deben distribuirse con el frontend ni copiarse en informes.

* **Entorno de Ejecución**: Node.js 20 LTS o Node.js 22 (probado y compatible con Módulos ECMAScript, `"type": "module"`). Las pruebas utilizan `--test-force-exit` y desarrollo usa `node --watch`.
* **Framework Web**: Express.js 5 (`express.Router()`).
* **Base de Datos**: PostgreSQL 17 / 18 (PostgreSQL 17 en Docker Compose y soporte verificado en PostgreSQL 18 con consultas SQL nativas parametrizadas).
* **Driver de BD**: `pg` (node-postgres) con Pool de conexiones persistente.
* **Seguridad y Criptografía**:
  * Autenticación basada en JSON Web Tokens (`jsonwebtoken`).
  * Hasheo de contraseñas con `bcryptjs` (cost factor = 10).
* **Políticas de Red**: CORS configurado para origen de desarrollo Vite (`http://localhost:5173`).

---

## 2. Estructura del Repositorio y Mapeo de Arquitectura

El directorio `backend/` sigue de manera estricta el diseño de paquetes (`P05` a `P11`) y componentes (`C02` a `C14`):

```text
backend/
├── database/                    # [P11 · persistence / C08] Esquema relacional DDL e inicialización
│   ├── README.md                # Especificación SDD del modelo relacional (ERD)
│   ├── schema.sql               # Esquema base; completar con migraciones incrementales
│   └── seed.sql                 # Datos de prueba con los 5 usuarios demo (hashes bcrypt)
├── src/
│   ├── interfaces/              # [P05 · interfaces/http / C02] Capa de transporte y HTTP
│   │   ├── README.md            # Especificación SDD de endpoints REST y códigos HTTP
│   │   ├── routes/              # Definición de rutas con Express Router
│   │   └── controllers/         # Controladores HTTP (parseo req/res, sin SQL ni lógica)
│   ├── middlewares/             # [P06 · middleware / C03] Filtros de seguridad y control
│   │   ├── README.md            # Especificación SDD de autenticación, RBAC y consentimiento
│   │   └── authMiddleware.js    # authenticate y requireRole; JWT y roles
│   ├── domain/                  # [P08 · domain] Invariantes puros de negocio y ética
│   │   ├── README.md            # Especificación de privacidad (bitácora aislada, k >= 5)
│   │   └── privacyRules.js      # Lógica de validación de k-anonimato y dimensiones
│   ├── application/             # [P07 · application / C04 y C05] Casos de uso
│   │   ├── README.md            # Especificación SDD de servicios y reglas de negocio
│   │   ├── services/            # Login, registros propios, SST, reportes y otros casos de uso
│   │   └── errors/AppError.js   # Error de aplicación con código y estado HTTP
│   ├── infrastructure/          # [P10 · infrastructure / C07] Acceso a BD y utilidades
│   │   ├── README.md            # Especificación SDD del pool de conexiones y repositorios
│   │   ├── db.js                # Instancia y exportación del Pool de conexiones de `pg`
│   │   └── repositories/        # Consultas SQL nativas parametrizadas ($1, $2...)
│   │       ├── README.md
│   │       ├── userRepository.js
│   │       ├── checkinRepository.js
│   │       ├── journalRepository.js
│   │       └── sstRepository.js
│   ├── jobs/                    # [P09 · jobs / C06 y C12] Tareas en segundo plano
│   │   └── README.md            # Especificación de análisis léxico y planificador
│   └── index.js                 # Punto de entrada de la aplicación Express y healthcheck
├── .env                         # Variables de entorno locales
├── package.json                 # Dependencias y scripts de ejecución
└── README.md                    # Esta guía
```

---

## 3. Puesta en Marcha

### Prerrequisitos
* PostgreSQL 18 instalado y corriendo localmente en el puerto `5432`.
* Node.js 22.19 o posterior de la rama 22 y npm instalados.

### 1. Variables de Entorno (`.env`)
Asegúrate de que el archivo `.env` en la raíz de `backend/` contenga:

```env
PORT=3000
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=pulso360_db
DB_USER=pulso360_app
DB_PASSWORD=

JWT_SECRET=
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173
```

Los valores vacíos requieren credenciales locales propias y el secreto aleatorio descrito arriba; esta plantilla no permite iniciar la API sin completarlos. No utilizar cuentas de superusuario en la ejecución normal. Para una instalación nueva, el administrador crea la base/esquema con su cuenta de mantenimiento y provisiona el rol de aplicación antes de arrancar la API.

### 2. Inicialización de Base de Datos (Si se requiere recrear)
La actualización de los contratos C01–C25 utiliza las migraciones incrementales de la sección 6. No ejecutar `schema.sql` ni `seed.sql` sobre una base con datos para aplicar esta actualización.
Para cargar el esquema DDL y los datos demo en PostgreSQL:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h 127.0.0.1 -d pulso360_db -f database/schema.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h 127.0.0.1 -d pulso360_db -f database/seed.sql
```

### 3. Comprobar Conexión con PostgreSQL
```bash
npm run test:db
```

### 4. Iniciar el Servidor en Desarrollo
```bash
npm run dev
```
El servidor arrancará en `http://localhost:3000` y reportará el estado de conexión de PostgreSQL.

---

## 4. Usuarios Demo Pre-cargados en la Semilla

Todos los usuarios de demostración tienen configurada la contraseña universal: **`Pulso360#2026`**.

| Correo | Rol | Nombre | Campaña / Equipo |
| :--- | :--- | :--- | :--- |
| `agente@pulso360.co` | `agente` | Laura Gómez | Campaña Soporte Alpha / Equipo Alpha 1 |
| `supervisor@pulso360.co` | `supervisor` | Carlos Mendoza | Campaña Soporte Alpha / Equipo Alpha 1 |
| `sst@pulso360.co` | `sst` | Patricia Silva | Seguridad y Salud en el Trabajo |
| `auditor@pulso360.co` | `auditor` | Marcos Rivas | Auditoría y Cumplimiento |
| `admin@pulso360.co` | `admin` | Admin Pulso360 | Administración General |

---

## 5. Directrices Inviolables para Agentes de Desarrollo

Revisión de infraestructura (fase 1, 2026-10-09): inventario real, correcciones,
validaciones y límites en [el informe de fase 1](src/infrastructure/repositories/phase1-review.md).
El catálogo contiene 18 repositorios y un auxiliar, frente a las 31 tablas del
esquema; la marca de 20 repositorios del plan externo no coincide con el código.

1. **Principio SDD**: Antes de programar cualquier archivo en `src/`, consulta el archivo `README.md` del directorio correspondiente para conocer la firma y el contrato exigido.
2. **Aislamiento de Bitácoras (Privacidad Absoluta)**: Jamás exponer la bitácora personal a roles distintos del autor (`WHERE user_id = $1`).
3. **k-Anonimato**: Toda métrica de bienestar organizacional debe suprimirse si no alcanza una cohorte mínima de 5 participantes ($k \ge 5$).
4. **Cero SQL en Controladores o Servicios**: Todas las consultas SQL pertenecen exclusivamente a `src/infrastructure/repositories/`.
5. **Estándares y Manifiesto Anti-Slop de Backend**: Consulta obligatoriamente [**`backend/CODING_STANDARDS.md`**](CODING_STANDARDS.md) para cumplir con el decálogo anti-slop (códigos HTTP semánticos, cero overfetching, prevención estricta de SQL injection y manejo unificado de errores).

## 6. Actualización incremental de integración (2026-10-05)

Los contratos completos están en [OpenAPI](src/interfaces/contracts/openapi.json). Se conservan React/Express/PostgreSQL, el algoritmo léxico determinista, k=5 y la edición del check-in durante dos horas. C3 autoriza apoyo voluntario y análisis, este último también requiere C2; los tratamientos comprueban la política publicada vigente.

### Migraciones y base de prueba

`npm run db:migrate -- --database NOMBRE` exige un destino explícito que coincida con la conexión. Las migraciones se ejecutan dentro de una transacción con bloqueo y registro de checksum en `pulso_migrations`; no se aplican al iniciar la API. Repetir el comando verifica las migraciones registradas sin volver a ejecutarlas. Un checksum diferente provoca error.

- `001_integration_contracts`: tokens de recuperación, versión de autenticación, contenido de léxico e historial de activaciones, propuesta/aprobación de reglas, formato de hash de auditoría y motivo de descarte separado.
- `002_current_lexicon`: registra únicamente el diccionario existente `lexico-v1.2`, conservado en `database/lexicon-current.json`, con hash SHA-256 canónico. No agrega términos ni versiones de producto. Las versiones sin contenido íntegro no son activables.
- `003_followup_action`: conserva el tipo de acción que ya ofrece el formulario de seguimiento; las notas históricas permanecen intactas.
- `004_weekly_alert_job`: agrega cursor, ejecuciones, motivos sin datos personales y metadatos de alertas semanales. Verificar su registro y checksum en cada destino antes de activar el job. En la lectura local del 2026-10-06 ya estaba aplicada en principal y prueba; no acredita otros entornos ni un scheduler activo.

Validación reproducible desde `backend/`, con la base separada ya preparada a partir del esquema canónico y su semilla académica:

```powershell
$env:NODE_ENV = 'test'
$env:DB_NAME_TEST = 'pulso360_plan_test_20261005'
npm run db:migrate -- --database pulso360_plan_test_20261005
npm test
```

Las pruebas requieren una base `DB_NAME_TEST` distinta de `DB_NAME`, y las pruebas del plan exigen el nombre aislado indicado. El runner utiliza `NODE_ENV=test` y ejecución secuencial para los contratos que escriben fixtures. No ejecutar estas pruebas con datos reales. Los fixtures propios se eliminan por ID; la auditoría de sus operaciones se conserva. `test/browser-fixtures.js prepare|cleanup` prepara las cuentas técnicas para recorridos de navegador en esa misma base.

La aplicación sobre `pulso360_db`, una base compartida o con datos reales requiere la aprobación específica del usuario acordada en el plan. Antes de aplicarla, comprobar el destino, conservar un respaldo recuperable y detener escrituras de la API. Después, ejecutar el migrador con ese nombre explícito, reiniciar la API y recorrer los contratos con cuentas de prueba autorizadas. No reinicializar el esquema ni restaurar semillas como parte de esta actualización.

### Recuperación SMTP

Nodemailer es la única nueva dependencia de ejecución. Configurar exclusivamente en el servidor `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` y `PUBLIC_FRONTEND_URL`, según `.env.example`. Un relay que no requiere credenciales puede omitir `SMTP_USER` y `SMTP_PASSWORD`. El puerto 465 usa TLS directo; los demás exigen STARTTLS, TLS 1.2 o superior y validación de certificado, conforme a la [documentación oficial de Nodemailer](https://nodemailer.com/smtp).

Sin host, remitente, puerto o URL pública válidos, la recuperación responde con indisponibilidad. Con transporte configurado, la respuesta es genérica y no revela la existencia de la cuenta ni confirma entrega individual. El servidor almacena únicamente el hash del token; su caducidad es de 30 minutos, solo se permite utilizarlo una vez y un fallo de entrega lo invalida. Restablecer la contraseña incrementa `auth_version` y revoca los JWT anteriores. Los JWT previos a la migración corresponden a la versión inicial 0.

La suite prepara un mensaje MIME con transporte local de Nodemailer y simula entrega/rechazo sin correo externo. La verificación de un servidor SMTP real requiere configuración y un destinatario de prueba autorizado; no está incluida en la evidencia de entrega externa.

### Límites de operación y evidencia

Las propuestas de reglas SST se guardan sin aprobación y solo ADMIN puede aprobarlas. La aprobación habilita a la regla para el job semanal; no genera una alerta inmediata. El job necesita la migración 004 y `ALERT_JOB_ENABLED=true`; permanece deshabilitado por defecto. Las activaciones y reversiones del léxico registran el actor y la versión anterior; el motor sigue analizando localmente y con el mismo algoritmo.

La auditoría nueva usa formato 2, contenido canónico y escritura serializada. Los hashes históricos se conservan; la verificación informa qué registros históricos no permiten comprobar su contenido. La exportación proviene del servidor, incluye filtros y un límite explícito de 10 000 registros; la paginación conserva un máximo de ID estable.

Los reportes conservan un único snapshot para previsualización, historial, hash y descarga. JSON y CSV se generan en el servidor; PDF es impresión del documento renderizado. Las dimensiones sin muestra publicable permanecen `null`. La participación permanece deshabilitada porque no existe un denominador de personas elegibles en el contrato.

Los formularios afectados esperan la confirmación del servidor. Ante un 401, el acceso se revoca y sus borradores de negocio quedan en memoria de la pestaña, asociados al mismo titular, durante un máximo de 30 minutos. Se recuperan después de reautenticarse y volver a abrir el formulario; se eliminan al cerrar sesión o cambiar de cuenta. No se guardan contraseñas ni tokens en ese mecanismo y no sobrevive a cerrar o recargar la pestaña.

El informe de cierre y su matriz C01–C25 están en `../anti-slop/audit-029-2026-10-05.md`. La validación de la base de prueba no equivale a haber actualizado la base habitual ni a certificar accesibilidad global o un despliegue.

Actualización autorizada del 2026-10-05: las tres migraciones ya se aplicaron en la base local `pulso360_db`, con respaldo restaurado y comprobaciones HTTP/navegador. El estado posterior y los pendientes SMTP/descarga nativa están en `../anti-slop/audit-030-2026-10-05.md`; este resultado no implica actualización de otras bases o entornos.


### Job semanal de alertas (2026-10-06)

Implementado sin nuevas dependencias en `src/jobs/alertScheduler.js`, `src/jobs/runAlerts.js` y `src/application/services/weeklyAlertService.js`. Reutiliza los agregados de check-in y aplica C4 vigente y k=5 por dimensión/semana. Las caídas son relativas a la semana anterior; sobrecarga percibida no tiene fuente automática. No altera el análisis de bitácoras ni envía correos.

La evaluación vence el lunes a las 06:00 de Bogotá; el planificador comprueba pendientes cada minuto cuando la API está encendida y recupera cierres desde su cursor. Un bloqueo PostgreSQL, transacciones e índice único impiden solapamiento, escrituras parciales y duplicados. Detalles y comando con destino explícito en `src/jobs/README.md`. La evidencia y el límite de activación están en `../anti-slop/audit-031-2026-10-06.md`.
