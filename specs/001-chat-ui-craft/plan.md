# [PLAN-001] Plan Técnico de Rediseño Visual y Ergonómico del Chat (Craft Nativo)

Fecha: 2026-10-18  
Última actualización: 2026-10-18 (Saneamiento de Drawer SST y Barra de Contexto)  
Especificación asociada: [spec.md](spec.md)

---

## 1. Evidencia y Arquitectura Existente

### Archivos e Implementación Observada
- **Componente de Agente**: [../../frontend/src/features/agent/components/SupportChatCard.jsx](../../frontend/src/features/agent/components/SupportChatCard.jsx) (Validado satisfactoriamente).
- **Componente de Especialista SST**: [../../frontend/src/features/sst/components/SstRequestChatDrawer.jsx](../../frontend/src/features/sst/components/SstRequestChatDrawer.jsx).
- **Hojas de Estilos**:
  - [../../frontend/src/styles/apoyo.css](../../frontend/src/styles/apoyo.css#L1543-L1790) (Estilos base de chat).
  - [../../frontend/src/styles/sst.css](../../frontend/src/styles/sst.css#L1180-L1350) (Estilos del drawer lateral que entraron en conflicto de especificidad).
- **Tokens de Diseño Base**: [../../frontend/src/styles/tokens.css](../../frontend/src/styles/tokens.css).
- **Pruebas de Entrega Existentes**: [../../frontend/tests/chat-delivery.test.mjs](../../frontend/tests/chat-delivery.test.mjs).

### Restricciones y Mandato Anti-Slop
1. **Sin Dependencias Externas**: Conforme a [../../AGENTS.md](../../AGENTS.md#L45-L53), se preserva el stack en React 18 + JavaScript/JSX + Vanilla CSS nativo.
2. **Cuidado con el Slop**: En cumplimiento de [../../DESIGN.md](../../DESIGN.md#L5-L18) y la directriz del usuario, la vista de SST no debe incorporar botones artificiales, chips superfluos ni decoraciones innecesarias. Se prioriza una ergonomía de trabajo sobria, legible y funcional.
3. **Preservación Total de la Lógica de Negocio**: Inalterados los contratos de WebSockets, persistencia en PostgreSQL, cierre formal de radicados y control de confidencialidad.

---

## 2. Propuesta de Cambio y Diseño de Componentes

### 2.1 Compositor Integrado y Ergonómico (Auto-growing Textarea)
* Reemplazo de `<input>` por `<textarea>` gestionado con auto-altura (hasta 4 líneas / 120px).
* Contenedor unificado `.embedded-chat-composer-box` con fondo reactivo al foco (`:focus-within`), leyenda de atajos (`Enter ↵ para enviar · Shift+Enter para salto de línea`), contador de caracteres y botón circular de envío.

### 2.2 Burbujas Asimétricas y Feed de Conversación
* Burbujas con curvatura orgánica moderna (16px con muesca de 4px hacia el emisor), sombras difusas de 1 capa y metadatos con espaciado calibrado.
* Separadores cronológicos inteligentes (`.chat-date-separator`) con pill flotante para agrupar mensajes por fecha.

### 2.3 Cabecera, Contenedor y Estados Obligatorios
* Contenedor con elevación `--shadow-sm`, radio de 12px y estados de carga, vacío, error y cerrado limpios.

### 2.4 Saneamiento Estructural del Drawer de SST ([../../frontend/src/styles/sst.css](../../frontend/src/styles/sst.css))
* **Causa raíz del defecto observado**: En `sst.css`, reglas históricas (`.sst-drawer-composer` con `display: flex; align-items: center` y selectores de alta especificidad para burbujas) pisaban a `apoyo.css`, provocando que el compositor se encogiera a media altura y los metadatos de la burbuja colisionaran.
* **Solución de ingeniería**:
  * Configurar `.sst-drawer-body` con `flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; background-color: var(--c-fondo);`.
  * Configurar `.sst-drawer-chat-stream` con `flex: 1; min-height: 0; display: flex; flex-direction: column;`.
  * Configurar `.sst-drawer-messages-list` con `flex: 1; min-height: 0; overflow-y: auto; padding: 18px 20px; background-color: var(--c-fondo); gap: 12px;`.
  * Configurar `.sst-drawer-composer` como bloque anclado en la base (`flex-shrink: 0; width: 100%; padding: 12px 16px; background-color: var(--c-superficie); border-top: 1px solid var(--c-borde-suave); box-shadow: 0 -2px 8px rgba(15, 23, 42, 0.04);`).
  * Eliminar selectores redundantes en `sst.css` para que las burbujas adopten limpiamente el diseño unificado de `apoyo.css`.
  * Asegurar en `.embedded-msg-meta` que el remitente y la hora usen `display: flex; justify-content: space-between; align-items: baseline; gap: 12px; width: 100%;`, garantizando cero colisiones.

### 2.5 Barra de Contexto Sobria para SST ([../../frontend/src/features/sst/components/SstRequestChatDrawer.jsx](../../frontend/src/features/sst/components/SstRequestChatDrawer.jsx))
* En la parte superior del drawer, bajo la cabecera, se incorpora una barra compacta (`.sst-drawer-context-bar`):
  * **Fondo**: `--c-fondo-subtle`, borde inferior suave de 1px.
  * **Contenido esencial**:
    * Código del radicado: `ticket.code || ticket.id`.
    * Motivo de la solicitud: `ticket.reason`.
    * Urgencia: indicador textual sobrio con dot o etiqueta sutil (`Media`, `Alta`, `Baja`).
    * SLA de respuesta: `ticket.sla || '24h hábiles'`.
### 2.6 Calibración de Proporciones y Anclaje Vertical del Drawer SST ([../../frontend/src/styles/sst.css](../../frontend/src/styles/sst.css) y [../../frontend/src/styles/apoyo.css](../../frontend/src/styles/apoyo.css))
* **Desacoplamiento de CSS Global**: Remover los selectores `.sst-drawer-messages-list`, `.sst-drawer-composer` y `.sst-drawer-closed-banner` de `apoyo.css` para evitar que `max-height: 380px` colapse la altura del feed en el drawer.
* **Anclaje Inferior y Expansión Plena**:
  * En `sst.css`, `.sst-drawer-messages-list` define `flex: 1; min-height: 0; max-height: none; overflow-y: auto;` para expandir el 100% de la altura disponible.
  * `.sst-drawer-composer` define `margin-top: auto; flex-shrink: 0; width: 100%;` asegurando anclaje permanente al borde inferior sin importar la cantidad de mensajes.

---

## 3. Contratos y Compatibilidad

* **Props de `SstRequestChatDrawer`**: Se preservan idénticas (`ticket`, `onClose`, `onSessionChanged`).
* **WebSockets y Persistencia**: Inalterados los eventos `support:message:received`, `support:chat:ended` y la API `chatService`.
* **Cero Impacto en Base de Datos**: Cambios 100% circunscritos al renderizado y CSS del frontend.

---

## 4. Estrategia de Verificación

| Criterio de Aceptación | Método de Comprobación | Entorno / Comando |
| :--- | :--- | :--- |
| **AC-01 a AC-05** | Comprobación visual y funcional del chat | Inspección en frontend |
| **AC-06 (Calidad y Regresiones)** | Quality Gates automatizados | `cd frontend && npm test`<br>`cd frontend && npm run lint`<br>`cd frontend && npm run build` |
| **AC-07 (Anclaje y 100% Ancho en SST)** | Comprobación de que el compositor se fija en la base y abarca todo el ancho del drawer | Inspección DOM en drawer |
| **AC-08 (Espaciado en Burbujas SST)** | Verificación de separación horizontal entre remitente y hora en mensajes salientes | Inspección visual en drawer |
| **AC-09 (Contexto Sobrio sin Slop)** | Verificación de renderizado de la barra informativa sin elementos decorativos excesivos | Inspección DOM en drawer |
| **AC-10 (Calibración de Proporciones)** | Verificación de que el compositor no deje espacio en blanco inferior y el feed tome el alto restante | Inspección visual / DOM en drawer |

---

## 5. Recuperación y Reversibilidad (Rollback)

* **Archivos Afectados**:
  1. `frontend/src/styles/sst.css`
  2. `frontend/src/styles/apoyo.css`
  3. `frontend/src/features/sst/components/SstRequestChatDrawer.jsx`
* **Estrategia**: Reversión directa mediante `git checkout` de los archivos modificados. Cero riesgo de corrupción de datos o dependencias.
