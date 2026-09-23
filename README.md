# Pulso360

Frontend académico de bienestar laboral para operaciones BPO / Contact Center, desarrollado con React 18, React Router, Vite y JavaScript/JSX. Incluye experiencias para agente, supervisor, SST, auditor y administrador.

## Ejecutar el proyecto

Desde la raíz de este repositorio:

```sh
npm ci
npm run dev
```

Copiar `.env.example` a `.env` si se necesita configurar el entorno local. La configuración de aplicación se lee exclusivamente desde `src/core/config/env.jsx`. No colocar secretos en variables `VITE_*`: se incluyen en el cliente.

```sh
npm test
npm run lint
npm run build
npm run preview
```

`npm test`, `lint` y `build` son los controles de integración. La suite usa el ejecutor de Node y Vite para cargar los módulos reales, sin dependencias adicionales. Cubre recuperación del almacenamiento y operaciones de bitácora por titular/rol. `preview` sirve la compilación para inspección; no es una prueba. No hay un pipeline TypeScript.

## Organización

```text
src/
  core/
    auth/         Sesión, permisos, navegación por rol y acceso denegado
    components/   UI realmente compartida entre funcionalidades
    config/       Variables de entorno
    layout/       Estructura de navegación autenticada
    nlp/          Motor léxico determinista
    storage/      Persistencia del navegador, semilla y migraciones
  features/
    admin/
    agent/
    auditor/
    auth/
    landing/
    notifications/
    reports/
    sst/
    supervisor/
  styles/         Tokens, estilos globales y hojas por funcionalidad
  App.jsx         Composición de rutas y restricciones por rol
  main.jsx        Montaje de React y estilos globales
```

Cada funcionalidad crea solo las carpetas que necesita:

| Carpeta | Responsabilidad |
| --- | --- |
| `pages/` | Componer una ruta, sus paneles y sus estados visibles. |
| `components/` | Formularios, paneles o interacciones con propósito concreto. Reciben datos y acciones; el estado visual local permanece cerca de su control. |
| `hooks/` | Coordinar estado, efectos y eventos de React. Traducir resultados de servicios a feedback y navegación. |
| `services/` | Consultar datos y ejecutar operaciones de negocio sin modificar estado React. |
| `data/` | Catálogos y contenido de referencia propios de la funcionalidad. |

No existe una jerarquía obligatoria de atoms/molecules/organisms. Se extraen componentes cuando representan una responsabilidad comprensible. La similitud visual no basta para trasladarlos a `core`.

Por requisito académico, **todos los módulos dentro de `src/` usan `.jsx`**, aunque algunos no contengan marcado. Los archivos de herramientas Vite y ESLint conservan `.js`. Los servicios y datos siguen siendo funciones y estructuras JavaScript normales; no necesitan componentes ni hooks artificiales.

## Flujo y límites

El flujo habitual es página → hook → servicio → `pulsoStore`. Los componentes reciben los valores y acciones que necesitan. Las páginas pequeñas pueden coordinar servicios directamente sin crear un hook vacío.

- Una funcionalidad puede depender de `core` y de sus propios módulos.
- `core` no importa funcionalidades y una funcionalidad no importa otra hermana.
- La UI compartida de acceso denegado y bloqueo por muestra insuficiente pertenece a `core`.
- La autenticación y las sesiones pertenecen a `core/auth`. `roleNavigation.jsx` concentra las etiquetas, menús y destinos canónicos; `authService` conserva las exportaciones anteriores para compatibilidad.
- Los servicios de lectura personal filtran por titular antes de entregar registros a los hooks. Las vistas organizacionales mantienen sus reglas y estados de protección.
- Las clases CSS, tokens y orden de importación se conservan. El proyecto no utiliza un nuevo sistema de estilos ni una biblioteca adicional de estado.

ESLint comprueba las dependencias entre módulos, impide acceso directo al almacenamiento fuera de `core/storage`, rechaza lecturas/escrituras de `pulsoStore` en páginas, componentes y hooks, y exige centralizar `import.meta.env`. Los hooks pueden registrar eventos de auditoría mediante la API existente.

## Datos locales y contratos

`src/core/storage/pulsoStore.jsx` mantiene `get`, `save`, `reset` y `audit`. Se apoya en:

