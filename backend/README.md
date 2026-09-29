# Pulso360 — Backend (API y Servicios)

Servicio de backend para Pulso360, encargado de la persistencia de datos, autenticacion segura, logica de negocio y exposicion de endpoints REST para el cliente frontend.

> Estado: En construccion / Inicializacion.

---

## Stack Tecnologico Previsto

* Entorno de ejecucion: Node.js (v18+)
* Framework Web: Express.js (o el framework seleccionado para la API)
* Base de Datos: A definir (PostgreSQL / MongoDB / SQLite)
* Autenticacion: JWT (JSON Web Tokens) / Cookies seguras HttpOnly

---

## Instalacion y Puesta en Marcha

1. Navegar al directorio del servidor:
   ```bash
   cd backend/server
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar en modo desarrollo:
   ```bash
   npm run dev
   # o
   npm start
   ```

---

## Variables de Entorno (.env)

Crea un archivo `.env` en la raiz de `backend/server/` con las siguientes configuraciones base:

```env
# Puerto del servidor (evitar el 5173 usado por el frontend de Vite)
PORT=4000

# Base de datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/pulso360_db

# Seguridad y Autenticacion
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=8h

# Origenes permitidos para CORS (Frontend de desarrollo)
CORS_ORIGIN=http://localhost:5173
```

---

## Estructura Recomendada

```text
backend/server/
├── src/
│   ├── config/          # Conexion a BD, variables de entorno y middlewares globales
│   ├── controllers/     # Controladores que reciben la peticion HTTP y envian respuestas
│   ├── models/          # Modelos / Esquemas de base de datos
│   ├── routes/          # Definicion de rutas y endpoints de la API (Express Router)
│   ├── middlewares/     # Proteccion de rutas por JWT y validacion de roles (RBAC)
│   └── services/        # Logica de negocio y consultas a base de datos
├── package.json
└── README.md
```

---

## Endpoints Principales (Roadmap de Implementacion)

### 1. Autenticacion (`/api/auth`)
* `POST /api/auth/login` — Autenticacion de usuarios por email/contrasena.
* `POST /api/auth/logout` — Cierre de sesion e invalidacion de token.
* `GET  /api/auth/me` — Datos del usuario autenticado y rol activo.

### 2. Agente y Bienestar (`/api/agent`)
* `GET  /api/agent/bitacora` — Registros propios del agente autenticado.
* `POST /api/agent/bitacora` — Creacion de nuevo registro privado de bienestar.

### 3. SST y Supervisor (`/api/sst` y `/api/supervisor`)
* `GET  /api/sst/metrics` — Metricas agregadas de bienestar respetando umbrales de anonimato (k-anonimato).
* `GET  /api/sst/inbox` — Bandeja de casos y solicitudes de apoyo.
