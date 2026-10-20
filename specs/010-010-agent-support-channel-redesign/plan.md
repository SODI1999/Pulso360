# [PLAN-010] Rediseño del Canal de Acompañamiento y Chat SST del Agente

Fecha: 2026-10-20
Especificación: [`specs/010-010-agent-support-channel-redesign/spec.md`](spec.md)
Ruta principal: `http://localhost:5173/agente/apoyo`

---

## 1. Resumen de la Solución Técnica

Este plan transforma la vista `/agente/apoyo` de un monolito vertical estático en un **espacio de trabajo ergonómico de acompañamiento y salud ocupacional**. La solución organiza la interacción en:
1. **Pestañas de Trabajo Accesibles (WAI-ARIA)**: Separación nítida entre *Mis Casos & Chat SST* (pestaña activa por defecto para consultar radicados y chatear) y *Nueva Solicitud*.
2. **Espacio de Conversación Dedicado (Master-Detail en Desktop / Vista Focalizada)**: Desacopla `SupportChatCard` del acordeón comprimido en la tarjeta de lista, ubicándolo en un panel de diálogo amplio y legible con soporte de atajos de teclado y conexión WebSocket en tiempo real.
3. **Línea de Trazabilidad Institucional (4 Fases SG-SST)**: Visualización del ciclo de vida del radicado (Radicado → Asignación → Orientación → Cierre) con badges sobrios.
4. **Humanización mediante el Avatar de Laura Gómez**: Incorporación de un nuevo activo fotográfico documental e inédito (`bpo-agent-support-dialogue.webp`) generado mediante `bpo-asset-designer`.
5. **Puente Inmediato de Respiro y Crisis**: Integración in-situ de `SomaticBreathingModal` (respiración somática 4-2-6) y acceso a primeros auxilios (Línea 106).

---

## 2. Archivos Afectados

| Archivo | Rol en la Implementación |
| :--- | :--- |
| `frontend/public/assets/fotos/bpo-agent-support-dialogue.webp` | **Nuevo activo fotográfico**: Imagen documental inédita de Laura Gómez en espacio de bienestar BPO. |
| [`frontend/src/features/agent/pages/SupportChannelPage.jsx`](../../frontend/src/features/agent/pages/SupportChannelPage.jsx) | **Refactor de Vista**: Orquestación de pestañas WAI-ARIA, selección de radicado activo para chat, modal de respiración y header con avatar. |
| [`frontend/src/features/agent/components/SupportRequestForm.jsx`](../../frontend/src/features/agent/components/SupportRequestForm.jsx) | **Formulario Ergonómico**: Rediseño de selectores de modalidad (Anónimo vs. Confidencial), chips de motivos BPO y tiempos de respuesta. |
| [`frontend/src/features/agent/components/SupportChatCard.jsx`](../../frontend/src/features/agent/components/SupportChatCard.jsx) | **Refactor de Chat**: Estilos ergonómicos, cabecera de especialista SST, atajos de teclado y scroll accesible. |
| `frontend/src/features/agent/components/SupportTimelineBadge.jsx` | **Nuevo componente de presentación**: Trazabilidad sobria de las 4 fases del radicado (Res. 2646 / SG-SST). |
| [`frontend/src/styles/apoyo.css`](../../frontend/src/styles/apoyo.css) | **Estilos del Módulo**: Layout de dos columnas / master-detail, tokens de color del sistema, eliminación de radiuses 9999px y responsive design. |

---

## 3. Arquitectura de Navegación y Componentes

