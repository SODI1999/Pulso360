# Pulso360

Pulso360 es una aplicación académica de bienestar laboral para operaciones BPO y Contact Center. Es una **SPA** hecha con React 18, React Router, Vite y JavaScript/JSX. Permite recorrer experiencias distintas para agente, supervisor, SST, auditor y administrador.

Por ahora es una demostración **solo frontend**: las cuentas y los datos se simulan en el navegador. No hay servidor, envío de correos ni autorización del lado del servidor.

## Instalación y ejecución

Necesitas Node.js y npm. Desde la carpeta del proyecto:

```sh
npm install
npm run dev
```

Abre la dirección local que muestra Vite. No hace falta crear un archivo `.env` para probar la aplicación. Si necesitas cambiar una opción local, copia `.env.example` a `.env`; las variables `VITE_*` son visibles en el navegador y no deben contener secretos.

## Cómo recorrer la demostración

| Ruta | Qué muestra |
| --- | --- |
| `/` | Inicio público, navegación y presentación del proyecto. |
| `/contactenos` | Formulario con campos controlados, validación y resumen local. |
| `/login` | Acceso de demostración para los cinco roles. |
| `/agente/bitacora` | Lista dinámica de registros propios; requiere entrar como agente. |
| `/admin/usuarios-roles` | Lista y gestión de cuentas; requiere entrar como administrador. |

En `/login`, abre **Acceso rápido de evaluación** y selecciona un rol para cargar sus credenciales de prueba. Las rutas personales y administrativas respetan ese rol. Los enlaces internos cambian de pantalla sin recargar la página.

## Estructura

```text
src/
  core/       Autenticación, permisos, almacenamiento, configuración y lógica compartida
  features/   Pantallas y funciones de cada área: agente, SST, administración, etc.
  styles/     Tokens, estilos globales y CSS por área
  App.jsx     Rutas públicas y protegidas
  main.jsx    Inicio de React
tests/        Pruebas automatizadas de regresión
public/       Imágenes y otros recursos estáticos
```

Dentro de cada funcionalidad, `pages/` compone pantallas, `components/` contiene piezas reutilizables, `hooks/` coordina el estado y los efectos, `services/` concentra operaciones y `data/` guarda catálogos. Solo se crean las carpetas necesarias. El CSS se separa por responsabilidad en `src/styles/`; los valores compartidos viven en `tokens.css`.

La navegación usa `BrowserRouter`, `Routes`, `Route` y `Link`. Los formularios y listas usan `useState`; `useEffect` carga datos locales y coordina efectos de pantalla. Los componentes de la aplicación son funciones de React. Los módulos dentro de `src/` usan `.jsx` por el requisito académico; la configuración de herramientas conserva `.js`.

## Datos y límites

`src/core/storage/pulsoStore.jsx` centraliza los datos de prueba en el almacenamiento del navegador. Se mantienen al recargar en el mismo origen mientras el navegador permita guardarlos; si el almacenamiento está bloqueado, los cambios duran solo durante la pestaña y aparece un aviso. El formulario de contacto muestra un resumen de demostración y **no envía** su contenido.

La recuperación de contraseña, la auditoría y los permisos se simulan en el frontend. No uses datos personales reales para evaluar el proyecto. El análisis de texto es léxico y determinista; no es un diagnóstico ni utiliza una API de IA.

## Comprobaciones

```sh
npm test
npm run lint
npm run build
```

`npm test` ejecuta la suite de regresión. `lint` revisa también límites entre módulos y acceso a almacenamiento. `build` genera la versión de producción; puede mostrar un aviso de Vite por el tamaño del JavaScript, que no impide compilar. Para abrir esa compilación localmente, ejecuta `npm run preview`.