- `seed.jsx`: datos iniciales de demostración.
- `migrations.jsx`: normalización de datos de versiones anteriores.
- `browserStorage.jsx`: único acceso directo a `localStorage` y `sessionStorage`. Si el navegador impide guardar, conserva cambios en memoria durante la pestaña y activa un aviso visible; no garantiza persistencia tras recargar.
- `normalizeStoredData.jsx`: recupera la estructura conocida de datos parciales y mantiene campos adicionales y colecciones válidas, incluidas las vacías.
- `preferences.jsx`: borradores de check-in, preferencias de audio, recordatorios y descarte del aviso de desconexión, con sus claves y formatos existentes.

Las operaciones específicas viven en los servicios de cada funcionalidad: guardar un check-in, corregir una bitácora, registrar una solicitud, administrar una campaña o actualizar una intervención. Las vistas no guardan una copia completa de la BD.

La persistencia sigue siendo local. Mover la carpeta del proyecto no mueve los datos del navegador: pertenecen al origen (protocolo, host y puerto). Mantener el mismo origen y la misma clave configurada conserva los datos existentes. Los puertos de pruebas utilizan datos independientes.

El sistema sigue siendo una **demostración frontend**: autenticación, recuperación de acceso y auditoría tienen comportamiento local simulado. La separación por módulos y las restricciones de pantalla no sustituyen autorización en servidor, cifrado ni un servicio real de correo. El motor NLP sigue siendo léxico y determinista; no se conecta a un LLM y no constituye un diagnóstico clínico.

## Estilos por responsabilidad

Los estilos usan CSS normal y permanecen en `src/styles`. Las tres entradas grandes ahora importan módulos en un orden explícito:

| Entrada | Módulos |
| --- | --- |
| `styles.css` | `landing/` para presentación pública y demostraciones; `academic/` para fundamentación. |
| `components.css` | `shared/` para controles compartidos y `agent/` para interacciones personales. |
| `agent.css` | Panel, patrones de página, modales, apoyo inmediato y pausa inmersiva. |

Las demás hojas conservan su funcionalidad específica. `tokens.css` sigue siendo la fuente de valores comunes. Buscar la clase antes de editar; mantener sus estados y reglas responsive junto a la interacción que describen. El orden de importación importa: algunas reglas existentes se complementan o sobrescriben. No cambiarlo sin comprobar el resultado.

Un componente necesita separarse cuando mezcla responsabilidades, no al alcanzar un límite arbitrario de líneas. Un catálogo, un SVG o un formulario pueden ser extensos y seguir siendo claros. Por ejemplo, la pausa delega sus efectos a `useBpoPause`, el recorrido público compone tres paneles y conserva su estado entre pestañas, y el mapa de anclaje compone escenas sensoriales independientes; el formulario de contacto delega coordinación al hook y validación a un servicio.

## Punto de partida independiente

La migración de maqueta a aplicación modular establece este repositorio como raíz de trabajo de Pulso360. El historial conserva los cambios correspondientes a la aplicación; los entregables académicos externos no forman parte del proyecto.

Los cambios locales de análisis se incorporaron a esta base. Dependencias, compilaciones, variables de entorno y documentación interna se excluyen mediante `.gitignore`. Las siguientes entregas deben mantener los contratos de datos, las restricciones por rol y los flujos existentes.

## Validación de la reorganización

Se comprueban lint, compilación, límites de importación, rutas y flujos con datos demo en un navegador aislado. Las comprobaciones temporales de navegador complementan la suite reproducible de `tests/regressions.test.mjs`; no forman parte de `npm test`.

La compilación conserva la advertencia previa de Vite por un paquete JavaScript superior a 500 kB. Esta reorganización no incorpora carga diferida ni altera el comportamiento de las rutas para ocultar la advertencia.

Para cambios futuros, verificar acceso y consentimiento por rol, estados protegidos, persistencia al recargar, interacción por teclado y reflow, además de lint y build. Registrar las limitaciones reales de cada revisión: estos controles no certifican ausencia absoluta de deuda técnica ni accesibilidad completa.

## Recursos gráficos

Las fotografías utilizadas se sirven como WebP desde `public/assets/fotos/`. El logo de interfaz usa WebP y el favicon usa un PNG pequeño. Las imágenes en `public/` se descargan por separado: su tamaño no forma parte del aviso de Vite sobre el paquete JavaScript.

Los cinco rostros animados APNG del check-in y sus cinco versiones estáticas para movimiento reducido siguen en PNG. Al reemplazar un recurso, comprobar primero sus usos y conservar la versión necesaria para esa preferencia.
