# Verification Evidence: [SPEC-011] User Profile, Avatar Diversity & Preferences

Date: 2026-10-20
Status: VERIFIED

## 1. Traceability Matrix

| Criterio | Descripción | Método | Evidencia / Resultado | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **AC-01** | Popover de cuenta desacoplado y sin duplicidad | Manual / DevTools | Inspección en `AppLayout.jsx` con eliminación de `.account-popover-header` redundante. Cabecera contextual muestra correo y turno; menú abre *"Mi perfil y preferencias"*. | **PASSED** |
| **AC-02** | Catálogo BPO con inclusión masculina y diversidad | Automatizado / Visual | 3 nuevos activos generados (`bpo-avatar-male-agent.webp`, `bpo-avatar-male-supervisor.webp`, `bpo-avatar-female-agent-2.webp`). Asignación en `seed.jsx` para roles masculinos y femeninos, y `getRandomAvatarForRole` en `avatarPool.js`. | **PASSED** |
| **AC-03** | Selector de avatar y carga de foto personalizada | Manual / DevTools | Verificado en navegador con Chrome DevTools: selección inmediata de Mateo Ramos, Carlos Mendoza, Sofía Vega (sin etiquetas de rol por UX). Subida de foto propia redimensionada por canvas a 256x256 (~6 KB) guardada en sesión y almacenamiento local. | **PASSED** |
| **AC-04** | Panel de preferencias de bienestar y ergonomía | Manual / Storage | Alternancia de toggles: `pauseSound` (`pulso360_pause_ambient`), `reminderCheckin` (`pulso360_reminder_${userId}`) y `reducedMotion` (`pulso_reduced_motion` y atributo `data-reduced-motion="true"` en `html`). Persistencia inmediata verificada. | **PASSED** |
| **AC-05** | Accesibilidad WAI-ARIA y estados de interfaz | Manual / a11y | `role="dialog"`, `aria-modal="true"`, foco inicial en botón de cierre, trampa de tabulación (Tab / Shift+Tab), cierre con tecla `Escape` y retorno del foco al disparador. Feedback accesible con `aria-live="polite"`. | **PASSED** |
| **AC-06** | Sincronización reactiva y calidad de código | Automatizado | Evento `pulso360-session-changed` actualiza el sidebar y topbar sin recarga. Quality gates superados: `npm run lint` (0 errores, 0 warnings), `npm test frontend` (55/55 ok), `npm test backend` (132/132 ok), `npm run build` (éxito en 5.17s). | **PASSED** |

## 2. Root Cause Analysis & Technical Resolutions

1. **Bucle de reseteo de selección y preferencias**:
   - *Causa raíz*: `InactivityModal` escuchaba eventos globales (`mousemove`, `click`, etc.) y llamaba `authService.touchSession(user)` continuamente sin throttling. `touchSession` disparaba `pulso360-session-changed`, generando una nueva referencia de objeto `user` en `AppLayout`. `UserProfileModal` dependía de `[isOpen, user]` en su `useEffect`, por lo que mover el ratón o hacer clic borraba inmediatamente cualquier cambio no guardado (`selectedAvatar`, toggles de preferencias).
   - *Solución*: Se aplicó un throttle de 30 segundos a `touchSession` en `InactivityModal` y se introdujo `wasOpenRef` en `UserProfileModal` para garantizar que la inicialización del estado del formulario solo ocurra al momento exacto de abrir el diálogo modal, preservando intactas las selecciones del usuario durante su edición.

2. **Desconexión del modo Reduced Motion**:
   - *Causa raíz*: La preferencia existía en `localData` pero no tenía efecto global ni sincronización CSS con el documento.
   - *Solución*: `preferences.saveReducedMotion` y la inicialización al arranque colocan el atributo `data-reduced-motion="true"` y la clase `.reduced-motion` en `document.documentElement`, con reglas estrictas en `tokens.css` que eliminan transiciones y animaciones en toda la aplicación.

3. **Optimización de foto personalizada y cuota de almacenamiento**:
   - *Causa raíz*: Cargar imágenes en alta resolución en base64 saturaba rápidamente la cuota de 5 MB de `localStorage`/`sessionStorage`.
   - *Solución*: Función `resizeImageToAvatar` con recorte central y escalado por HTML5 Canvas a 256x256 píxeles en formato JPEG con calidad 0.88, resultando en archivos de ~5.9 KB livianos y seguros para almacenamiento local.

4. **Desacoplamiento de roles en catálogo de avatares**:
   - *Causa raíz*: La asignación de avatares mostraba etiquetas de cargo que confundían a los agentes al seleccionar avatares asociados visualmente a supervisores o especialistas SST.
   - *Solución*: Se removieron todas las etiquetas de rol de las tarjetas de avatar del catálogo en `UserProfileModal`, mostrando únicamente nombres representativos para una libre elección orientada a la experiencia de usuario.
