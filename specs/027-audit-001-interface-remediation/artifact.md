# Pulso360 · auditoría y chat SST verificados

**Spec 027 completada** el 2 de noviembre de 2026 a las 14:35:28 UTC. Los doce criterios están respaldados y el CLI aprobó los cuatro controles del proyecto. [Constancia de cierre](completion.json).

## Qué quedó corregido

- SST: contexto completo y datos ausentes explícitos; activar, responder y concluir dentro de un único diálogo; borradores al cancelar/reabrir; errores que retienen notas/texto y recuperan foco; controles de 44 px y compositor de 56 px.
- Agente: selección explícita con Enter/Espacio, retorno y foco en carga/espera/error/activo/cerrado; borradores por caso; aviso de mensajes nuevos sin mover la lectura y recuperación después de un envío fallido.
- Supervisor: título y consulta siguen el ámbito seleccionado; caché y respuestas tardías no mezclan resultados.
- Admin/auditor y textos: dotación sin inferir publicación, integridad pendiente de comprobar, fechas/acciones legibles, umbral real y eliminación de garantías institucionales sin evidencia.

Se reutilizaron chatService, useChatDelivery, auth, consultas, useModalA11y, useBodyScrollLock, Icon y tokens. Se añadieron useChatScroll y support-chat.css para la responsabilidad compartida, sin importaciones entre features. No se cambiaron stack, dependencias, backend, permisos, persistencia ni NLP.

## Abrir SST

1. Abrir [la aplicación local](http://localhost:5173/login).
2. Elegir SST en el acceso académico e ingresar.
3. Ir a Buzón de apoyo o abrir [la ruta SST](http://localhost:5173/sst/buzon) después de iniciar sesión.

App y API respondieron HTTP200 al cierre. El preview de Deska seguía informando ausencia de ventana; se validó con Chrome DevTools por autorización del usuario. No se determinó la causa del fallo del preview.

## Capturas seleccionadas

Este artefacto conserva una selección de capturas para respetar el límite de tamaño de Deska. La evidencia completa permanece en specs/027-audit-001-interface-remediation del proyecto: verification.md, acceptance.json, verification.json y evidence/ui-observations.json. [Registro de las 39 observaciones](evidence/ui-observations.json); las referencias del registro a capturas no incluidas corresponden a ese directorio local.

| Vista | Captura |
|---|---|
| SST móvil, 320 CSS px | [Abrir](evidence/sst-final-320.png) |
| SST escritorio, 1366 CSS px | [Abrir](evidence/sst-final-1366.png) |
| SST error de cierre con foco | [Abrir](evidence/sst-final-close-error.png) |
| Chat del agente, 320 CSS px | [Abrir](evidence/agent-final-320.png) |
| Supervisor con consulta retenida | [Abrir](evidence/supervisor-final-loading.png) |

## Verificación y revisión better

- Backend:132/132 pruebas; frontend:50/50. Lint y build exit0. Verify027 y complete027 exitosos. Build conserva advertencia de chunk>500kB: JS950.10kB/gzip265.55kB.
-39 observaciones de navegador: 320/768/1366 CSS px, teclado/foco, estados, borradores, lectura/aviso, envío/error/reintento y cierre.
- better-interface dirigió accesibilidad, layout, escritura, tipografía, color y UI. El reporte completo está en anti-slop/audit-004-2026-11-02.md. Gate único DESIGN: tarea/composición, proporción/responsive, funcionamiento/estados, privacidad/roles/evidencia, accesibilidad e integración técnica revisados en el alcance afectado.
- Contraste efectivo observado: texto17.85:1, nota de privacidad7.58:1, canal abierto5.20:1, hora recibida4.76:1 y texto/foco blanco sobre teal5.47:1. Movimiento reducido observado.
- La revisión independiente de fuente/coherencia no encontró nuevos hallazgos accionables. No produjo render propio. No quedan defectos identificados pendientes dentro de lo revisado.

Los casos y mensajes están marcados MUESTRA-UI. Envíos y cierres se interceptaron localmente; no se enviaron mensajes ni se concluyeron casos reales. Los contratos de backend se probaron por separado; no se afirma entrega E2E entre cuentas reales.

El 200% se comprobó como reflow equivalente mediante viewport CSS683×384 DPR2 desde1366×768. No se accionó el menú de zoom nativo ni se probó lector de pantalla o móvil físico. El alcance no certifica toda la aplicación. Los borradores no sobreviven salir de ruta/recargar. No hubo commits ni despliegues.
