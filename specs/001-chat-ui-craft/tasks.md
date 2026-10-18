# [TASKS-001] Tareas de Implementación — Rediseño Visual y Ergonómico del Chat

Especificación: [spec.md](spec.md)  
Plan técnico: [plan.md](plan.md)

---

## Lista de Tareas

- [x] **T-01: Estilos de Craftsmanship Nativo en `apoyo.css`**
  - **Criterios asociados**: AC-01, AC-03, AC-04, AC-05
  - **Archivos afectados**: [../../frontend/src/styles/apoyo.css](../../frontend/src/styles/apoyo.css)
  - **Alcance**:
    - Definir las clases para el compositor unificado: `.embedded-chat-composer-box`, `.embedded-composer-textarea`, `.embedded-composer-footer`, `.composer-keyboard-hint`, `.embedded-composer-counter` y `.embedded-composer-send-btn`.
    - Rediseñar las burbujas de conversación `.msg-outgoing .embedded-chat-bubble` (radio `16px 16px 4px 16px`, sombra difusa con acento teal) y `.msg-incoming .embedded-chat-bubble` (radio `16px 16px 16px 4px`, sombra difusa `--shadow-xs`).
    - Añadir las reglas para el divisor contextual de fecha `.chat-date-separator` con pill flotante y `backdrop-filter: blur(4px)`.
    - Actualizar `.support-embedded-chat-box` con elevación `--shadow-sm` y radio de 12px, y pulir la cabecera y el avatar.
  - **Verificación**: Validación de sintaxis CSS, cálculo de contraste WCAG AA con tokens y ausencia de advertencias de linter.

- [x] **T-02: Refactor Ergonómico del Compositor y Feed en `SupportChatCard.jsx`**
  - **Criterios asociados**: AC-01, AC-02, AC-03, AC-04, AC-05
  - **Archivos afectados**: [../../frontend/src/features/agent/components/SupportChatCard.jsx](../../frontend/src/features/agent/components/SupportChatCard.jsx)
  - **Alcance**:
    - Reemplazar el `<input type="text">` por un `<textarea>` gestionado con auto-ajuste de altura dinámico (hasta 4 filas / 120px).
    - Implementar atajos de teclado: `Enter` para enviar (cuando haya texto y no esté enviando) y `Shift + Enter` para salto de línea.
    - Implementar el algoritmo de intercalado de divisores de fecha cronológicos ("Hoy", "Ayer", o fecha formateada).
    - Actualizar la estructura JSX para usar el compositor integrado y las nuevas burbujas asimétricas con hora integrada.
  - **Verificación**: Comprobación interactiva del comportamiento de auto-expansión, envío con `Enter` y paso de pruebas en [../../frontend/tests/chat-delivery.test.mjs](../../frontend/tests/chat-delivery.test.mjs).

- [x] **T-03: Sincronización Simétrica Inicial en `SstRequestChatDrawer.jsx`**
  - **Criterios asociados**: AC-01, AC-02, AC-03, AC-04, AC-05
  - **Archivos afectados**: [../../frontend/src/features/sst/components/SstRequestChatDrawer.jsx](../../frontend/src/features/sst/components/SstRequestChatDrawer.jsx)
  - **Alcance**:
    - Migrar el `<input>` a `<textarea>` con auto-altura y atajos `Enter`/`Shift+Enter`.
  - **Verificación**: Inspección de props y eventos de WebSocket.

- [x] **T-04: Ejecución de Quality Gates Fase 1**
  - **Criterios asociados**: AC-06
  - **Archivos afectados**: Todos los componentes modificados en fase inicial
  - **Alcance**:
    - Ejecutar suite de pruebas del frontend (`npm test`), ESLint (`npm run lint`) y build (`npm run build`).
  - **Verificación**: Pruebas superadas en fase 1.

