# Pulso360

Plataforma de bienestar laboral y gestión psicosocial orientada a operaciones de BPO y Contact Centers. El sistema permite monitorear y gestionar la fatiga emocional, sobrecarga y soporte operativo a través de experiencias diferenciadas para agentes, supervisores, equipos de SST (Seguridad y Salud en el Trabajo), auditores y administradores.

---

## Arquitectura del Repositorio

El proyecto está organizado en un esquema monorepo modular que separa las responsabilidades de cliente y servidor:

```text
Pulso360/
├── frontend/                 # Aplicación cliente SPA (React 18 + Vite)
├── backend/                  # Servidor y API REST (Node.js)
├── docs/                     # Documentación de diseño, arquitectura y auditorías
├── .agents/                  # Contratos de ingeniería y directrices para asistentes
├── AGENTS.md                 # Constitución técnica y reglas operativas del repo
├── DESIGN.md                 # Sistema de diseño e identidad visual
└── README.md                 # Este documento (Visión general)
```

Para consultar la documentación técnica específica de cada módulo, revisa sus respectivos archivos:
* [Documentación del Frontend](frontend/README.md)
* [Documentación del Backend](backend/README.md)

---

## Inicio Rápido

### Opción A: Arranque 1-Click con Docker Compose (Recomendado)
Para evaluadores o despliegue en cualquier máquina sin necesidad de configurar Node.js ni PostgreSQL manualmente:

```bash
# 1. Levantar la plataforma completa en segundo plano
docker compose up -d

# 2. Ver logs de inicialización
docker compose logs -f
```
* **Cliente Web (Frontend):** `http://localhost:5173`
* **API REST (Backend):** `http://localhost:3000/api/v1`
* **Healthcheck:** `http://localhost:3000/api/v1/health`

Para detener el entorno:
```bash
docker compose down
```

---

### Opción B: Ejecución Local Nativa (Entorno de Desarrollo)

#### Prerrequisitos
* Node.js: v20.0 o superior (exigido por React Router 7 y runtime ESM moderno)
* npm: v10.0 o superior
* PostgreSQL: 16 o superior con base de datos `pulso360_db` creada
* Git

#### 1. Levantar el Frontend (Cliente Web)
La interfaz de usuario está desarrollada en React 18 con Vite:

```bash
# 1. Entrar al directorio del frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor local
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

---

### 2. Levantar el Backend (API)
El servidor se encuentra estructurado en el subdirectorio `backend`:

```bash
# 1. Entrar al directorio del servidor
cd backend

# 2. Instalar dependencias
npm install

# 3. Probar conexión con PostgreSQL
npm run test:db

# 4. Iniciar el servidor
npm run dev
```

---

## Principios de Privacidad y Dominio

* **No vigilancia individual:** La plataforma no está diseñada como herramienta de monitoreo punitivo o ranking de empleados.
* **Privacidad por diseño (k-anonimato):** Las métricas mostradas a supervisores y SST se presentan de manera agregada y solo cuando superan un umbral mínimo de participantes para evitar la identificación individual.
* **Procesamiento léxico local:** El módulo de bitácora del agente utiliza un motor de análisis determinista local que no envía texto libre a modelos externos de IA generativa.

---

## Pruebas y Auditoría Integral de Calidad

### 1. Gates automáticos de entrega
Ejecuta tests de frontend dos veces, lint/build, conexión PostgreSQL, tests de backend y parseo JSON de OpenAPI. El runner guarda un resumen y logs locales; su resultado acredita esos controles, no sustituye la auditoría de integración, permisos y recuperación ni aprueba un despliegue:

```bash
node .agents/skills/pre-flight-audit/scripts/run-all-gates.mjs
```

La skill `pre-flight-audit` completa las comprobaciones aplicables y entrega GO/NO-GO para un alcance declarado. Las skills locales están excluidas de Git; el comando requiere que esa carpeta esté disponible en el equipo.

### 2. Pruebas por Módulo

#### Frontend:
```bash
cd frontend
npm test          # 31 pruebas unitarias y de regresión
npm test          # Segunda ejecución exigida por el contrato de calidad
npm run lint      # Análisis estático con ESLint
npm run build     # Verificación de compilación de producción (Vite)
```

#### Backend:
```bash
cd backend
npm run test:db   # Verifica conectividad con PostgreSQL
npm test          # Ejecuta 110 pruebas de contratos HTTP, RBAC y k-anonimato
```

### 3. Migraciones de Base de Datos (PostgreSQL)
Para aplicar las migraciones incrementales en una base de datos específica:

```bash
cd backend
npm run db:migrate -- --database pulso360_db
```
