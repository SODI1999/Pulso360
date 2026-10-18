# [SPEC-001] Chat UI Craft (Rediseño Ergonómico y Visual del Chat Agente — SST)

Fecha: 2026-10-18  
Última actualización: 2026-10-18 (Extensión de alcance para Drawer de SST)

## 0. Fase de Clarificación y Supuestos

- **Decisión de Enfoque**: Se opta por el estándar de **Craftsmanship Nativo**. No se introducirán librerías externas ni frameworks pesados (como Tailwind o paquetes externos de ShadCN), preservando la arquitectura estricta del proyecto definida en [../../AGENTS.md](../../AGENTS.md#L45-L53). En su lugar, se implementan los patrones visuales y ergonómicos modernos (profundidad por elevación sutil, radios orgánicos de 12-16px, compositor integrado y espaciado respirable) usando exclusivamente CSS nativo y los tokens de diseño existentes en [../../frontend/src/styles/tokens.css](../../frontend/src/styles/tokens.css).
- **Preservación Funcional**: La lógica de negocio, manejo de WebSockets (`useChatDelivery`), persistencia en PostgreSQL y pruebas unitarias/regresión existentes en [../../frontend/tests/chat-delivery.test.mjs](../../frontend/tests/chat-delivery.test.mjs) se preservan al 100%.
- **Validación de Vista de Agente**: La vista del agente ([../../frontend/src/features/agent/components/SupportChatCard.jsx](../../frontend/src/features/agent/components/SupportChatCard.jsx)) fue validada satisfactoriamente en ergonomía y acabado visual.
- **Corrección de Alcance para Vista SST**: La vista del especialista en el panel lateral ([../../frontend/src/features/sst/components/SstRequestChatDrawer.jsx](../../frontend/src/features/sst/components/SstRequestChatDrawer.jsx)) presentó colapso de layout (compositor flotante encogido a mitad de pantalla, falta de contraste en el fondo y solapamiento de hora/remitente en burbujas salientes debido a reglas conflictivas en [../../frontend/src/styles/sst.css](../../frontend/src/styles/sst.css)).
- **Mandato Anti-Slop en SST**: Conforme a [../../DESIGN.md](../../DESIGN.md#L5-L18) y a la instrucción explícita del usuario, la solución para SST debe ser estrictamente sobria, funcional y contenida, evitando sobrecargar la pantalla con chips innecesarios o componentes decorativos artificiales.

## 1. Need and scope

- **Necesidad**: Mientras que la vista del agente alcanzó el estándar deseado, el drawer lateral del especialista SST requiere una corrección estructural en su layout flex para que el compositor abarque el 100% del ancho anclado en la base del panel, el feed de mensajes cuente con contraste de fondo `--c-fondo`, se resuelva el solapamiento de metadatos en burbujas, y el especialista disponga de un contexto sobrio del caso que atiende (motivo, urgencia, SLA).
- **Alcance**:
  1. Rediseñar el compositor de mensajes en un contenedor integrado ("Card Composer") con `<textarea>` auto-expandible (1 a 4 líneas), atajo `Enter` para enviar y `Shift + Enter` para salto de línea.
  2. Modernizar la geometría de las burbujas de mensaje con curvatura asimétrica (14-16px), sombras sutiles de una capa (`--shadow-xs`), padding adecuado y contraste accesible WCAG AA.
  3. Incorporar divisores cronológicos contextuales ("Hoy", "Ayer", o fecha) en la lista de mensajes.
  4. Rediseñar la cabecera del chat con indicador de presencia en vivo refinado y contexto del Radicado Formal (RF-10).
  5. Saneamiento del layout flex en el drawer de SST ([../../frontend/src/styles/sst.css](../../frontend/src/styles/sst.css)): anclaje inferior a ancho completo (100%), eliminación de selectores obsoletos que pisaban a `apoyo.css` y erradicación del solapamiento de remitente/hora.
  6. Barra de contexto sobria del radicado para SST: resumen no invasivo con motivo, urgencia y SLA.
- **Non-Goals (Fuera de alcance)**:
  - No añadir chips decorativos o componentes superfluos que sobrecarguen la vista de SST ("Zero Slop").
  - No modificar la arquitectura de base de datos, rutas REST de backend ni contratos de WebSockets.
  - No instalar dependencias npm de estilos ni migrar a TypeScript.
  - No alterar las políticas de privacidad, anonimato ni los umbrales de agregación \(k \ge 5\).

## 2. Acceptance Criteria and Non-Goals

- **AC-01 (Compositor Integrado y Auto-expandible)**: El campo de entrada de texto debe ser un `<textarea>` dentro de un contenedor unificado con bordes suaves y elevación. Su altura debe adaptarse automáticamente al texto escrito desde 1 fila hasta un máximo de 4 filas (~120px) sin barras de scroll prematuras ni desbordamientos. Al enviarse o vaciarse, debe restaurar su altura compacta inicial.
- **AC-02 (Atajos Ergonómicos de Teclado)**: En el compositor, presionar la tecla `Enter` (sin `Shift`) debe accionar el envío del mensaje siempre que contenga texto válido y no esté en curso de envío. Presionar `Shift + Enter` debe insertar un salto de línea sin disparar el envío.
- **AC-03 (Burbujas Asimétricas y Profundidad "Craft")**: Los mensajes entrantes y salientes deben contar con esquinas asimétricas fluidas (14-16px con muesca sutil de 4px orientada al remitente), elevación suave mediante sombra difusa de 1 capa, padding respirable (10px 14px), tipografía `Plus Jakarta Sans` y contraste de texto que cumpla con el estándar WCAG AA.
- **AC-04 (Separadores Cronológicos Inteligentes)**: La lista de mensajes debe agrupar los mensajes mostrando divisores de fecha centrados y discretos cuando cambie el día calendario entre mensajes consecutivos o respecto al día actual ("Hoy", "Ayer" o formato fecha).
- **AC-05 (Estados de Interfaz Obligatorios)**: Se deben mantener y mejorar estéticamente los 4 estados requeridos: carga, vacío/en espera, error y concluido.
- **AC-06 (Calidad y Cero Regresiones)**: Las pruebas existentes en [../../frontend/tests/chat-delivery.test.mjs](../../frontend/tests/chat-delivery.test.mjs) y los quality gates del frontend (`npm test`, `npm run lint`, `npm run build`) deben pasar satisfactoriamente.
- **AC-07 (Anclaje y Ancho Completo del Compositor SST)**: En el panel lateral de SST, el compositor debe abarcar el 100% del ancho del drawer y permanecer fijado en el pie del contenedor (`flex-shrink: 0`), con el feed de mensajes ocupando el espacio vertical restante (`flex: 1; min-height: 0`) con scroll independiente sobre fondo `--c-fondo` (`#f8fafc`).
- **AC-08 (Espaciado de Metadatos en Burbuja SST)**: El encabezado interno de las burbujas salientes de SST debe mantener separación horizontal adecuada (`justify-content: space-between; gap: 12px`), erradicando cualquier solapamiento visual entre la etiqueta de rol y la marca temporal.
- **AC-09 (Barra de Contexto Sobria para SST)**: El drawer de SST debe exhibir una franja informativa discreta en la parte superior con los datos esenciales del caso (motivo de la solicitud, urgencia y SLA de atención), utilizando tipografía contenida y sin componentes decorativos superfluos.
- **AC-10 (Calibración de Proporciones y Anclaje Vertical en SST)**: El compositor del drawer de SST debe permanecer anclado incondicionalmente en la base del panel lateral (`margin-top: auto; flex-shrink: 0`), eliminando cualquier espacio en blanco inferior remanente. El área de mensajes debe expandirse verticalmente sin topes artificiales (`max-height: none; flex: 1`) para ocupar todo el espacio entre la barra de contexto y el compositor con scroll independiente.

## 3. Domain applicability

| Security & Compliance Control | Required? | Technical Enforcement |
| :--- | :---: | :--- |
| **¿Toca datos personales sensibles (PII)?** | SÍ | Las conversaciones contienen información sobre salud laboral y estado anímico. Deben mantenerse aisladas en la sesión autorizada del radicado formal del titular (RF-10) y no exponerse a supervisores. |
| **¿Expone datos cross-tenant?** | N/A | El sistema opera sobre una única instancia organizacional; no existe concepto de tenencia compartida. |
| **¿Requiere registro de auditoría?** | SÍ | Toda interacción queda registrada en la base de datos PostgreSQL bajo `soporte_sesiones_chat` y `soporte_mensajes_chat`. La UI refleja fielmente la trazabilidad existente. |
| **¿Accede o procesa datos sensibles?** | SÍ | Se respeta la bandera `isAnonymous`, ocultando la identidad del agente ante SST y presentando el aviso de privacidad correspondiente. |

## 4. Experiencia y límites

- **Modo Reducido de Movimiento**: Cualquier micro-animación debe respetar la regla `@media (prefers-reduced-motion: reduce)`.
- **Adaptabilidad Responsive**: En dispositivos móviles o pantallas estrechas (drawer lateral), el compositor y las burbujas no deben provocar scroll horizontal ni ocultar el botón de envío.

## 5. Traceability

- **AC-01, AC-02** -> Plan: Sección 2.1 (Compositor Unificado) | Tareas: T-01, T-02
- **AC-03, AC-04** -> Plan: Sección 2.2 (Burbujas y Separadores) | Tareas: T-01, T-02
- **AC-05** -> Plan: Sección 2.3 (Estados de la Interfaz) | Tareas: T-01, T-02
- **AC-06** -> Plan: Sección 2.4 (Validación de Gates) | Tareas: T-04, T-07, T-09
- **AC-07, AC-08** -> Plan: Sección 2.5 (Saneamiento Drawer SST) | Tareas: T-05
- **AC-09** -> Plan: Sección 2.5 (Barra de Contexto SST) | Tareas: T-06
- **AC-10** -> Plan: Sección 2.6 (Calibración de Proporciones y Anclaje Vertical) | Tareas: T-08