- [x] **T-05: Saneamiento de Layout Flex y Eliminación de Reglas Obsoletas en `sst.css`**
  - **Criterios asociados**: AC-07, AC-08
  - **Archivos afectados**: [../../frontend/src/styles/sst.css](../../frontend/src/styles/sst.css)
  - **Alcance**:
    - Configurar `.sst-drawer-body` con `flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; background-color: var(--c-fondo);`.
    - Configurar `.sst-drawer-chat-stream` con `flex: 1; min-height: 0; display: flex; flex-direction: column;`.
    - Configurar `.sst-drawer-messages-list` con `flex: 1; min-height: 0; overflow-y: auto; padding: 18px 20px; background-color: var(--c-fondo); gap: 12px;`.
    - Configurar `.sst-drawer-composer` como bloque fijado en la base (`flex-shrink: 0; width: 100%; padding: 12px 16px; background-color: var(--c-superficie); border-top: 1px solid var(--c-borde-suave); box-shadow: 0 -2px 8px rgba(15, 23, 42, 0.04);`).
    - Eliminar selectores obsoletos de burbujas en `sst.css` para que las burbujas adopten limpiamente el diseño unificado de `apoyo.css`.
    - Ajustar `.embedded-msg-meta` con `gap: 12px; justify-content: space-between; width: 100%` para erradicar cualquier solapamiento tipográfico entre rol y hora.
  - **Verificación**: Inspección en el navegador verificando que el compositor ocupe el 100% del ancho en la base del panel y las burbujas no colisionen.

- [x] **T-06: Incorporación de Barra de Contexto Sobria ("Zero Slop") en `SstRequestChatDrawer.jsx`**
  - **Criterios asociados**: AC-09
  - **Archivos afectados**: [../../frontend/src/features/sst/components/SstRequestChatDrawer.jsx](../../frontend/src/features/sst/components/SstRequestChatDrawer.jsx) y [../../frontend/src/styles/sst.css](../../frontend/src/styles/sst.css)
  - **Alcance**:
    - Renderizar una barra informativa sobria (`.sst-drawer-context-bar`) bajo la cabecera del drawer con los datos esenciales del radicado (`código`, `motivo`, `urgencia`, `SLA`).
    - Usar tipografía contenida (12px), fondo `--c-fondo-subtle` y bordes sutiles sin adornos ni botones artificiales ("Zero Slop").
  - **Verificación**: Verificación visual de legibilidad y sobriedad en el drawer.

- [x] **T-07: Ejecución de Quality Gates y Verificación Integral Fase 2**
  - **Criterios asociados**: AC-06
  - **Archivos afectados**: Todos los componentes y estilos modificados
  - **Alcance**:
    - Ejecutar suite de pruebas de frontend: `cd frontend && npm test`.
    - Ejecutar linter: `cd frontend && npm run lint`.
    - Ejecutar build de producción: `cd frontend && npm run build`.
  - **Verificación**: Cero fallos, cero advertencias y build limpio.

- [x] **T-08: Calibración de Proporciones y Anclaje Vertical del Drawer SST**
  - **Criterios asociados**: AC-10
  - **Archivos afectados**: [../../frontend/src/styles/sst.css](../../frontend/src/styles/sst.css) y [../../frontend/src/styles/apoyo.css](../../frontend/src/styles/apoyo.css)
  - **Alcance**:
    - Desacoplar `.sst-drawer-messages-list`, `.sst-drawer-composer` y `.sst-drawer-closed-banner` de `apoyo.css` para erradicar el `max-height: 380px` que restringía el feed en el drawer.
    - En `sst.css`, asegurar que `.sst-drawer-messages-list` tenga `flex: 1; min-height: 0; max-height: none; overflow-y: auto;` permitiendo el aprovechamiento íntegro de la altura vertical disponible.
    - Asegurar que `.sst-drawer-composer` tenga `margin-top: auto; flex-shrink: 0; width: 100%;` fijándolo sin holgura en el borde inferior del panel.
  - **Verificación**: Confirmación visual de anclaje inferior del compositor y desaparición del espacio en blanco.

- [x] **T-09: Verificación de Quality Gates Fase 3**
  - **Criterios asociados**: AC-06
  - **Archivos afectados**: `frontend/src/styles/apoyo.css`, `frontend/src/styles/sst.css`
  - **Alcance**:
    - Ejecutar `cd frontend && npm test`.
    - Ejecutar `cd frontend && npm run lint`.
    - Ejecutar `cd frontend && npm run build`.
    - Ejecutar auditoría OmniSpec `omni-spec audit 001`.
  - **Verificación**: 100% de pruebas pasando, cero advertencias de linter y build de Vite exitoso.
