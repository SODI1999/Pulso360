# Pulso360 — Backend (API REST & Persistencia PostgreSQL)

Servicio de backend para la plataforma Pulso360, desarrollado en **Node.js, Express y PostgreSQL 18**. Implementa una arquitectura en capas limpia alineada con los requisitos funcionales del **Proyecto Pedagógico Integrador (PPI)** y los diagramas C4/Paquetes de la materia de **Diseño de Sistemas**.

> **Metodología**: Spec-Driven Development (SDD). Cada paquete y capa cuenta con su contrato `.md` predefinido antes de su implementación en código.

---

## 1. Stack Tecnológico Oficial

* **Entorno de Ejecución**: Node.js (v18+ / v20 LTS) con Módulos ECMAScript (`"type": "module"`).
* **Framework Web**: Express.js 5 (`express.Router()`).
* **Base de Datos**: PostgreSQL 18 (Relacional con consultas SQL nativas parametrizadas).
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
│   ├── schema.sql               # DDL oficial de 9 tablas, llaves foráneas e índices
│   └── seed.sql                 # Datos de prueba con los 5 usuarios demo (hashes bcrypt)
├── src/
│   ├── interfaces/              # [P05 · interfaces/http / C02] Capa de transporte y HTTP
│   │   ├── README.md            # Especificación SDD de endpoints REST y códigos HTTP
│   │   ├── routes/              # Definición de rutas con Express Router
│   │   └── controllers/         # Controladores HTTP (parseo req/res, sin SQL ni lógica)
│   ├── middlewares/             # [P06 · middleware / C03] Filtros de seguridad y control
│   │   ├── README.md            # Especificación SDD de autenticación, RBAC y consentimiento
│   │   ├── authMiddleware.js    # Verificador de token JWT (Authorization: Bearer)
│   │   ├── rbacMiddleware.js    # Guardias de autorización por rol
│   │   └── errorMiddleware.js   # Manejador global de excepciones HTTP
│   ├── domain/                  # [P08 · domain] Invariantes puros de negocio y ética
│   │   ├── README.md            # Especificación de privacidad (bitácora aislada, k >= 5)
│   │   └── privacyRules.js      # Lógica de validación de k-anonimato y dimensiones
│   ├── application/             # [P07 · application / C04 y C05] Casos de uso
│   │   ├── README.md            # Especificación SDD de servicios y reglas de negocio
│   │   ├── authService.js       # Lógica de login, tokens y perfil
│   │   ├── agentService.js      # Registro de check-ins y bitácoras
│   │   └── sstService.js        # Gestión de alertas, intervenciones y reportes
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
* Node.js v18+ y npm instalados.

### 1. Variables de Entorno (`.env`)
Asegúrate de que el archivo `.env` en la raíz de `backend/` contenga:

```env
PORT=3000
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=pulso360_db
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=pulso360_super_secret_jwt_key_2026_academica
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173
```

### 2. Inicialización de Base de Datos (Si se requiere recrear)
Para cargar el esquema DDL y los datos demo en PostgreSQL:

```powershell
$env:PGPASSWORD = "postgres"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h 127.0.0.1 -d pulso360_db -f backend/database/schema.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h 127.0.0.1 -d pulso360_db -f backend/database/seed.sql
$env:PGPASSWORD = $null
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

1. **Principio SDD**: Antes de programar cualquier archivo en `src/`, consulta el archivo `README.md` del directorio correspondiente para conocer la firma y el contrato exigido.
2. **Aislamiento de Bitácoras (Privacidad Absoluta)**: Jamás exponer la bitácora personal a roles distintos del autor (`WHERE user_id = $1`).
3. **k-Anonimato**: Toda métrica de bienestar organizacional debe suprimirse si no alcanza una cohorte mínima de 5 participantes ($k \ge 5$).
4. **Cero SQL en Controladores o Servicios**: Todas las consultas SQL pertenecen exclusivamente a `src/infrastructure/repositories/`.
5. **Estándares y Manifiesto Anti-Slop de Backend**: Consulta obligatoriamente [**`backend/CODING_STANDARDS.md`**](CODING_STANDARDS.md) para cumplir con el decálogo anti-slop (códigos HTTP semánticos, cero overfetching, prevención estricta de SQL injection y manejo unificado de errores).
