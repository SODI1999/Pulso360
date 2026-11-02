# [RCA-029] Investigación de causa

## Evidencia e hipótesis

RouteAccessibility.focusContent agrega tabindex-1 y llama focus(preventScroll). tokens.css197 aplica outline2px var(--c-primario) a cualquier :focus-visible. El navegador decide esa pseudoclase por heurística; focusprogramático al inicio puede activarla aunque no huboTab. La captura del usuario coincide con esa responsabilidad compartida. No es un borde permanente deAccessDenied. Debe confirmarse con estilo computado y comparar título/controles.

## Causa raíz

La misma presentación global de foco alcanza destinos estáticos programáticos y controles interactivos sin distinguir su tarea. El indicador de controles no debe eliminarse para ocultar el síntoma. Gitignore no contempla las capturas generadas en specs/*/evidence; son archivos nuevos,no activos de aplicación.

Referencias consultadas2026-11-02:MDN :focus-visible yHTMLElement.focus. No se adopta API nueva o cambio de versiones.
