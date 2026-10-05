# Pulso360 — Frontend

Cliente web de Pulso360, una plataforma de bienestar laboral para operaciones BPO y Contact Center. Es una Single Page Application (SPA) construida con React 18, React Router, Vite y JavaScript/JSX. Permite recorrer experiencias diferenciadas para cinco roles: agente, supervisor, SST, auditor y administrador.

---

## Stack Tecnológico

* Framework: React 18
* Enrutamiento: React Router 7
* Empaquetador y Dev Server: Vite 5
* Iconografía: Lucide React
* Estilos: Vanilla CSS modular con sistema de diseño por tokens (`src/styles/tokens.css`)
* Linter y Calidad: ESLint 9 + Node Test Runner (`tests/regressions.test.mjs`)

---

## Instalación y Ejecución

Requisitos: Node.js (v20.0 o superior, exigido por React Router 7 y runtime ESM moderno) y npm (v10.0 o superior).

1. Entrar a la carpeta del frontend:
   ```bash
   cd frontend
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar el entorno de desarrollo:
   ```bash
   npm run dev
   ```
   Abre en tu navegador la dirección local que indique la consola (habitualmente `http://localhost:5173`).

---

## Configuración de Entorno (.env)

No es estrictamente necesario configurar un `.env` para probar la aplicación en modo demostración local. Si necesitas cambiar parámetros locales o conectar con el backend:

```bash
# Copia la plantilla de ejemplo
cp .env.example .env
```

> **Aviso de seguridad:** Las variables con prefijo `VITE_*` son públicas y visibles en el código cliente generado para el navegador. No coloques credenciales secretas aquí.

---

## Recorrido de la Demostración

| Ruta | Descripción |
| :--- | :--- |
| `/` | Portada principal, presentación del proyecto y módulos de contexto. |
| `/contactenos` | Formulario de contacto y canal informativo. |
| `/login` | Autenticación con acceso rápido para los 5 roles RBAC. |
| `/agente/panel` | Tablero de bienestar del agente, estado del turno y accesos directos. |
| `/agente/bitacora` | Registro privado de bienestar y análisis léxico determinista. |
| `/agente/checkin` | Evaluación voluntaria diaria de dimensiones de fatiga y carga. |
| `/supervisor/panel` | Vista agregada de factores y KPIs de equipo (k-anonimato N >= 5). |
| `/supervisor/acciones` | Seguimiento y planes de acción preventivos asignados. |
| `/sst/panel` | Vigilancia epidemiológica preventiva y monitoreo psicosocial agregado. |
| `/sst/alertas` | Gestión de alertas operativas e intervenciones SST. |
| `/sst/buzon` | Solicitudes voluntarias de apoyo confidencial canalizadas por SST. |
| `/auditor/panel` | Registro inmutable de auditoría y trazabilidad del sistema. |
| `/admin/panel` | Gestión organizacional y configuración de campañas/turnos. |
| `/admin/usuarios-roles` | Administración y auditoría de cuentas y roles del sistema. |
| `/reportes` | Generación y exportación de reportes agregados con hash de integridad SHA-256. |
| `/notificaciones` | Notificaciones y avisos institucionales in-app. |

> En la pantalla de `/login`, utiliza la sección **Acceso rápido de evaluación** para autocompletar credenciales de cualquier rol con un solo clic.

---

## Estructura del Código

```text
frontend/
├── public/              # Recursos estáticos (logos, imágenes, favicon)
├── src/
│   ├── core/            # Infraestructura transversal (Auth, Storage, Config, API, Layout, NLP léxico)
│   ├── features/        # Módulos organizados por dominio y rol:
│   │   ├── admin/       # Vistas y servicios de administración y gobernanza
│   │   ├── agent/       # Bitácora privada, check-in, pausas activas, apoyo y privacidad
│   │   ├── auth/        # Login RBAC, consentimiento C1-C5 y recuperación de claves
│   │   ├── auditor/     # Trazabilidad, logs inmutables y registros de auditoría
│   │   ├── landing/     # Portada pública, fundamentación académica y contacto
│   │   ├── notifications/# Notificaciones y comunicados operativos in-app
│   │   ├── reports/     # Generación de reportes agregados con sello SHA-256
│   │   ├── sst/         # Vigilancia epidemiológica, alertas, reglas, intervenciones y buzón
│   │   └── supervisor/  # Tableros de equipo (k-anonimato N >= 5) y planes preventivos
│   ├── styles/          # Design tokens, variables CSS globales y hojas de módulo
│   ├── App.jsx          # Declaración central de rutas públicas, protegidas y redirecciones canónicas
│   └── main.jsx         # Punto de entrada de React en el DOM
├── tests/               # Pruebas automatizadas de regresión (storage, auth, bitácora)
├── index.html           # Documento base HTML
└── vite.config.js       # Configuración del bundler Vite
```

---

## Pruebas y Validación de Calidad

El proyecto cuenta con el siguiente flujo de validación:

```bash
# Ejecutar suite de pruebas de regresión (Node test runner)
npm test

# Ejecutar análisis estático de código
npm run lint

# Compilar para producción (genera carpeta dist/)
npm run build

# Previsualizar el build de producción localmente
npm run preview
```

---

## Privacidad y Almacenamiento

### Arquitectura de Persistencia y Modos de Ejecución

Pulso360 implementa un desacoplamiento estricto entre la interfaz de usuario y los mecanismos de persistencia, administrado por la variable de entorno `VITE_USE_MOCK_STORAGE`:

* **Modo Producción Conectada (`VITE_USE_MOCK_STORAGE=false`):**
  Arquitectura de cliente ligero (*Thin Client*). Todas las operaciones de dominio (check-ins diarios, bitácoras privadas de desahogo, consentimientos informados C1–C5, alertas psicosociales, intervenciones y reportes) se gestionan directamente contra el backend REST (Node.js, Express y PostgreSQL 18) a través de `apiClient`.
  - **Principio Anti-Dual-Persistence:** La aplicación cliente nunca persiste microdatos personales ni registros sensibles de bienestar en el navegador (ni en `localStorage` ni en `sessionStorage`), garantizando que la única fuente de verdad sea la base de datos relacional y protegiendo la confidencialidad en puestos de trabajo compartidos de Contact Center.

* **Modo Demostración Offline (`VITE_USE_MOCK_STORAGE=true`):**
  Almacenamiento simulado en `src/core/storage/pulsoStore.jsx` (`localStorage` con fallback resiliente en memoria en caso de bloqueo por políticas del navegador) para demostraciones portables, pruebas unitarias o entornos aislados sin backend.

### Motor NLP Determinista

* **Análisis Léxico en Cliente:** Ubicado en `src/core/nlp/nlpEngine.jsx`, evalúa reflexiones de la bitácora mediante coincidencia léxica determinista de diccionarios locales sin recurrir a procesamiento probabilístico en la nube.
* **Seguridad Psicológica y Ética de Datos:** Se ejecuta estrictamente en el navegador del usuario sin exposición de datos a modelos LLM externos ni servicios de terceros. Su alcance es estrictamente de autorreflexión y apoyo operativo; no emite diagnósticos clínicos, valoraciones psiquiátricas ni dictámenes médicos laborales.
