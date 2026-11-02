# [BUG-029] Foco de ruta y capturas locales

## Reproducción y entorno

El usuario adjunta captura de403 con un marco verde alrededor delh1 y lo reproduce al entrar/recargar landing yapp. RouteAccessibility.jsx enfoca programáticamente h1/main al cambiarpathname; tokens.css197 aplica outline2px global a :focus-visible. Fuente comprobada; reproducción de navegador de este turno pendiente.621capturas PNG nuevas en evidencia027/028 suman66,466,057bytes y no están ignoradas.

## Resultado esperado y aceptación

- AC-01 [visual]: CUANDO se abra/recargue una página o se navegue por puntero, el título DEBERÁ presentarse sin marco de selección verde; el foco programático de contenido y título de documento DEBERÁN conservar su propósito sin desplazar automáticamente la posición inicial/restaurada del documento.
- AC-02 [accessibility]: CUANDO se useTab/Enter o Saltar al contenido, los controles DEBERÁN conservar foco visible, secuencia y navegación; cambiosSPA y encabezados asíncronos DEBERÁN conservar foco comprensible sin robarlo tras interacción.
- AC-03 [functional]: CUANDO Git enumere las capturas de specs/*/evidence, las imágenes DEBERÁN quedar ignoradas y conservarse localmente, mientras activos de frontend/public y datos/textos de evidencia DEBERÁN seguir disponibles para versionar según política existente.
- AC-04 [functional]: DESPUÉS de revisar y corregir, los cuatro gates vigentes y el harnessDOM pertinente DEBERÁN pasar con evidencia vinculada al código; el conjunto de cambios de027/028/029 DEBERÁ quedar revisado para su publicación sin imágenes locales ni secretos.

Entrega autorizada posterior al gate: commit y push normales alorigin/develop; verificar hash remoto separado del cierre de código. Esta entrega sigue siendo obligatoria y no se considera ejecutada por pasar el gate.

## Alcance y no objetivos

Corrección compartida de foco,gitignore de imágenes generadas y revisión previa a publicar los cambios de esta sesión. Better-interface dirige el alcance visual con dueño accesibilidad. Reutilizar código,estilos,tokens,servicios y stack. No backend,permisos,NLP,migraciones,activos de producto borrados,despliegue ni cambio global deagentes. El usuario autorizó commit/push a GitHub en este turno; rama actualdevelop,origin sin divergencia al fetch. No modificar auditorías históricas como instrucciones.
