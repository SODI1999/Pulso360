# Evidencia de Verificación — [SPEC-001] Chat UI Craft

Fecha de convergencia: 2026-10-18  
Especificación activa: [spec.md](spec.md)  
Plan técnico: [plan.md](plan.md)  
Tareas de implementación: [tasks.md](tasks.md)  

---

## 1. Mapeo Criterio de Aceptación a Evidencia

| Criterio de Aceptación | Estado | Tipo de Evidencia | Ubicación / Comando / Detalle |
| :--- | :---: | :---: | :--- |
| **AC-01 (Compositor Integrado y Auto-expandible)** | **VERIFICADO** | OBSERVADO & EJECUTADO | Contenedor `.embedded-chat-composer-box` con `<textarea>` auto-expandible (1 a 4 filas, max 120px) y restauración a altura inicial al enviar en [SupportChatCard.jsx](../../frontend/src/features/agent/components/SupportChatCard.jsx#L130-L142) y [SstRequestChatDrawer.jsx](../../frontend/src/features/sst/components/SstRequestChatDrawer.jsx#L143-L157). |
| **AC-02 (Atajos Ergonómicos de Teclado)** | **VERIFICADO** | OBSERVADO & EJECUTADO | Manejo de `onKeyDown`: `Enter` dispara `handleSendMessage()` si hay texto válido; `Shift+Enter` inserta salto de línea sin enviar en [SupportChatCard.jsx](../../frontend/src/features/agent/components/SupportChatCard.jsx#L144-L149) y [SstRequestChatDrawer.jsx](../../frontend/src/features/sst/components/SstRequestChatDrawer.jsx#L159-L164). |
| **AC-03 (Burbujas Asimétricas y Profundidad "Craft")** | **VERIFICADO** | OBSERVADO | Radio orgánico asimétrico (`16px 16px 4px 16px` para salientes y `16px 16px 16px 4px` para entrantes), elevación de una capa (`--shadow-xs`), tipografía del sistema y contraste accesible WCAG AA en [apoyo.css](../../frontend/src/styles/apoyo.css#L1730-L1770). |
| **AC-04 (Separadores Cronológicos Inteligentes)** | **VERIFICADO** | OBSERVADO & EJECUTADO | Separador `.chat-date-separator` con pill flotante ("Hoy", "Ayer" o fecha local) intercalado dinámicamente entre mensajes de días distintos en [SupportChatCard.jsx](../../frontend/src/features/agent/components/SupportChatCard.jsx#L151-L178) y [SstRequestChatDrawer.jsx](../../frontend/src/features/sst/components/SstRequestChatDrawer.jsx#L167-L194). |
| **AC-05 (Estados de Interfaz Obligatorios)** | **VERIFICADO** | OBSERVADO | Estados de carga (indicador accesible con rol `status`), vacío/en espera, error de envío con reintento, y modo cerrado/solo lectura en [SupportChatCard.jsx](../../frontend/src/features/agent/components/SupportChatCard.jsx#L205-L290) y [SstRequestChatDrawer.jsx](../../frontend/src/features/sst/components/SstRequestChatDrawer.jsx#L427-L466). |
| **AC-06 (Calidad y Cero Regresiones)** | **VERIFICADO** | EJECUTADO | Tests de frontend: 48/48 superados (`frontend/tests/`). Tests de backend: 132/132 superados (`backend/test/run-contracts.js`). ESLint: 0 errores/warnings (`npm run lint`). Vite: compilación de producción exitosa (`npm run build`). |
| **AC-07 (Anclaje y 100% Ancho en SST)** | **VERIFICADO** | OBSERVADO | `.sst-drawer-composer` abarca `width: 100%`, `flex-shrink: 0`, con padding ergonómico y elevación en la base del panel en [sst.css](../../frontend/src/styles/sst.css#L1207-L1219). |
| **AC-08 (Espaciado de Metadatos en Burbuja SST)** | **VERIFICADO** | OBSERVADO | `.embedded-msg-meta` define `display: flex; justify-content: space-between; gap: 12px; width: 100%;` impidiendo cualquier solapamiento tipográfico entre rol y hora en [apoyo.css](../../frontend/src/styles/apoyo.css#L1775-L1795). |
| **AC-09 (Barra de Contexto Sobria para SST)** | **VERIFICADO** | OBSERVADO | Franja superior `.sst-drawer-context-bar` con motivo, urgencia (badge sobrio) y plazo/SLA sin elementos decorativos superfluos ("Zero Slop") en [SstRequestChatDrawer.jsx](../../frontend/src/features/sst/components/SstRequestChatDrawer.jsx#L288-L305) y [sst.css](../../frontend/src/styles/sst.css#L1235-L1300). |
| **AC-10 (Calibración de Proporciones y Anclaje Vertical)** | **VERIFICADO** | OBSERVADO & EJECUTADO | `.sst-drawer-messages-list` con `flex: 1; min-height: 0; max-height: none; overflow-y: auto;` y `.sst-drawer-composer` con `margin-top: auto; flex-shrink: 0; width: 100%;` en [sst.css](../../frontend/src/styles/sst.css#L1195-L1215). Desacoplamiento total de selectores SST en [apoyo.css](../../frontend/src/styles/apoyo.css#L1678). Erradicación del espacio en blanco inferior. |

---

## 2. Registro de Verificaciones Automatizadas (Quality Gates)

### Backend Contracts & Invariants
- **Comando**: `cd "backend" && npm test`
- **Resultado**: 132 tests pasando, 44 suites, 0 fallos.
- **Duración**: ~33 segundos.

### Frontend Tests (Chat Delivery & Unit Tests)
- **Comando**: `cd "frontend" && npm test`
- **Resultado**: 48 tests pasando, 0 fallos.
- **Duración**: ~2.3 segundos.

### Frontend Linter (ESLint)
- **Comando**: `cd "frontend" && npm run lint`
- **Resultado**: Código 0 (cero errores, cero advertencias).

### Frontend Production Build (Vite)
- **Comando**: `cd "frontend" && npm run build`
- **Resultado**: Compilación exitosa en 10.17s.
- **Artefactos**:
  - `dist/index.html` (0.54 kB)
  - `dist/assets/index-b6TKb1Um.css` (365.69 kB)
  - `dist/assets/index-DtXvcEGy.js` (923.61 kB)

---

## 3. Limitaciones Conocidas y Alcance de Verificación

1. **Entorno de Pruebas**: Verificación ejecutada en entorno local Windows 11 con Node.js v20.x, Vite v6.4.4 y navegador Chromium. No se afirma compatibilidad universal con entornos obsoletos (e.g. Internet Explorer).
2. **Restricción de Librerías Externas**: No se introdujeron paquetes de ShadCN ni Tailwind CSS, preservando la arquitectura estricta del proyecto definida en [AGENTS.md](../../AGENTS.md).
3. **Persistencia e Integridad**: Se preservaron sin alteraciones los contratos de base de datos PostgreSQL, las tablas `soporte_sesiones_chat` y `soporte_mensajes_chat`, y los eventos WebSocket de Socket.IO.