```
SupportChannelPage (WAI-ARIA Tablist)
 ├── Header Institucional con Avatar Situado (bpo-agent-support-dialogue.webp)
 ├── Barra de Acceso Rápido a Crisis (Línea 106 & SomaticBreathingModal)
 ├── Tab 1: [Mis Casos & Chat SST] (role="tabpanel")
 │    ├── Si hay casos:
 │    │    ├── Layout Maestro-Detalle (Desktop) / Split View:
 │    │    │    ├── Columna Izquierda: Lista de Radicados (con SupportTimelineBadge de 4 fases)
 │    │    │    └── Columna Derecha: Panel de Diálogo Focalizado con SST (SupportChatCard)
 │    └── Si no hay casos:
 │         └── Estado Vacío Empático con botón para radicar primera solicitud
 └── Tab 2: [Nueva Solicitud a SST] (role="tabpanel")
      └── SupportRequestForm (Modalidad Anónima/Confidencial + Motivos BPO + Tiempos SLA)
```

---

## 4. Contratos de Datos e Interfaces

No se alteran los contratos de datos del backend ni del store para garantizar cero regresiones:
- **Lectura de Radicados**: `userRequests` filtrados por `currentUser.id` desde `useSupportChannel`.
- **Chats Activos**: `chatService.getAgentActiveChatsMap()` y `chatService.getChatByRequest(requestId)`.
- **Eventos WebSocket**: `support:chat:activated`, `support:chat:ended`, `support:request:statusChanged`, `support:message:received`.
- **Creación de Solicitud**: `createSupportRequest(isAnonymous, urgency, supportMode, currentUser, reason, details, contactPreference, timeWindow)`.
- **Compuerta de Consentimiento**: Validación de `consent?.c3 === true`.

---

## 5. Modos de Falla y Resiliencia

1. **Fallo de Red o Servidor en Envío de Mensaje en Chat**:
   - `useChatDelivery` retiene el mensaje en el textarea y muestra un banner de error con reintento sin descartar el texto del agente.
2. **Desconexión de WebSocket**:
   - Indicador visual sutil de reconexión sin bloquear la lectura de mensajes previos almacenados en base de datos.
3. **Agente sin Consentimiento C3**:
   - Despliegue inmediato del estado bloqueado institucional, impidiendo la radicación de solicitudes individuales pero manteniendo accesible la ruta pública de crisis (Línea 106).
4. **Agente sin Solicitudes Previas (Estado Vacío)**:
   - Mensaje pedagógico claro y botón de acción para redactar su primera solicitud.

---

## 6. Plan de Verificación

1. **Pruebas de Calidad Automatizadas**:
   - `cd frontend; npm run lint` (0 errores, 0 warnings).
   - `cd frontend; npm run build` (compilación exitosa en producción).
   - `cd frontend; npm test` (55/55 pruebas pasando).
   - `cd backend; npm test` (132/132 pruebas pasando).
2. **Inspección de Navegación y UI con Chrome DevTools MCP**:
   - Comprobar cambio de pestañas con mouse y teclas de flecha (`ArrowLeft`, `ArrowRight`).
   - Comprobar selección de radicado y apertura de la sala de chat dedicada.
   - Verificar renderizado de la nueva foto del avatar (`bpo-agent-support-dialogue.webp`).
   - Comprobar apertura del modal de respiración somática 4-2-6.
   - Verificar la experiencia en anchos de pantalla desktop (1280px), tablet (768px) y móvil (375px).
3. **Delivery Gate de `DESIGN.md`**:
   - Auditar contra el gate visual (Tarea y composición, Proporción y responsive, Funcionamiento y estados, Privacidad y roles, Accesibilidad, Integración técnica).

---

## 7. Estrategia de Rollback y Recuperación

Al tratarse de una refactorización de capa frontend que preserva intactos los contratos de persistencia y sockets:
- **Estrategia de Reversión**: En caso de bloqueo o regresión crítica en producción, la reversión se efectúa restaurando los archivos `SupportChannelPage.jsx`, `SupportRequestForm.jsx`, `SupportChatCard.jsx` y `apoyo.css` al commit previo (`2d3971b`) mediante Git (`git checkout 2d3971b -- frontend/src/features/agent/ frontend/src/styles/apoyo.css`).
- **Impacto en Datos**: Cero impacto en datos de base de datos o almacenamiento local, ya que la estructura de radicados (`supportRequests`) y mensajes WebSocket no sufre alteraciones de esquema.

