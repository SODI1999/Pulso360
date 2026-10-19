# [TASKS-002] Tareas de Implementación — Rediseño de Apoyo en Crisis

Especificación: [spec.md](spec.md)  
Plan técnico: [plan.md](plan.md)

---

## Lista de Tareas

- [x] **T-01: Estilos de Layout Equilibrado y Orbe Zen en `crisis.css`**
  - **Criterios asociados**: AC-01, AC-02, AC-03
  - **Archivos afectados**: [../../frontend/src/styles/crisis.css](../../frontend/src/styles/crisis.css)
  - **Alcance**:
    - Definir clases para el contenedor de 2 columnas: `.crisis-clean-layout`, `.crisis-clean-card`, `.crisis-clean-card--calm`.
    - Estilizar el orbe de respiración somática: `.zen-orb-wrapper`, `.zen-orb-core`, `.zen-orb-pulse-ring`, `.btn-zen-toggle`.
    - Implementar transiciones de ritmo (4s Inhala · 2s Sostén · 6s Exhala) y regla estricta `@media (prefers-reduced-motion: reduce)`.
    - Estilizar la lista ergonómica de líneas oficiales: `.crisis-lines-list`, `.crisis-line-item`, badges y botones directos.
  - **Verificación**: Validación sintáctica de CSS, cálculo de contraste WCAG AA con tokens y compilación limpia.

- [x] **T-02: Reestructuración de Layout Bipolar en `CrisisSupportPage.jsx` y `CrisisContactLines.jsx`**
  - **Criterios asociados**: AC-01, AC-04, AC-06
  - **Archivos afectados**: [../../frontend/src/features/agent/pages/CrisisSupportPage.jsx](../../frontend/src/features/agent/pages/CrisisSupportPage.jsx) y [../../frontend/src/features/agent/components/CrisisContactLines.jsx](../../frontend/src/features/agent/components/CrisisContactLines.jsx)
  - **Alcance**:
    - Rediseñar la vista principal en 2 columnas armoniosas (`1fr 1.15fr`) visibles sin scroll forzado en 1440×900 px.
    - Estructurar las líneas 106, 123 y 155 en filas ergonómicas con botones directos `tel:`.
    - Confinar la solicitud voluntaria a SST y el marco legal (Ley 1010 y Res. 3461) a un bloque colapsable `<details>` al pie.
  - **Verificación**: Inspección en navegador con Chrome DevTools comprobando visibilidad inmediata de ambas opciones sin scroll vertical.

- [x] **T-03: Implementación de Respiración Somática In-Situ en `ZenBreathingOrb.jsx`**
  - **Criterios asociados**: AC-02, AC-03
  - **Archivos afectados**: [../../frontend/src/features/agent/components/ZenBreathingOrb.jsx](../../frontend/src/features/agent/components/ZenBreathingOrb.jsx)
  - **Alcance**:
    - Construir el componente de respiración somática pasiva con cadencia fisiológica continua 4-2-6.
    - Anillos concéntricos suaves de pulso con gradiente de calma (`#14b8a6` a `#0f766e`).
    - Control accesible único de pausar/reanudar y anuncio `aria-live="polite"` para lectores de pantalla.
  - **Verificación**: Renderizado e inspección en vivo de los ciclos de inhalación, sostén y exhalación.

- [x] **T-04: Desmantelamiento de `BpoResetModal` y Vinculación desde Panel y Check-in**
  - **Criterios asociados**: AC-05
  - **Archivos afectados**:
    - [../../frontend/src/features/agent/pages/AgentDashboardPage.jsx](../../frontend/src/features/agent/pages/AgentDashboardPage.jsx)
    - [../../frontend/src/features/agent/hooks/useAgentDashboard.jsx](../../frontend/src/features/agent/hooks/useAgentDashboard.jsx)
    - [../../frontend/src/features/agent/components/CheckinConfirmation.jsx](../../frontend/src/features/agent/components/CheckinConfirmation.jsx)
    - [../../frontend/src/features/agent/pages/CheckinWizardPage.jsx](../../frontend/src/features/agent/pages/CheckinWizardPage.jsx)
    - [../../frontend/src/features/agent/hooks/useCheckinWizard.jsx](../../frontend/src/features/agent/hooks/useCheckinWizard.jsx)
    - [../../frontend/src/features/agent/hooks/useCrisisSupport.jsx](../../frontend/src/features/agent/hooks/useCrisisSupport.jsx)
    - Eliminación de `BpoResetModal.jsx` e `immersive-pause.css`.
  - **Alcance**:
    - Eliminar toda referencia y estado asociado a modales de respiración de 2 minutos.
    - Reemplazar el botón "Tomar un respiro (2 min)" en el hero del panel por un enlace directo a `/apoyo-crisis` ("Pausa de respiración").
    - Actualizar la confirmación de check-in para enlazar a `/apoyo-crisis`.
  - **Verificación**: Búsqueda global confirmando 0 ocurrencias de `BpoResetModal` y comprobación del clic navegando a `/apoyo-crisis`.

- [x] **T-05: Verificación Técnica y Quality Gates del Repositorio**
  - **Criterios asociados**: AC-07
  - **Archivos afectados**: Todos los componentes y estilos modificados.
  - **Alcance**:
    - Ejecutar linter: `cd frontend && npm run lint`.
    - Ejecutar build de producción: `cd frontend && npm run build`.
    - Ejecutar auditoría OmniSpec: `node specs/.omni/runtime/bin/omni-spec.mjs audit 002`.
  - **Verificación**: Cero errores, cero advertencias, build de Vite exitoso sin paquetes npm nuevos.
