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

Para consultar la documentación técnica específica de cada módulo y los diagramas de ingeniería de software, revisa sus respectivos archivos:
* [Compendio Maestro de Diagramas (C4, Casos de Uso, UI, Flujos, Componentes, Clases, ER, Relacional)](docs/DIAGRAMAS.md)
* [Libro Técnico de Pulso360 (12 Capítulos Modulares)](docs/libro-pulso360/INDICE_MAESTRO.md)
* [Documentación del Frontend](frontend/README.md)
* [Documentación del Backend](backend/README.md)
* [Especificación del Modelo de Datos (31 Tablas)](backend/database/README.md)

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
* Node.js: v20.0 LTS o superior (compatible con Node 20 y Node 22 ESM)
* npm: v10.0 o superior
* PostgreSQL: 17 o 18 (PostgreSQL 17 en Docker Compose y soporte en PostgreSQL 18 nativo) con base de datos `pulso360_db` creada
* Git

#### 1. Levantar el Frontend (Cliente Web)
La interfaz de usuario está desarrollada en React 18 con Vite 6:

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

### 1. Quality Gates Oficiales de Entrega
De acuerdo con la [CONSTITUTION.md](CONSTITUTION.md), los siguientes comandos constituyen los gates oficiales de verificación obligatorios antes de considerar cualquier cambio o Pull Request como completado:

```bash
# 1. Pruebas de integración de backend (110 pruebas de contratos HTTP, RBAC y k-anonimato)
cd backend && npm test

# 2. Pruebas unitarias y de regresión de frontend
cd frontend && npm test

# 3. Análisis estático de código con ESLint 9
cd frontend && npm run lint

# 4. Verificación de compilación de producción con Vite 6
cd frontend && npm run build
```

### 2. Comandos Operativos Adicionales

#### Backend:
```bash
cd backend
npm run test:db   # Verifica conectividad y credenciales con PostgreSQL
npm test          # Ejecuta las 110 pruebas de contratos HTTP, RBAC y k-anonimato
```

#### Migraciones de Base de Datos (PostgreSQL):
Para aplicar las migraciones incrementales sobre las 31 tablas canónicas:

```bash
cd backend
npm run db:migrate -- --database pulso360_db
```
