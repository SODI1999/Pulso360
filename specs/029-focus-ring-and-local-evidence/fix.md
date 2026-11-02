# [FIX-029] Corrección y preparación de publicación

## Cambio mínimo y compatibilidad

Better-accessibility propone y corrige únicamente foco/estilo de destinos de ruta y comprobaciónDOM. Mantener foco semántico,skiplink y títulos,ring visible de controles y cancelación del foco tardío. Evitar resetglobal outline:none o dependencia de APIexperimental.

Gitignore se limita a imágenes en specs/*/evidence, sin borrar ficheros ni ignorar assets públicos. Revisar archivos staged,diffs,extensiones/tamaño y materiallocal antes decommit. Conservar commits previos y usar convenciónConventionalCommits en español; push normal origin develop. Rollback: revertir parche acotado si introduce regresión; no reset ni forcepush.

## Regresión

Render real de landing,403 y una ruta deapp a320/1366; entrada/recarga,puntero,Tab/Enter,skiplink,encabezado async y modal. Capturas locales e informe del gate únicoDESIGN. Tests vigentes backend/npmtest,frontend/npmtest/lint/build; harnessChrome real si está permitido. No atribuir testDOM a lector de pantalla.

## Observabilidad

No nueva telemetría:problema visible de presentación. Evidencia con focoactivo,pseudoclase y estilo computado, y gitcheck-ignore/estado. No registrar contenido sensible ni credenciales.

## Tareas

- [x] TASK-01: Reproducir/corregir foco bajo direcciónbetter y comprobar entrada,recarga,puntero,teclado y skiplink(AC01/02).
- [x] TASK-02: Ignorar capturas locales y revisar pendientes/diff/archivos que irán aGitHub(AC03/04).
- [x] TASK-03: Revisar resultado integrado,gates ypreparar evidencia para cierre/publicación normal autorizada(AC01/02/03/04).
