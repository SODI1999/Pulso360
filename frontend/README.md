# Pulso360 — Frontend

Cliente web de Pulso360, una plataforma de bienestar laboral para operaciones BPO y Contact Center. Es una Single Page Application (SPA) construida con React 18, React Router, Vite y JavaScript/JSX. Permite recorrer experiencias diferenciadas para cinco roles: agente, supervisor, SST, auditor y administrador.

---

## Stack Tecnologico

* Framework: React 18
* Enrutamiento: React Router 7
* Empaquetador y Dev Server: Vite 5
* Iconografia: Lucide React
* Estilos: Vanilla CSS modular con sistema de diseno por tokens (`src/styles/tokens.css`)
* Linter y Calidad: ESLint 9 + Node Test Runner (`tests/regressions.test.mjs`)

---

## Instalacion y Ejecucion

Requisitos: Node.js (v18+ recomendado) y npm.

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
   Abre en tu navegador la direccion local que indique la consola (habitualmente `http://localhost:5173`).

---

## Configuracion de Entorno (.env)

No es estrictamente necesario configurar un `.env` para probar la aplicacion en modo demostracion local. Si necesitas cambiar parametros locales o conectar con el backend:

```bash
# Copia la plantilla de ejemplo
cp .env.example .env
```

> **Aviso de seguridad:** Las variables con prefijo `VITE_*` son publicas y visibles en el codigo cliente generado para el navegador. No coloques credenciales secretas aqui.

---

## Recorrido de la Demostracion

| Ruta | Descripcion |
| :--- | :--- |
| `/` | Portada principal, presentacion del proyecto y modulos de contexto. |
| `/contactenos` | Formulario con validacion controlada y resumen demostrativo. |
| `/login` | Acceso con switch rapido de prueba para los 5 roles. |
| `/agente/dashboard` | Tablero del agente, estado del turno, metricas y accesos rapidos. |
| `/agente/bitacora` | Registro privado de bienestar y analisis lexico determinista. |
| `/supervisor/equipo` | Vista agregada de factores y KPIs de equipo (respetando k-anonimato). |
| `/sst/dashboard` | Gestion de alertas operativas, bandejas de apoyo e intervenciones SST. |
| `/admin/usuarios-roles`| Administracion y auditoria de cuentas y roles del sistema. |

> En la pantalla de `/login`, utiliza la seccion **Acceso rapido de evaluacion** para autocompletar credenciales de cualquier rol con un solo clic.

---

## Estructura del Codigo

```text
frontend/
├── public/              # Recursos estaticos (logos, imagenes, favicon)
├── src/
│   ├── core/            # Infraestructura transversal (Auth, Storage, Config, NLP lexico)
│   ├── features/        # Modulos organizados por dominio y rol:
│   │   ├── admin/       # Vistas y servicios de administracion
│   │   ├── agent/       # Bitacora, pausas activas, soporte de agente
│   │   ├── public/      # Landing page, contacto, login
│   │   ├── sst/         # Reglas de alerta, intervenciones, inbox SST
│   │   └── supervisor/  # Tableros de equipo y seguimiento
│   ├── styles/          # Design tokens, variables CSS globales y hojas de modulo
│   ├── App.jsx          # Declaracion central de rutas publicas y protegidas
│   └── main.jsx         # Punto de entrada de React en el DOM
├── tests/               # Pruebas automatizadas de regresion (storage, auth, bitacora)
├── index.html           # Documento base HTML
└── vite.config.js       # Configuracion del bundler Vite
```

---

## Pruebas y Validacion de Calidad

El proyecto cuenta con el siguiente flujo de validacion:

```bash
# Ejecutar suite de pruebas de regresion (Node test runner)
npm test

# Ejecutar analisis estatico de codigo
npm run lint

# Compilar para produccion (genera carpeta dist/)
npm run build

# Previsualizar el build de produccion localmente
npm run preview
```

---

## Privacidad y Almacenamiento

* **Almacenamiento:** Centralizado a traves de `src/core/storage/pulsoStore.jsx` utilizando almacenamiento del navegador (localStorage / memoria en caso de bloqueo).
* **Motor NLP:** Ubicado en `src/core/nlp/nlpEngine.jsx`, es un modelo puramente lexico y determinista. No envia datos a LLMs externos ni emite diagnosticos clinicos.
