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

### Prerrequisitos
* Node.js: v18.0 o superior
* npm: v9.0 o superior
* Git

---

### 1. Levantar el Frontend (Cliente Web)
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
El servidor se encuentra estructurado en el subdirectorio `backend/server`:

```bash
# 1. Entrar al directorio del servidor
cd backend/server

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor
npm run dev
```

---

## Principios de Privacidad y Dominio

* **No vigilancia individual:** La plataforma no está diseñada como herramienta de monitoreo punitivo o ranking de empleados.
* **Privacidad por diseño (k-anonimato):** Las métricas mostradas a supervisores y SST se presentan de manera agregada y solo cuando superan un umbral mínimo de participantes para evitar la identificación individual.
* **Procesamiento léxico local:** El módulo de bitácora del agente utiliza un motor de análisis determinista local que no envía texto libre a modelos externos de IA generativa.

---

## Pruebas y Validación (Frontend)

Para verificar la integridad del código del cliente:

```bash
cd frontend
npm test          # Pruebas automatizadas de regresión
npm run lint      # Análisis estático de código
npm run build     # Verificación de compilación de producción
```
