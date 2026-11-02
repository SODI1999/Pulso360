# [DEBT-027] Corrección de los doce hallazgos de interfaz

## Evidencia y costo actual

Fuente: [audit-001](../../anti-slop/audit-001-2026-11-01.md). La auditoría del 1 de noviembre es evidencia histórica por muestras, sin aprobación global. Inspección estática actual confirma dotación usada como publicación en CampaignCard/adminQueries, título del supervisor basado en usuario mientras consulta el ámbito seleccionado, efecto que reselecciona tras volver, artículo accionable, estados de chat desiguales, etiqueta de presencia sin evidencia, scroll incondicional, integridad sin comprobar presentada como inmutable, promesa institucional absoluta, fórmula literal y fechas técnicas.

Usuarios: administración organiza dotación; supervisor interpreta agregados; agente solicita/revisa apoyo; SST trabaja por caso; auditor revisa eventos. Consecuencia: atribución incorrecta, garantías engañosas y fricción al acceder y leer conversaciones. No se ha demostrado fuga de backend.

## Alcance y criterios de aceptación

- AC-01 [functional]: CUANDO se renderice una campaña, el sistema DEBERÁ mostrar dotación sin inferir publicación o protección de métricas por tamaño del equipo.
- AC-02 [functional]: CUANDO el supervisor seleccione un ámbito autorizado, el sistema DEBERÁ utilizar ese mismo ámbito para título, contexto y parámetros de consulta.
- AC-03 [interaction]: CUANDO el agente vuelva desde un radicado, el sistema DEBERÁ conservar la lista sin reseleccionar automáticamente y devolver foco al disparador; abrir y volver DEBERÁ funcionar en carga, espera, error, conversación e historial cerrado.
- AC-04 [accessibility]: CUANDO se recorra la lista de radicados con teclado, el sistema DEBERÁ exponer botones con nombre y selección, activación nativa y foco visible; carga y error DEBERÁN comunicar su estado y recuperación.
- AC-05 [visual]: CUANDO se utilice acompañamiento a 320, 768 y 1366 CSS px, el sistema DEBERÁ priorizar selección o conversación, sin desbordamiento de página ni acciones cortadas; espera, carga, error, historial largo y conversación DEBERÁN conservar jerarquía y tokens. A 200% el contenido DEBERÁ seguir alcanzable.
- AC-06 [interaction]: MIENTRAS se lean mensajes anteriores en agente o SST, recibir un mensaje DEBERÁ conservar la posición y ofrecer un aviso; al estar al final o enviar un mensaje propio confirmado, el sistema DEBERÁ mostrar el final sin interrumpir otras lecturas.
- AC-07 [functional]: MIENTRAS la integridad no haya sido verificada, el sistema DEBERÁ indicar que está pendiente de comprobar. CUANDO una sesión de chat esté abierta, el sistema DEBERÁ indicar canal abierto sin inferir presencia humana. Los avisos de turno DEBERÁN evitar garantías de consecuencias institucionales y SST DEBERÁ mostrar el umbral real sin fórmula literal ni atribución normativa añadida.
- AC-08 [functional]: CUANDO el auditor consulte eventos, el sistema DEBERÁ mostrar fecha localizada con zona explícita y acciones legibles, conservando fecha exacta y código en detalle.
- AC-09 [functional]: DESPUÉS de los cambios, el sistema DEBERÁ conservar límites de rol, estados protegidos, servicios de entrega y scripts vigentes sin regresiones detectadas por las comprobaciones configuradas.
- AC-10 [interaction]: CUANDO SST revise, active, responda o concluya un chat por radicado, el sistema DEBERÁ mantener una sola superficie modal activa, permitir cancelar y recuperar foco, conservar el borrador del caso en la página y mostrar fallos con recuperación; el envío DEBERÁ conservar confirmación del servicio y el cierre sus estados actuales.
- AC-11 [visual]: CUANDO SST abra el panel de un radicado a 320, 768 y 1366 CSS px y con zoom 200%, el sistema DEBERÁ mantener contexto legible, historial desplazable y compositor/acciones alcanzables, también durante carga, ausencia de chat, error, contenido largo y cierre. La revisión DEBERÁ seguir las seis disciplinas better y el gate DESIGN.
- AC-12 [functional]: CUANDO falten urgencia o plazo de un radicado, la vista SST DEBERÁ indicar su ausencia sin fabricar un valor. CUANDO un chat esté cerrado o no permita responder, la interfaz DEBERÁ mostrar ese estado sin ofrecer un envío que no puede realizarse.

## Decisiones y límites

El usuario delegó correcciones y dirección visual a better-interface (2026-11-02). Sus seis disciplinas orientan implementación/revisión; DESIGN.md conserva el único gate visual de Pulso360. Convención de APIs: JSDoc, sin comentarios que narren sintaxis.

Ampliación confirmada el 2026-11-02: el usuario prioriza urgentemente el chat SST bajo better. Se revisa el flujo completo del panel lateral, incluida su confirmación de cierre y el disparador del buzón. No añade persistencia entre rutas ni cambia dominio/estados/endpoints. Los defectos enumerados en la evidencia inicial describen la línea base antes de 027; las correcciones actuales se registran en verification.md.

No objetivos: chat persistente/global, presencia humana nueva, nuevas métricas/permisos/endpoints, cambios de stack, datos académicos creados o borrados, migraciones, commits o despliegue. Reutilizar chatService/useChatDelivery, auth, consultas y tokens. No importar componentes entre features hermanas.

El bloqueo inicial de render se conserva como hecho histórico. El usuario autorizó explícitamente Chrome DevTools como alternativa y se observaron los recorridos en Chrome156 con perfil temporal aislado y transporte de muestra interceptado. La evidencia actual y sus límites están en verification.md y acceptance.json; no existe aprobación global de otras pantallas.
