# Verificación de030

## Resultado comprobado y alcance

Se ejecutó el recorrido de acompañamiento con dos cuentas desechables, dos perfiles Chrome156 y build de producción local contra Express, Socket.IO y PostgreSQL reales. No hubo peticiones de producto interceptadas. Better dirigió los estados de carga/error y la accesibilidad afectada e inspeccionó las dos capturas finales. La ejecución de referencia está en [e2e-result.json](evidence/e2e/e2e-result.json); [better-review.md](better-review.md) conserva el alcance de su inspección.

| Criterio | Comprobación y evidencia | Resultado |
|---|---|---|
| AC-01 | [Comparación](evidence/bundle-comparison.json), [baseline](evidence/baseline-bundle.json), [después](evidence/after-bundle.json) y recursos de landing fría en ambos perfiles. | JS inicial de landing962719→368756bytes (-61,7%); gzip nivel9 estimado267972→117136 (-56,3%); CSS inicial423645→173724 (-59,0%). Chrome observó368757JS/173724CSS;1byte adicional por API URL temporal. Sin páginas privadas descargadas al entrar. |
| AC-02 | Login de agente/SST, solicitud anónima, activación, mensajes en ambos sentidos recibidos sin recarga, historial tras recargar, cierre recibido en vivo y persistido. Dos eventos de envío Socket observados; consulta PG comprueba1mensaje por actor y estados Cerrada/cerrada. | Ejecución real9+7checks, exit0. Consentimiento es precondición de fixture, no recorrido de aceptación. |
| AC-03 | Guarda SQL del nombre de base; dos cuentas únicas; finally con borrados acotados y cinco recuentos de cuentas, solicitudes, sesiones, mensajes y consentimientos. | Base técnica separada verificada; cinco contadores0, auditoría conservada. Sin migraciones ni acceso a datos productivos. |
| AC-04 | PageBoundary, AppLayout/Outlet y RouteAccessibility; harness Chrome16grupos y revisión Better. | Carga anunciada, error comprensible y recuperación; main único, shell/estado conservados y título/foco tras lazy. ProtectedRoute y rutas retienen permisos; contratos backend aportan regresión RBAC. |
| AC-05 | Configuración de dos checks UI en specs/checks.json más cuatro gates existentes, ligados mediante verify030. | Preflight: backend132/132; frontend55/55; lint exit0; build exit0; harness16grupos; E2E exit0. El registro [verification.json](verification.json) contiene la ejecución final y su huella. |

## Medición reproducible del bundle

Desde la raíz: node specs/030-real-e2e-and-route-bundles/evidence/measure-bundle.mjs baseline y el mismo comando con after. La baseline usa git show de58eb868 para App.jsx, AppLayout.jsx y RouteAccessibility.jsx mediante un load de Vite; no modifica el checkout. El resto de las fuentes de producto y configuración son iguales. Se inspecciona la salida final de Rollup, después de los hooks de preload, y se calcula gzip nivel9 por recurso. Los porcentajes de reducción son1−después/antes. La suma de landing incluye entry, LandingPage y sus imports estáticos transitivos, sin contar dos veces dependencias compartidas.

El entry actual queda en319917bytes; el mayor chunk tiene ese tamaño. No se cambió el umbral500kB ni se ocultaron advertencias. La suma de todo el producto pasa de962719 a979849bytesJS y de423645 a484976bytesCSS: la separación tiene coste total (+1,8%JS/+14,5%CSS). El beneficio verificado es evitar descargar todas las páginas por cada entrada. No se atribuye mejora de tiempo, memoria o Core Web Vitals sin medirlos.

## Reutilización y revisión técnica

Se conservan React18/JSX, React Router existente, Vite6, rutas y ProtectedRoute, AppLayout, servicios de autenticación/chat, motor NLP determinista y almacenamiento central. No hay nuevas dependencias ni contratos API de producto. PageBoundary es compartido en core y no depende de features. Los lazy se declaran estables a nivel de módulo. El error no expone excepciones; recarga explícita reinicia imports fallidos y el enlace permite cambiar de ruta. El wrapper interior conserva el main/layout. RouteAccessibility observa de forma acotada contenido visible y cancela foco pendiente por interacción, sin reinstalar un marco verde en entradas iniciales.

El runner reutiliza la infraestructura real de app/socket/db y la semilla técnica existente. Los endpoints /__e2e son coordinación local del test, no sustitutos del API de producto. Los perfiles, puertos y build son temporales; al terminar se cierran y eliminan exclusivamente los recursos creados por el runner. Se registran métodos/rutas/estados y contadores, no tokens ni cuerpos sensibles. Los archivos .env no se modifican ni publican. README documenta requisitos y ejecución; capturas generadas y test-results quedan locales ignorados por Git.

## Límites y diagnóstico conservado

Esta comprobación es local sobre producción compilada; no acredita despliegue, TLS/CDN, cookies/orígenes de hosting ni red corporativa. Chrome se opera con dump-dom y eventos DOM programáticos, sin CDP ni entrada física. Las capturas E2E son1366×768; no se atribuye a030 una nueva auditoría de todos los roles, móvil, zoom o lector de pantalla. La inspección de nombre oculto se limita a la fila/conversación de esta muestra y se complementa con contratos RBAC, sin prometer anonimato absoluto. El harness confirma presencia/handler de recarga y ejecuta recuperación mediante enlace; no pulsa la recarga nativa en su caso de import rechazado.

El primer pase falló por un selector del driver que buscaba otra etiqueta de activación; se corrigió al control existente y se repitió el recorrido completo. Se preserva [diagnóstico inicial](evidence/e2e-first-run.json); no fue un fallo funcional demostrado del chat. En el harness, React Router conserva la vista durante una transición; se corrigió una espera de40ms por condiciones DOM observables, sin demoras artificiales en producto.

La publicación normal autorizada y la actualización del mismo artifact se verifican después del gate. No se infieren de un estado de Omni. Las limitaciones anteriores permanecen aunque todos los checks sean satisfactorios.
